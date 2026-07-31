// ============================================================
// 품질관리 — 번호 및 코드 채번 유틸리티
// ============================================================

export function generateRequestNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `REQ-${cleanDate}-${String(seq).padStart(3, "0")}`;
}

export function generateIQCNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `IQC-${cleanDate}-${String(seq).padStart(3, "0")}`;
}

export function generatePQCNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `PQC-${cleanDate}-${String(seq).padStart(3, "0")}`;
}

export function generateFQCNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `FQC-${cleanDate}-${String(seq).padStart(3, "0")}`;
}

export function generateNCNo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `NC-${cleanDate}-${String(seq).padStart(3, "0")}`;
}

export function generateCANo(dateStr: string, seq: number): string {
  const cleanDate = dateStr.replace(/-/g, "");
  return `CA-${cleanDate}-${String(seq).padStart(3, "0")}`;
}
