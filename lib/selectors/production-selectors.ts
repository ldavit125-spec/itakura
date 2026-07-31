import type { ProductionPlan, ProductionResult } from "@/types/production";
import type { Product } from "@/types/master-data";
import { filterByDateRange } from "./business-date";

export function getProductionPlansByDateRange(
  plans: ProductionPlan[],
  startDate?: string,
  endDate?: string
): ProductionPlan[] {
  const filtered = filterByDateRange(plans, (p) => p.plannedDate, startDate, endDate);
  return filtered.filter((p) => p.planStatus !== "CANCELLED");
}

export function getProductionResultsByDateRange(
  results: ProductionResult[],
  startDate?: string,
  endDate?: string
): ProductionResult[] {
  const filtered = filterByDateRange(results, (r) => r.productionDate, startDate, endDate);
  return filtered.filter((r) => r.resultStatus !== "DRAFT");
}

export function getPlannedQuantity(plans: ProductionPlan[]): number {
  return plans.reduce((sum, p) => sum + p.plannedQuantity, 0);
}

export function getProducedQuantity(results: ProductionResult[]): number {
  return results.reduce((sum, r) => sum + r.totalQuantity, 0);
}

export function getGoodQuantity(results: ProductionResult[]): number {
  return results.reduce((sum, r) => sum + r.goodQuantity, 0);
}

export function getDefectQuantity(results: ProductionResult[]): number {
  return results.reduce((sum, r) => sum + r.defectQuantity, 0);
}

export function getReworkQuantity(results: ProductionResult[]): number {
  return results.reduce((sum, r) => sum + (r.reworkQuantity || 0), 0);
}

export function calculateAchievementRate(producedQty: number, plannedQty: number): number {
  if (!plannedQty || plannedQty <= 0) return 0;
  return Number(((producedQty / plannedQty) * 100).toFixed(1));
}

export function calculateDefectRate(defectQty: number, producedQty: number): number {
  if (!producedQty || producedQty <= 0) return 0;
  return Number(((defectQty / producedQty) * 100).toFixed(1));
}

export function aggregateProductionByProduct(
  results: ProductionResult[],
  products: Product[],
  startDate?: string,
  endDate?: string
): { productCode: string; productName: string; quantity: number }[] {
  const validResults = getProductionResultsByDateRange(results, startDate, endDate);
  const prodMap: Record<string, number> = {};
  validResults.forEach((r) => {
    prodMap[r.productCode] = (prodMap[r.productCode] || 0) + r.totalQuantity;
  });

  return products.map((p) => ({
    productCode: p.code,
    productName: p.name,
    quantity: prodMap[p.code] || 0,
  }));
}

export function aggregateProductionByLine(
  results: ProductionResult[]
): { lineName: string; quantity: number }[] {
  const lineMap: Record<string, number> = {};
  results.forEach((r) => {
    lineMap[r.productionLine] = (lineMap[r.productionLine] || 0) + r.totalQuantity;
  });

  return Object.entries(lineMap).map(([lineName, quantity]) => ({
    lineName,
    quantity,
  }));
}

export function aggregateProductionByPeriod(
  plans: ProductionPlan[],
  results: ProductionResult[],
  startDate?: string,
  endDate?: string
): {
  period: string;
  label: string;
  planQty: number;
  plan: number;
  productionQty: number;
  actual: number;
  achievementRate: number;
}[] {
  const validPlans = getProductionPlansByDateRange(plans, startDate, endDate);
  const validResults = getProductionResultsByDateRange(results, startDate, endDate);

  const dateMap: Record<string, { planQty: number; prodQty: number }> = {};
  validPlans.forEach((p) => {
    if (!dateMap[p.plannedDate]) dateMap[p.plannedDate] = { planQty: 0, prodQty: 0 };
    dateMap[p.plannedDate].planQty += p.plannedQuantity;
  });

  validResults.forEach((r) => {
    if (!dateMap[r.productionDate]) dateMap[r.productionDate] = { planQty: 0, prodQty: 0 };
    dateMap[r.productionDate].prodQty += r.totalQuantity;
  });

  const sortedDates = Object.keys(dateMap).sort();
  return sortedDates.map((date) => {
    const pQty = dateMap[date].planQty;
    const prodQty = dateMap[date].prodQty;
    const rate = calculateAchievementRate(prodQty, pQty);
    return {
      period: date.substring(5),
      label: date.substring(5),
      planQty: pQty,
      plan: pQty,
      productionQty: prodQty,
      actual: prodQty,
      achievementRate: rate,
    };
  });
}
