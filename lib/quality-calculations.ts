import { isWeightWithinAllowedRange } from "@/constants/quality-rules";

// ============================================================
// 품질관리 — 합격률 / 불량률 및 중량 평가 유틸리티
// ============================================================

/** 합격률 계산 (소수점 첫째 자리 %) */
export function calculatePassRate(passedCount: number, totalCompletedCount: number): number {
  if (!totalCompletedCount || totalCompletedCount <= 0) return 0;
  return Math.round((passedCount / totalCompletedCount) * 100 * 10) / 10;
}

/** 불량률 계산 (소수점 첫째 자리 %) */
export function calculateQualityDefectRate(failedCount: number, totalCompletedCount: number): number {
  if (!totalCompletedCount || totalCompletedCount <= 0) return 0.0;
  return Math.round((failedCount / totalCompletedCount) * 100 * 10) / 10;
}

/** 완제품 샘플 중량 적합성 평가 */
export function evaluateWeightResult(productCode: string, avgWeight: number): "PASS" | "FAIL" {
  return isWeightWithinAllowedRange(productCode, avgWeight) ? "PASS" : "FAIL";
}
