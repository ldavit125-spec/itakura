// ============================================================
// 생산관리 — 업무 규칙 및 제품별 유통기한 설정
// ============================================================

/** 제품 코드별 유통기한 일수 매핑 (생산일 기준 + N일) */
export const PRODUCT_EXPIRATION_DAYS: Record<string, number> = {
  "PRD-001": 5, // 식빵: 생산일 + 5일
  "PRD-002": 4, // 단팥빵: 생산일 + 4일
  "PRD-003": 4, // 멜론빵: 생산일 + 4일
  "PRD-004": 3, // 크림빵: 생산일 + 3일
  "PRD-005": 4, // 크루아상: 생산일 + 4일
};

/** 제품 코드에 대한 유통기한 만료일 계산 함수 */
export function calculateFGExpirationDate(productCode: string, productionDate: string): string {
  const daysToAdd = PRODUCT_EXPIRATION_DAYS[productCode] ?? 4;
  const prodDate = new Date(productionDate);
  prodDate.setDate(prodDate.getDate() + daysToAdd);
  return prodDate.toISOString().split("T")[0];
}
