import type {
  InspectionStatus,
  InboundStatus,
  InventoryStatus,
  OutboundStatus,
  TransactionType,
  MaterialTab,
} from "@/types/materials";

// ============================================================
// 자재관리 — 한국어 라벨 맵 및 상수
// ============================================================

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  PENDING: "materials.inspection.pending", PASSED: "status.pass", HOLD: "status.hold", FAILED: "status.fail",
};

export const INSPECTION_STATUS_OPTIONS: { value: InspectionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "materials.inspection.all" }, { value: "PENDING", label: "materials.inspection.pending" }, { value: "PASSED", label: "status.pass" }, { value: "HOLD", label: "status.hold" }, { value: "FAILED", label: "status.fail" },
];

export const INBOUND_STATUS_LABELS: Record<InboundStatus, string> = {
  RECEIVED: "materials.inbound.received", CANCELLED: "materials.inbound.cancelled",
};

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  NORMAL: "status.normal", LOW: "materials.inventory.low", CRITICAL: "materials.inventory.critical", HOLD: "materials.inventory.hold", EXPIRED: "materials.inventory.expired",
};

export const INVENTORY_STATUS_OPTIONS: { value: InventoryStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "materials.inventory.all" }, { value: "NORMAL", label: "status.normal" }, { value: "LOW", label: "materials.inventory.low" }, { value: "CRITICAL", label: "materials.inventory.critical" }, { value: "HOLD", label: "materials.inventory.hold" }, { value: "EXPIRED", label: "materials.inventory.expired" },
];

export const OUTBOUND_STATUS_LABELS: Record<OutboundStatus, string> = {
  COMPLETED: "materials.outbound.completed", CANCELLED: "materials.outbound.cancelled",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INBOUND: "materials.transaction.inbound", OUTBOUND: "materials.transaction.outbound", INBOUND_CANCEL: "materials.transaction.inboundCancel", OUTBOUND_CANCEL: "materials.transaction.outboundCancel", ADJUSTMENT_INCREASE: "materials.transaction.adjustIncrease", ADJUSTMENT_DECREASE: "materials.transaction.adjustDecrease",
};

export const TRANSACTION_TYPE_OPTIONS: { value: TransactionType | "ALL"; label: string }[] = [
  { value: "ALL", label: "materials.transaction.all" }, { value: "INBOUND", label: "materials.transaction.inbound" }, { value: "OUTBOUND", label: "materials.transaction.outbound" }, { value: "INBOUND_CANCEL", label: "materials.transaction.inboundCancel" }, { value: "OUTBOUND_CANCEL", label: "materials.transaction.outboundCancel" }, { value: "ADJUSTMENT_INCREASE", label: "materials.transaction.adjustIncrease" }, { value: "ADJUSTMENT_DECREASE", label: "materials.transaction.adjustDecrease" },
];

export const MATERIAL_TAB_LABELS: Record<MaterialTab, string> = {
  inbound: "materials.tab.inbound", inventory: "materials.tab.inventory", outbound: "materials.tab.outbound", transaction: "materials.tab.transactions", shortage: "materials.tab.shortage",
};

export const MATERIAL_TABS: MaterialTab[] = [
  "inbound",
  "inventory",
  "outbound",
  "transaction",
  "shortage",
];

export const STORAGE_LOCATIONS = [
  "원료창고 A-01",
  "원료창고 A-02",
  "냉장창고 C-01",
  "냉장창고 C-02",
  "가공원료창고 B-01",
];
