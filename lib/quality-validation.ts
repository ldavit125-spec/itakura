import type { InspectionItemResult, InspectionJudgment } from "@/types/quality";

// ============================================================
// 품질관리 — 판정 및 검사 입력 검증 유틸리티
// ============================================================

export function validateJudgmentRules(
  items: InspectionItemResult[],
  judgment: InspectionJudgment,
  reason?: string
): { isValid: boolean; errorMessage?: string } {
  const hasFailedItem = items.some((item) => item.result === "FAIL");

  // 규칙 1: 부적합 항목이 하나라도 존재하면 합격 또는 조건부합격 판정 불가!
  if (hasFailedItem && (judgment === "PASSED" || judgment === "CONDITIONAL_PASS")) {
    return {
      isValid: false,
      errorMessage: "검사 항목 중 부적합(FAIL) 항목이 존재하여 합격 또는 조건부 합격으로 판정할 수 없습니다. 보류 또는 불합격 판정만 가능합니다.",
    };
  }

  // 규칙 2: 조건부 합격, 보류, 불합격 시 판정 사유 필수 입력
  if (
    (judgment === "CONDITIONAL_PASS" || judgment === "HOLD" || judgment === "FAILED") &&
    (!reason || reason.trim() === "")
  ) {
    return {
      isValid: false,
      errorMessage: `${judgment === "HOLD" ? "보류" : judgment === "FAILED" ? "불합격" : "조건부 합격"} 판정 시 상세 판정 사유 입력이 필수입니다.`,
    };
  }

  return { isValid: true };
}
