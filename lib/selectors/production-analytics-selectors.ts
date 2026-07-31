import type { DefectHistory } from "@/types/quality";
import type { FinishedGoodsLot, ProductionPlan, ProductionResult } from "@/types/production";
import type {
  DailyProductionRow,
  ProductionAggregateRow,
  ProductionAnalyticsSnapshot,
  ProductionComparisonRow,
  ProductionMetrics,
  ProductionPeriod,
  ProductionResultDetail,
  ProductionViewMode,
} from "@/types/production-analytics";
import { getBusinessDate, parseBusinessDate } from "./business-date";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const METRIC_COMPARISON = [
  ["planQuantity", "계획수량", false],
  ["productionQuantity", "생산수량", false],
  ["goodQuantity", "양품수량", false],
  ["defectQuantity", "불량수량", true],
  ["achievementRate", "달성률", false],
  ["defectRate", "불량률", true],
] as const;

function dateOnly(value: Date) {
  return getBusinessDate(value);
}

function addDays(value: Date, days: number) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function startOfWeek(value: Date) {
  const offset = (value.getDay() + 6) % 7;
  return addDays(value, -offset);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

function inRange(dateValue: string, period: ProductionPeriod) {
  const date = parseBusinessDate(dateValue);
  const start = parseBusinessDate(period.startDate);
  const end = parseBusinessDate(period.endDate);
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export function getProductionPeriod(viewMode: ProductionViewMode, anchorDate: string): ProductionPeriod {
  const anchor = parseBusinessDate(anchorDate);
  if (viewMode === "weekly") {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    return { startDate: dateOnly(start), endDate: dateOnly(end), viewMode, label: `${dateOnly(start)} ~ ${dateOnly(end)}` };
  }
  if (viewMode === "monthly") {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = endOfMonth(anchor);
    return { startDate: dateOnly(start), endDate: dateOnly(end), viewMode, label: `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월` };
  }
  const date = dateOnly(anchor);
  return { startDate: date, endDate: date, viewMode, label: date };
}

export function getPreviousProductionPeriod(period: ProductionPeriod): ProductionPeriod {
  const start = parseBusinessDate(period.startDate);
  if (period.viewMode === "weekly") return getProductionPeriod("weekly", dateOnly(addDays(start, -7)));
  if (period.viewMode === "monthly") return getProductionPeriod("monthly", dateOnly(new Date(start.getFullYear(), start.getMonth() - 1, 1)));
  return getProductionPeriod("daily", dateOnly(addDays(start, -1)));
}

function rate(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function emptyMetrics(): ProductionMetrics {
  return { planQuantity: 0, productionQuantity: 0, goodQuantity: 0, defectQuantity: 0, achievementRate: 0, defectRate: 0, workCount: 0 };
}

function finishMetrics(value: ProductionMetrics): ProductionMetrics {
  return {
    ...value,
    goodQuantity: Math.max(0, value.productionQuantity - value.defectQuantity),
    achievementRate: rate(value.productionQuantity, value.planQuantity),
    defectRate: rate(value.defectQuantity, value.productionQuantity),
  };
}

function buildDefectByResult(results: ProductionResult[], lots: FinishedGoodsLot[], defects: DefectHistory[]) {
  const lotByResult = new Map(lots.map((lot) => [lot.resultNo, lot]));
  const defectByLot = new Map<string, number>();
  defects.forEach((item) => defectByLot.set(item.lotNumber, (defectByLot.get(item.lotNumber) ?? 0) + item.defectQuantity));
  const defectByResult = new Map<string, number>();
  results.forEach((result) => {
    const lot = lotByResult.get(result.resultNo);
    defectByResult.set(result.resultNo, lot && defectByLot.has(lot.fgLotNo) ? defectByLot.get(lot.fgLotNo)! : result.defectQuantity);
  });
  return { lotByResult, defectByResult };
}

function aggregate(
  plans: ProductionPlan[],
  results: ProductionResult[],
  defectByResult: Map<string, number>
): ProductionMetrics {
  const value = emptyMetrics();
  value.planQuantity = plans.reduce((sum, item) => sum + item.plannedQuantity, 0);
  value.productionQuantity = results.reduce((sum, item) => sum + item.totalQuantity, 0);
  value.defectQuantity = results.reduce((sum, item) => sum + (defectByResult.get(item.resultNo) ?? 0), 0);
  value.workCount = results.length;
  return finishMetrics(value);
}

function datesInPeriod(period: ProductionPeriod) {
  const start = parseBusinessDate(period.startDate);
  const end = parseBusinessDate(period.endDate);
  const dates: string[] = [];
  for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) dates.push(dateOnly(cursor));
  return dates;
}

function aggregateGroups(
  keys: Array<{ key: string; label: string }>,
  plans: ProductionPlan[],
  results: ProductionResult[],
  defectByResult: Map<string, number>,
  planKey: (item: ProductionPlan) => string,
  resultKey: (item: ProductionResult) => string
): ProductionAggregateRow[] {
  return keys.map(({ key, label }) => ({
    key,
    label,
    ...aggregate(plans.filter((item) => planKey(item) === key), results.filter((item) => resultKey(item) === key), defectByResult),
  }));
}

function weekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  return Math.floor((date.getDate() + mondayOffset - 1) / 7) + 1;
}

export function compareProductionPeriods(current: ProductionMetrics, previous: ProductionMetrics): ProductionComparisonRow[] {
  return METRIC_COMPARISON.map(([key, label, inverse]) => {
    const difference = current[key] - previous[key];
    return { key, label, current: current[key], previous: previous[key], difference, changeRate: previous[key] !== 0 ? Math.round((difference / previous[key]) * 1000) / 10 : null, inverse };
  });
}

export function buildProductionAnalytics(input: {
  plans: ProductionPlan[];
  results: ProductionResult[];
  lots: FinishedGoodsLot[];
  defects: DefectHistory[];
  viewMode: ProductionViewMode;
  anchorDate: string;
  productionLine?: string;
}): ProductionAnalyticsSnapshot {
  const period = getProductionPeriod(input.viewMode, input.anchorDate);
  const previousPeriod = getPreviousProductionPeriod(period);
  const lineMatches = (line: string) => !input.productionLine || input.productionLine === "ALL" || line === input.productionLine;
  const allPlans = input.plans.filter((item) => item.planStatus !== "CANCELLED" && lineMatches(item.productionLine));
  const allResults = input.results.filter((item) => lineMatches(item.productionLine));
  const confirmedResults = allResults.filter((item) => item.resultStatus === "CONFIRMED");
  const { lotByResult, defectByResult } = buildDefectByResult(confirmedResults, input.lots, input.defects);
  const periodPlans = allPlans.filter((item) => inRange(item.plannedDate, period));
  const periodResults = confirmedResults.filter((item) => inRange(item.productionDate, period));
  const previousPlans = allPlans.filter((item) => inRange(item.plannedDate, previousPeriod));
  const previousResults = confirmedResults.filter((item) => inRange(item.productionDate, previousPeriod));
  const metrics = aggregate(periodPlans, periodResults, defectByResult);
  const previousMetrics = aggregate(previousPlans, previousResults, defectByResult);

  const daily: DailyProductionRow[] = datesInPeriod(period).map((date) => ({
    date,
    dayLabel: DAY_LABELS[parseBusinessDate(date).getDay()],
    ...aggregate(periodPlans.filter((item) => dateOnly(parseBusinessDate(item.plannedDate)) === date), periodResults.filter((item) => dateOnly(parseBusinessDate(item.productionDate)) === date), defectByResult),
  }));

  const productKeys = new Map<string, string>();
  [...periodPlans, ...periodResults].forEach((item) => productKeys.set("productCode" in item ? item.productCode : "", item.productName));
  const lineKeys = [...new Set([...periodPlans.map((item) => item.productionLine), ...periodResults.map((item) => item.productionLine)])].sort().map((key) => ({ key, label: key }));
  const weeks = [...new Set(daily.map((item) => weekOfMonth(parseBusinessDate(item.date))))];
  const weekly = weeks.map((week) => {
    const dates = new Set(daily.filter((item) => weekOfMonth(parseBusinessDate(item.date)) === week).map((item) => item.date));
    return { key: String(week), label: `${week}주차`, ...aggregate(periodPlans.filter((item) => dates.has(dateOnly(parseBusinessDate(item.plannedDate)))), periodResults.filter((item) => dates.has(dateOnly(parseBusinessDate(item.productionDate)))), defectByResult) };
  });

  const detailResults: ProductionResultDetail[] = allResults
    .filter((item) => inRange(item.productionDate, period))
    .map((item) => {
      const lot = lotByResult.get(item.resultNo) ?? input.lots.find((candidate) => candidate.resultNo === item.resultNo);
      const linkedDefectQuantity = item.resultStatus === "CONFIRMED" ? (defectByResult.get(item.resultNo) ?? item.defectQuantity) : item.defectQuantity;
      return { ...item, lotNumber: lot?.fgLotNo, linkedDefectQuantity, displayGoodQuantity: Math.max(0, item.totalQuantity - linkedDefectQuantity), displayStatus: item.resultStatus };
    })
    .sort((a, b) => b.actualEndTime.localeCompare(a.actualEndTime));

  return {
    period,
    previousPeriod,
    metrics,
    previousMetrics,
    hasPreviousData: previousPlans.length > 0 || previousResults.length > 0,
    daily,
    weekly,
    byProduct: aggregateGroups([...productKeys].map(([key, label]) => ({ key, label })), periodPlans, periodResults, defectByResult, (item) => item.productCode, (item) => item.productCode),
    byLine: aggregateGroups(lineKeys, periodPlans, periodResults, defectByResult, (item) => item.productionLine, (item) => item.productionLine),
    comparison: compareProductionPeriods(metrics, previousMetrics),
    detailResults,
  };
}
