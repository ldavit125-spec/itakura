import type { BOMItem } from "@/types/production";

// ============================================================
// 생산관리 — 제품별 BOM Mock 데이터 (기준 수량: 1,000개 당)
// 주: 제품명/자재명 직접 저장 금지 (productCode / materialCode 참조)
// ============================================================

export const PRODUCT_BOM_MOCK: BOMItem[] = [
  // 1. 식빵 (PRD-001) 1,000개 기준
  { productCode: "PRD-001", materialCode: "MAT-001", baseQuantity: 350 },
  { productCode: "PRD-001", materialCode: "MAT-002", baseQuantity: 35 },
  { productCode: "PRD-001", materialCode: "MAT-003", baseQuantity: 25 },
  { productCode: "PRD-001", materialCode: "MAT-004", baseQuantity: 8 },

  // 2. 단팥빵 (PRD-002) 1,000개 기준
  { productCode: "PRD-002", materialCode: "MAT-001", baseQuantity: 280 },
  { productCode: "PRD-002", materialCode: "MAT-002", baseQuantity: 30 },
  { productCode: "PRD-002", materialCode: "MAT-003", baseQuantity: 18 },
  { productCode: "PRD-002", materialCode: "MAT-004", baseQuantity: 10 },
  { productCode: "PRD-002", materialCode: "MAT-005", baseQuantity: 120 },

  // 3. 멜론빵 (PRD-003) 1,000개 기준
  { productCode: "PRD-003", materialCode: "MAT-001", baseQuantity: 300 },
  { productCode: "PRD-003", materialCode: "MAT-002", baseQuantity: 55 },
  { productCode: "PRD-003", materialCode: "MAT-003", baseQuantity: 35 },
  { productCode: "PRD-003", materialCode: "MAT-004", baseQuantity: 12 },

  // 4. 크림빵 (PRD-004) 1,000개 기준
  { productCode: "PRD-004", materialCode: "MAT-001", baseQuantity: 290 },
  { productCode: "PRD-004", materialCode: "MAT-002", baseQuantity: 40 },
  { productCode: "PRD-004", materialCode: "MAT-003", baseQuantity: 25 },
  { productCode: "PRD-004", materialCode: "MAT-004", baseQuantity: 11 },

  // 5. 크루아상 (PRD-005) 1,000개 기준
  { productCode: "PRD-005", materialCode: "MAT-001", baseQuantity: 320 },
  { productCode: "PRD-005", materialCode: "MAT-002", baseQuantity: 25 },
  { productCode: "PRD-005", materialCode: "MAT-003", baseQuantity: 110 },
  { productCode: "PRD-005", materialCode: "MAT-004", baseQuantity: 6 },
];
