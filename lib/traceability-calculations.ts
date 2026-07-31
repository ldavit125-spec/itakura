import type { TraceabilitySummary } from "@/types/traceability";
import type { MaterialInventory } from "@/types/materials";
import type { FinishedGoodsLot, WorkOrder } from "@/types/production";
import type { CorrectiveAction } from "@/types/quality";
import { INITIAL_MATERIAL_INVENTORIES } from "@/data/materials.mock";
import { INITIAL_WORK_ORDERS, INITIAL_FINISHED_GOODS_LOTS } from "@/data/production.mock";
import { INITIAL_CORRECTIVE_ACTIONS } from "@/data/quality.mock";

// ============================================================
// LOT 통합 추적관리 — 요약 집계 유틸리티 (Live Context 연동)
// ============================================================

export function calculateTraceabilitySummary(contextData?: {
  inventories?: MaterialInventory[];
  fgLots?: FinishedGoodsLot[];
  workOrders?: WorkOrder[];
  actions?: CorrectiveAction[];
}): TraceabilitySummary {
  const inventories = contextData?.inventories || INITIAL_MATERIAL_INVENTORIES;
  const fgLots = contextData?.fgLots || INITIAL_FINISHED_GOODS_LOTS;
  const workOrders = contextData?.workOrders || INITIAL_WORK_ORDERS;
  const actions = contextData?.actions || INITIAL_CORRECTIVE_ACTIONS;

  const totalRawLotCount = inventories.length;
  const totalFGLotCount = fgLots.length;
  const traceableWorkOrderCount = workOrders.length;

  const rawHold = inventories.filter((i) => i.inspectionStatus === "HOLD" || i.inventoryStatus === "HOLD").length;
  const fgHold = fgLots.filter((lot) => lot.qualityStatus === "HOLD").length;
  const qualityHoldLotCount = rawHold + fgHold;

  const rawFailed = inventories.filter(
    (inventory) => inventory.inspectionStatus === "FAILED"
  ).length;
  const fgFailed = fgLots.filter((lot) => lot.qualityStatus === "FAILED").length;
  const failedLotCount = rawFailed + fgFailed;

  const inProgressCACount = actions.filter((c) => c.caStatus !== "CLOSED" && c.caStatus !== "VERIFIED").length;

  return {
    totalRawLotCount,
    totalFGLotCount,
    traceableWorkOrderCount,
    qualityHoldLotCount,
    failedLotCount,
    inProgressCACount,
  };
}
