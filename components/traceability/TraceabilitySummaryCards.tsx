import React from "react";
import type { TraceabilitySummary } from "@/types/traceability";

// ============================================================
// LOT 통합 추적관리 상단 6종 요약 카드 컴포넌트
// ============================================================

interface TraceabilitySummaryCardsProps {
  summary: TraceabilitySummary;
}

export default function TraceabilitySummaryCards({ summary }: TraceabilitySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. 전체 원재료 LOT 수 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          전체 원재료 LOT
        </p>
        <p className="text-2xl font-extrabold text-blue-600 mt-1">
          {summary.totalRawLotCount}
          <span className="text-xs font-normal text-gray-500 ml-1">개</span>
        </p>
      </div>

      {/* 2. 전체 완제품 LOT 수 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          전체 완제품 LOT
        </p>
        <p className="text-2xl font-extrabold text-indigo-600 mt-1">
          {summary.totalFGLotCount}
          <span className="text-xs font-normal text-gray-500 ml-1">개</span>
        </p>
      </div>

      {/* 3. 추적 가능한 작업지시 수 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          연동 작업지시
        </p>
        <p className="text-2xl font-extrabold text-teal-600 mt-1">
          {summary.traceableWorkOrderCount}
          <span className="text-xs font-normal text-gray-500 ml-1">건</span>
        </p>
      </div>

      {/* 4. 품질 보류 LOT 수 */}
      <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm bg-amber-50/30">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
          품질 보류 LOT
        </p>
        <p className="text-2xl font-extrabold text-amber-700 mt-1">
          {summary.qualityHoldLotCount}
          <span className="text-xs font-normal text-gray-500 ml-1">개</span>
        </p>
      </div>

      {/* 5. 불합격 LOT 수 */}
      <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm bg-red-50/30">
        <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
          불합격 LOT
        </p>
        <p className="text-2xl font-extrabold text-red-600 mt-1">
          {summary.failedLotCount}
          <span className="text-xs font-normal text-gray-500 ml-1">개</span>
        </p>
      </div>

      {/* 6. 시정조치 진행 LOT 수 */}
      <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm bg-purple-50/30">
        <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">
          진행 중 CAPA
        </p>
        <p className="text-2xl font-extrabold text-purple-700 mt-1">
          {summary.inProgressCACount}
          <span className="text-xs font-normal text-gray-500 ml-1">건</span>
        </p>
      </div>
    </div>
  );
}
