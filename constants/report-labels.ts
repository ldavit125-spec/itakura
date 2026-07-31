import type {
  ReportPeriodType,
  ReportAggregationType,
  ExpirationStatus,
  ReportTab,
} from "@/types/reports";

// ============================================================
// 보고서 및 통계관리 — 한국어 라벨 맵 및 선택 옵션
// ============================================================

export const REPORT_PERIOD_TYPE_LABELS: Record<ReportPeriodType, string> = {
  TODAY: "오늘",
  THIS_WEEK: "이번 주",
  THIS_MONTH: "이번 달",
  LAST_MONTH: "지난달",
  LAST_3_MONTHS: "최근 3개월",
  THIS_YEAR: "올해",
  CUSTOM: "직접 설정",
};

export const REPORT_PERIOD_OPTIONS: { value: ReportPeriodType; label: string }[] = [
  { value: "THIS_MONTH", label: "이번 달 (2026.07)" },
  { value: "TODAY", label: "오늘" },
  { value: "THIS_WEEK", label: "이번 주" },
  { value: "LAST_MONTH", label: "지난달 (2026.06)" },
  { value: "LAST_3_MONTHS", label: "최근 3개월" },
  { value: "THIS_YEAR", label: "올해 (2026년)" },
  { value: "CUSTOM", label: "직접 날짜 설정" },
];

export const REPORT_AGGREGATION_TYPE_LABELS: Record<ReportAggregationType, string> = {
  DAILY: "일별 집계",
  WEEKLY: "주별 집계",
  MONTHLY: "월별 집계",
};

export const EXPIRATION_STATUS_LABELS: Record<ExpirationStatus, string> = {
  NORMAL: "정상 (30일 초과)",
  WARNING: "주의 (8~30일)",
  EXPIRING_SOON: "임박 (1~7일)",
  EXPIRED: "만료 (0일 이하)",
};

export const REPORT_TAB_LABELS: Record<ReportTab, string> = {
  dashboard: "통합 경영현황",
  production: "생산실적 보고서",
  materials: "자재·재고 보고서",
  quality: "품질분석 보고서",
  lot: "LOT 추적 보고서",
};

export const REPORT_TABS: ReportTab[] = [
  "dashboard",
  "production",
  "materials",
  "quality",
  "lot",
];

export const EXPIRATION_STATUS_STYLES: Record<ExpirationStatus, string> = {
  NORMAL: "bg-green-100 text-green-800 border-green-200",
  WARNING: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
  EXPIRING_SOON: "bg-orange-100 text-orange-900 border-orange-300 font-bold",
  EXPIRED: "bg-red-100 text-red-900 border-red-300 font-extrabold animate-pulse",
};
