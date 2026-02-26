/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Factory, Package, ExternalLink, Loader2, ChevronRight, Info, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getProductionPlan, ProductionPlan } from './services/gemini';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const result = await getProductionPlan(searchQuery);
      setPlan(result);
    } catch (err) {
      setError('정보를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Factory className="text-white w-5 h-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">FindYourService</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#666]">
            <a href="#" className="hover:text-black transition-colors">서비스 소개</a>
            <a href="#" className="hover:text-black transition-colors">파트너사</a>
            <a href="#" className="hover:text-black transition-colors">문의하기</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero / Search Section */}
        <section className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
          >
            무엇을 만들고 싶으신가요?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#666] text-lg mb-10 max-w-2xl mx-auto"
          >
            아이템 이름만 입력하세요. 필요한 재료부터 생산 업체, 예상 비용까지 한 번에 찾아드립니다.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="relative max-w-2xl mx-auto"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 티셔츠, 가죽 가방, 스마트 워치 스트랩..."
              className="w-full bg-white border border-black/10 rounded-2xl px-6 py-4 pl-14 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#999] w-6 h-6" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-xl font-medium hover:bg-[#333] transition-colors disabled:bg-[#999]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '검색'}
            </button>
          </motion.form>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" />
              <p className="text-lg font-medium animate-pulse text-[#666]">
                필요한 재료와 업체를 분석하고 있습니다...
              </p>
              <p className="text-sm text-[#999] mt-2">잠시만 기다려 주세요. (약 10-20초 소요)</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-center mb-8">
            {error}
          </div>
        )}

        {/* Results Section */}
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Production Plan
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">{plan.product} 제작 가이드</h2>
              <p className="text-[#666] leading-relaxed text-lg">
                {plan.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                필요 항목 및 업체 리스트
              </h3>
              
              {plan.bom.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5"
                >
                  <div className="p-6 border-b border-black/5 bg-[#fafafa]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold mb-2">{item.item}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.subItems.map((sub, sIdx) => (
                            <span key={sIdx} className="bg-white border border-black/10 px-2 py-0.5 rounded-md text-xs text-[#666]">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/5 p-2 rounded-xl">
                        <ChevronRight className="w-5 h-5 text-[#999]" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {item.suppliers.map((supplier, sIdx) => (
                      <div key={sIdx} className="group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg group-hover:text-emerald-600 transition-colors">
                              {supplier.name}
                            </span>
                            {supplier.url && (
                              <a 
                                href={supplier.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#999] hover:text-black transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                            <DollarSign className="w-4 h-4" />
                            {supplier.estimatedCost}
                          </div>
                        </div>
                        <p className="text-[#666] text-sm leading-relaxed">
                          {supplier.description}
                        </p>
                        {sIdx < item.suppliers.length - 1 && (
                          <div className="h-px bg-black/5 mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State / Suggestions */}
        {!plan && !loading && (
          <section className="mt-20">
            <h3 className="text-center text-[#999] font-medium mb-8 uppercase tracking-widest text-xs">추천 검색어</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['티셔츠', '수제 비누', '에코백', '반려견 간식', '스마트폰 케이스'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    // Trigger search
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleSearch(fakeEvent, suggestion);
                  }}
                  className="bg-white border border-black/10 px-6 py-2 rounded-full text-sm font-medium hover:border-black transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-black/5 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <Factory className="text-white w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">FindYourService</span>
          </div>
          <p className="text-sm text-[#999]">
            © 2024 FindYourService. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}
