import type {
  InspectionCategory,
  InspectionStatus,
  InspectionJudgment,
  ItemResultCode,
  PriorityLevel,
  ProcessCode,
  NonconformityType,
  SeverityLevel,
  NonconformityStatus,
  DepartmentCode,
  CorrectiveActionStatus,
  VerificationStatus,
  AnalysisMethod,
  QualityTab,
} from "@/types/quality";

// ============================================================
// 품질관리 — 한국어 라벨 맵 및 옵션 목록
// ============================================================

export const INSPECTION_CATEGORY_LABELS: Record<InspectionCategory, string> = {
  INCOMING: "원재료 입고검사",
  PROCESS: "공정검사",
  FINISHED_GOODS: "완제품검사",
};

export const INSPECTION_CATEGORY_OPTIONS: { value: InspectionCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "검사 구분 전체" },
  { value: "INCOMING", label: "원재료 입고검사" },
  { value: "PROCESS", label: "공정검사" },
  { value: "FINISHED_GOODS", label: "완제품검사" },
];

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  REQUESTED: "검사 요청",
  ASSIGNED: "담당자 배정",
  IN_PROGRESS: "검사 중",
  COMPLETED: "검사 완료",
  CANCELLED: "검사 취소",
};

export const INSPECTION_STATUS_OPTIONS: { value: InspectionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "검사 상태 전체" },
  { value: "REQUESTED", label: "검사 요청" },
  { value: "ASSIGNED", label: "담당자 배정" },
  { value: "IN_PROGRESS", label: "검사 중" },
  { value: "COMPLETED", label: "검사 완료" },
  { value: "CANCELLED", label: "검사 취소" },
];

export const INSPECTION_JUDGMENT_LABELS: Record<InspectionJudgment, string> = {
  PASSED: "합격",
  CONDITIONAL_PASS: "조건부 합격",
  HOLD: "보류",
  FAILED: "불합격",
};

export const INSPECTION_JUDGMENT_OPTIONS: { value: InspectionJudgment | "ALL"; label: string }[] = [
  { value: "ALL", label: "판정 전체" },
  { value: "PASSED", label: "합격" },
  { value: "CONDITIONAL_PASS", label: "조건부 합격" },
  { value: "HOLD", label: "보류" },
  { value: "FAILED", label: "불합격" },
];

export const ITEM_RESULT_LABELS: Record<ItemResultCode, string> = {
  NOT_TESTED: "미검사",
  PASS: "적합",
  FAIL: "부적합",
  NOT_APPLICABLE: "해당 없음",
};

export const PRIORITY_LEVEL_LABELS: Record<PriorityLevel, string> = {
  URGENT: "긴급",
  HIGH: "높음",
  NORMAL: "보통",
  LOW: "낮음",
};

export const PRIORITY_LEVEL_OPTIONS: { value: PriorityLevel | "ALL"; label: string }[] = [
  { value: "ALL", label: "우선순위 전체" },
  { value: "URGENT", label: "긴급" },
  { value: "HIGH", label: "높음" },
  { value: "NORMAL", label: "보통" },
  { value: "LOW", label: "낮음" },
];

export const PROCESS_CODE_LABELS: Record<ProcessCode, string> = {
  MIXING: "배합",
  DOUGH: "반죽",
  FERMENTATION: "발효",
  DIVIDING: "분할",
  SHAPING: "성형",
  BAKING: "소성",
  COOLING: "냉각",
  PACKAGING: "포장",
};

export const PROCESS_CODE_OPTIONS: { value: ProcessCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "공정 전체" },
  { value: "MIXING", label: "배합" },
  { value: "DOUGH", label: "반죽" },
  { value: "FERMENTATION", label: "발효" },
  { value: "DIVIDING", label: "분할" },
  { value: "SHAPING", label: "성형" },
  { value: "BAKING", label: "소성" },
  { value: "COOLING", label: "냉각" },
  { value: "PACKAGING", label: "포장" },
];

export const NONCONFORMITY_TYPE_LABELS: Record<NonconformityType, string> = {
  MATERIAL_DEFECT: "원재료 불량",
  PACKAGING_DAMAGE: "포장 파손",
  FOREIGN_MATERIAL: "이물 혼입",
  TEMPERATURE_DEVIATION: "온도 이탈",
  WEIGHT_DEVIATION: "중량 이탈",
  APPEARANCE_DEFECT: "외관 불량",
  SHAPE_DEFECT: "형태 불량",
  BAKING_DEFECT: "소성 불량",
  LABELING_ERROR: "표시 오류",
  HYGIENE_ISSUE: "위생 문제",
  PROCESS_DEVIATION: "공정 이탈",
  OTHER: "기타",
};

