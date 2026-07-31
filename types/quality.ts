// ============================================================
// 품질관리 — TypeScript 타입 정의
// ============================================================

/** 검사 구분 코드 */
export type InspectionCategory = "INCOMING" | "PROCESS" | "FINISHED_GOODS";

/** 검사 상태 코드 */
export type InspectionStatus =
  | "REQUESTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** 최종 판정 코드 */
export type InspectionJudgment =
  | "PASSED"
  | "CONDITIONAL_PASS"
  | "HOLD"
  | "FAILED";

/** 개별 검사 항목 결과 코드 */
export type ItemResultCode =
  | "NOT_TESTED"
  | "PASS"
  | "FAIL"
  | "NOT_APPLICABLE";

/** 우선순위 코드 */
export type PriorityLevel = "URGENT" | "HIGH" | "NORMAL" | "LOW";

/** 공정검사 공정 코드 */
export type ProcessCode =
  | "MIXING"
  | "DOUGH"
  | "FERMENTATION"
  | "DIVIDING"
  | "SHAPING"
  | "BAKING"
  | "COOLING"
  | "PACKAGING";

/** 부적합 유형 코드 */
export type NonconformityType =
  | "MATERIAL_DEFECT"
  | "PACKAGING_DAMAGE"
  | "FOREIGN_MATERIAL"
  | "TEMPERATURE_DEVIATION"
  | "WEIGHT_DEVIATION"
  | "APPEARANCE_DEFECT"
  | "SHAPE_DEFECT"
  | "BAKING_DEFECT"
  | "LABELING_ERROR"
  | "HYGIENE_ISSUE"
  | "PROCESS_DEVIATION"
  | "OTHER";

/** 심각도 코드 */
export type SeverityLevel = "CRITICAL" | "MAJOR" | "MINOR";

/** 부적합 처리 상태 코드 */
export type NonconformityStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "ACTION_REQUIRED"
  | "ACTION_IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

/** 대상 부서 코드 */
export type DepartmentCode =
  | "MATERIALS"
  | "PRODUCTION"
  | "QUALITY"
  | "FACILITY"
  | "HYGIENE";

/** 시정조치 상태 코드 */
export type CorrectiveActionStatus =
  | "REQUESTED"
  | "ANALYZING"
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "VERIFIED"
  | "CLOSED";

/** 검증 상태 코드 */
export type VerificationStatus =
  | "NOT_VERIFIED"
  | "EFFECTIVE"
  | "INEFFECTIVE"
  | "RECHECK_REQUIRED";

/** 원인 분석 방법 코드 */
export type AnalysisMethod =
  | "FIVE_WHY"
  | "FISHBONE"
  | "CHECKLIST"
  | "INTERVIEW"
  | "DATA_ANALYSIS"
  | "OTHER";

/** 품질관리 탭 코드 */
export type QualityTab =
  | "inspection"
  | "results"
  | "defects"
  | "statistics";

export type DefectType =
  | "FOREIGN_MATERIAL"
  | "WEIGHT"
  | "PACKAGING"
  | "APPEARANCE"
  | "SEALING"
  | "LABEL"
  | "DAMAGE"
  | "OTHER";

export type DefectProcessingStatus =
  | "INVESTIGATING"
  | "CAUSE_ANALYZED"
  | "REWORK"
  | "DISCARDED"
  | "SHIPMENT_HOLD"
  | "COMPLETED";

