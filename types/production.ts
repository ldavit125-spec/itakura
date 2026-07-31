// ============================================================
// 생산관리 — TypeScript 타입 정의
// ============================================================

/** 생산계획 상태 코드 */
export type PlanStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** 계획 우선순위 코드 */
export type PlanPriority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

/** 자재 준비 상태 코드 */
export type MaterialReadiness = "READY" | "PARTIAL" | "SHORTAGE" | "NOT_CHECKED";

/** 작업 상태 코드 */
export type WorkStatus =
  | "WAITING"
  | "READY"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

/** 자재 출고 상태 코드 */
export type MaterialIssueStatus =
  | "NOT_ISSUED"
  | "PARTIALLY_ISSUED"
  | "ISSUED"
  | "SHORTAGE";

/** 실적 상태 코드 */
export type ResultStatus = "DRAFT" | "SUBMITTED" | "CONFIRMED";

/** 완제품 품질 상태 코드 */
export type QualityStatus = "PENDING" | "PASSED" | "HOLD" | "FAILED";

/** 불량 유형 코드 */
export type DefectType =
  | "DOUGH_DEFECT"
  | "BAKING_DEFECT"
  | "SHAPE_DEFECT"
  | "WEIGHT_DEFECT"
  | "PACKAGING_DEFECT"
  | "OTHER";

/** 생산관리 탭 코드 */
export type ProductionTab =
  | "plan"
  | "work-order"
  | "progress"
  | "result"
  | "fg-lot";

// ── 엔티티 인터페이스 ──────────────────────────────────────────

/** 생산계획 인터페이스 */
export interface ProductionPlan {
  id: string;
  planNo: string;
  plannedDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  plannedQuantity: number;
  unit: string;
  startTime: string;
  endTime: string;
  priority: PlanPriority;
  planStatus: PlanStatus;
  materialReadiness: MaterialReadiness;
  manager: string;
  remarks?: string;
}

/** 작업지시 인터페이스 */
export interface WorkOrder {
  id: string;
  workOrderNo: string;
  planNo: string;
  plannedDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  orderedQuantity: number;
  unit: string;
  startTime: string;
  endTime: string;
  handler: string;
  materialIssueStatus: MaterialIssueStatus;
  workStatus: WorkStatus;
  actualStartTime?: string;
  actualEndTime?: string;
  currentQuantity: number;
  remarks?: string;
}

/** 제품별 BOM (기준 수량: 1,000개 당 필요 수량) */
export interface BOMItem {
  productCode: string;
  materialCode: string;
  baseQuantity: number;
}

/** 자재 소요량 계산 결과 */
export interface MaterialRequirement {
  materialCode: string;
  materialName: string;
  unit: string;
  requiredQuantity: number;
  issuedQuantity: number;
  currentStock: number;
  status: MaterialIssueStatus;
}

/** 불량 세부 내역 */
export interface DefectDetail {
  type: DefectType;
  quantity: number;
}

/** 생산실적 인터페이스 */
export interface ProductionResult {
  id: string;
  resultNo: string;
  workOrderNo: string;
  productionDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  orderedQuantity: number;
  totalQuantity: number;
  goodQuantity: number;
  defectQuantity: number;
  reworkQuantity: number;
  achievementRate: number;
  defectRate: number;
  actualStartTime: string;
  actualEndTime: string;
  workingHours: string;
  handler: string;
  resultStatus: ResultStatus;
  defectBreakdown: DefectDetail[];
  remarks?: string;
}

/** 완제품 LOT 인터페이스 */
export interface FinishedGoodsLot {
  id: string;
  fgLotNo: string;
  resultNo: string;
  workOrderNo: string;
  productionDate: string;
  productCode: string;
  productName: string;
  productionLine: string;
  totalQuantity: number;
  goodQuantity: number;
  unit: string;
  expirationDate: string;
  qualityStatus: QualityStatus;
  isReleaseAvailable: boolean;
}

/** 상단 요약 카드 데이터 */
export interface ProductionSummary {
  todayPlanCount: number;
  todayPlannedQty: number;
  inProgressCount: number;
  todayResultQty: number;
  avgAchievementRate: number;
  materialNotReadyCount: number;
}

// ── 모달 및 알림 상태 ──────────────────────────────────────────

export interface PlanModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: ProductionPlan;
}

export interface WorkOrderModalState {
  isOpen: boolean;
  mode: "create" | "detail" | "assign";
  item?: WorkOrder;
  planItem?: ProductionPlan;
}

export interface ProgressModalState {
  isOpen: boolean;
  item?: WorkOrder;
}

export interface ResultModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: ProductionResult;
  workOrderItem?: WorkOrder;
}

export interface FGLotDetailModalState {
  isOpen: boolean;
  item?: FinishedGoodsLot;
}

export interface ProductionToastState {
  id: number;
  message: string;
  type: "success" | "error";
}
