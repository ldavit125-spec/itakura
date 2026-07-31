// ============================================================
// 공통 업무 날짜(businessDate) 및 기간 필터 유틸리티
// ============================================================

export function getBusinessDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseBusinessDate(dateStr: string): Date {
  const cleanStr = dateStr.split(" ")[0].trim();
  const [year, month, day] = cleanStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function isSameBusinessDate(date1?: string | null, date2?: string | null): boolean {
  if (!date1 || !date2) return false;
  const d1 = date1.split(" ")[0].trim();
  const d2 = date2.split(" ")[0].trim();
  return d1 === d2;
}

export function getStartOfBusinessDay(dateStr: string = getBusinessDate()): string {
  return `${dateStr.split(" ")[0].trim()} 00:00:00`;
}

export function getEndOfBusinessDay(dateStr: string = getBusinessDate()): string {
  return `${dateStr.split(" ")[0].trim()} 23:59:59`;
}

export function filterByDateRange<T>(
  items: T[],
  dateExtractor: (item: T) => string,
  startDate?: string,
  endDate?: string
): T[] {
  if (!startDate && !endDate) return items;
  return items.filter((item) => {
    const itemDateStr = dateExtractor(item);
    if (!itemDateStr) return false;
    const cleanItemDate = itemDateStr.split(" ")[0].trim();
    if (startDate && cleanItemDate < startDate) return false;
    if (endDate && cleanItemDate > endDate) return false;
    return true;
  });
}
