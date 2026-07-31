import type { ReportPeriodType, ExpirationStatus } from "@/types/reports";
import { getBusinessDate } from "./selectors/business-date";

// ============================================================
// 보고서 및 통계관리 — 날짜 계산 및 유효성 검증 유틸리티
// ============================================================

/** Reference base date for mock environment: 2026-07-31 */
const BASE_DATE_STR = getBusinessDate();

export function calculateDateRange(
  periodType: ReportPeriodType,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  if (periodType === "CUSTOM") {
    return {
      startDate: customStart || "2026-07-01",
      endDate: customEnd || BASE_DATE_STR,
    };
  }

  const baseDate = new Date(`${BASE_DATE_STR}T00:00:00`);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-indexed (6 = July)

  switch (periodType) {
    case "TODAY":
      return { startDate: BASE_DATE_STR, endDate: BASE_DATE_STR };

    case "THIS_WEEK": {
      // Monday of this week
      const dayOfWeek = baseDate.getDay() || 7; // Sunday = 7
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() - (dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        startDate: formatDateStr(monday),
        endDate: formatDateStr(sunday),
      };
    }

    case "THIS_MONTH": {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        startDate: formatDateStr(firstDay),
        endDate: formatDateStr(lastDay),
      };
    }

    case "LAST_MONTH": {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      return {
        startDate: formatDateStr(firstDay),
        endDate: formatDateStr(lastDay),
      };
    }

    case "LAST_3_MONTHS": {
      const firstDay = new Date(year, month - 2, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        startDate: formatDateStr(firstDay),
        endDate: formatDateStr(lastDay),
      };
    }

    case "THIS_YEAR": {
      return {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      };
    }

    default:
      return { startDate: "2026-07-01", endDate: BASE_DATE_STR };
  }
}

/** YYYY-MM-DD 날짜 포맷 변환 */
export function formatDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** 기간 검증 함수 */
export function validateDateRange(
  startDate: string,
  endDate: string
): { isValid: boolean; errorMessage?: string } {
  if (!startDate || !endDate) {
    return { isValid: false, errorMessage: "조회 시작일과 종료일을 입력해 주세요." };
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end)) {
    return { isValid: false, errorMessage: "올바른 날짜 형식이 아닙니다." };
  }

  if (start > end) {
    return { isValid: false, errorMessage: "조회 시작일은 종료일보다 늦을 수 없습니다." };
  }

  return { isValid: true };
}

/** 지정 날짜가 기간 범위 내 포함되는지 검사 */
export function isDateInRange(targetDateStr: string, startDate: string, endDate: string): boolean {
  if (!targetDateStr) return false;
  const targetOnlyDate = targetDateStr.split(" ")[0];
  return targetOnlyDate >= startDate && targetOnlyDate <= endDate;
}

/** 두 날짜 간 일수 차이 계산 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr.split(" ")[0]).getTime();
  const end = new Date(endDateStr.split(" ")[0]).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  const diffTime = end - start;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/** 유통기한 남은 일수 계산 (현재 날짜 기준: 2026-07-31) */
export function calculateRemainingDays(expirationDateStr: string): number {
  return calculateDaysBetween(BASE_DATE_STR, expirationDateStr);
}

/** 남은 일수에 따른 유통기한 상태 구분 */
export function getExpirationStatus(remainingDays: number): ExpirationStatus {
  if (remainingDays > 30) return "NORMAL";
  if (remainingDays >= 8) return "WARNING";
  if (remainingDays >= 1) return "EXPIRING_SOON";
  return "EXPIRED";
}
