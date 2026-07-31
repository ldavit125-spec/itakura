import type { ProductionPlan, ProductionResult } from "@/types/production";
import type { InspectionQueueItem, IncomingInspection, ProcessInspection, FinishedGoodsInspection, CorrectiveAction } from "@/types/quality";
import type { MaterialInventory, MaterialInbound, MaterialOutbound } from "@/types/materials";
import type { Material, Product, Supplier } from "@/types/master-data";
import type { ReportFilter } from "@/types/reports";

import { getBusinessDate } from "./business-date";
import {
  getProductionPlansByDateRange,
  getProductionResultsByDateRange,
  getPlannedQuantity,
  getProducedQuantity,
  getGoodQuantity,
  getDefectQuantity,
  calculateAchievementRate,
  calculateDefectRate,
} from "./production-selectors";
import { getPendingInspections, aggregateInspectionResults } from "./quality-selectors";
import { getShortageMaterials } from "./material-selectors";
import { getDashboardMetrics } from "./dashboard-selectors";
import { getProductionReportMetrics, getMaterialReportMetrics, getQualityReportMetrics } from "./report-selectors";

export interface DiscrepancyReport {
  metricName: string;
  period: string;
  filter: string;
  managementValue: any;
  dashboardValue: any;
  reportValue: any;
  selectorName: string;
}

/**
 * 개발용 전 화면 지표 일치 검증 함수
 */
export function validateCrossScreenMetrics({
  plans,
  results,
  workOrders,
  queue,
  incoming,
  processList,
  finished,
  actions,
  inventories,
  inbounds,
  outbounds,
  materials,
  targetDate = getBusinessDate(),
}: {
  plans: ProductionPlan[];
  results: ProductionResult[];
  workOrders: any[];
  queue: InspectionQueueItem[];
  incoming: IncomingInspection[];
  processList: ProcessInspection[];
  finished: FinishedGoodsInspection[];
  actions: CorrectiveAction[];
  inventories: MaterialInventory[];
  inbounds: MaterialInbound[];
  outbounds: MaterialOutbound[];
  materials: Material[];
  targetDate?: string;
}): { isValid: boolean; discrepancies: DiscrepancyReport[] } {
  const discrepancies: DiscrepancyReport[] = [];

  // 1. 관리화면 셀렉터 수치
  const mgmtPlans = getProductionPlansByDateRange(plans, targetDate, targetDate);
  const mgmtResults = getProductionResultsByDateRange(results, targetDate, targetDate);

  const mgmtPlanQty = getPlannedQuantity(mgmtPlans);
  const mgmtProdQty = getProducedQuantity(mgmtResults);
  const mgmtDefectQty = getDefectQuantity(mgmtResults);
  const mgmtAchieveRate = calculateAchievementRate(mgmtProdQty, mgmtPlanQty);
  const mgmtDefectRate = calculateDefectRate(mgmtDefectQty, mgmtProdQty);

  const mgmtPendingInspections = getPendingInspections(queue).length;
  const mgmtShortageCount = getShortageMaterials(inventories, materials).length;

  // 2. 대시보드 셀렉터 수치
  const dashCards = getDashboardMetrics(plans, results, queue, inventories, materials, targetDate);
  const dashPlanQty = dashCards.find((c) => c.id === "production-plan")?.value;
  const dashProdQty = dashCards.find((c) => c.id === "production-actual")?.value;
  const dashAchieveRate = parseFloat(dashCards.find((c) => c.id === "production-rate")?.value as string || "0");
  const dashDefectRate = parseFloat(dashCards.find((c) => c.id === "defect-rate")?.value as string || "0");
  const dashPendingCount = dashCards.find((c) => c.id === "quality-pending")?.value;
  const dashShortageCount = dashCards.find((c) => c.id === "stock-shortage")?.value;

  // 3. 보고서 TODAY 셀렉터 수치
  const todayFilter: ReportFilter = {
    periodType: "TODAY",
    startDate: targetDate,
    endDate: targetDate,
    productCode: "ALL",
    productionLine: "ALL",
    materialCode: "ALL",
    supplierName: "ALL",
    handler: "ALL",
    status: "ALL",
    aggregationType: "DAILY",
  };

  const reportProdMetrics = getProductionReportMetrics({ plans, workOrders, results, filters: todayFilter });
  const reportMatMetrics = getMaterialReportMetrics({ inbounds, inventories, outbounds, materials, filters: todayFilter });
  const reportQualMetrics = getQualityReportMetrics({ incoming, processList, finished, actions, filters: todayFilter });

  // 검증 항목 1: 생산계획 수량
  if (mgmtPlanQty !== dashPlanQty || mgmtPlanQty !== reportProdMetrics.totalPlannedQuantity) {
    discrepancies.push({
      metricName: "생산계획 수량",
      period: targetDate,
      filter: "TODAY",
      managementValue: mgmtPlanQty,
      dashboardValue: dashPlanQty,
      reportValue: reportProdMetrics.totalPlannedQuantity,
      selectorName: "getPlannedQuantity",
    });
  }

  // 검증 항목 2: 생산실적 수량
  if (mgmtProdQty !== dashProdQty || mgmtProdQty !== reportProdMetrics.totalProductionQuantity) {
    discrepancies.push({
      metricName: "생산실적 수량",
      period: targetDate,
      filter: "TODAY",
      managementValue: mgmtProdQty,
      dashboardValue: dashProdQty,
      reportValue: reportProdMetrics.totalProductionQuantity,
      selectorName: "getProducedQuantity",
    });
  }

  // 검증 항목 3: 생산 달성률
  if (mgmtAchieveRate !== dashAchieveRate || mgmtAchieveRate !== reportProdMetrics.averageAchievementRate) {
    discrepancies.push({
      metricName: "생산 달성률",
      period: targetDate,
      filter: "TODAY",
      managementValue: mgmtAchieveRate,
      dashboardValue: dashAchieveRate,
      reportValue: reportProdMetrics.averageAchievementRate,
      selectorName: "calculateAchievementRate",
    });
  }

  // 검증 항목 4: 품질검사 대기 건수
  if (mgmtPendingInspections !== dashPendingCount) {
    discrepancies.push({
      metricName: "품질검사 대기 건수",
      period: targetDate,
      filter: "TODAY",
      managementValue: mgmtPendingInspections,
      dashboardValue: dashPendingCount,
      reportValue: "N/A",
      selectorName: "getPendingInspectionCount",
    });
  }

  // 검증 항목 5: 재고 부족 품목 수
  if (mgmtShortageCount !== dashShortageCount || mgmtShortageCount !== reportMatMetrics.shortageMaterialCount) {
    discrepancies.push({
      metricName: "재고 부족 품목 수",
      period: targetDate,
      filter: "TODAY",
      managementValue: mgmtShortageCount,
      dashboardValue: dashShortageCount,
      reportValue: reportMatMetrics.shortageMaterialCount,
      selectorName: "getShortageMaterials",
    });
  }

  if (discrepancies.length > 0) {
    console.warn("⚠️ [Cross-Screen Validation Alert] 화면 간 지표 불일치가 발견되었습니다:", discrepancies);
  } else {
    console.log("✅ [Cross-Screen Validation Passed] 전 화면 지표가 100% 일치합니다.");
  }

  return {
    isValid: discrepancies.length === 0,
    discrepancies,
  };
}
