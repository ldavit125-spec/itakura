import type { ProductionPlan, ProductionResult } from "@/types/production";
import type { InspectionQueueItem, IncomingInspection, ProcessInspection, FinishedGoodsInspection } from "@/types/quality";
import type { MaterialInventory } from "@/types/materials";
import type { Material, Product } from "@/types/master-data";
import type { DashboardCardData } from "@/types";
import type { PeriodType, ProductionDataPoint, ProductProductionData, QualityResultData } from "@/types/dashboard";

import { getBusinessDate } from "./business-date";
import {
  getProductionPlansByDateRange,
  getProductionResultsByDateRange,
  getPlannedQuantity,
  getProducedQuantity,
  getDefectQuantity,
  calculateAchievementRate,
  calculateDefectRate,
  aggregateProductionByPeriod,
  aggregateProductionByProduct,
} from "./production-selectors";

import { getPendingInspections, aggregateInspectionResults } from "./quality-selectors";
import { getShortageMaterials } from "./material-selectors";
import { PRODUCT_CODE_LABELS, QUALITY_RESULT_LABELS } from "@/types/dashboard";

export function getDashboardMetrics(
  plans: ProductionPlan[],
  results: ProductionResult[],
  queue: InspectionQueueItem[],
  inventories: MaterialInventory[],
  materials: Material[],
  targetDate: string = getBusinessDate()
): DashboardCardData[] {
  const todayPlans = getProductionPlansByDateRange(plans, targetDate, targetDate);
  const todayResults = getProductionResultsByDateRange(results, targetDate, targetDate);

  const plannedQty = getPlannedQuantity(todayPlans);
  const producedQty = getProducedQuantity(todayResults);
  const defectQty = getDefectQuantity(todayResults);

  const achievementRate = calculateAchievementRate(producedQty, plannedQty);
  const defectRate = calculateDefectRate(defectQty, producedQty);

  const pendingCount = getPendingInspections(queue).length;
  const shortageList = getShortageMaterials(inventories, materials);
  const shortageCount = shortageList.length;

  return [
    {
      id: "production-plan",
      title: "오늘의 생산계획",
      value: plannedQty,
      unit: "개",
      description: `오늘(${targetDate}) 등록된 생산계획 목표 수량`,
      status: "NEUTRAL",
    },
    {
      id: "production-actual",
      title: "오늘의 생산실적",
      value: producedQty,
      unit: "개",
      description: `오늘(${targetDate}) 누적 실적 확정 수량`,
      status: producedQty < plannedQty ? "WARNING" : "GOOD",
    },
    {
      id: "production-rate",
      title: "생산 달성률",
      value: achievementRate.toString(),
      unit: "%",
      description: "목표 대비 현재 생산 달성률",
      status: achievementRate >= 90 ? "GOOD" : achievementRate >= 70 ? "WARNING" : "DANGER",
    },
    {
      id: "defect-rate",
      title: "불량률",
      value: defectRate.toString(),
      unit: "%",
      description: "기준치 2.0% 이하 — 품질 정상 유지",
      status: defectRate <= 2.0 ? "GOOD" : "DANGER",
    },
    {
      id: "quality-pending",
      title: "품질검사 대기",
      value: pendingCount,
      unit: "건",
      description: "검사 완료 후 출하 가능 항목",
      status: pendingCount > 0 ? "WARNING" : "GOOD",
    },
    {
      id: "stock-shortage",
      title: "재고 부족 자재",
      value: shortageCount,
      unit: "품목",
      description: shortageCount > 0 ? `${shortageList.map((s) => s.materialName).join(", ")} 부족` : "모든 자재 안전재고 충족",
      status: shortageCount > 0 ? "DANGER" : "GOOD",
    },
  ];
}

export function getDashboardCharts(
  plans: ProductionPlan[],
  results: ProductionResult[],
  products: Product[],
  incoming: IncomingInspection[],
  processList: ProcessInspection[],
  finished: FinishedGoodsInspection[],
  period: PeriodType
) {
  const lineChartData = aggregateProductionByPeriod(plans, results);
  const productData = aggregateProductionByProduct(results, products);
  const qualityRes = aggregateInspectionResults(incoming, processList, finished);

  const productChartData: ProductProductionData[] = productData.map((p) => ({
    productCode: (PRODUCT_CODE_LABELS[p.productCode as keyof typeof PRODUCT_CODE_LABELS] ? p.productCode : "SHOKUPAN") as any,
    quantity: p.quantity,
  }));

  const qualityChartData: { qualityResultData: QualityResultData[]; totalCount: number } = {
    qualityResultData: [
      {
        result: "PASS",
        count: qualityRes.passedCount,
        percentage: qualityRes.completedCount > 0 ? Number(((qualityRes.passedCount / qualityRes.completedCount) * 100).toFixed(1)) : 0,
      },
      {
        result: "CONDITIONAL_PASS",
        count: qualityRes.conditionalPassCount,
        percentage: qualityRes.completedCount > 0 ? Number(((qualityRes.conditionalPassCount / qualityRes.completedCount) * 100).toFixed(1)) : 0,
      },
      {
        result: "FAIL",
        count: qualityRes.failedCount + qualityRes.holdCount,
        percentage: qualityRes.completedCount > 0 ? Number((((qualityRes.failedCount + qualityRes.holdCount) / qualityRes.completedCount) * 100).toFixed(1)) : 0,
      },
    ],
    totalCount: qualityRes.completedCount,
  };

  return {
    lineChartData,
    productChartData,
    qualityChartData,
  };
}
