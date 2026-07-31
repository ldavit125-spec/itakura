// ============================================================
// 보고서 및 통계관리 — UTF-8 BOM CSV 생성 및 다운로드 유틸리티
// ============================================================

export function exportTableToCsv(
  headers: string[],
  rows: (string | number)[][],
  filenamePrefix: string
): void {
  if (typeof window === "undefined") return;

  // UTF-8 BOM Header
  const BOM = "\uFEFF";

  const csvRows: string[] = [];

  // Add Headers
  csvRows.push(headers.map(escapeCsvCell).join(","));

  // Add Rows
  rows.forEach((row) => {
    csvRows.push(row.map(escapeCsvCell).join(","));
  });

  const csvString = BOM + csvRows.join("\r\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const nowStr = new Date().toISOString().substring(0, 10).replace(/-/g, "");
  const filename = `${filenamePrefix}_${nowStr}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(cell: string | number): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
