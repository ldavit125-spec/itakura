import type {
  PlanStatus,
  PlanPriority,
  MaterialReadiness,
  WorkStatus,
  MaterialIssueStatus,
  ResultStatus,
  QualityStatus,
  DefectType,
  ProductionTab,
} from "@/types/production";

// ============================================================
// 생산관리 — 한국어 라벨 맵 및 선택 옵션
// ============================================================

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  DRAFT: "작성 중",
  CONFIRMED: "확정",
  IN_PROGRESS: "생산 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export const PLAN_STATUS_OPTIONS: { value: PlanStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "계획 상태 전체" },
  { value: "DRAFT", label: "작성 중" },
  { value: "CONFIRMED", label: "확정" },
  { value: "IN_PROGRESS", label: "생산 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

export const PLAN_PRIORITY_LABELS: Record<PlanPriority, string> = {
  URGENT: "긴급",
  HIGH: "높음",
  NORMAL: "보통",
  LOW: "낮음",
};

export const PLAN_PRIORITY_OPTIONS: { value: PlanPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "우선순위 전체" },
  { value: "URGENT", label: "긴급" },
  { value: "HIGH", label: "높음" },
  { value: "NORMAL", label: "보통" },
  { value: "LOW", label: "낮음" },
];

export const MATERIAL_READINESS_LABELS: Record<MaterialReadiness, string> = {
  READY: "준비 완료",
  PARTIAL: "일부 준비",
  SHORTAGE: "자재 부족",
  NOT_CHECKED: "미확인",
};

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  WAITING: "작업 대기",
  READY: "작업 준비 완료",
  IN_PROGRESS: "작업 중",
  PAUSED: "일시정지",
  COMPLETED: "작업 완료",
  CANCELLED: "작업 취소",
};

export const WORK_STATUS_OPTIONS: { value: WorkStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "작업 상태 전체" },
  { value: "WAITING", label: "작업 대기" },
  { value: "READY", label: "작업 준비 완료" },
  { value: "IN_PROGRESS", label: "작업 중" },
  { value: "PAUSED", label: "일시정지" },
  { value: "COMPLETED", label: "작업 완료" },
  { value: "CANCELLED", label: "작업 취소" },
];

export const MATERIAL_ISSUE_STATUS_LABELS: Record<MaterialIssueStatus, string> = {
  NOT_ISSUED: "미출고",
  PARTIALLY_ISSUED: "일부 출고",
  ISSUED: "출고 완료",
  SHORTAGE: "재고 부족",
};

export const RESULT_STATUS_LABELS: Record<ResultStatus, string> = {
  DRAFT: "임시저장",
  SUBMITTED: "제출 완료",
  CONFIRMED: "확정",
};

export const QUALITY_STATUS_LABELS: Record<QualityStatus, string> = {
  PENDING: "품질검사 대기",
  PASSED: "합격",
  HOLD: "보류",
  FAILED: "불합격",
};

export const DEFECT_TYPE_LABELS: Record<DefectType, string> = {
  DOUGH_DEFECT: "반죽 불량",
  BAKING_DEFECT: "소성 불량",
  SHAPE_DEFECT: "성형 불량",
  WEIGHT_DEFECT: "중량 불량",
  PACKAGING_DEFECT: "포장 불량",
  OTHER: "기타",
};

export const DEFECT_TYPE_OPTIONS: { value: DefectType; label: string }[] = [
  { value: "DOUGH_DEFECT", label: "반죽 불량" },
  { value: "BAKING_DEFECT", label: "소성 불량" },
  { value: "SHAPE_DEFECT", label: "성형 불량" },
  { value: "WEIGHT_DEFECT", label: "중량 불량" },
  { value: "PACKAGING_DEFECT", label: "포장 불량" },
  { value: "OTHER", label: "기타" },
];

export const PRODUCTION_TAB_LABELS: Record<ProductionTab, string> = {
  plan: "생산계획",
  "work-order": "작업지시",
  progress: "생산 진행",
  result: "생산실적",
  "fg-lot": "완제품 LOT",
};

export const PRODUCTION_TABS: ProductionTab[] = [
  "plan",
  "work-order",
  "progress",
  "result",
  "fg-lot",
];
