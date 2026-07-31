import type { MaterialInventory, MaterialInbound } from "@/types/materials";
import type { FinishedGoodsLot } from "@/types/production";
import type { IncomingInspection, ProcessInspection, FinishedGoodsInspection } from "@/types/quality";

export function getTraceableRawLots(inventories: MaterialInventory[]): MaterialInventory[] {
  return inventories.filter((inv) => inv.lotNo && inv.lotNo.startsWith("LOT-"));
}

export function getTraceableFGLots(fgLots: FinishedGoodsLot[]): FinishedGoodsLot[] {
  return fgLots.filter(
    (lot) =>
      lot.fgLotNo &&
      (lot.fgLotNo.startsWith("FG-") || lot.fgLotNo.startsWith("LOT-FG-"))
  );
}

export function getFGLotQualityStatus(
  fgLotNo: string,
  finishedInspections: FinishedGoodsInspection[]
): "PASSED" | "FAILED" | "HOLD" | "CONDITIONAL_PASS" {
  const fqc = finishedInspections.find((f) => f.fgLotNo === fgLotNo || f.workOrderNo === fgLotNo);
  if (fqc) {
    return fqc.judgment as any;
  }
  return "PASSED";
}
