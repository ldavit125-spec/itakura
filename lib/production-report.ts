import type {
  ReportFilter,
  ProductionReportSummary,
  ProductProductionMetric,
  LineProductionMetric,
} from "@/types/reports";
import type { ProductionPlan, WorkOrder, ProductionResult } from "@/types/production";
import { DEFECT_TYPE_LABELS } from "@/constants/production-labels";
import { isDateInRange } from "./report-date-utils";
import { calculateAchievementRate, calculateDefectRate } from "./selectors/production-selectors";

// ============================================================
// 보고서 및 통계관리 — 생산실적 보고서 집계 유틸리티 (Live State 연동)
// ============================================================

export interface ProductionReportData {
  summary: ProductionReportSummary;
  trendChartData: { period: string; planQty: number; productionQty: number; achievementRate: number }[];
  productChartData: { name: string; value: number }[];
  lineChartData: { name: string; value: number }[];
  achievementByProductChartData: { name: string; achievementRate: number }[];
  defectTypeChartData: { name: string; count: number }[];

  detailedTable: {
    id: string;
    productionDate: string;
    planNo: string;
    workOrderNo: string;
    resultNo: string;
    productCode: string;
    productName: string;
    productionLine: string;
    plannedQuantity: number;
    productionQuantity: number;
    goodQuantity: number;
    defectQuantity: number;
    reworkQuantity: number;
    achievementRate: number;
    defectRate: number;
    workHours: number;
    handler: string;
  }[];

  productAggTable: ProductProductionMetric[];
  lineAggTable: LineProductionMetric[];
}

