import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Supplier {
  name: string;
  url: string;
  description: string;
  estimatedCost: string;
}

export interface BOMItem {
  item: string;
  subItems: string[];
  suppliers: Supplier[];
}

export interface ProductionPlan {
  product: string;
  description: string;
  bom: BOMItem[];
}

export async function getProductionPlan(productName: string): Promise<ProductionPlan> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    I want to manufacture the following product: "${productName}".
    Please provide a detailed breakdown of the materials and services required (Bill of Materials).
    For each item, find real-world suppliers or service providers using Google Search.
    Include their names, website URLs (if available), a brief description of what they offer, and an estimated cost range for small to medium scale production.
    
    The response must be in Korean.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          product: { type: Type.STRING },
          description: { type: Type.STRING },
          bom: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                subItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                suppliers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      url: { type: Type.STRING },
                      description: { type: Type.STRING },
                      estimatedCost: { type: Type.STRING }
                    },
                    required: ["name", "description"]
                  }
                }
              },
              required: ["item", "subItems", "suppliers"]
            }
          }
        },
        required: ["product", "description", "bom"]
      }
    },
  });

  try {
    return JSON.parse(response.text || "{}") as ProductionPlan;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate production plan. Please try again.");
  }
}
