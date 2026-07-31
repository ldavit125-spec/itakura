import React from "react";
import type { MaterialSummary } from "@/types/materials";

// ============================================================
// 재고 부족 및 이상 현황 상단 요약 카드
// ============================================================

interface MaterialSummaryCardsProps {
  summary: MaterialSummary;
}

export default function MaterialSummaryCards({ summary }: MaterialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. 부족 자재 수 */}
      <div className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            부족 자재 수
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.totalShortageCount}
            <span className="text-sm font-normal text-gray-500 ml-1">품목</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">안전재고 미만 자재</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      {/* 2. 긴급 부족 자재 수 */}
      <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
            긴급 부족 자재 수
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {summary.criticalShortageCount}
            <span className="text-sm font-normal text-gray-500 ml-1">품목</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">안전재고 50% 미만</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-red-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>

      {/* 3. 유통기한 임박 LOT 수 */}
      <div className="bg-white rounded-lg border border-orange-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
            유통기한 임박 LOT
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.expiringLotCount}
            <span className="text-sm font-normal text-gray-500 ml-1">건</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">30일 이내 만료 예정</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* 4. 사용 보류 LOT 수 */}
      <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            사용 보류 LOT
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.holdLotCount}
            <span className="text-sm font-normal text-gray-500 ml-1">건</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">검사 보류 중</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
