import type { ProductWeightStandard } from "@/types/quality";

// ============================================================
// 품질관리 — 완제품 중량 오차 기준 및 검사 규칙
// ============================================================

export const PRODUCT_WEIGHT_STANDARDS: Record<string, ProductWeightStandard> = {
  "PRD-001": {
    productCode: "PRD-001",
    productName: "식빵",
    baseWeight: 450,
    tolerance: 15,
    minAllowed: 435,
    maxAllowed: 465,
  },
  "PRD-002": {
    productCode: "PRD-002",
    productName: "단팥빵",
    baseWeight: 90,
    tolerance: 5,
    minAllowed: 85,
    maxAllowed: 95,
  },
  "PRD-003": {
    productCode: "PRD-003",
    productName: "멜론빵",
    baseWeight: 85,
    tolerance: 5,
    minAllowed: 80,
    maxAllowed: 90,
  },
  "PRD-004": {
    productCode: "PRD-004",
    productName: "크림빵",
    baseWeight: 90,
    tolerance: 5,
    minAllowed: 85,
    maxAllowed: 95,
  },
  "PRD-005": {
    productCode: "PRD-005",
    productName: "크루아상",
    baseWeight: 75,
    tolerance: 5,
    minAllowed: 70,
    maxAllowed: 80,
  },
};

/** 평균 중량이 허용 범위 내에 있는지 평가하는 함수 */
export function isWeightWithinAllowedRange(productCode: string, avgWeight: number): boolean {
  const std = PRODUCT_WEIGHT_STANDARDS[productCode];
  if (!std) return true;
  return avgWeight >= std.minAllowed && avgWeight <= std.maxAllowed;
}
