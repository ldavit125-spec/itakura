import type { DefectHistory, DefectHistorySummary } from "@/types/quality";

export function getDefectHistorySummary(items: DefectHistory[]): DefectHistorySummary {
  const totalCount = items.length;
  const totalDefectQuantity = items.reduce((sum, item) => sum + item.defectQuantity, 0);
  const averageDefectRate = totalCount ? Math.round((items.reduce((sum, item) => sum + item.defectRate, 0) / totalCount) * 100) / 100 : 0;
  const completed = items.filter((item) => item.status === "COMPLETED").length;
  return {
    totalCount,
    totalDefectQuantity,
    averageDefectRate,
    completionRate: totalCount ? Math.round((completed / totalCount) * 1000) / 10 : 0,
  };
}
