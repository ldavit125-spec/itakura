// ============================================================
// 생산관리 — 번호 및 LOT 채번 유틸리티
// ============================================================

/** 생산계획 번호 생성 (형식: PLAN-YYYYMMDD-순번) */
export function generatePlanNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const seqStr = String(seq).padStart(3, "0");
  return `PLAN-${cleanDate}-${seqStr}`;
}

/** 작업지시 번호 생성 (형식: WO-YYYYMMDD-순번) */
export function generateWorkOrderNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const seqStr = String(seq).padStart(3, "0");
  return `WO-${cleanDate}-${seqStr}`;
}

/** 실적 번호 생성 (형식: RESULT-YYYYMMDD-순번) */
export function generateResultNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const seqStr = String(seq).padStart(3, "0");
  return `RESULT-${cleanDate}-${seqStr}`;
}

/** 완제품 LOT 번호 생성 (형식: FG-제품코드-YYYYMMDD-순번) */
export function generateFGLotNo(productCode: string, dateStr: string, seq: number): string {
  const cleanProductCode = productCode.replace("-", "");
  const cleanDate = dateStr.replace(/-/g, "");
  const seqStr = String(seq).padStart(3, "0");
  return `FG-${cleanProductCode}-${cleanDate}-${seqStr}`;
}
