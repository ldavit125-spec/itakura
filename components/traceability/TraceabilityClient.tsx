"use client";

import React, { useEffect, useState } from "react";
import { useTraceability } from "@/context/TraceabilityContext";
import { getIntegratedSearchResults } from "@/lib/traceability-selectors";

import TraceabilitySummaryCards from "./TraceabilitySummaryCards";
import IntegratedLotSearch from "./IntegratedLotSearch";
import TraceabilityTabs from "./TraceabilityTabs";

import TraceSearchResultTable from "./TraceSearchResultTable";
import ForwardTracePanel from "./ForwardTracePanel";
import BackwardTracePanel from "./BackwardTracePanel";
import LotRelationDiagram from "./LotRelationDiagram";
import TraceHistoryTable from "./TraceHistoryTable";
import RecallImpactModal from "./RecallImpactModal";
import { useMaterials } from "@/context/MaterialsContext";
import { useProduction } from "@/context/ProductionContext";

// ============================================================
// LOT 통합 추적관리 클라이언트 메인 컨테이너
// ============================================================

export default function TraceabilityClient() {
  const {
    activeTab,
    setActiveTab,
    summary,
    forwardTargetLotNo,
    setForwardTargetLotNo,
    backwardTargetLotNo,
    setBackwardTargetLotNo,
    diagramTargetNo,
    setDiagramTargetNo,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    history,
    addHistoryLog,
    recallModal,
    openRecallModal,
    closeRecallModal,
    triggerForwardTrace,
    triggerBackwardTrace,
    triggerDiagramView,
  } = useTraceability();

  const { inventories, inbounds } = useMaterials();
  const { fgLots } = useProduction();

  const [searchTerm, setSearchTerm] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");
  const [qualityStatusFilter, setQualityStatusFilter] = useState("ALL");

  useEffect(() => {
    const lot = new URLSearchParams(window.location.search).get("lot");
    if (lot) {
      setSearchTerm(lot);
      addRecentSearch(lot);
    }
  }, []);

  const searchResults = getIntegratedSearchResults(searchTerm, targetTypeFilter, qualityStatusFilter, {
    inventories,
    inbounds,
    fgLots,
  });

  const handleGlobalSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      addRecentSearch(term);
      addHistoryLog("INTEGRATED_SEARCH", term, term, searchResults.length, false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 6종 요약 카드 */}
      <TraceabilitySummaryCards summary={summary} />

      {/* 2. 상단 눈에 띄는 통합 LOT 검색 바 */}
      <IntegratedLotSearch
        searchTerm={searchTerm}
        onSearch={handleGlobalSearch}
        recentSearches={recentSearches}
        onSelectRecent={handleGlobalSearch}
        onClearRecent={clearRecentSearches}
      />

      {/* 3. 메인 탭 래퍼 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <TraceabilityTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* 탭 1: 통합 LOT 검색 */}
        {activeTab === "search" && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* 검색어 필터 바 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="font-bold text-gray-700">검색 세부 필터:</span>
                <select
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  className="px-2.5 py-1 border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="ALL">대상 구분 전체</option>
                  <option value="RAW_MATERIAL_LOT">원재료 LOT</option>
                  <option value="FINISHED_GOODS_LOT">완제품 LOT</option>
                  <option value="WORK_ORDER">작업지시</option>
                  <option value="PRODUCTION_RESULT">생산실적</option>
                  <option value="NONCONFORMITY">부적합</option>
                </select>

                <select
                  value={qualityStatusFilter}
                  onChange={(e) => setQualityStatusFilter(e.target.value)}
                  className="px-2.5 py-1 border border-gray-300 rounded bg-white font-medium"
                >
                  <option value="ALL">품질 상태 전체</option>
                  <option value="PASSED">합격 (PASSED)</option>
                  <option value="HOLD">보류 (HOLD)</option>
                  <option value="FAILED">불합격 (FAILED)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setTargetTypeFilter("ALL");
                  setQualityStatusFilter("ALL");
                }}
                className="text-gray-500 hover:text-gray-700 underline text-xs whitespace-nowrap self-end sm:self-center"
              >
                검색 조건 초기화
              </button>
            </div>

            <TraceSearchResultTable
              results={searchResults}
              onTriggerForward={triggerForwardTrace}
              onTriggerBackward={triggerBackwardTrace}
              onTriggerDiagram={triggerDiagramView}
              onOpenRecall={openRecallModal}
            />
          </div>
        )}

        {/* 탭 2: 원재료 정방향 추적 */}
        {activeTab === "forward" && (
          <ForwardTracePanel
            targetLotNo={forwardTargetLotNo}
            onSearch={setForwardTargetLotNo}
            onOpenRecall={openRecallModal}
            onTriggerDiagram={triggerDiagramView}
          />
        )}

        {/* 탭 3: 완제품 역방향 추적 */}
        {activeTab === "backward" && (
          <BackwardTracePanel
            targetLotNo={backwardTargetLotNo}
            onSearch={setBackwardTargetLotNo}
            onTriggerForward={triggerForwardTrace}
            onOpenRecall={openRecallModal}
            onTriggerDiagram={triggerDiagramView}
          />
        )}

        {/* 탭 4: LOT 관계도 */}
        {activeTab === "diagram" && (
          <LotRelationDiagram
            diagramTargetNo={diagramTargetNo}
            onTriggerForward={triggerForwardTrace}
            onTriggerBackward={triggerBackwardTrace}
          />
        )}

        {/* 탭 5: 추적 이력 */}
        {activeTab === "history" && (
          <TraceHistoryTable
            history={history}
            onTriggerForward={triggerForwardTrace}
            onTriggerBackward={triggerBackwardTrace}
          />
        )}
      </div>

      {/* 4. 리콜 영향 범위 분석 결과 모달 */}
      <RecallImpactModal
        isOpen={recallModal.isOpen}
        result={recallModal.result}
        onClose={closeRecallModal}
      />
    </div>
  );
}
