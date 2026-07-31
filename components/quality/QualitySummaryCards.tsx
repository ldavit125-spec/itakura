import React from "react";
import type { QualitySummary } from "@/types/quality";

// ============================================================
// 품질관리 상단 8종 요약 카드 컴포넌트
// ============================================================

interface QualitySummaryCardsProps {
  summary: QualitySummary;
}

export default function QualitySummaryCards({ summary }: QualitySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
      {/* 1. 전체 검사 대기 */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          전체 검사대기
        </p>
        <p className="text-lg font-extrabold text-gray-900 mt-0.5">
          {summary.totalQueueCount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

      {/* 2. 원재료 검사 대기 */}
      <div className="bg-white rounded-xl border border-blue-200 p-3 shadow-sm bg-blue-50/20">
        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
          원재료 검사대기
        </p>
        <p className="text-lg font-extrabold text-blue-600 mt-0.5">
          {summary.incomingQueueCount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

      {/* 3. 공정검사 진행 중 */}
      <div className="bg-white rounded-xl border border-purple-200 p-3 shadow-sm bg-purple-50/20">
        <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
          공정검사 진행중
        </p>
        <p className="text-lg font-extrabold text-purple-600 mt-0.5">
          {summary.processInProgressCount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

      {/* 4. 완제품 검사 대기 */}
      <div className="bg-white rounded-xl border border-indigo-200 p-3 shadow-sm bg-indigo-50/20">
        <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
          완제품 검사대기
        </p>
        <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
          {summary.finishedQueueCount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

      {/* 5. 오늘의 불합격 건수 */}
      <div className="bg-white rounded-xl border border-red-200 p-3 shadow-sm bg-red-50/20">
        <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">
          금일 불량수
        </p>
        <p className="text-lg font-extrabold text-red-600 mt-0.5">
          {summary.todayFailCount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

      {/* 6. 미완료 시정조치 */}
      <div className="bg-white rounded-xl border border-amber-200 p-3 shadow-sm bg-amber-50/20">
        <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
          미완료 시정조치
        </p>
        <p className="text-lg font-extrabold text-amber-700 mt-0.5">
          {summary.unresolvedCACount}
          <span className="text-xs font-normal text-gray-500 ml-0.5">건</span>
        </p>
      </div>

    </div>
  );
}
