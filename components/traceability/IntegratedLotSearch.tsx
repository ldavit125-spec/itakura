import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 상단 눈에 띄는 통합 LOT 검색 바 & 최근 검색어 컴포넌트
// ============================================================

interface IntegratedLotSearchProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  recentSearches: string[];
  onSelectRecent: (term: string) => void;
  onClearRecent: () => void;
}

export default function IntegratedLotSearch({
  searchTerm,
  onSearch,
  recentSearches,
  onSelectRecent,
  onClearRecent,
}: IntegratedLotSearchProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";
  const [inputVal, setInputVal] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputVal);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg mb-6">
      <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>{isJa ? "原材料および完成品統合LOT履歴検索" : "원재료 및 완제품 통합 LOT 이력 검색"}</span>
      </h3>
      <p className="text-xs text-blue-200 mb-4">
        {isJa
          ? "原材料LOT、完成品LOT、作業指示番号、生産実績、検査成績書、不適合および是正措置番号を一括追跡します。"
          : "원재료 LOT, 완제품 LOT, 작업지시 번호, 생산실적, 검사 성적서, 부적합 및 시정조치 번호를 한 번에 추적합니다."}
      </p>

      <form onSubmit={handleSubmit} className="relative flex items-center max-w-3xl">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isJa ? "例: LOT-FLOUR-260730-A / FG-PRD001-20260730-001 / WO-20260730-001" : "예: LOT-FLOUR-260730-A / FG-PRD001-20260730-001 / WO-20260730-001 / IQC-20260730-001"}
          className="w-full pl-10 pr-28 py-3.5 rounded-xl border border-white/80 bg-white text-sm text-gray-900 caret-blue-600 placeholder:text-gray-400 placeholder:opacity-100 font-mono shadow-inner outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-400/60"
        />
        <svg
          className="w-5 h-5 text-gray-400 absolute left-3 top-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-md"
        >
          {isJa ? "統合検索" : "통합 검색"}
        </button>
      </form>

      {/* 최근 검색어 태그 UI */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          <span className="text-blue-200 font-semibold whitespace-nowrap">{isJa ? "最近の検索:" : "최근 검색어:"}</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInputVal(term);
                  onSelectRecent(term);
                }}
                className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-md text-[11px] font-mono text-blue-100 transition-colors border border-white/10"
              >
                {term}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearRecent}
              className="text-[10px] text-blue-300 hover:text-white underline ml-2"
            >
              {isJa ? "リセット" : "초기화"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
