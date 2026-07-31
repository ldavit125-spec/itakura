// ============================================================
// 공통 TypeScript 타입 정의
// ============================================================

/** 사이드바 네비게이션 메뉴 아이템 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // SVG path string
  module: import("./admin").ModuleKey;
}

/** 대시보드 KPI 카드 데이터 */
export interface DashboardCardData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  status?: KpiStatus;
}

/** KPI 상태 코드 */
export type KpiStatus = "GOOD" | "WARNING" | "DANGER" | "NEUTRAL";

/** 빈 기능 카드 (미구현 섹션 플레이스홀더) */
export interface EmptyCardData {
  id: string;
  title: string;
  description: string;
}

/** 페이지 헤더 Props */
export interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumb?: string[];
}
