import type { MaterialInventory, MaterialOutbound } from "@/types/materials";
import type { FinishedGoodsLot, WorkOrder } from "@/types/production";
import type { CorrectiveAction, Nonconformity } from "@/types/quality";
import type { RecallImpactResult } from "@/types/traceability";

interface RecallContextData {
  inventories: MaterialInventory[];
  outbounds: MaterialOutbound[];
  workOrders: WorkOrder[];
  fgLots: FinishedGoodsLot[];
  nonconformities: Nonconformity[];
  correctiveActions: CorrectiveAction[];
}

export function calculateRecallImpact(
  targetLotNo: string,
  targetType: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT",
  data: RecallContextData,
): RecallImpactResult {
  const { inventories, outbounds, workOrders, fgLots, nonconformities, correctiveActions } = data;

  const affectedWorkOrderNumbers = new Set<string>();
  if (targetType === "RAW_MATERIAL_LOT") {
    outbounds
      .filter((outbound) => outbound.lotNo === targetLotNo)
      .forEach((outbound) => affectedWorkOrderNumbers.add(outbound.workOrderNo));
  } else {
    const targetLot = fgLots.find((lot) => lot.fgLotNo === targetLotNo);
    if (targetLot) affectedWorkOrderNumbers.add(targetLot.workOrderNo);
  }

  const affectedWorkOrders = workOrders
    .filter((workOrder) => affectedWorkOrderNumbers.has(workOrder.workOrderNo))
    .map((workOrder) => ({
      workOrderNo: workOrder.workOrderNo,
      productName: workOrder.productName,
      productionLine: workOrder.productionLine,
      workStatus: workOrder.workStatus,
    }));

  const affectedFGLots = fgLots
    .filter((lot) =>
      targetType === "FINISHED_GOODS_LOT"
        ? lot.fgLotNo === targetLotNo
        : affectedWorkOrderNumbers.has(lot.workOrderNo),
    )
    .map((lot) => ({
      fgLotNo: lot.fgLotNo,
      productName: lot.productName,
      quantity: lot.totalQuantity,
      unit: lot.unit,
      qualityStatus: lot.qualityStatus,
      isReleaseAvailable: lot.isReleaseAvailable,
    }));

  const affectedFGLotNumbers = new Set(affectedFGLots.map((lot) => lot.fgLotNo));
  const relatedNonconformities = nonconformities
    .filter(
      (item) =>
        item.lotNo === targetLotNo ||
        affectedFGLotNumbers.has(item.lotNo) ||
        affectedWorkOrderNumbers.has(item.targetNo),
    )
    .map((item) => item.ncNo);
  const relatedNCNumbers = new Set(relatedNonconformities);
  const relatedCorrectiveActions = correctiveActions
    .filter((item) => relatedNCNumbers.has(item.ncNo))
    .map((item) => item.caNo);

  const rawInventory = inventories.find((inventory) => inventory.lotNo === targetLotNo);
  const finishedLot = fgLots.find((lot) => lot.fgLotNo === targetLotNo);

  return {
    targetType,
    targetLotNo,
    targetName:
      targetType === "RAW_MATERIAL_LOT"
        ? (rawInventory?.materialName ?? targetLotNo)
        : (finishedLot?.productName ?? targetLotNo),
    affectedWorkOrders,
    affectedFGLots,
    affectedTotalProductionQuantity: affectedFGLots.reduce((sum, lot) => sum + lot.quantity, 0),
    passedLotCount: affectedFGLots.filter((lot) => lot.qualityStatus === "PASSED").length,
    holdLotCount: affectedFGLots.filter((lot) => lot.qualityStatus === "HOLD").length,
    failedLotCount: affectedFGLots.filter((lot) => lot.qualityStatus === "FAILED").length,
    relatedNonconformities,
    relatedCorrectiveActions,
  };
}
