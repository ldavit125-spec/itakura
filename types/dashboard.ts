// ============================================================
// 대시보드 — TypeScript 타입 정의 및 한국어 라벨 맵
// ============================================================

/** 조회 기간 */
export type PeriodType = "WEEKLY" | "MONTHLY";

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  WEEKLY: "주간",
  MONTHLY: "월간",
};

/** 제품 코드 (내부 영문값) */
export type ProductCode =
  | "SHOKUPAN"
  | "ANPAN"
  | "MELON_BREAD"
  | "CREAM_BREAD"
  | "CROISSANT";

export const PRODUCT_CODE_LABELS: Record<ProductCode, string> = {
  SHOKUPAN: "식빵",
  ANPAN: "단팥빵",
  MELON_BREAD: "멜론빵",
  CREAM_BREAD: "크림빵",
  CROISSANT: "크루아상",
};

/** 품질검사 판정 코드 */
export type QualityResult = "PASS" | "CONDITIONAL_PASS" | "FAIL";

export const QUALITY_RESULT_LABELS: Record<QualityResult, string> = {
  PASS: "합격",
  CONDITIONAL_PASS: "조건부 합격",
  FAIL: "불합격",
};

// ── 차트 데이터 인터페이스 ────────────────────────────────────

/** 생산계획 대비 실적 데이터 포인트 */
export interface ProductionDataPoint {
  label: string;   // 표시 라벨 (월, 1월 등)
  plan: number;    // 계획 수량
  actual: number;  // 실제 생산량
}

/** 제품별 생산량 데이터 */
export interface ProductProductionData {
  productCode: ProductCode;
  quantity: number;
}

/** 품질검사 판정 결과 데이터 */
export interface QualityResultData {
  result: QualityResult;
  count: number;
  percentage: number;
}

export type MonitoringLevel = "GOOD" | "WARNING" | "DANGER";
export type ProductionLineRuntimeStatus = "RUNNING" | "WAITING" | "INSPECTION" | "STOPPED" | "QUALITY_HOLD";

export interface MonitoringKpi {
  planQuantity: number;
  productionQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  achievementRate: number;
  defectRate: number;
  pendingInspectionCount: number;
  shortageMaterialCount: number;
  achievementLevel: MonitoringLevel;
  defectLevel: MonitoringLevel;
}

export interface LineProgressItem {
  lineName: string;
  productName: string;
  planQuantity: number;
  productionQuantity: number;
  achievementRate: number;
  status: ProductionLineRuntimeStatus;
  updatedAt: string;
}

export interface HourlyMonitoringPoint {
  hour: string;
  productionQuantity: number;
  defectQuantity: number;
}
