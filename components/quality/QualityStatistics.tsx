"use client";

import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAdmin } from "@/context/AdminContext";
import { useProduction } from "@/context/ProductionContext";
import { buildQualityDefectStatistics } from "@/lib/selectors/quality-statistics-selectors";
import { getBusinessDate } from "@/lib/selectors/business-date";
import type { DefectHistory, QualitySummary } from "@/types/quality";
import type { ProductionViewMode } from "@/types/production-analytics";

const VIEW_LABELS: Record<ProductionViewMode, string> = { daily: "일간", weekly: "주간", monthly: "월간" };
const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function QualityStatistics({ quality, defects }: { quality: QualitySummary; defects: DefectHistory[] }) {
  const { results, fgLots } = useProduction();
  const { canAccessProductionLine } = useAdmin();
  const [viewMode, setViewMode] = useState<ProductionViewMode>("daily");
  const [anchorDate, setAnchorDate] = useState(getBusinessDate());
  const scopedResults = useMemo(() => results.filter((item) => canAccessProductionLine(item.productionLine)), [canAccessProductionLine, results]);
  const scopedLots = useMemo(() => fgLots.filter((item) => canAccessProductionLine(item.productionLine)), [canAccessProductionLine, fgLots]);
  const statistics = useMemo(() => buildQualityDefectStatistics({
    results: scopedResults,
    lots: scopedLots,
    defects,
    viewMode,
    anchorDate,
  }), [anchorDate, defects, scopedLots, scopedResults, viewMode]);
  const chartData = statistics.daily.map((item) => ({
    label: viewMode === "weekly" ? `${item.date.slice(5)}(${item.dayLabel})` : item.date.slice(5),
    productionQuantity: item.productionQuantity,
    defectQuantity: item.defectQuantity,
    defectRate: item.defectRate,
  }));

  const changeView = (mode: ProductionViewMode) => {
    setViewMode(mode);
    setAnchorDate(getBusinessDate());
  };

  return <div className="space-y-6 p-4 sm:p-6">
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><h3 className="font-bold text-gray-900">기간별 불량률 조회</h3><p className="mt-1 text-xs text-gray-500">확정 생산실적과 완제품 LOT에 연결된 불량품 이력을 기준으로 계산합니다.</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex rounded-lg border border-gray-300 bg-white p-1">{(["daily", "weekly", "monthly"] as ProductionViewMode[]).map((mode) => <button key={mode} onClick={() => changeView(mode)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${viewMode === mode ? "bg-blue-600 text-white" : "text-gray-500"}`}>{VIEW_LABELS[mode]}</button>)}</div>
          <label className="text-xs font-bold text-gray-600"><span className="mb-1 block">{viewMode === "monthly" ? "조회 월" : viewMode === "weekly" ? "기준 날짜" : "조회 날짜"}</span>{viewMode === "monthly" ? <input type="month" value={anchorDate.slice(0, 7)} onChange={(e) => setAnchorDate(`${e.target.value}-01`)} className={inputClass} /> : <input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} className={inputClass} />}</label>
          <button onClick={() => setAnchorDate(getBusinessDate())} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-600">{viewMode === "daily" ? "오늘" : viewMode === "weekly" ? "이번 주" : "이번 달"}</button>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-blue-700">{statistics.period.label}</p>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="총 생산수량" value={statistics.productionQuantity.toLocaleString()} unit="개" color="text-blue-600" />
      <StatCard label="불량 건수" value={statistics.defectCount.toLocaleString()} unit="건" color="text-red-600" />
      <StatCard label="불량수량" value={statistics.defectQuantity.toLocaleString()} unit="개" color="text-orange-600" />
      <StatCard label={`${VIEW_LABELS[viewMode]} 불량률`} value={statistics.defectRate.toFixed(2)} unit="%" color={statistics.defectRate > 2 ? "text-red-600" : "text-emerald-600"} />
      <StatCard label="처리 완료율" value={statistics.completionRate.toFixed(1)} unit="%" color="text-emerald-600" />
      <StatCard label="미완료 시정조치" value={quality.unresolvedCACount.toLocaleString()} unit="건" color="text-purple-600" />
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">생산수량·불량수량·불량률 추이</h3>
      <div className="mt-4 h-80"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="label" interval={viewMode === "monthly" ? 4 : 0} tick={{ fontSize: 11 }} /><YAxis yAxisId="quantity" tick={{ fontSize: 11 }} /><YAxis yAxisId="rate" orientation="right" unit="%" tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar yAxisId="quantity" dataKey="productionQuantity" name="생산수량" fill="#2563eb" radius={[3, 3, 0, 0]} /><Bar yAxisId="quantity" dataKey="defectQuantity" name="불량수량" fill="#f97316" radius={[3, 3, 0, 0]} /><Line yAxisId="rate" type="monotone" dataKey="defectRate" name="불량률(%)" stroke="#dc2626" strokeWidth={2.5} /></ComposedChart></ResponsiveContainer></div>
    </section>

    {viewMode !== "daily" && <section className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold">{VIEW_LABELS[viewMode]} 일자별 불량률</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[750px] text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-4 py-3 text-left">날짜</th><th className="px-4 py-3">요일</th><th className="px-4 py-3 text-right">생산수량</th><th className="px-4 py-3 text-right">불량수량</th><th className="px-4 py-3 text-right">불량률</th></tr></thead><tbody className="divide-y">{statistics.daily.map((item) => <tr key={item.date}><td className="px-4 py-3 font-mono">{item.date}</td><td className="px-4 py-3 text-center">{item.dayLabel}</td><td className="px-4 py-3 text-right font-bold text-blue-700">{item.productionQuantity.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold text-orange-600">{item.defectQuantity.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold">{item.defectRate.toFixed(2)}%</td></tr>)}</tbody></table></div></section>}

    <p className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">불량률 = 선택 기간의 LOT 연결 불량수량 ÷ 확정 생산수량 × 100. 생산실적의 불량수량과 불량품 이력을 중복 합산하지 않습니다.</p>
  </div>;
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{label}</p><p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}<span className="ml-1 text-sm font-normal text-gray-500">{unit}</span></p></div>;
}
