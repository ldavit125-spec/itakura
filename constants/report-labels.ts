import type {
  ReportPeriodType,
  ReportAggregationType,
  ExpirationStatus,
  ReportTab,
} from "@/types/reports";

// ============================================================
// 보고서 및 통계관리 — 한국어 라벨 맵 및 선택 옵션
// ============================================================

export const REPORT_PERIOD_TYPE_LABELS: Record<ReportPeriodType, { ko: string; ja: string }> = {
  TODAY: { ko: "오늘", ja: "今日" },
  THIS_WEEK: { ko: "이번 주", ja: "今週" },
  THIS_MONTH: { ko: "이번 달", ja: "今月" },
  LAST_MONTH: { ko: "지난달", ja: "先月" },
  LAST_3_MONTHS: { ko: "최근 3개월", ja: "直近3ヶ月" },
  THIS_YEAR: { ko: "올해", ja: "今年" },
  CUSTOM: { ko: "직접 설정", ja: "カスタム設定" },
};

export const getReportPeriodOptions = (locale: "ko" | "ja"): { value: ReportPeriodType; label: string }[] => [
  { value: "THIS_MONTH", label: locale === "ja" ? "今月 (2026.07)" : "이번 달 (2026.07)" },
  { value: "TODAY", label: locale === "ja" ? "今日" : "오늘" },
  { value: "THIS_WEEK", label: locale === "ja" ? "今週" : "이번 주" },
  { value: "LAST_MONTH", label: locale === "ja" ? "先月 (2026.06)" : "지난달 (2026.06)" },
  { value: "LAST_3_MONTHS", label: locale === "ja" ? "直近3ヶ月" : "최근 3개월" },
  { value: "THIS_YEAR", label: locale === "ja" ? "今年 (2026年)" : "올해 (2026년)" },
  { value: "CUSTOM", label: locale === "ja" ? "日付カスタム設定" : "직접 날짜 설정" },
];

export const REPORT_AGGREGATION_TYPE_LABELS: Record<ReportAggregationType, { ko: string; ja: string }> = {
  DAILY: { ko: "일별 집계", ja: "日別集計" },
  WEEKLY: { ko: "주별 집계", ja: "週別集計" },
  MONTHLY: { ko: "월별 집계", ja: "月別集計" },
};

export const EXPIRATION_STATUS_LABELS: Record<ExpirationStatus, { ko: string; ja: string }> = {
  NORMAL: { ko: "정상 (30일 초과)", ja: "正常 (30日超過)" },
  WARNING: { ko: "주의 (8~30일)", ja: "注意 (8〜30日)" },
  EXPIRING_SOON: { ko: "임박 (1~7일)", ja: "間近 (1〜7日)" },
  EXPIRED: { ko: "만료 (0일 이하)", ja: "期限切れ (0日以下)" },
};

export const REPORT_TAB_LABELS: Record<ReportTab, { ko: string; ja: string }> = {
  dashboard: { ko: "통합 경영현황", ja: "統合経営状況" },
  production: { ko: "생산실적 보고서", ja: "生産実績レポート" },
  materials: { ko: "자재·재고 보고서", ja: "資材・在庫レポート" },
  quality: { ko: "품질분석 보고서", ja: "品質分析レポート" },
  lot: { ko: "LOT 추적 보고서", ja: "LOT追跡レポート" },
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