export const NONCONFORMITY_TYPE_OPTIONS: { value: NonconformityType | "ALL"; label: string }[] = [
  { value: "ALL", label: "부적합 유형 전체" },
  { value: "MATERIAL_DEFECT", label: "원재료 불량" },
  { value: "PACKAGING_DAMAGE", label: "포장 파손" },
  { value: "FOREIGN_MATERIAL", label: "이물 혼입" },
  { value: "TEMPERATURE_DEVIATION", label: "온도 이탈" },
  { value: "WEIGHT_DEVIATION", label: "중량 이탈" },
  { value: "APPEARANCE_DEFECT", label: "외관 불량" },
  { value: "SHAPE_DEFECT", label: "형태 불량" },
  { value: "BAKING_DEFECT", label: "소성 불량" },
  { value: "LABELING_ERROR", label: "표시 오류" },
  { value: "HYGIENE_ISSUE", label: "위생 문제" },
  { value: "PROCESS_DEVIATION", label: "공정 이탈" },
  { value: "OTHER", label: "기타" },
];

export const SEVERITY_LEVEL_LABELS: Record<SeverityLevel, string> = {
  CRITICAL: "치명",
  MAJOR: "중대",
  MINOR: "경미",
};

export const SEVERITY_LEVEL_OPTIONS: { value: SeverityLevel | "ALL"; label: string }[] = [
  { value: "ALL", label: "심각도 전체" },
  { value: "CRITICAL", label: "치명" },
  { value: "MAJOR", label: "중대" },
  { value: "MINOR", label: "경미" },
];

export const NONCONFORMITY_STATUS_LABELS: Record<NonconformityStatus, string> = {
  OPEN: "접수",
  INVESTIGATING: "원인 조사 중",
  ACTION_REQUIRED: "조치 필요",
  ACTION_IN_PROGRESS: "조치 중",
  RESOLVED: "해결",
  CLOSED: "종결",
};

export const NONCONFORMITY_STATUS_OPTIONS: { value: NonconformityStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "처리 상태 전체" },
  { value: "OPEN", label: "접수" },
  { value: "INVESTIGATING", label: "원인 조사 중" },
  { value: "ACTION_REQUIRED", label: "조치 필요" },
  { value: "ACTION_IN_PROGRESS", label: "조치 중" },
  { value: "RESOLVED", label: "해결" },
  { value: "CLOSED", label: "종결" },
];

export const DEPARTMENT_CODE_LABELS: Record<DepartmentCode, string> = {
  MATERIALS: "자재관리",
  PRODUCTION: "생산관리",
  QUALITY: "품질관리",
  FACILITY: "설비관리",
  HYGIENE: "위생관리",
};

export const DEPARTMENT_CODE_OPTIONS: { value: DepartmentCode; label: string }[] = [
  { value: "MATERIALS", label: "자재관리" },
  { value: "PRODUCTION", label: "생산관리" },
  { value: "QUALITY", label: "품질관리" },
  { value: "FACILITY", label: "설비관리" },
  { value: "HYGIENE", label: "위생관리" },
];

export const CORRECTIVE_ACTION_STATUS_LABELS: Record<CorrectiveActionStatus, string> = {
  REQUESTED: "요청",
  ANALYZING: "원인 분석 중",
  PLANNED: "조치 계획 수립",
  IN_PROGRESS: "조치 진행 중",
  COMPLETED: "조치 완료",
  VERIFIED: "효과 검증 완료",
  CLOSED: "종결",
};

export const CORRECTIVE_ACTION_STATUS_OPTIONS: { value: CorrectiveActionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "조치 상태 전체" },
  { value: "REQUESTED", label: "요청" },
  { value: "ANALYZING", label: "원인 분석 중" },
  { value: "PLANNED", label: "조치 계획 수립" },
  { value: "IN_PROGRESS", label: "조치 진행 중" },
  { value: "COMPLETED", label: "조치 완료" },
  { value: "VERIFIED", label: "효과 검증 완료" },
  { value: "CLOSED", label: "종결" },
];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  NOT_VERIFIED: "미검증",
  EFFECTIVE: "효과 있음",
  INEFFECTIVE: "효과 없음",
  RECHECK_REQUIRED: "재검증 필요",
};

export const ANALYSIS_METHOD_LABELS: Record<AnalysisMethod, string> = {
  FIVE_WHY: "5 Why",
  FISHBONE: "특성요인도",
  CHECKLIST: "체크리스트",
  INTERVIEW: "작업자 인터뷰",
  DATA_ANALYSIS: "데이터 분석",
  OTHER: "기타",
};

export const QUALITY_TAB_LABELS: Record<QualityTab, string> = {
  inspection: "품질 검사",
  results: "검사 결과",
  defects: "불량품 이력",
  statistics: "품질 통계",
};

export const QUALITY_TABS: QualityTab[] = [
  "inspection",
  "results",
  "defects",
  "statistics",
];
