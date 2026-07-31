import type { MaterialInventory } from "@/types/materials";
import type { Material, ProductionLine } from "@/types/master-data";
import type { ProductionPlan, ProductionResult, WorkOrder, FinishedGoodsLot } from "@/types/production";
import type { DefectHistory, InspectionQueueItem } from "@/types/quality";
import type { HourlyMonitoringPoint, LineProgressItem, MonitoringKpi, MonitoringLevel, ProductionLineRuntimeStatus } from "@/types/dashboard";
import { DASHBOARD_THRESHOLDS } from "@/constants/dashboard-monitoring";
import { getBusinessDate, isSameBusinessDate } from "@/lib/selectors/business-date";
import { getPendingInspections } from "@/lib/selectors/quality-selectors";
import { getShortageMaterials } from "@/lib/selectors/material-selectors";

function rate(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function sumCurrentProduction(results: ProductionResult[], workOrders: WorkOrder[]) {
  const resultWorkOrderNumbers = new Set(results.map((item) => item.workOrderNo));
  const resultQuantity = results.reduce((sum, item) => sum + item.totalQuantity, 0);
  const inProgressQuantity = workOrders
    .filter((item) => item.workStatus !== "CANCELLED" && !resultWorkOrderNumbers.has(item.workOrderNo))
    .reduce((sum, item) => sum + item.currentQuantity, 0);

  return resultQuantity + inProgressQuantity;
}

export function getAchievementLevel(value: number): MonitoringLevel {
  return value >= DASHBOARD_THRESHOLDS.achievement.good ? "GOOD" : value >= DASHBOARD_THRESHOLDS.achievement.warning ? "WARNING" : "DANGER";
}

export function getDefectLevel(value: number): MonitoringLevel {
  return value <= DASHBOARD_THRESHOLDS.defectRate.good ? "GOOD" : value <= DASHBOARD_THRESHOLDS.defectRate.warning ? "WARNING" : "DANGER";
}

export function buildRealtimeMonitoring(input: {
  plans: ProductionPlan[];
  workOrders: WorkOrder[];
  results: ProductionResult[];
  fgLots: FinishedGoodsLot[];
  defects: DefectHistory[];
  queue: InspectionQueueItem[];
  inventories: MaterialInventory[];
  materials: Material[];
  productionLines: ProductionLine[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const today = getBusinessDate(now);
  const todayPlans = input.plans.filter((item) => isSameBusinessDate(item.plannedDate, today) && item.planStatus !== "CANCELLED");
  const todayResults = input.results.filter((item) => isSameBusinessDate(item.productionDate, today));
  const todayWorkOrders = input.workOrders.filter((item) => isSameBusinessDate(item.plannedDate, today));
  const todayDefects = input.defects.filter((item) => isSameBusinessDate(item.inspectionDate, today));
  const planQuantity = todayPlans.reduce((sum, item) => sum + item.plannedQuantity, 0);
  const productionQuantity = sumCurrentProduction(todayResults, todayWorkOrders);
  const defectQuantity = todayDefects.reduce((sum, item) => sum + item.defectQuantity, 0);
  const goodQuantity = Math.max(0, productionQuantity - defectQuantity);
  const achievementRate = rate(productionQuantity, planQuantity);
  const defectRate = rate(defectQuantity, productionQuantity);
  const kpi: MonitoringKpi = {
    planQuantity, productionQuantity, goodQuantity, defectQuantity, achievementRate, defectRate,
    pendingInspectionCount: getPendingInspections(input.queue).filter((item) => isSameBusinessDate(item.requestTime, today)).length,
    shortageMaterialCount: getShortageMaterials(input.inventories, input.materials).length,
    achievementLevel: getAchievementLevel(achievementRate),
    defectLevel: getDefectLevel(defectRate),
  };

  const lineProgress: LineProgressItem[] = input.productionLines.map((line) => {
    const plans = todayPlans.filter((item) => item.productionLine === line.name);
    const results = todayResults.filter((item) => item.productionLine === line.name);
    const orders = todayWorkOrders.filter((item) => item.productionLine === line.name);
    const planQty = plans.reduce((sum, item) => sum + item.plannedQuantity, 0);
    const productionQty = sumCurrentProduction(results, orders);
    const hold = input.fgLots.some((item) => item.productionLine === line.name && isSameBusinessDate(item.productionDate, today) && (item.qualityStatus === "HOLD" || item.qualityStatus === "FAILED"));
    let status: ProductionLineRuntimeStatus = "WAITING";
    if (line.status !== "ACTIVE") status = "INSPECTION";
    else if (hold) status = "QUALITY_HOLD";
    else if (orders.some((item) => item.workStatus === "PAUSED" || item.workStatus === "CANCELLED")) status = "STOPPED";
    else if (orders.some((item) => item.workStatus === "IN_PROGRESS")) status = "RUNNING";
    const latest = [...orders.map((item) => item.actualEndTime || item.actualStartTime || `${item.plannedDate} ${item.startTime}`), ...results.map((item) => item.actualEndTime)].filter(Boolean).sort().at(-1);
    return {
      lineName: line.name,
      productName: orders.find((item) => item.workStatus === "IN_PROGRESS")?.productName ?? plans[0]?.productName ?? "-",
      planQuantity: planQty,
      productionQuantity: productionQty,
      achievementRate: rate(productionQty, planQty),
      status,
      updatedAt: latest?.split(" ")[1] ?? "--:--",
    };
  });

  const endHour = Math.max(8, now.getHours());
  const hourly: HourlyMonitoringPoint[] = Array.from({ length: endHour - 7 }, (_, index) => {
    const hour = index + 8;
    const completedProduction = todayResults.filter((item) => Number(item.actualEndTime.split(" ")[1]?.split(":")[0]) === hour).reduce((sum, item) => sum + item.totalQuantity, 0);
    const resultWorkOrderNumbers = new Set(todayResults.map((item) => item.workOrderNo));
    const currentProduction = hour === now.getHours()
      ? todayWorkOrders
          .filter((item) => item.workStatus !== "CANCELLED" && !resultWorkOrderNumbers.has(item.workOrderNo))
          .reduce((sum, item) => sum + item.currentQuantity, 0)
      : 0;
    const defects = todayDefects.filter((item) => Number(item.createdAt.split(" ")[1]?.split(":")[0]) === hour).reduce((sum, item) => sum + item.defectQuantity, 0);
    return { hour: `${String(hour).padStart(2, "0")}:00`, productionQuantity: completedProduction + currentProduction, defectQuantity: defects };
  });

  const defectTypeTotals = new Map<string, number>();
  todayDefects.forEach((item) => defectTypeTotals.set(item.defectType, (defectTypeTotals.get(item.defectType) ?? 0) + item.defectQuantity));
  const topDefectType = [...defectTypeTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    today, kpi, lineProgress, hourly,
    recentDefects: [...todayDefects].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    topDefectType,
  };
}
