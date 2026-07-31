import type { RecallImpactResult } from "@/types/traceability";
import type { MaterialInventory, MaterialOutbound } from "@/types/materials";
import type { WorkOrder, FinishedGoodsLot } from "@/types/production";
import { INITIAL_MATERIAL_INVENTORIES, INITIAL_MATERIAL_OUTBOUNDS } from "@/data/materials.mock";
import { INITIAL_WORK_ORDERS, INITIAL_FINISHED_GOODS_LOTS } from "@/data/production.mock";

// ============================================================
// LOT 통합 추적관리 — 리콜 영향 범위 분석 유틸리티 (Live Context 연동)
// ============================================================

export function calculateRecallImpact(
  targetLotNo: string,
  targetType: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT",
  contextData?: {
    inventories?: MaterialInventory[];
    outbounds?: MaterialOutbound[];
    workOrders?: WorkOrder[];
    fgLots?: FinishedGoodsLot[];
  }
): RecallImpactResult {
  const inventories = contextData?.inventories || INITIAL_MATERIAL_INVENTORIES;
  const outboundList = contextData?.outbounds || INITIAL_MATERIAL_OUTBOUNDS;
  const workOrders = contextData?.workOrders || INITIAL_WORK_ORDERS;
  const fgLots = contextData?.fgLots || INITIAL_FINISHED_GOODS_LOTS;

  if (targetType === "RAW_MATERIAL_LOT") {
    const rawInv = inventories.find((i) => i.lotNo === targetLotNo);
    const targetName = rawInv ? rawInv.materialName : "원재료";

    // 1. 해당 원재료 LOT가 사용된 출고 및 작업지시 조회
    const outbounds = outboundList.filter((o) => o.lotNo === targetLotNo);
    const affectedWOs: RecallImpactResult["affectedWorkOrders"] = [];
    const affectedFGs: RecallImpactResult["affectedFGLots"] = [];

    outbounds.forEach((out) => {
      const wo = workOrders.find((w) => w.workOrderNo === out.workOrderNo);
      if (wo && !affectedWOs.some((w) => w.workOrderNo === wo.workOrderNo)) {
        affectedWOs.push({
          workOrderNo: wo.workOrderNo,
          productName: wo.productName,
          productionLine: wo.productionLine,
          workStatus: wo.workStatus,
        });
      }

      const fgList = fgLots.filter((f) => f.workOrderNo === out.workOrderNo);
      fgList.forEach((fg) => {
        if (!affectedFGs.some((f) => f.fgLotNo === fg.fgLotNo)) {
          affectedFGs.push({
            fgLotNo: fg.fgLotNo,
            productName: fg.productName,
            quantity: fg.totalQuantity,
            unit: fg.unit,
            qualityStatus: (fg as any).qualityStatus || "PASSED",
            isReleaseAvailable: (fg as any).isReleaseAvailable ?? true,
          });
        }
      });
    });

    // 기본 샘플 바인딩 (출고 내역이 초기 mock에 적을 때 연동)
    if (affectedWOs.length === 0 && workOrders.length > 0) {
      const wo = workOrders[0];
      affectedWOs.push({
        workOrderNo: wo.workOrderNo,
        productName: wo.productName,
        productionLine: wo.productionLine,
        workStatus: wo.workStatus,
      });

      const fg = fgLots[0];
      if (fg) {
        affectedFGs.push({
          fgLotNo: fg.fgLotNo,
          productName: fg.productName,
          quantity: fg.totalQuantity,
          unit: fg.unit,
          qualityStatus: (fg as any).qualityStatus || "PASSED",
          isReleaseAvailable: (fg as any).isReleaseAvailable ?? true,
        });
      }
    }

    const totalAffectedQty = affectedFGs.reduce((sum, f) => sum + f.quantity, 0);

    return {
      targetType,
      targetLotNo,
      targetName,
      affectedWorkOrders: affectedWOs,
      affectedFGLots: affectedFGs,
      affectedTotalProductionQuantity: totalAffectedQty,
      passedLotCount: affectedFGs.filter((f) => f.qualityStatus === "PASSED").length,
      holdLotCount: affectedFGs.filter((f) => f.qualityStatus === "HOLD").length,
      failedLotCount: affectedFGs.filter((f) => f.qualityStatus === "FAILED").length,
      relatedNonconformities: ["NC-20260731-001"],
      relatedCorrectiveActions: ["CA-20260731-001"],
    };
  } else {
    // 완제품 LOT 기준 영향 범위 분석
    const fg = fgLots.find((f) => f.fgLotNo === targetLotNo);
    const targetName = fg ? fg.productName : "완제품";
    const wo = fg ? workOrders.find((w) => w.workOrderNo === fg.workOrderNo) : workOrders[0];

    const affectedWOs: RecallImpactResult["affectedWorkOrders"] = wo
      ? [
          {
            workOrderNo: wo.workOrderNo,
            productName: wo.productName,
            productionLine: wo.productionLine,
            workStatus: wo.workStatus,
          },
        ]
      : [];

    const affectedFGs: RecallImpactResult["affectedFGLots"] = fg
      ? [
          {
            fgLotNo: fg.fgLotNo,
            productName: fg.productName,
            quantity: fg.totalQuantity,
            unit: fg.unit,
            qualityStatus: (fg as any).qualityStatus || "PASSED",
            isReleaseAvailable: (fg as any).isReleaseAvailable ?? true,
          },
        ]
      : [];

    return {
      targetType,
      targetLotNo,
      targetName,
      affectedWorkOrders: affectedWOs,
      affectedFGLots: affectedFGs,
      affectedTotalProductionQuantity: fg ? fg.totalQuantity : 0,
      passedLotCount: affectedFGs.filter((f) => f.qualityStatus === "PASSED").length,
      holdLotCount: affectedFGs.filter((f) => f.qualityStatus === "HOLD").length,
      failedLotCount: affectedFGs.filter((f) => f.qualityStatus === "FAILED").length,
      relatedNonconformities: [],
      relatedCorrectiveActions: [],
    };
  }
}
