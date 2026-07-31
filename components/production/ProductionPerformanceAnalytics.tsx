"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";
import { ResultStatusBadge } from "@/components/production/ProductionStatusBadge";
import { buildProductionAnalytics } from "@/lib/selectors/production-analytics-selectors";
import { getBusinessDate } from "@/lib/selectors/business-date";
import type { DefectHistory } from "@/types/quality";
import type { FinishedGoodsLot, ProductionPlan, ProductionResult, ResultStatus } from "@/types/production";
import type { ProductionAggregateRow, ProductionMetricKey, ProductionViewMode } from "@/types/production-analytics";

type SortKey = "productionQuantity" | "defectQuantity" | "achievementRate" | "defectRate";

interface Props {
  plans: ProductionPlan[];
  results: ProductionResult[];
  lots: FinishedGoodsLot[];
  defects: DefectHistory[];
  canCreate: boolean;
  canApprove: boolean;
  onOpenCreate: () => void;
  onOpenDetail: (item: ProductionResult) => void;
  onConfirmResult: (id: string) => void;
}

const VIEW_LABELS: Record<ProductionViewMode, string> = { daily: "일간", weekly: "주간", monthly: "월간" };
const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProductionPerformanceAnalytics(props: Props) {
  const today = getBusinessDate();
  const [viewMode, setViewMode] = useState<ProductionViewMode>("daily");
  const [anchorDate, setAnchorDate] = useState(today);
  const [line, setLine] = useState("ALL");
  const [monthlyGraph, setMonthlyGraph] = useState<"daily" | "weekly">("daily");
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("productionQuantity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [detailProduct, setDetailProduct] = useState("ALL");
  const [detailWorker, setDetailWorker] = useState("ALL");
  const [detailStatus, setDetailStatus] = useState<ResultStatus | "ALL">("ALL");

  const lines = useMemo(() => [...new Set([...props.plans.map((item) => item.productionLine), ...props.results.map((item) => item.productionLine)])].sort(), [props.plans, props.results]);
  const snapshot = useMemo(() => buildProductionAnalytics({
    plans: props.plans,
    results: props.results,
    lots: props.lots,
    defects: props.defects,
    viewMode,
    anchorDate,
    productionLine: line,
  }), [anchorDate, line, props.defects, props.lots, props.plans, props.results, viewMode]);

  const products = useMemo(() => [...new Set(snapshot.byProduct.map((item) => item.label))].sort(), [snapshot.byProduct]);
  const workers = useMemo(() => [...new Set(snapshot.detailResults.map((item) => item.handler))].sort(), [snapshot.detailResults]);
  const productRows = useMemo(() => snapshot.byProduct
    .filter((item) => (productFilter === "ALL" || item.label === productFilter) && item.label.toLowerCase().includes(productSearch.toLowerCase()))
    .sort((a, b) => (a[sortKey] - b[sortKey]) * (sortDirection === "asc" ? 1 : -1)), [productFilter, productSearch, snapshot.byProduct, sortDirection, sortKey]);
  const detailRows = useMemo(() => snapshot.detailResults.filter((item) =>
    (detailProduct === "ALL" || item.productName === detailProduct)
    && (detailWorker === "ALL" || item.handler === detailWorker)
    && (detailStatus === "ALL" || item.resultStatus === detailStatus)
  ), [detailProduct, detailStatus, detailWorker, snapshot.detailResults]);

  const graphRows: Array<{ date: string; planQuantity: number; productionQuantity: number; defectQuantity: number }> =
    viewMode === "monthly" && monthlyGraph === "weekly"
      ? snapshot.weekly.map((item) => ({ date: item.label, planQuantity: item.planQuantity, productionQuantity: item.productionQuantity, defectQuantity: item.defectQuantity }))
      : snapshot.daily.map((item) => ({ date: viewMode === "weekly" ? `${item.date.slice(5)}(${item.dayLabel})` : item.date.slice(5), planQuantity: item.planQuantity, productionQuantity: item.productionQuantity, defectQuantity: item.defectQuantity }));
  const moveCurrent = () => setAnchorDate(getBusinessDate());
  const changeView = (next: ProductionViewMode) => {
    setViewMode(next);
    setAnchorDate(getBusinessDate());
  };

  return <div className="space-y-6 p-4 sm:p-6">
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h3 className="font-bold text-gray-900">기간별 생산 실적 조회</h3>
          <p className="mt-1 text-xs text-gray-500">확정 생산실적과 LOT에 연결된 불량품 이력을 기준으로 집계합니다.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex rounded-lg border border-gray-300 bg-white p-1">{(["daily", "weekly", "monthly"] as ProductionViewMode[]).map((mode) => <button key={mode} onClick={() => changeView(mode)} className={`rounded-md px-3 py-1.5 text-sm font-bold ${viewMode === mode ? "bg-blue-600 text-white" : "text-gray-500"}`}>{VIEW_LABELS[mode]}</button>)}</div>
          <label className="text-xs font-bold text-gray-600"><span className="mb-1 block">{viewMode === "monthly" ? "조회 월" : viewMode === "weekly" ? "기준 날짜" : "조회 날짜"}</span>{viewMode === "monthly" ? <input type="month" value={anchorDate.slice(0, 7)} onChange={(e) => setAnchorDate(`${e.target.value}-01`)} className={inputClass} /> : <input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} className={inputClass} />}</label>
          <label className="text-xs font-bold text-gray-600"><span className="mb-1 block">생산라인</span><select value={line} onChange={(e) => setLine(e.target.value)} className={inputClass}><option value="ALL">전체 생산라인</option>{lines.map((item) => <option key={item}>{item}</option>)}</select></label>
          <button onClick={moveCurrent} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-600">{viewMode === "daily" ? "오늘" : viewMode === "weekly" ? "이번 주" : "이번 달"}</button>
          <button disabled={!props.canCreate} onClick={props.onOpenCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300">생산실적 등록</button>
        </div>
      </div>
      <p className="mt-3 text-sm font-bold text-blue-700">{snapshot.period.label}</p>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardCard data={{ id: "period-plan", title: "계획수량", value: snapshot.metrics.planQuantity.toLocaleString(), unit: "개", status: "NEUTRAL" }} />
      <DashboardCard data={{ id: "period-production", title: "총 생산수량", value: snapshot.metrics.productionQuantity.toLocaleString(), unit: "개", status: "GOOD" }} />
      <DashboardCard data={{ id: "period-good", title: "양품수량", value: snapshot.metrics.goodQuantity.toLocaleString(), unit: "개", status: "GOOD" }} />
      <DashboardCard data={{ id: "period-defect", title: "불량수량", value: snapshot.metrics.defectQuantity.toLocaleString(), unit: "개", status: snapshot.metrics.defectRate > 2 ? "DANGER" : "GOOD" }} />
      <DashboardCard data={{ id: "period-achievement", title: "생산 달성률", value: snapshot.metrics.achievementRate.toFixed(1), unit: "%", status: snapshot.metrics.achievementRate >= 80 ? "GOOD" : snapshot.metrics.achievementRate >= 50 ? "WARNING" : "DANGER" }} />
      <DashboardCard data={{ id: "period-defect-rate", title: "불량률", value: snapshot.metrics.defectRate.toFixed(1), unit: "%", status: snapshot.metrics.defectRate <= 1 ? "GOOD" : snapshot.metrics.defectRate <= 2 ? "WARNING" : "DANGER" }} />
      <DashboardCard data={{ id: "period-work-count", title: "작업 건수", value: snapshot.metrics.workCount, unit: "건", status: "NEUTRAL" }} />
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">기간별 생산 추이</h3><p className="mt-1 text-xs text-gray-500">계획·생산수량과 LOT 연결 불량수량 비교</p></div>{viewMode === "monthly" && <div className="flex rounded-lg bg-gray-100 p-1"><button onClick={() => setMonthlyGraph("daily")} className={`rounded px-3 py-1 text-xs font-bold ${monthlyGraph === "daily" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}>일자별</button><button onClick={() => setMonthlyGraph("weekly")} className={`rounded px-3 py-1 text-xs font-bold ${monthlyGraph === "weekly" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}>주차별</button></div>}</div>
      <div className="mt-4 h-80"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={graphRows}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="date" interval={viewMode === "monthly" && monthlyGraph === "daily" ? 4 : 0} tick={{ fontSize: 11 }} /><YAxis yAxisId="quantity" tick={{ fontSize: 11 }} /><YAxis yAxisId="defect" orientation="right" tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => `${Number(value).toLocaleString()}개`} /><Legend /><Bar yAxisId="quantity" dataKey="planQuantity" name="계획수량" fill="#94a3b8" radius={[3, 3, 0, 0]} /><Bar yAxisId="quantity" dataKey="productionQuantity" name="생산수량" fill="#2563eb" radius={[3, 3, 0, 0]} /><Line yAxisId="defect" type="monotone" dataKey="defectQuantity" name="불량수량" stroke="#ef4444" strokeWidth={2.5} /></ComposedChart></ResponsiveContainer></div>
    </section>

    {viewMode !== "daily" && <ComparisonSection rows={snapshot.comparison} label={snapshot.previousPeriod.label} hasData={snapshot.hasPreviousData} />}

    {viewMode === "weekly" && <DailyTable rows={snapshot.daily} />}
    {viewMode === "monthly" && <AggregateTable title="월간 주차별 집계" firstLabel="주차" rows={snapshot.weekly} />}

    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">제품별 실적</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3"><input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className={inputClass} placeholder="제품명 검색" /><select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={inputClass}><option value="ALL">전체 제품</option>{products.map((item) => <option key={item}>{item}</option>)}</select><select value={`${sortKey}-${sortDirection}`} onChange={(e) => { const [key, direction] = e.target.value.split("-") as [SortKey, "asc" | "desc"]; setSortKey(key); setSortDirection(direction); }} className={inputClass}><option value="productionQuantity-desc">생산수량 높은 순</option><option value="defectQuantity-desc">불량수량 높은 순</option><option value="achievementRate-desc">달성률 높은 순</option><option value="defectRate-desc">불량률 높은 순</option><option value="productionQuantity-asc">생산수량 낮은 순</option></select></div>
      <MetricTable firstLabel="제품명" rows={productRows} />
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold">생산라인별 실적</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><MetricHeader firstLabel="생산라인" /></thead><tbody className="divide-y">{snapshot.byLine.map((item) => <tr key={item.key}><MetricCells item={item} first={<div><p className="font-bold">{item.label}</p><div className="mt-2 h-1.5 w-32 overflow-hidden rounded bg-gray-100"><div className="h-full bg-blue-600" style={{ width: `${Math.min(100, item.achievementRate)}%` }} /></div></div>} /></tr>)}</tbody></table></div></section>

    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">상세 생산 실적</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3"><select value={detailProduct} onChange={(e) => setDetailProduct(e.target.value)} className={inputClass}><option value="ALL">전체 제품</option>{products.map((item) => <option key={item}>{item}</option>)}</select><select value={detailWorker} onChange={(e) => setDetailWorker(e.target.value)} className={inputClass}><option value="ALL">전체 작업자</option>{workers.map((item) => <option key={item}>{item}</option>)}</select><select value={detailStatus} onChange={(e) => setDetailStatus(e.target.value as ResultStatus | "ALL")} className={inputClass}><option value="ALL">전체 상태</option><option value="DRAFT">임시저장</option><option value="SUBMITTED">제출완료</option><option value="CONFIRMED">확정</option></select></div>
      <div className="mt-4 overflow-x-auto rounded-lg border"><table className="w-full min-w-[1400px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-3 py-3">생산일시</th><th className="px-3 py-3">작업지시번호</th><th className="px-3 py-3">LOT 번호</th><th className="px-3 py-3">제품명</th><th className="px-3 py-3">생산라인</th><th className="px-3 py-3 text-right">계획수량</th><th className="px-3 py-3 text-right">생산수량</th><th className="px-3 py-3 text-right">양품수량</th><th className="px-3 py-3 text-right">불량수량</th><th className="px-3 py-3">작업자</th><th className="px-3 py-3">상태</th><th className="px-3 py-3">작업</th></tr></thead><tbody className="divide-y">{detailRows.map((item) => <tr key={item.id}><td className="px-3 py-3 whitespace-nowrap">{item.actualEndTime}</td><td className="px-3 py-3 font-mono text-xs">{item.workOrderNo}</td><td className="px-3 py-3">{item.lotNumber ? <Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="font-mono text-xs font-bold text-blue-600 underline">{item.lotNumber}</Link> : <span className="text-gray-400">미생성</span>}</td><td className="px-3 py-3 font-bold">{item.productName}</td><td className="px-3 py-3">{item.productionLine}</td><td className="px-3 py-3 text-right">{item.orderedQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right font-bold text-blue-700">{item.totalQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right text-emerald-700">{item.displayGoodQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right font-bold text-red-600">{item.linkedDefectQuantity.toLocaleString()}</td><td className="px-3 py-3">{item.handler}</td><td className="px-3 py-3"><ResultStatusBadge status={item.resultStatus} /></td><td className="px-3 py-3 whitespace-nowrap"><button onClick={() => props.onOpenDetail(item)} className="rounded bg-gray-100 px-2 py-1 text-xs font-bold">상세</button>{item.resultStatus !== "CONFIRMED" && <button disabled={!props.canApprove} onClick={() => props.onConfirmResult(item.id)} className="ml-1 rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white disabled:bg-gray-300">확정</button>}</td></tr>)}</tbody></table>{detailRows.length === 0 && <p className="py-12 text-center text-sm text-gray-400">선택 기간의 생산실적이 없습니다.</p>}</div>
    </section>
  </div>;
}

function ComparisonSection({ rows, label, hasData }: { rows: ReturnType<typeof buildProductionAnalytics>["comparison"]; label: string; hasData: boolean }) {
  return <section className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold">이전 기간 비교</h3><p className="mt-1 text-xs text-gray-500">비교 기간: {label}</p>{!hasData ? <p className="py-10 text-center text-sm text-gray-400">비교 데이터 없음</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map((item) => { const rising = item.difference > 0; const favorable = item.inverse ? !rising : rising; const color = item.difference === 0 ? "text-gray-500" : favorable ? "text-emerald-600" : "text-red-600"; return <div key={item.key} className="rounded-lg border p-4"><p className="text-xs text-gray-500">{item.label}</p><div className="mt-2 flex items-end justify-between"><p className="text-xl font-extrabold">{formatMetric(item.key, item.current)}</p><p className={`text-sm font-bold ${color}`}>{item.difference > 0 ? "▲" : item.difference < 0 ? "▼" : "−"} {formatDifference(item.key, item.difference)} · {item.changeRate === null ? "기준 없음" : `${Math.abs(item.changeRate).toFixed(1)}%`}</p></div><p className="mt-2 text-xs text-gray-400">이전 {formatMetric(item.key, item.previous)}</p></div>; })}</div>}</section>;
}

function DailyTable({ rows }: { rows: ReturnType<typeof buildProductionAnalytics>["daily"] }) {
  return <section className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold">주간 일자별 실적</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-3 text-left">날짜</th><th className="px-3 py-3">요일</th><th className="px-3 py-3 text-right">계획수량</th><th className="px-3 py-3 text-right">생산수량</th><th className="px-3 py-3 text-right">양품수량</th><th className="px-3 py-3 text-right">불량수량</th><th className="px-3 py-3 text-right">달성률</th><th className="px-3 py-3 text-right">불량률</th></tr></thead><tbody className="divide-y">{rows.map((item) => <tr key={item.date}><td className="px-3 py-3 font-mono">{item.date}</td><td className="px-3 py-3 text-center">{item.dayLabel}</td><MetricNumberCells item={item} /></tr>)}</tbody></table></div></section>;
}

function AggregateTable({ title, firstLabel, rows }: { title: string; firstLabel: string; rows: ProductionAggregateRow[] }) {
  return <section className="rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-bold">{title}</h3><MetricTable firstLabel={firstLabel} rows={rows} /></section>;
}
function MetricTable({ firstLabel, rows }: { firstLabel: string; rows: ProductionAggregateRow[] }) {
  return <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><MetricHeader firstLabel={firstLabel} /></thead><tbody className="divide-y">{rows.map((item) => <tr key={item.key}><MetricCells item={item} first={<span className="font-bold">{item.label}</span>} /></tr>)}</tbody></table>{rows.length === 0 && <p className="py-10 text-center text-sm text-gray-400">집계 데이터가 없습니다.</p>}</div>;
}
function MetricHeader({ firstLabel }: { firstLabel: string }) { return <tr><th className="px-3 py-3 text-left">{firstLabel}</th><th className="px-3 py-3 text-right">계획수량</th><th className="px-3 py-3 text-right">생산수량</th><th className="px-3 py-3 text-right">양품수량</th><th className="px-3 py-3 text-right">불량수량</th><th className="px-3 py-3 text-right">달성률</th><th className="px-3 py-3 text-right">불량률</th></tr>; }
function MetricCells({ item, first }: { item: ProductionAggregateRow; first: React.ReactNode }) { return <><td className="px-3 py-3">{first}</td><MetricNumberCells item={item} /></>; }
function MetricNumberCells({ item }: { item: { planQuantity: number; productionQuantity: number; goodQuantity: number; defectQuantity: number; achievementRate: number; defectRate: number } }) { return <><td className="px-3 py-3 text-right">{item.planQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right font-bold text-blue-700">{item.productionQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right text-emerald-700">{item.goodQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right font-bold text-red-600">{item.defectQuantity.toLocaleString()}</td><td className="px-3 py-3 text-right font-bold">{item.achievementRate.toFixed(1)}%</td><td className="px-3 py-3 text-right">{item.defectRate.toFixed(1)}%</td></>; }
function formatMetric(key: ProductionMetricKey, value: number) { return key.endsWith("Rate") ? `${value.toFixed(1)}%` : `${value.toLocaleString()}개`; }
function formatDifference(key: ProductionMetricKey, value: number) { return key.endsWith("Rate") ? `${Math.abs(value).toFixed(1)}%p` : `${Math.abs(value).toLocaleString()}개`; }
