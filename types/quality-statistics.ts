import type { DailyProductionRow, ProductionPeriod, ProductionViewMode } from "@/types/production-analytics";

export interface QualityDefectStatistics {
  period: ProductionPeriod;
  viewMode: ProductionViewMode;
  productionQuantity: number;
  defectCount: number;
  defectQuantity: number;
  defectRate: number;
  completedCount: number;
  completionRate: number;
  daily: DailyProductionRow[];
}
