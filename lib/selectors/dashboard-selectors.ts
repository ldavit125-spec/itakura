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
      title: "dashboard.todayPlan",
      value: plannedQty,
      unit: "unit.item",
      description: "dashboard.card.planDescription",
      status: "NEUTRAL",
    },
    {
      id: "production-actual",
      title: "dashboard.currentProduction",
      value: producedQty,
      unit: "unit.item",
      description: "dashboard.card.productionDescription",
      status: producedQty < plannedQty ? "WARNING" : "GOOD",
    },
    {
      id: "production-rate",
      title: "dashboard.achievementRate",
      value: achievementRate.toString(),
      unit: "%",
      description: "dashboard.card.achievementDescription",
      status: achievementRate >= 90 ? "GOOD" : achievementRate >= 70 ? "WARNING" : "DANGER",
    },
    {
      id: "defect-rate",
      title: "dashboard.realtimeDefectRate",
      value: defectRate.toString(),
      unit: "%",
      description: "dashboard.card.defectRateDescription",
      status: defectRate <= 2.0 ? "GOOD" : "DANGER",
    },
    {
      id: "quality-pending",
      title: "dashboard.inspectionPending",
      value: pendingCount,
      unit: "unit.case",
      description: "dashboard.card.inspectionDescription",
      status: pendingCount > 0 ? "WARNING" : "GOOD",
    },
    {
      id: "stock-shortage",
      title: "dashboard.materialShortage",
      value: shortageCount,
      unit: "common.count.item",
      description: "dashboard.card.shortageDescription",
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
