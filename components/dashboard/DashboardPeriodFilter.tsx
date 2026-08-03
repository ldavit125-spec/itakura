"use client";

import type { PeriodType } from "@/types/dashboard";
import { PERIOD_TYPE_LABELS } from "@/types/dashboard";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 주간/월간 기간 선택 필터
// ============================================================

const PERIODS: PeriodType[] = ["WEEKLY", "MONTHLY"];

interface DashboardPeriodFilterProps {
  period: PeriodType;
  onChange: (period: PeriodType) => void;
}

export default function DashboardPeriodFilter({
  period,
  onChange,
}: DashboardPeriodFilterProps) {
  const { t } = useLanguage();
  return (
    <div
      className="flex gap-0.5 bg-gray-100 rounded-md p-0.5"
      role="group"
      aria-label={t("period.select")}
    >
      {PERIODS.map((p) => (
        <button
          key={p}
          id={`period-filter-${p.toLowerCase()}`}
          onClick={() => onChange(p)}
          aria-pressed={period === p}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            period === p
              ? "bg-white text-gray-800 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t(PERIOD_TYPE_LABELS[p])}
        </button>
      ))}
    </div>
  );
}
