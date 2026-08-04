// ============================================================
// 자재관리 — TypeScript 타입 정의
// ============================================================

/** 검사 상태 코드 */
export type InspectionStatus = "PENDING" | "PASSED" | "HOLD" | "FAILED";

/** 입고 상태 코드 */
export type InboundStatus = "RECEIVED" | "CANCELLED";

/** 재고 상태 코드 */
export type InventoryStatus = "NORMAL" | "LOW" | "CRITICAL" | "HOLD" | "EXPIRED";

/** 출고 상태 코드 */
export type OutboundStatus = "COMPLETED" | "CANCELLED";

/** 부족 자재 발주 요청 상태 코드 */
export type MaterialPurchaseRequestStatus = "REQUESTED" | "RECEIVED";

/** 수불 이력 처리 유형 코드 */
export type TransactionType =
  | "INBOUND"
  | "OUTBOUND"
  | "INBOUND_CANCEL"
  | "OUTBOUND_CANCEL"
  | "ADJUSTMENT_INCREASE"
  | "ADJUSTMENT_DECREASE";

/** 자재관리 탭 코드 */
export type MaterialTab =
  | "inbound"
  | "inventory"
  | "outbound"
  | "transaction"
  | "shortage";

// ── 자재 입고 엔티티 ──────────────────────────────────────────
export interface MaterialInbound {
  id: string;
  inboundNo: string;
  inboundDate: string;
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  lotNo: string;
  supplierName: string;
  supplierNameJa?: string | null;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expirationDate: string;
  inspectionStatus: InspectionStatus;
  inboundStatus: InboundStatus;
  remarks?: string;
}

// ── 재고 현황 엔티티 ──────────────────────────────────────────
export interface MaterialInventory {
  id: string;
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  lotNo: string;
  currentStock: number;
  availableStock: number;
  holdStock: number;
  unit: string;
  safetyStock: number;
  location: string;
  expirationDate: string;
  inventoryStatus: InventoryStatus;
  inspectionStatus: InspectionStatus;
  supplierName: string;
  supplierNameJa?: string | null;
}

// ── 자재 출고 엔티티 ──────────────────────────────────────────
export interface MaterialOutbound {
  id: string;
  outboundNo: string;
  outboundDate: string;
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  lotNo: string;
  quantity: number;
  unit: string;
  productionLine: string;
  productionLineJa?: string | null;
  workOrderNo: string;
  handler: string;
  outboundStatus: OutboundStatus;
  remarks?: string;
}

// ── 수불 이력 엔티티 ──────────────────────────────────────────
export interface MaterialTransaction {
  id: string;
  timestamp: string;
  transactionNo: string;
  transactionType: TransactionType;
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  lotNo: string;
  inboundQty: number;
  outboundQty: number;
  balanceAfter: number;
  handler: string;
  remarks?: string;
}

// ── 재고 부족 현황 엔티티 ──────────────────────────────────────
export interface MaterialShortageItem {
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  currentStock: number;
  safetyStock: number;
  shortageQty: number;
  unit: string;
  defaultSupplier: string;
  defaultSupplierJa?: string | null;
  inventoryStatus: InventoryStatus;
  orderStatus: "REQUIRED" | "REQUESTED";
}

// ── 부족 자재 발주 요청 엔티티 ────────────────────────────────
export interface MaterialPurchaseRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  materialCode: string;
  materialName: string;
  materialNameJa?: string | null;
  supplierName: string;
  supplierNameJa?: string | null;
  requestedQuantity: number;
  unit: string;
  status: MaterialPurchaseRequestStatus;
  requester: string;
  receivedInboundNo?: string;
}

// ── 상단 요약 카드의 집계 데이터 ──────────────────────────────
export interface MaterialSummary {
  totalShortageCount: number;
  criticalShortageCount: number;
  expiringLotCount: number;
  holdLotCount: number;
}

// ── 모달 상태 인터페이스 ─────────────────────────────────────
export interface InboundModalState {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: MaterialInbound;
}

export interface InventoryDetailModalState {
  isOpen: boolean;
  item?: MaterialInventory;
}

export interface OutboundModalState {
  isOpen: boolean;
  mode: "create" | "detail";
  item?: MaterialOutbound;
}

export interface TransactionDetailModalState {
  isOpen: boolean;
  item?: MaterialTransaction;
}

export interface MaterialToastState {
  id: number;
  message: string;
  type: "success" | "error";
}
