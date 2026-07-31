import type { ProductionResult, ResultStatus } from "@/types/production";

export type ProductionViewMode = "daily" | "weekly" | "monthly";
export type ProductionMetricKey = "planQuantity" | "productionQuantity" | "goodQuantity" | "defectQuantity" | "achievementRate" | "defectRate";

export interface ProductionPeriod {
  startDate: string;
  endDate: string;
  viewMode: ProductionViewMode;
  label: string;
}

export interface ProductionMetrics {
  planQuantity: number;
  productionQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  achievementRate: number;
  defectRate: number;
  workCount: number;
}

export interface ProductionAggregateRow extends ProductionMetrics {
  key: string;
  label: string;
}

export interface DailyProductionRow extends ProductionMetrics {
  date: string;
  dayLabel: string;
}

export interface ProductionComparisonRow {
  key: ProductionMetricKey;
  label: string;
  current: number;
  previous: number;
  difference: number;
  changeRate: number | null;
  inverse: boolean;
}

export interface ProductionResultDetail extends ProductionResult {
  lotNumber?: string;
  linkedDefectQuantity: number;
  displayGoodQuantity: number;
  displayStatus: ResultStatus;
}

export interface ProductionAnalyticsSnapshot {
  period: ProductionPeriod;
  previousPeriod: ProductionPeriod;
  metrics: ProductionMetrics;
  previousMetrics: ProductionMetrics;
  hasPreviousData: boolean;
  daily: DailyProductionRow[];
  weekly: ProductionAggregateRow[];
  byProduct: ProductionAggregateRow[];
  byLine: ProductionAggregateRow[];
  comparison: ProductionComparisonRow[];
  detailResults: ProductionResultDetail[];
}