export interface DefectHistory {
  id: string;
  defectNo: string;
  lotNumber: string;
  productId: string;
  productName: string;
  productionDate: string;
  inspectionDate: string;
  inspector: string;
  defectType: DefectType;
  defectQuantity: number;
  defectRate: number;
  cause: string;
  correctiveAction: string;
  status: DefectProcessingStatus;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface DefectHistorySummary {
  totalCount: number;
  totalDefectQuantity: number;
  averageDefectRate: number;
  completionRate: number;
}

// ── 엔티티 인터페이스 ──────────────────────────────────────────

/** 상태 변경 이력 항목 */
export interface InspectionStatusHistoryItem {
  id: string;
  changeTime: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
}

/** 개별 검사 항목 결과 */
export interface InspectionItemResult {
  itemName: string;
  standardValue: string;
  measuredValue: string;
  unit?: string;
  isMandatory: boolean;
  result: ItemResultCode;
  notes?: string;
}

/** 검사 대기열 항목 */
export interface InspectionQueueItem {
  id: string;
  requestNo: string;
  requestTime: string;
  category: InspectionCategory;
  targetNo: string;
  targetName: string;
  lotNo: string;
  lineOrSupplier: string;
  requester: string;
  inspector?: string;
  priority: PriorityLevel;
  status: InspectionStatus;
  notes?: string;
}

/** 원재료 입고검사 엔티티 */
export interface IncomingInspection {
  id: string;
  iqcNo: string;
  inboundNo: string;
  inboundDate: string;
  materialCode: string;
  materialName: string;
  lotNo: string;
  supplierName: string;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expirationDate: string;
  inspector: string;
  inspectionDate: string;
  status: InspectionStatus;
  judgment: InspectionJudgment;
  judgmentReason?: string;
  items: InspectionItemResult[];
  attachmentFileName?: string;
  previousInspectionNo?: string;
  statusHistory: InspectionStatusHistoryItem[];
}

/** 공정검사 엔티티 */
export interface ProcessInspection {
  id: string;
  pqcNo: string;
  workOrderNo: string;
  productionDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  process: ProcessCode;
  inspectionTiming: string;
  worker: string;
  inspector: string;
  inspectionDate: string;
  status: InspectionStatus;
  judgment: InspectionJudgment;
  judgmentReason?: string;
  followUpAction?: string;
  items: InspectionItemResult[];
  previousInspectionNo?: string;
  statusHistory: InspectionStatusHistoryItem[];
}

/** 완제품검사 엔티티 */
export interface FinishedGoodsInspection {
  id: string;
  fqcNo: string;
  fgLotNo: string;
  resultNo: string;
  workOrderNo: string;
  productionDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  totalQuantity: number;
  unit: string;
  sampleQuantity: number;
  defectiveSampleQuantity: number;
  avgWeight: number;
  minWeight: number;
  maxWeight: number;
  inspector: string;
  inspectionDate: string;
  status: InspectionStatus;
  judgment: InspectionJudgment;
  judgmentReason?: string;
  isReleaseAvailable: boolean;
  recheckRequired: boolean;
  items: InspectionItemResult[];
  previousInspectionNo?: string;
  statusHistory: InspectionStatusHistoryItem[];
}

/** 부적합 관리 엔티티 */
export interface Nonconformity {
  id: string;
  ncNo: string;
  occurredDate: string;
  category: InspectionCategory;
  inspectionNo: string;
  targetNo: string;
  targetName: string;
  lotNo: string;
  ncType: NonconformityType;
  defectQuantity: number;
  unit: string;
  severity: SeverityLevel;
  ncStatus: NonconformityStatus;
  handler: string;
  dueDate: string;
  details: string;
  interimAction?: string;
  adminMemo?: string;
  correctiveActionNo?: string;
}

/** 시정조치 (CAPA) 엔티티 */
export interface CorrectiveAction {
  id: string;
  caNo: string;
  ncNo: string;
  requestDate: string;
  targetDepartment: DepartmentCode;
  handler: string;
  problemSummary: string;
  interimAction?: string;
  directCause?: string;
  rootCause?: string;
  analysisMethod?: AnalysisMethod;
  actionPlan?: string;
  preventiveMeasure?: string;
  caStatus: CorrectiveActionStatus;
  startDate?: string;
  dueDate: string;
  completedDate?: string;
  verificationContent?: string;
  verifier?: string;
  verificationDate?: string;
  verificationStatus: VerificationStatus;
}

/** 검사 기준 Mock 인터페이스 */
export interface InspectionStandard {
  targetCode: string; // materialCode or productCode
  targetName: string;
  items: {
    itemName: string;
    standardValue: string;
    isMandatory: boolean;
    unit?: string;
  }[];
}

/** 완제품 중량 오차 기준 */
export interface ProductWeightStandard {
  productCode: string;
  productName: string;
  baseWeight: number; // g
  tolerance: number; // ±g
  minAllowed: number;
  maxAllowed: number;
}

/** 상단 8종 요약 카드 데이터 */
export interface QualitySummary {
  totalQueueCount: number;
  incomingQueueCount: number;
  processInProgressCount: number;
  finishedQueueCount: number;
  todayFailCount: number;
  unresolvedCACount: number;
  thisMonthPassRate: number;
  thisMonthDefectRate: number;
}

// ── 모달 및 Toast 상태 ──────────────────────────────────────────

export interface QualityToastState {
  id: number;
  message: string;
  type: "success" | "error";
}

export interface InspectionAssignModalState {
  isOpen: boolean;
  queueItem?: InspectionQueueItem;
}

export interface IncomingInspectionModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: IncomingInspection;
  queueItem?: InspectionQueueItem;
}

export interface ProcessInspectionModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: ProcessInspection;
  queueItem?: InspectionQueueItem;
}

export interface FinishedGoodsInspectionModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: FinishedGoodsInspection;
  queueItem?: InspectionQueueItem;
}

export interface NonconformityModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: Nonconformity;
}

export interface CorrectiveActionModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: CorrectiveAction;
}
