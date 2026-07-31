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
  PENDING: "검사 대기",
  PASSED: "합격",
  HOLD: "보류",
  FAILED: "불합격",
};

export const INSPECTION_STATUS_OPTIONS: { value: InspectionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "검사 상태 전체" },
  { value: "PENDING", label: "검사 대기" },
  { value: "PASSED", label: "합격" },
  { value: "HOLD", label: "보류" },
  { value: "FAILED", label: "불합격" },
];

export const INBOUND_STATUS_LABELS: Record<InboundStatus, string> = {
  RECEIVED: "입고 완료",
  CANCELLED: "입고 취소",
};

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  NORMAL: "정상",
  LOW: "부족",
  CRITICAL: "긴급",
  HOLD: "사용 보류",
  EXPIRED: "유통기한 만료",
};

export const INVENTORY_STATUS_OPTIONS: { value: InventoryStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "재고 상태 전체" },
  { value: "NORMAL", label: "정상" },
  { value: "LOW", label: "부족" },
  { value: "CRITICAL", label: "긴급" },
  { value: "HOLD", label: "사용 보류" },
  { value: "EXPIRED", label: "유통기한 만료" },
];

export const OUTBOUND_STATUS_LABELS: Record<OutboundStatus, string> = {
  COMPLETED: "출고 완료",
  CANCELLED: "출고 취소",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INBOUND: "입고",
  OUTBOUND: "출고",
  INBOUND_CANCEL: "입고 취소",
  OUTBOUND_CANCEL: "출고 취소",
  ADJUSTMENT_INCREASE: "재고 증가 조정",
  ADJUSTMENT_DECREASE: "재고 감소 조정",
};

export const TRANSACTION_TYPE_OPTIONS: { value: TransactionType | "ALL"; label: string }[] = [
  { value: "ALL", label: "처리 유형 전체" },
  { value: "INBOUND", label: "입고" },
  { value: "OUTBOUND", label: "출고" },
  { value: "INBOUND_CANCEL", label: "입고 취소" },
  { value: "OUTBOUND_CANCEL", label: "출고 취소" },
  { value: "ADJUSTMENT_INCREASE", label: "재고 증가 조정" },
  { value: "ADJUSTMENT_DECREASE", label: "재고 감소 조정" },
];

export const MATERIAL_TAB_LABELS: Record<MaterialTab, string> = {
  inbound: "자재 입고",
  inventory: "재고 현황",
  outbound: "자재 출고",
  transaction: "수불 이력",
  shortage: "재고 부족 현황",
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
