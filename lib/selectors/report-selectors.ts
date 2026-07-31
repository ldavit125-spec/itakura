import type { ReportFilter } from "@/types/reports";
import type { ProductionPlan, WorkOrder, ProductionResult } from "@/types/production";
import type { MaterialInbound, MaterialInventory, MaterialOutbound } from "@/types/materials";
import type { IncomingInspection, ProcessInspection, FinishedGoodsInspection, Nonconformity, CorrectiveAction } from "@/types/quality";
import type { Product, Material } from "@/types/master-data";

import { filterByDateRange, getBusinessDate } from "./business-date";
import {
  getPlannedQuantity,
  getProducedQuantity,
  getGoodQuantity,
  getDefectQuantity,
  calculateAchievementRate,
} from "./production-selectors";

import { getShortageMaterials, getCriticalShortageMaterials, getExpiringLots } from "./material-selectors";
import { aggregateInspectionResults, getIncompleteCorrectiveActions } from "./quality-selectors";

export function getProductionReportMetrics({
  plans,
  workOrders,
  results,
  filters,
}: {
  plans: ProductionPlan[];
  workOrders: WorkOrder[];
  results: ProductionResult[];
  filters: ReportFilter;
}) {
  const { startDate, endDate, productCode, productionLine, handler } = filters;

  const filteredPlans = plans.filter((plan) => {
    if (!filterByDateRange([plan], (item) => item.plannedDate, startDate, endDate).length) return false;
    if (plan.planStatus === "CANCELLED") return false;
    if (productCode !== "ALL" && plan.productCode !== productCode) return false;
    if (productionLine !== "ALL" && plan.productionLine !== productionLine) return false;
    return true;
  });

  const filteredWOs = workOrders.filter((wo) => {
    if (!filterByDateRange([wo], (w) => w.plannedDate, startDate, endDate).length) return false;
    if (productCode !== "ALL" && wo.productCode !== productCode) return false;
    if (productionLine !== "ALL" && wo.productionLine !== productionLine) return false;
    if (handler !== "ALL" && wo.handler !== handler) return false;
    return true;
  });

  const filteredResults = results.filter((res) => {
    if (!filterByDateRange([res], (r) => r.productionDate, startDate, endDate).length) return false;
    if (productCode !== "ALL" && res.productCode !== productCode) return false;
    if (productionLine !== "ALL" && res.productionLine !== productionLine) return false;
    if (handler !== "ALL" && res.handler !== handler) return false;
    if (res.resultStatus === "DRAFT") return false;
    return true;
  });

  const planCount = filteredPlans.length;
  const completedCount = filteredWOs.filter((w) => w.workStatus === "COMPLETED").length;

  const totalPlannedQuantity = getPlannedQuantity(filteredPlans);
  const totalProductionQuantity = getProducedQuantity(filteredResults);
  const totalGoodQuantity = getGoodQuantity(filteredResults);
  const totalDefectQuantity = getDefectQuantity(filteredResults);

  const averageAchievementRate = calculateAchievementRate(totalProductionQuantity, totalPlannedQuantity);

  const totalWorkHours = filteredResults.reduce((sum, r) => sum + (parseFloat(r.workingHours) || 8.0), 0);
  const averageWorkHours = filteredResults.length > 0 ? Number((totalWorkHours / filteredResults.length).toFixed(1)) : 0;

  return {
    planCount,
    completedCount,
    totalPlannedQuantity,
    totalProductionQuantity,
    totalGoodQuantity,
    totalDefectQuantity,
    averageAchievementRate,
    averageWorkHours,
    filteredWOs,
    filteredResults,
  };
}

export function getMaterialReportMetrics({
  inbounds,
  inventories,
  outbounds,
  materials,
  filters,
}: {
  inbounds: MaterialInbound[];
  inventories: MaterialInventory[];
  outbounds: MaterialOutbound[];
  materials: Material[];
  filters: ReportFilter;
}) {
  const { startDate, endDate, materialCode, supplierName } = filters;

  const filteredInbounds = inbounds.filter((inb) => {
    if (!filterByDateRange([inb], (i) => i.inboundDate, startDate, endDate).length) return false;
    if (materialCode !== "ALL" && inb.materialCode !== materialCode) return false;
    if (supplierName !== "ALL" && inb.supplierName !== supplierName) return false;
    return true;
  });

  const filteredOutbounds = outbounds.filter((out) => {
    if (!filterByDateRange([out], (o) => o.outboundDate, startDate, endDate).length) return false;
    if (materialCode !== "ALL" && out.materialCode !== materialCode) return false;
    return true;
  });

  const filteredInventories = inventories.filter((inv) => {
    if (materialCode !== "ALL" && inv.materialCode !== materialCode) return false;
    if (supplierName !== "ALL" && inv.supplierName !== supplierName) return false;
    return true;
  });

  const shortageMaterials = getShortageMaterials(filteredInventories, materials);
  const criticalMaterials = getCriticalShortageMaterials(filteredInventories, materials);
  const expiringLots = getExpiringLots(filteredInventories);
  const holdLots = filteredInventories.filter((inv) => inv.inspectionStatus === "HOLD" || inv.inventoryStatus === "HOLD");
  const expiredLots = filteredInventories.filter((inv) => {
    if (!inv.expirationDate) return false;
    return inv.expirationDate < getBusinessDate();
  });

  return {
    totalInboundCount: filteredInbounds.length,
    totalOutboundCount: filteredOutbounds.length,
    currentStockMaterialCount: materials.length,
    shortageMaterialCount: shortageMaterials.length,
    criticalShortageCount: criticalMaterials.length,
    expiringSoonLotCount: expiringLots.length,
    holdLotCount: holdLots.length,
    expiredLotCount: expiredLots.length,
    filteredInbounds,
    filteredOutbounds,
    filteredInventories,
  };
}

export function getQualityReportMetrics({
  incoming,
  processList,
  finished,
  actions,
  filters,
}: {
  incoming: IncomingInspection[];
  processList: ProcessInspection[];
  finished: FinishedGoodsInspection[];
  actions: CorrectiveAction[];
  filters: ReportFilter;
}) {
  const { startDate, endDate } = filters;
  const res = aggregateInspectionResults(incoming, processList, finished, startDate, endDate);
  const unresolvedCA = getIncompleteCorrectiveActions(actions, startDate, endDate);

  return {
    totalInspectionCount: res.totalCount,
    completedInspectionCount: res.completedCount,
    passedCount: res.passedCount,
    conditionalPassCount: res.conditionalPassCount,
    holdCount: res.holdCount,
    failedCount: res.failedCount,
    totalPassRate: res.passRate,
    unresolvedCACount: unresolvedCA.length,
  };
}