export function aggregateProductionReport(
  filter: ReportFilter,
  contextData: {
    plans: ProductionPlan[];
    workOrders: WorkOrder[];
    results: ProductionResult[];
  }
): ProductionReportData {
  const { plans, workOrders, results } = contextData;

  const { startDate, endDate, productCode, productionLine, handler } = filter;

  const filteredPlans = plans.filter((plan) => {
    if (!isDateInRange(plan.plannedDate, startDate, endDate)) return false;
    if (plan.planStatus === "CANCELLED") return false;
    if (productCode !== "ALL" && plan.productCode !== productCode) return false;
    if (productionLine !== "ALL" && plan.productionLine !== productionLine) return false;
    return true;
  });

  // 1. 작업지시 및 생산실적 기간/조건 필터링
  const filteredWOs = workOrders.filter((wo) => {
    if (!isDateInRange(wo.plannedDate, startDate, endDate)) return false;
    if (productCode !== "ALL" && wo.productCode !== productCode) return false;
    if (productionLine !== "ALL" && wo.productionLine !== productionLine) return false;
    if (handler !== "ALL" && wo.handler !== handler) return false;
    return true;
  });

  const filteredResults = results.filter((res) => {
    if (!isDateInRange(res.productionDate, startDate, endDate)) return false;
    if (productCode !== "ALL" && res.productCode !== productCode) return false;
    if (productionLine !== "ALL" && res.productionLine !== productionLine) return false;
    if (handler !== "ALL" && res.handler !== handler) return false;
    if (res.resultStatus === "DRAFT") return false;
    return true;
  });

  // 2. 상단 요약 카운트 계산
  const planCount = filteredPlans.length;
  const completedCount = filteredWOs.filter((w) => w.workStatus === "COMPLETED").length;

  const totalPlannedQuantity = filteredPlans.reduce(
    (sum, plan) => sum + plan.plannedQuantity,
    0
  );
  const totalProductionQuantity = filteredResults.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalGoodQuantity = filteredResults.reduce((sum, r) => sum + r.goodQuantity, 0);
  const totalDefectQuantity = filteredResults.reduce((sum, r) => sum + r.defectQuantity, 0);

  const averageAchievementRate = calculateAchievementRate(totalProductionQuantity, totalPlannedQuantity);

  const totalWorkHours = filteredResults.reduce((sum, r) => {
    return sum + (r.workingHours ? parseFloat(r.workingHours) || 8.0 : 8.0);
  }, 0);

  const averageWorkHours =
    filteredResults.length > 0
      ? Number((totalWorkHours / filteredResults.length).toFixed(1))
      : 0;

  const summary: ProductionReportSummary = {
    planCount,
    completedCount,
    totalPlannedQuantity,
    totalProductionQuantity,
    totalGoodQuantity,
    totalDefectQuantity,
    averageAchievementRate,
    averageWorkHours,
  };

  // 3. 차트 1: 기간별 추이 데이터 (일별)
  const dateMap: Record<string, { planQty: number; prodQty: number }> = {};
  filteredPlans.forEach((plan) => {
    if (!dateMap[plan.plannedDate]) {
      dateMap[plan.plannedDate] = { planQty: 0, prodQty: 0 };
    }
    dateMap[plan.plannedDate].planQty += plan.plannedQuantity;
  });

  filteredResults.forEach((r) => {
    if (!dateMap[r.productionDate]) dateMap[r.productionDate] = { planQty: 0, prodQty: 0 };
    dateMap[r.productionDate].prodQty += r.totalQuantity;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const trendChartData = sortedDates.map((date) => {
    const pQty = dateMap[date].planQty;
    const prodQty = dateMap[date].prodQty;
    const rate = calculateAchievementRate(prodQty, pQty);
    return {
      period: date.substring(5),
      planQty: pQty,
      productionQty: prodQty,
      achievementRate: rate,
    };
  });

  // 4. 차트 2 & 4: 제품별 생산량 및 달성률
  const productMap: Record<string, { name: string; planQty: number; prodQty: number; goodQty: number; defectQty: number; count: number }> = {};
  filteredPlans.forEach((plan) => {
    if (!productMap[plan.productCode]) {
      productMap[plan.productCode] = { name: plan.productName, planQty: 0, prodQty: 0, goodQty: 0, defectQty: 0, count: 0 };
    }
    productMap[plan.productCode].planQty += plan.plannedQuantity;
  });

  filteredResults.forEach((r) => {
    if (!productMap[r.productCode]) {
      productMap[r.productCode] = { name: r.productName, planQty: 0, prodQty: 0, goodQty: 0, defectQty: 0, count: 0 };
    }
    productMap[r.productCode].prodQty += r.totalQuantity;
    productMap[r.productCode].goodQty += r.goodQuantity;
    productMap[r.productCode].defectQty += r.defectQuantity;
    productMap[r.productCode].count += 1;
  });

  const productChartData = Object.values(productMap).map((p) => ({
    name: p.name,
    value: p.prodQty,
  }));

  const achievementByProductChartData = Object.values(productMap).map((p) => ({
    name: p.name,
    achievementRate: calculateAchievementRate(p.prodQty, p.planQty),
  }));

  // 5. 차트 3: 생산라인별 생산량
  const lineMap: Record<string, { planQty: number; prodQty: number; count: number; achievementSum: number; defectSum: number }> = {};
  filteredPlans.forEach((plan) => {
    if (!lineMap[plan.productionLine]) {
      lineMap[plan.productionLine] = { planQty: 0, prodQty: 0, count: 0, achievementSum: 0, defectSum: 0 };
    }
    lineMap[plan.productionLine].planQty += plan.plannedQuantity;
  });
  filteredResults.forEach((r) => {
    if (!lineMap[r.productionLine]) {
      lineMap[r.productionLine] = { planQty: 0, prodQty: 0, count: 0, achievementSum: 0, defectSum: 0 };
    }
    lineMap[r.productionLine].prodQty += r.totalQuantity;
    lineMap[r.productionLine].count += 1;
    lineMap[r.productionLine].achievementSum += r.achievementRate;
    lineMap[r.productionLine].defectSum += r.defectRate;
  });

  const lineChartData = Object.entries(lineMap).map(([line, val]) => ({
    name: line,
    value: val.prodQty,
  }));

  // 6. 차트 5: 불량 유형별 발생 수량
  const defectTypeMap: Record<string, number> = {};
  filteredResults.forEach((r) => {
    if (r.defectBreakdown && r.defectBreakdown.length > 0) {
      r.defectBreakdown.forEach((d) => {
        const label = DEFECT_TYPE_LABELS[d.type] || d.type;
        defectTypeMap[label] = (defectTypeMap[label] || 0) + d.quantity;
      });
    } else if (r.defectQuantity > 0) {
      defectTypeMap["성형 불량"] = (defectTypeMap["성형 불량"] || 0) + r.defectQuantity;
    }
  });

  const defectTypeChartData = Object.entries(defectTypeMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 7. 상세 생산실적 테이블
  const detailedTable = filteredResults.map((r) => {
    const wo = workOrders.find((w) => w.workOrderNo === r.workOrderNo);
    return {
      id: r.id,
      productionDate: r.productionDate,
      planNo: wo?.planNo || "PLAN-20260730-001",
      workOrderNo: r.workOrderNo,
      resultNo: r.resultNo,
      productCode: r.productCode,
      productName: r.productName,
      productionLine: r.productionLine,
      plannedQuantity: wo?.orderedQuantity || r.totalQuantity,
      productionQuantity: r.totalQuantity,
      goodQuantity: r.goodQuantity,
      defectQuantity: r.defectQuantity,
      reworkQuantity: r.reworkQuantity,
      achievementRate: r.achievementRate,
      defectRate: r.defectRate,
      workHours: parseFloat(r.workingHours) || 8.0,
      handler: r.handler,
    };
  });

  // 8. 제품별 집계 테이블
  const productAggTable: ProductProductionMetric[] = Object.entries(productMap).map(([code, p]) => {
    const achievementRate = calculateAchievementRate(p.prodQty, p.planQty);
    const defectRate = calculateDefectRate(p.defectQty, p.prodQty);
    return {
      productCode: code,
      productName: p.name,
      plannedQuantity: p.planQty,
      productionQuantity: p.prodQty,
      goodQuantity: p.goodQty,
      defectQuantity: p.defectQty,
      achievementRate,
      defectRate,
      runCount: p.count,
    };
  });

  // 9. 생산라인별 집계 테이블
  const lineAggTable: LineProductionMetric[] = Object.entries(lineMap).map(([line, val]) => {
    const avgAchievement = val.count > 0 ? Number((val.achievementSum / val.count).toFixed(1)) : 0;
    const avgDefect = val.count > 0 ? Number((val.defectSum / val.count).toFixed(1)) : 0;
    return {
      productionLine: line,
      plannedQuantity: val.planQty || val.prodQty,
      productionQuantity: val.prodQty,
      runCount: val.count,
      averageAchievementRate: avgAchievement,
      averageDefectRate: avgDefect,
      averageWorkHours: 8.0,
    };
  });

  return {
    summary,
    trendChartData,
    productChartData,
    lineChartData,
    achievementByProductChartData,
    defectTypeChartData,
    detailedTable,
    productAggTable,
    lineAggTable,
  };
}
