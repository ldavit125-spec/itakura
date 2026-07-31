import type { FinishedGoodsLot, ProductionResult } from "@/types/production";
import type { DefectHistory } from "@/types/quality";
import type { ProductionViewMode } from "@/types/production-analytics";
import type { QualityDefectStatistics } from "@/types/quality-statistics";
import { buildProductionAnalytics } from "./production-analytics-selectors";

export function buildQualityDefectStatistics(input: {
  results: ProductionResult[];
  lots: FinishedGoodsLot[];
  defects: DefectHistory[];
  viewMode: ProductionViewMode;
  anchorDate: string;
}): QualityDefectStatistics {
  const analytics = buildProductionAnalytics({
    plans: [],
    results: input.results,
    lots: input.lots,
    defects: input.defects,
    viewMode: input.viewMode,
    anchorDate: input.anchorDate,
  });
  const periodLots = new Set(
    analytics.detailResults
      .filter((item) => item.resultStatus === "CONFIRMED" && item.lotNumber)
      .map((item) => item.lotNumber as string)
  );
  const periodDefects = input.defects.filter((item) => periodLots.has(item.lotNumber));
  const completedCount = periodDefects.filter((item) => item.status === "COMPLETED").length;

  return {
    period: analytics.period,
    viewMode: input.viewMode,
    productionQuantity: analytics.metrics.productionQuantity,
    defectCount: periodDefects.length,
    defectQuantity: analytics.metrics.defectQuantity,
    defectRate: analytics.metrics.defectRate,
    completedCount,
    completionRate: periodDefects.length > 0 ? Math.round((completedCount / periodDefects.length) * 1000) / 10 : 0,
    daily: analytics.daily,
  };
}
