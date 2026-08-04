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

import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

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

const VIEW_LABELS: Record<ProductionViewMode, Record<"ko" | "ja", string>> = {
  daily: { ko: "일간", ja: "日別" },
  weekly: { ko: "주간", ja: "週別" },
  monthly: { ko: "월간", ja: "月別" },
};

const DAY_JA_MAP: Record<string, string> = {
  일: "日", 월: "月", 화: "火", 수: "水", 목: "木", 금: "金", 토: "土"
};

const inputClass = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProductionPerformanceAnalytics(props: Props) {
  const { t, language } = useLanguage();
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

  // Lookup maps for Japanese names
  const productJaMap = useMemo(() => {
    const map = new Map<string, string>();
    props.plans.forEach((p) => { if (p.productNameJa) map.set(p.productName, p.productNameJa); });
    props.results.forEach((r) => { if (r.productNameJa) map.set(r.productName, r.productNameJa); });
    return map;
  }, [props.plans, props.results]);

  const lineJaMap = useMemo(() => {
    const map = new Map<string, string>();
    props.plans.forEach((p) => { if (p.lineNameJa) map.set(p.productionLine, p.lineNameJa); });
    props.results.forEach((r) => { if (r.lineNameJa) map.set(r.productionLine, r.lineNameJa); });
    return map;
  }, [props.plans, props.results]);

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
    .filter((item) => {
      const locLabel = localizedName({ locale: language, ko: item.label, ja: productJaMap.get(item.label) });
      return (productFilter === "ALL" || item.label === productFilter) &&
        (item.label.toLowerCase().includes(productSearch.toLowerCase()) || locLabel.toLowerCase().includes(productSearch.toLowerCase()));
    })
    .sort((a, b) => (a[sortKey] - b[sortKey]) * (sortDirection === "asc" ? 1 : -1)), [productFilter, productSearch, snapshot.byProduct, sortDirection, sortKey, language, productJaMap]);

  const detailRows = useMemo(() => snapshot.detailResults.filter((item) =>
    (detailProduct === "ALL" || item.productName === detailProduct)
    && (detailWorker === "ALL" || item.handler === detailWorker)
    && (detailStatus === "ALL" || item.resultStatus === detailStatus)
  ), [detailProduct, detailStatus, detailWorker, snapshot.detailResults]);

  const graphRows: Array<{ date: string; planQuantity: number; productionQuantity: number; defectQuantity: number }> =
    viewMode === "monthly" && monthlyGraph === "weekly"
      ? snapshot.weekly.map((item) => ({ date: item.label, planQuantity: item.planQuantity, productionQuantity: item.productionQuantity, defectQuantity: item.defectQuantity }))
      : snapshot.daily.map((item) => {
          const dayStr = language === "ja" ? (DAY_JA_MAP[item.dayLabel] || item.dayLabel) : item.dayLabel;
          return {
            date: viewMode === "weekly" ? `${item.date.slice(5)}(${dayStr})` : item.date.slice(5),
            planQuantity: item.planQuantity,
            productionQuantity: item.productionQuantity,
            defectQuantity: item.defectQuantity,
          };
        });

  const moveCurrent = () => setAnchorDate(getBusinessDate());
  const changeView = (next: ProductionViewMode) => {
    setViewMode(next);
    setAnchorDate(getBusinessDate());
  };

  const periodLabel = useMemo(() => {
    if (language === "ja") {
      return snapshot.period.label.replace(/년/g, "年").replace(/월/g, "月").replace(/일/g, "日");
    }
    return snapshot.period.label;
  }, [language, snapshot.period.label]);

  const itemUnit = localizedName({ locale: language, ko: "개", ja: "個" });
  const countUnit = localizedName({ locale: language, ko: "건", ja: "件" });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* 1. 컨트롤 필터 바 */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="font-bold text-gray-900">
              {localizedName({ locale: language, ko: "기간별 생산 실적 조회", ja: "期間別生産実績照会" })}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {localizedName({ locale: language, ko: "확정 생산실적과 LOT에 연결된 불량품 이력을 기준으로 집계합니다.", ja: "確定された生産実績とLOTに関連付けられた不良履歴を基準に集計します。" })}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex rounded-lg border border-gray-300 bg-white p-1">
              {(["daily", "weekly", "monthly"] as ProductionViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeView(mode)}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${viewMode === mode ? "bg-blue-600 text-white" : "text-gray-500"}`}
                >
                  {VIEW_LABELS[mode][language]}
                </button>
              ))}
            </div>
            <label className="text-xs font-bold text-gray-600">
              <span className="mb-1 block">
                {viewMode === "monthly"
                  ? localizedName({ locale: language, ko: "조회 월", ja: "照会月" })
                  : viewMode === "weekly"
                  ? localizedName({ locale: language, ko: "기준 날짜", ja: "基準日付" })
                  : localizedName({ locale: language, ko: "조회 날짜", ja: "照会日付" })}
              </span>
              {viewMode === "monthly" ? (
                <input type="month" value={anchorDate.slice(0, 7)} onChange={(e) => setAnchorDate(`${e.target.value}-01`)} className={inputClass} />
              ) : (
                <input type="date" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} className={inputClass} />
              )}
            </label>
            <label className="text-xs font-bold text-gray-600">
              <span className="mb-1 block">{t("master.tab.lines")}</span>
              <select value={line} onChange={(e) => setLine(e.target.value)} className={inputClass}>
                <option value="ALL">{t("production.plan.lineAll")}</option>
                {lines.map((item) => (
                  <option key={item} value={item}>
                    {localizedName({ locale: language, ko: item, ja: lineJaMap.get(item) })}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={moveCurrent} className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-600">
              {viewMode === "daily"
                ? localizedName({ locale: language, ko: "오늘", ja: "今日" })
                : viewMode === "weekly"
                ? localizedName({ locale: language, ko: "이번 주", ja: "今週" })
                : localizedName({ locale: language, ko: "이번 달", ja: "今月" })}
            </button>
            <button disabled={!props.canCreate} onClick={props.onOpenCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300">
              {t("production.result.new")}
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-blue-700">{periodLabel}</p>
      </section>

      {/* 2. KPI 요약 카드 */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard data={{ id: "period-plan", title: t("production.plan.quantity"), value: snapshot.metrics.planQuantity.toLocaleString(), unit: itemUnit, status: "NEUTRAL" }} />
        <DashboardCard data={{ id: "period-production", title: t("production.result.totalQty"), value: snapshot.metrics.productionQuantity.toLocaleString(), unit: itemUnit, status: "GOOD" }} />
        <DashboardCard data={{ id: "period-good", title: t("production.result.goodQty"), value: snapshot.metrics.goodQuantity.toLocaleString(), unit: itemUnit, status: "GOOD" }} />
        <DashboardCard data={{ id: "period-defect", title: t("production.result.defectQty"), value: snapshot.metrics.defectQuantity.toLocaleString(), unit: itemUnit, status: snapshot.metrics.defectRate > 2 ? "DANGER" : "GOOD" }} />
        <DashboardCard data={{ id: "period-achievement", title: t("production.summary.avgAchievementRate"), value: snapshot.metrics.achievementRate.toFixed(1), unit: "%", status: snapshot.metrics.achievementRate >= 80 ? "GOOD" : snapshot.metrics.achievementRate >= 50 ? "WARNING" : "DANGER" }} />
        <DashboardCard data={{ id: "period-defect-rate", title: t("production.result.defectRate"), value: snapshot.metrics.defectRate.toFixed(1), unit: "%", status: snapshot.metrics.defectRate <= 1 ? "GOOD" : snapshot.metrics.defectRate <= 2 ? "WARNING" : "DANGER" }} />
        <DashboardCard data={{ id: "period-work-count", title: localizedName({ locale: language, ko: "작업 건수", ja: "作業件数" }), value: snapshot.metrics.workCount, unit: countUnit, status: "NEUTRAL" }} />
      </section>

      {/* 3. 추이 차트 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold">{localizedName({ locale: language, ko: "기간별 생산 추이", ja: "期間別生産推移" })}</h3>
            <p className="mt-1 text-xs text-gray-500">
              {localizedName({ locale: language, ko: "계획·생산수량과 LOT 연결 불량수량 비교", ja: "計画・生産数量とLOT連携不良数量の比較" })}
            </p>
          </div>
          {viewMode === "monthly" && (
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button onClick={() => setMonthlyGraph("daily")} className={`rounded px-3 py-1 text-xs font-bold ${monthlyGraph === "daily" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}>
                {localizedName({ locale: language, ko: "일자별", ja: "日別" })}
              </button>
              <button onClick={() => setMonthlyGraph("weekly")} className={`rounded px-3 py-1 text-xs font-bold ${monthlyGraph === "weekly" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}>
                {localizedName({ locale: language, ko: "주차별", ja: "週別" })}
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={graphRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" interval={viewMode === "monthly" && monthlyGraph === "daily" ? 4 : 0} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="quantity" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="defect" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()}${itemUnit}`} />
              <Legend />
              <Bar yAxisId="quantity" dataKey="planQuantity" name={t("production.plan.quantity")} fill="#94a3b8" radius={[3, 3, 0, 0]} />
              <Bar yAxisId="quantity" dataKey="productionQuantity" name={t("production.result.totalQty")} fill="#2563eb" radius={[3, 3, 0, 0]} />
              <Line yAxisId="defect" type="monotone" dataKey="defectQuantity" name={t("production.result.defectQty")} stroke="#ef4444" strokeWidth={2.5} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. 이전 기간 비교 */}
      {viewMode !== "daily" && (
        <ComparisonSection
          rows={snapshot.comparison}
          label={snapshot.previousPeriod.label}
          hasData={snapshot.hasPreviousData}
        />
      )}

      {/* 5. 기간별/월간집계 테이블 */}
      {viewMode === "weekly" && <DailyTable rows={snapshot.daily} />}
      {viewMode === "monthly" && (
        <AggregateTable
          title={localizedName({ locale: language, ko: "월간 주차별 집계", ja: "月間週別集計" })}
          firstLabel={localizedName({ locale: language, ko: "주차", ja: "週" })}
          rows={snapshot.weekly}
          productJaMap={productJaMap}
        />
      )}

      {/* 6. 제품별 실적 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold">{localizedName({ locale: language, ko: "제품별 실적", ja: "製品別実績" })}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className={inputClass}
            placeholder={localizedName({ locale: language, ko: "제품명 검색...", ja: "製品名検索..." })}
          />
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)} className={inputClass}>
            <option value="ALL">{localizedName({ locale: language, ko: "전체 제품", ja: "全体製品" })}</option>
            {products.map((item) => (
              <option key={item} value={item}>
                {localizedName({ locale: language, ko: item, ja: productJaMap.get(item) })}
              </option>
            ))}
          </select>
          <select
            value={`${sortKey}-${sortDirection}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split("-") as [SortKey, "asc" | "desc"];
              setSortKey(key);
              setSortDirection(direction);
            }}
            className={inputClass}
          >
            <option value="productionQuantity-desc">{localizedName({ locale: language, ko: "생산수량 높은 순", ja: "生産数量が高い順" })}</option>
            <option value="defectQuantity-desc">{localizedName({ locale: language, ko: "불량수량 높은 순", ja: "不良数量が高い順" })}</option>
            <option value="achievementRate-desc">{localizedName({ locale: language, ko: "달성률 높은 순", ja: "達成率が高い順" })}</option>
            <option value="defectRate-desc">{localizedName({ locale: language, ko: "불량률 높은 순", ja: "不良率が高い順" })}</option>
            <option value="productionQuantity-asc">{localizedName({ locale: language, ko: "생산수량 낮은 순", ja: "生産数量が低い順" })}</option>
          </select>
        </div>
        <MetricTable firstLabel={t("master.field.productName")} rows={productRows} productJaMap={productJaMap} />
      </section>

      {/* 7. 생산라인별 실적 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold">{localizedName({ locale: language, ko: "생산라인별 실적", ja: "生産ライン別実績" })}</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <MetricHeader firstLabel={t("master.tab.lines")} />
            </thead>
            <tbody className="divide-y">
              {snapshot.byLine.map((item) => (
                <tr key={item.key}>
                  <MetricCells
                    item={item}
                    first={
                      <div>
                        <p className="font-bold">{localizedName({ locale: language, ko: item.label, ja: lineJaMap.get(item.label) })}</p>
                        <div className="mt-2 h-1.5 w-32 overflow-hidden rounded bg-gray-100">
                          <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, item.achievementRate)}%` }} />
                        </div>
                      </div>
                    }
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. 상세 생산 실적 */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-bold">{localizedName({ locale: language, ko: "상세 생산 실적", ja: "詳細生産実績" })}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select value={detailProduct} onChange={(e) => setDetailProduct(e.target.value)} className={inputClass}>
            <option value="ALL">{localizedName({ locale: language, ko: "전체 제품", ja: "全体製品" })}</option>
            {products.map((item) => (
              <option key={item} value={item}>
                {localizedName({ locale: language, ko: item, ja: productJaMap.get(item) })}
              </option>
            ))}
          </select>
          <select value={detailWorker} onChange={(e) => setDetailWorker(e.target.value)} className={inputClass}>
            <option value="ALL">{localizedName({ locale: language, ko: "전체 작업자", ja: "全体作業者" })}</option>
            {workers.map((item) => (
              <option key={item} value={item}>
                {localizedName({ locale: language, ko: item })}
              </option>
            ))}
          </select>
          <select value={detailStatus} onChange={(e) => setDetailStatus(e.target.value as ResultStatus | "ALL")} className={inputClass}>
            <option value="ALL">{localizedName({ locale: language, ko: "전체 상태", ja: "全体状態" })}</option>
            <option value="DRAFT">{t("production.resultStatus.draft")}</option>
            <option value="SUBMITTED">{t("production.resultStatus.submitted")}</option>
            <option value="CONFIRMED">{t("production.resultStatus.confirmed")}</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[1400px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-3">{localizedName({ locale: language, ko: "생산일시", ja: "生産日時" })}</th>
                <th className="px-3 py-3">{t("production.workOrder.number")}</th>
                <th className="px-3 py-3">{t("production.result.fgLot")}</th>
                <th className="px-3 py-3">{t("master.field.productName")}</th>
                <th className="px-3 py-3">{t("master.tab.lines")}</th>
                <th className="px-3 py-3 text-right">{t("production.plan.quantity")}</th>
                <th className="px-3 py-3 text-right">{t("production.result.totalQty")}</th>
                <th className="px-3 py-3 text-right">{t("production.result.goodQty")}</th>
                <th className="px-3 py-3 text-right">{t("production.result.defectQty")}</th>
                <th className="px-3 py-3">{t("master.field.manager")}</th>
                <th className="px-3 py-3">{t("production.plan.status")}</th>
                <th className="px-3 py-3">{t("production.plan.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {detailRows.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-3 whitespace-nowrap">{item.actualEndTime}</td>
                  <td className="px-3 py-3 font-mono text-xs">{item.workOrderNo}</td>
                  <td className="px-3 py-3">
                    {item.lotNumber ? (
                      <Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="font-mono text-xs font-bold text-blue-600 underline">
                        {item.lotNumber}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{localizedName({ locale: language, ko: "미생성", ja: "未生成" })}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-bold">
                    {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                  </td>
                  <td className="px-3 py-3">
                    {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                  </td>
                  <td className="px-3 py-3 text-right">{item.orderedQuantity.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-bold text-blue-700">{item.totalQuantity.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right text-emerald-700">{item.displayGoodQuantity.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-bold text-red-600">{item.linkedDefectQuantity.toLocaleString()}</td>
                  <td className="px-3 py-3">{localizedName({ locale: language, ko: item.handler })}</td>
                  <td className="px-3 py-3"><ResultStatusBadge status={item.resultStatus} /></td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <button onClick={() => props.onOpenDetail(item)} className="rounded bg-gray-100 px-2 py-1 text-xs font-bold">
                      {t("action.detail")}
                    </button>
                    {item.resultStatus !== "CONFIRMED" && (
                      <button disabled={!props.canApprove} onClick={() => props.onConfirmResult(item.id)} className="ml-1 rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white disabled:bg-gray-300">
                        {t("action.confirm")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {detailRows.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-400">
              {localizedName({ locale: language, ko: "선택 기간의 생산실적이 없습니다.", ja: "選択期間の生産実績がありません。" })}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ComparisonSection({ rows, label, hasData }: { rows: ReturnType<typeof buildProductionAnalytics>["comparison"]; label: string; hasData: boolean }) {
  const { t, language } = useLanguage();
  const formatMetricWithLang = (key: ProductionMetricKey, value: number) => {
    const unit = localizedName({ locale: language, ko: "개", ja: "個" });
    return key.endsWith("Rate") ? `${value.toFixed(1)}%` : `${value.toLocaleString()}${unit}`;
  };
  const formatDiffWithLang = (key: ProductionMetricKey, value: number) => {
    const unit = localizedName({ locale: language, ko: "개", ja: "個" });
    return key.endsWith("Rate") ? `${Math.abs(value).toFixed(1)}%p` : `${Math.abs(value).toLocaleString()}${unit}`;
  };

  const formattedLabel = language === "ja" ? label.replace(/년/g, "年").replace(/월/g, "月").replace(/일/g, "日") : label;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">{localizedName({ locale: language, ko: "이전 기간 비교", ja: "前期間比較" })}</h3>
      <p className="mt-1 text-xs text-gray-500">{localizedName({ locale: language, ko: "비교 기간: ", ja: "比較期間: " })}{formattedLabel}</p>
      {!hasData ? (
        <p className="py-10 text-center text-sm text-gray-400">{localizedName({ locale: language, ko: "비교 데이터 없음", ja: "比較データなし" })}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((item) => {
            const rising = item.difference > 0;
            const favorable = item.inverse ? !rising : rising;
            const color = item.difference === 0 ? "text-gray-500" : favorable ? "text-emerald-600" : "text-red-600";
            return (
              <div key={item.key} className="rounded-lg border p-4">
                <p className="text-xs text-gray-500">
                  {localizedName({ locale: language, ko: item.label, ja: item.label === "계획수량" ? "計画数量" : item.label === "생산수량" ? "生産数量" : item.label === "양품수량" ? "良品数量" : item.label === "불량수량" ? "不良数量" : item.label === "달성률" ? "達成率" : "不良率" })}
                </p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-xl font-extrabold">{formatMetricWithLang(item.key, item.current)}</p>
                  <p className={`text-sm font-bold ${color}`}>
                    {item.difference > 0 ? "▲" : item.difference < 0 ? "▼" : "−"} {formatDiffWithLang(item.key, item.difference)} · {item.changeRate === null ? localizedName({ locale: language, ko: "기준 없음", ja: "基準なし" }) : `${Math.abs(item.changeRate).toFixed(1)}%`}
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {localizedName({ locale: language, ko: "이전 ", ja: "前 " })}{formatMetricWithLang(item.key, item.previous)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DailyTable({ rows }: { rows: ReturnType<typeof buildProductionAnalytics>["daily"] }) {
  const { language } = useLanguage();
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">{localizedName({ locale: language, ko: "주간 일자별 실적", ja: "週間日別実績" })}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-3 py-3 text-left">{localizedName({ locale: language, ko: "날짜", ja: "日付" })}</th>
              <th className="px-3 py-3">{localizedName({ locale: language, ko: "요일", ja: "曜日" })}</th>
              <MetricHeaderCellCols />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((item) => (
              <tr key={item.date}>
                <td className="px-3 py-3 font-mono">{item.date}</td>
                <td className="px-3 py-3 text-center">{language === "ja" ? (DAY_JA_MAP[item.dayLabel] || item.dayLabel) : item.dayLabel}</td>
                <MetricNumberCells item={item} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AggregateTable({ title, firstLabel, rows, productJaMap }: { title: string; firstLabel: string; rows: ProductionAggregateRow[]; productJaMap?: Map<string, string> }) {
  const { language } = useLanguage();
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold">{title}</h3>
      <MetricTable firstLabel={firstLabel} rows={rows} productJaMap={productJaMap} />
    </section>
  );
}

function MetricTable({ firstLabel, rows, productJaMap }: { firstLabel: string; rows: ProductionAggregateRow[]; productJaMap?: Map<string, string> }) {
  const { language } = useLanguage();
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[850px] text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <MetricHeader firstLabel={firstLabel} />
        </thead>
        <tbody className="divide-y">
          {rows.map((item) => (
            <tr key={item.key}>
              <MetricCells
                item={item}
                first={<span className="font-bold">{localizedName({ locale: language, ko: item.label, ja: productJaMap?.get(item.label) })}</span>}
              />
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">
          {localizedName({ locale: language, ko: "집계 데이터가 없습니다.", ja: "集計データがありません。" })}
        </p>
      )}
    </div>
  );
}

function MetricHeader({ firstLabel }: { firstLabel: string }) {
  return (
    <tr>
      <th className="px-3 py-3 text-left">{firstLabel}</th>
      <MetricHeaderCellCols />
    </tr>
  );
}

function MetricHeaderCellCols() {
  const { t } = useLanguage();
  return (
    <>
      <th className="px-3 py-3 text-right">{t("production.plan.quantity")}</th>
      <th className="px-3 py-3 text-right">{t("production.result.totalQty")}</th>
      <th className="px-3 py-3 text-right">{t("production.result.goodQty")}</th>
      <th className="px-3 py-3 text-right">{t("production.result.defectQty")}</th>
      <th className="px-3 py-3 text-right">{t("production.plan.achievementRate")}</th>
      <th className="px-3 py-3 text-right">{t("production.result.defectRate")}</th>
    </>
  );
}

function MetricCells({ item, first }: { item: ProductionAggregateRow; first: React.ReactNode }) {
  return (
    <>
      <td className="px-3 py-3">{first}</td>
      <MetricNumberCells item={item} />
    </>
  );
}

function MetricNumberCells({ item }: { item: { planQuantity: number; productionQuantity: number; goodQuantity: number; defectQuantity: number; achievementRate: number; defectRate: number } }) {
  return (
    <>
      <td className="px-3 py-3 text-right">{item.planQuantity.toLocaleString()}</td>
      <td className="px-3 py-3 text-right font-bold text-blue-700">{item.productionQuantity.toLocaleString()}</td>
      <td className="px-3 py-3 text-right text-emerald-700">{item.goodQuantity.toLocaleString()}</td>
      <td className="px-3 py-3 text-right font-bold text-red-600">{item.defectQuantity.toLocaleString()}</td>
      <td className="px-3 py-3 text-right font-bold">{item.achievementRate.toFixed(1)}%</td>
      <td className="px-3 py-3 text-right">{item.defectRate.toFixed(1)}%</td>
    </>
  );
}
