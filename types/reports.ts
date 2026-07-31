// ============================================================
// 보고서 및 통계관리 — TypeScript 타입 정의
// ============================================================

/** 보고서 탭 코드 */
export type ReportTab =
  | "dashboard"
  | "production"
  | "materials"
  | "quality"
  | "lot";

/** 기간 선택 유형 코드 */
export type ReportPeriodType =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_3_MONTHS"
  | "THIS_YEAR"
  | "CUSTOM";

/** 집계 주기 코드 */
export type ReportAggregationType = "DAILY" | "WEEKLY" | "MONTHLY";

/** 유통기한 남은 일수 상태 코드 */
export type ExpirationStatus = "NORMAL" | "WARNING" | "EXPIRING_SOON" | "EXPIRED";

/** 공통 필터 구조 */
export interface ReportFilter {
  periodType: ReportPeriodType;
  startDate: string;
  endDate: string;
  productCode: string;
  productionLine: string;
  materialCode: string;
  supplierName: string;
  handler: string;
  status: string;
  aggregationType: ReportAggregationType;
}

// ── 1. 통합 경영현황 데이터 구조 ──────────────────────────────
export interface IntegratedKPiSummary {
  totalPlannedQuantity: number;
  totalActualProduction: number;
  averageAchievementRate: number;
  totalGoodQuantity: number;
  averageDefectRate: number;
  qualityPassRate: number;
  shortageMaterialsCount: number;
  qualityHoldOrFailedLotCount: number;
}

export interface MajorAlertItem {
  id: string;
  type: "ACHIEVEMENT_LOW" | "DEFECT_HIGH" | "SAFETY_STOCK_LOW" | "LOT_HOLD_FAILED" | "CAPA_OVERDUE";
  title: string;
  description: string;
  referenceNo: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  date: string;
  targetModule: "production" | "materials" | "quality" | "traceability";
}

// ── 2. 생산실적 보고서 데이터 구조 ──────────────────────────────
export interface ProductionReportSummary {
  planCount: number;
  completedCount: number;
  totalPlannedQuantity: number;
  totalProductionQuantity: number;
  totalGoodQuantity: number;
  totalDefectQuantity: number;
  averageAchievementRate: number;
  averageWorkHours: number;
}

export interface ProductProductionMetric {
  productCode: string;
  productName: string;
  plannedQuantity: number;
  productionQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  achievementRate: number;
  defectRate: number;
  runCount: number;
}

export interface LineProductionMetric {
  productionLine: string;
  plannedQuantity: number;
  productionQuantity: number;
  runCount: number;
  averageAchievementRate: number;
  averageDefectRate: number;
  averageWorkHours: number;
}

// ── 3. 자재·재고 보고서 데이터 구조 ──────────────────────────────
export interface MaterialReportSummary {
  totalInboundQuantity: number;
  totalOutboundQuantity: number;
  currentStockMaterialCount: number;
  shortageMaterialCount: number;
  criticalShortageCount: number;
  expiringSoonLotCount: number;
  holdLotCount: number;
  expiredLotCount: number;
}

export interface MaterialInventoryMetric {
  materialCode: string;
  materialName: string;
  totalInboundQty: number;
  totalOutboundQty: number;
  currentStock: number;
  availableStock: number;
  holdStock: number;
  safetyStock: number;
  shortageQty: number;
  unit: string;
  inventoryStatus: string;
  defaultSupplier: string;
}

export interface LotInventoryMetric {
  materialCode: string;
  materialName: string;
  lotNo: string;
  inboundQty: number;
  outboundQty: number;
  currentStock: number;
  manufactureDate: string;
  expirationDate: string;
  remainingDays: number;
  inspectionStatus: string;
  expirationStatus: ExpirationStatus;
}

// ── 4. 품질분석 보고서 데이터 구조 ──────────────────────────────
export interface QualityReportSummary {
  totalInspectionCount: number;
  completedInspectionCount: number;
  passedCount: number;
  conditionalPassCount: number;
  holdCount: number;
  failedCount: number;
  totalPassRate: number;
  unresolvedCACount: number;
}

export interface CategoryInspectionMetric {
  categoryLabel: string;
  totalCount: number;
  passedCount: number;
  conditionalPassCount: number;
  holdCount: number;
  failedCount: number;
  passRate: number;
}

export interface NonconformityMetric {
  ncType: string;
  ncTypeLabel: string;
  totalCount: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  resolvedCount: number;
  unresolvedCount: number;
  averageResolutionDays: number;
}

export interface DepartmentCAMetric {
  departmentCode: string;
  departmentName: string;
  totalCount: number;
  inProgressCount: number;
  completedCount: number;
  verifiedCount: number;
  overdueCount: number;
  effectiveCount: number;
  ineffectiveCount: number;
}

// ── 5. LOT 추적 보고서 데이터 구조 ──────────────────────────────
export interface LotReportSummary {
  traceableRawLotCount: number;
  traceableFGLotCount: number;
  linkedWorkOrderCount: number;
  normalLotCount: number;
  holdLotCount: number;
  failedLotCount: number;
  ncLinkedLotCount: number;
  inProgressCALotCount: number;
}

export interface FGLotTraceReportItem {
  fgLotNo: string;
  productCode: string;
  productName: string;
  productionDate: string;
  workOrderNo: string;
  resultNo: string;
  usedMaterialTypesCount: number;
  linkedRawLotCount: number;
  qualityStatus: string;
  ncNo?: string;
  caNo?: string;
  isTraceable: boolean;
}

export interface RawLotImpactReportItem {
  rawMaterialLotNo: string;
  materialCode: string;
  materialName: string;
  supplierName: string;
  usedWorkOrdersCount: number;
  linkedFGLotsCount: number;
  affectedProductionQuantity: number;
  passedLotCount: number;
  holdLotCount: number;
  failedLotCount: number;
}

export type FGLotTraceMetric = FGLotTraceReportItem;
export type RawLotImpactMetric = RawLotImpactReportItem;
