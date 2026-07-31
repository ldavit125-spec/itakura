import type { FinishedGoodsLot } from "@/types/production";
import type { FinishedGoodsInspection } from "@/types/quality";
import type { Shipment, ShipmentKpi, ShipmentLotAvailability } from "@/types/shipment";
import { getBusinessDate, isSameBusinessDate } from "@/lib/selectors/business-date";

export function generateShipmentNumber(date: string, sequence: number) {
  return `SHP-${date.replace(/-/g, "")}-${String(sequence).padStart(3, "0")}`;
}

export function getShipmentLotAvailability(
  lot: FinishedGoodsLot,
  inspections: FinishedGoodsInspection[],
  shipments: Shipment[]
): ShipmentLotAvailability {
  const inspection = inspections
    .filter((item) => item.fgLotNo === lot.fgLotNo)
    .sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate))[0];
  const inspectionCompleted = inspection?.status === "COMPLETED";
  const inspectionPassed = inspection?.judgment === "PASSED" || inspection?.judgment === "CONDITIONAL_PASS";
  const shippedQuantity = shipments
    .filter((item) => item.lotNumber === lot.fgLotNo && item.status === "COMPLETED")
    .reduce((sum, item) => sum + item.quantity, 0);
  const reservedQuantity = shipments
    .filter((item) => item.lotNumber === lot.fgLotNo && (item.status === "PLANNED" || item.status === "READY"))
    .reduce((sum, item) => sum + item.quantity, 0);
  const currentStock = Math.max(0, lot.goodQuantity - shippedQuantity);
  const availableQuantity = Math.max(0, currentStock - reservedQuantity);

  let reason: string | undefined;
  if (!inspectionCompleted) reason = "품질검사 미완료";
  else if (!inspectionPassed || lot.qualityStatus !== "PASSED" || !lot.isReleaseAvailable) reason = "품질검사 불합격 또는 출하 보류";
  else if (availableQuantity <= 0) reason = "출하 가능 재고 부족";

  return {
    lotNumber: lot.fgLotNo,
    productId: lot.productCode,
    productName: lot.productName,
    productionDate: lot.productionDate,
    productionQuantity: lot.totalQuantity,
    qualityStatus: lot.qualityStatus,
    inspectionCompleted,
    inspectionPassed,
    currentStock,
    reservedQuantity,
    availableQuantity,
    canShip: !reason,
    reason,
  };
}

export function getShipmentKpi(shipments: Shipment[], now = new Date()): ShipmentKpi {
  const today = getBusinessDate(now);
  const todayItems = shipments.filter((item) => isSameBusinessDate(item.plannedDate, today) && item.status !== "CANCELLED");
  const completed = todayItems.filter((item) => item.status === "COMPLETED");
  return {
    todayShipmentCount: completed.length,
    todayShipmentQuantity: completed.reduce((sum, item) => sum + item.quantity, 0),
    completionRate: todayItems.length > 0 ? Math.round((completed.length / todayItems.length) * 1000) / 10 : 0,
  };
}
