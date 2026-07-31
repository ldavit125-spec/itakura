"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuality } from "@/context/QualityContext";
import { aggregateInspectionResults } from "@/lib/common-selectors";
import { QUALITY_RESULT_LABELS, type QualityResult } from "@/types/dashboard";

// ============================================================
// 품질검사 판정 비율 도넛 Pie Chart (실시간 Context 연동)
// ============================================================

/** 판정별 색상 */
const RESULT_COLORS: Record<QualityResult, string> = {
  PASS: "#16a34a",
  CONDITIONAL_PASS: "#f59e0b",
  FAIL: "#dc2626",
};

/** 커스텀 Tooltip */
interface TooltipPayloadItem {
  payload: {
    result: QualityResult;
    label: string;
    percentage: number;
    count: number;
    fill: string;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function QualityTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.fill }}
        />
        <span className="font-semibold text-gray-700">{item.label}</span>
      </div>
      <p className="text-gray-600">
        검사 비율: <span className="font-medium text-gray-900">{item.percentage}%</span>
      </p>
      <p className="text-gray-600">
        건수: <span className="font-medium text-gray-900">{item.count}건</span>
      </p>
    </div>
  );
}

/** 범례 아이콘 */
function legendFormatter(value: string): string {
  return value;
}

export default function QualityResultChart() {
  const { incoming, processList, finished } = useQuality();

  const res = aggregateInspectionResults(incoming, processList, finished);

  const chartData = [
    {
      result: "PASS" as QualityResult,
      label: QUALITY_RESULT_LABELS.PASS,
      count: res.passedCount,
      percentage: res.completedCount > 0 ? Number(((res.passedCount / res.completedCount) * 100).toFixed(1)) : 0,
      fill: RESULT_COLORS.PASS,
    },
    {
      result: "CONDITIONAL_PASS" as QualityResult,
      label: QUALITY_RESULT_LABELS.CONDITIONAL_PASS,
      count: res.conditionalPassCount,
      percentage: res.completedCount > 0 ? Number(((res.conditionalPassCount / res.completedCount) * 100).toFixed(1)) : 0,
      fill: RESULT_COLORS.CONDITIONAL_PASS,
    },
    {
      result: "FAIL" as QualityResult,
      label: QUALITY_RESULT_LABELS.FAIL,
      count: res.failedCount + res.holdCount,
      percentage: res.completedCount > 0 ? Number((((res.failedCount + res.holdCount) / res.completedCount) * 100).toFixed(1)) : 0,
      fill: RESULT_COLORS.FAIL,
    },
  ];

  const totalCount = res.completedCount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* 헤더 */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-800">품질검사 판정 비율</h3>
        <p className="text-xs text-gray-500 mt-0.5">원재료·공정·완제품 검사 결과 분포</p>
      </div>

      {/* 차트 + 도넛 중앙 텍스트 */}
      {totalCount === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
          표시할 완결된 품질검사 데이터가 없습니다.
        </div>
      ) : (
        <div className="relative" style={{ height: "280px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="44%"
                innerRadius={70}
                outerRadius={108}
                dataKey="percentage"
                nameKey="label"
                paddingAngle={2}
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry: { result: string; fill: string }) => (
                  <Cell key={entry.result} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<QualityTooltip />} />
              <Legend
                formatter={legendFormatter}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* 도넛 중앙 텍스트 — cy 44%에 맞춰 배치 */}
          <div
            className="absolute left-1/2 pointer-events-none flex flex-col items-center"
            style={{ top: "44%", transform: "translate(-50%, -50%)" }}
            aria-hidden="true"
          >
            <span className="text-xs text-gray-500 leading-tight">전체 검사</span>
            <span className="text-2xl font-bold text-gray-900 leading-tight">
              {totalCount}건
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
