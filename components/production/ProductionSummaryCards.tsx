"use client";

import React from "react";
import type { ProductionSummary } from "@/types/production";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 생산관리 상단 6종 요약 카드 컴포넌트
// ============================================================

interface ProductionSummaryCardsProps {
  summary: ProductionSummary;
}

export default function ProductionSummaryCards({ summary }: ProductionSummaryCardsProps) {
  const { t, language } = useLanguage();
  const countUnit = localizedName({ locale: language, ko: "건", ja: "件" });
  const itemUnit = localizedName({ locale: language, ko: "개", ja: "個" });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. 오늘의 생산계획 건수 */}
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {t("production.summary.todayPlan")}
        </p>
        <p className="text-xl font-extrabold text-gray-900 mt-1">
          {summary.todayPlanCount}
          <span className="text-xs font-normal text-gray-500 ml-1">{countUnit}</span>
        </p>
      </div>

      {/* 2. 오늘의 계획 수량 */}
      <div className="bg-white rounded-xl border border-blue-200 p-3.5 shadow-sm bg-blue-50/20">
        <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
          {t("production.summary.todayPlannedQty")}
        </p>
        <p className="text-xl font-extrabold text-blue-600 mt-1">
          {summary.todayPlannedQty.toLocaleString()}
          <span className="text-xs font-normal text-gray-500 ml-1">{itemUnit}</span>
        </p>
      </div>

      {/* 3. 현재 진행 중 작업 */}
      <div className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-sm bg-amber-50/20">
        <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
          {t("production.summary.inProgressWork")}
        </p>
        <p className="text-xl font-extrabold text-amber-600 mt-1">
          {summary.inProgressCount}
          <span className="text-xs font-normal text-gray-500 ml-1">{countUnit}</span>
        </p>
      </div>

      {/* 4. 오늘의 생산실적 */}
      <div className="bg-white rounded-xl border border-green-200 p-3.5 shadow-sm bg-green-50/20">
        <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">
          {t("production.summary.todayResultQty")}
        </p>
        <p className="text-xl font-extrabold text-green-600 mt-1">
          {summary.todayResultQty.toLocaleString()}
          <span className="text-xs font-normal text-gray-500 ml-1">{itemUnit}</span>
        </p>
      </div>

      {/* 5. 평균 생산 달성률 */}
      <div className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-sm bg-indigo-50/20">
        <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
          {t("production.summary.avgAchievementRate")}
        </p>
        <p className="text-xl font-extrabold text-indigo-600 mt-1">
          {summary.avgAchievementRate}%
        </p>
      </div>

      {/* 6. 자재 준비 미완료 작업 */}
      <div className="bg-white rounded-xl border border-red-200 p-3.5 shadow-sm bg-red-50/20">
        <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
          {t("production.summary.materialUnreadyWork")}
        </p>
        <p className="text-xl font-extrabold text-red-600 mt-1">
          {summary.materialNotReadyCount}
          <span className="text-xs font-normal text-gray-500 ml-1">{countUnit}</span>
        </p>
      </div>
    </div>
  );
}
