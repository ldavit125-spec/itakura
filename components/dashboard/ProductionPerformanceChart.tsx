"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PeriodType } from "@/types/dashboard";
import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";
import { aggregateProductionByPeriod } from "@/lib/common-selectors";
import { getBusinessDate } from "@/lib/common-selectors";
import DashboardPeriodFilter from "@/components/dashboard/DashboardPeriodFilter";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 생산계획 대비 실적 Line Chart (실시간 Context 연동)
// ============================================================

/** 커스텀 Tooltip */
interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function ProductionTooltip({ active, payload, label }: CustomTooltipProps) {
  const { t } = useLanguage();
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-1.5 leading-5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">
            {t(entry.dataKey === "plan" ? "dashboard.planQuantity" : "dashboard.actualProduction")}:
          </span>
          <span className="font-medium text-gray-900">
            {entry.value.toLocaleString()}{t("unit.item")}
          </span>
        </p>
      ))}
    </div>
  );
}

/** 범례 라벨 변환 */
function legendFormatter(value: string): string {
  return value === "plan" ? "dashboard.planQuantity" : "dashboard.actualProduction";
}

/** Y축 눈금 포맷 */
function yAxisTickFormatter(value: number | string | readonly (string | number)[]): string {
  if (typeof value !== "number") return String(value);
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString("ko-KR");
}

export default function ProductionPerformanceChart() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState<PeriodType>("WEEKLY");
  const { plans, results } = useProduction();
  const { canAccessProductionLine } = useAdmin();

  const endDate = getBusinessDate();
  const startDate =
    period === "MONTHLY"
      ? `${endDate.substring(0, 7)}-01`
      : new Date(`${endDate}T00:00:00`)
          .toLocaleDateString("en-CA", {
            timeZone: "Asia/Seoul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
  const weeklyStartDate =
    period === "WEEKLY"
      ? (() => {
          const date = new Date(`${endDate}T00:00:00`);
          const day = date.getDay() || 7;
          date.setDate(date.getDate() - day + 1);
          return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
          ].join("-");
        })()
      : startDate;

  const data = aggregateProductionByPeriod(
    plans.filter((item) => canAccessProductionLine(item.productionLine)),
    results.filter((item) => canAccessProductionLine(item.productionLine)),
    weeklyStartDate,
    endDate
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">{t("dashboard.planVsActual")}</h3><p className="text-xs text-gray-500 mt-0.5">{t("dashboard.planVsActualDescription")}</p>
        </div>
        <DashboardPeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* 차트 */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
          {t("empty.chart")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => yAxisTickFormatter(value)}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<ProductionTooltip />} />
            <Legend
              formatter={(value) => t(legendFormatter(value))}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="plan"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
