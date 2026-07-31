import type { MaterialInventory, MaterialInbound, MaterialOutbound } from "@/types/materials";
import type { Material } from "@/types/master-data";
import { isSameBusinessDate, filterByDateRange, getBusinessDate } from "./business-date";

export function getInventoryByMaterial(inventories: MaterialInventory[]): Record<string, number> {
  const stockMap: Record<string, number> = {};
  inventories.forEach((inv) => {
    stockMap[inv.materialCode] = (stockMap[inv.materialCode] || 0) + inv.currentStock;
  });
  return stockMap;
}

export function getAvailableStockByMaterial(inventories: MaterialInventory[]): Record<string, number> {
  const stockMap: Record<string, number> = {};
  inventories.forEach((inv) => {
    if (
      inv.inspectionStatus === "PASSED" &&
      inv.inventoryStatus !== "HOLD" &&
      inv.inventoryStatus !== "EXPIRED"
    ) {
      stockMap[inv.materialCode] =
        (stockMap[inv.materialCode] || 0) +
        (inv.availableStock ?? inv.currentStock);
    }
  });
  return stockMap;
}

export function getShortageMaterials(
  inventories: MaterialInventory[],
  materials: Material[]
): { materialCode: string; materialName: string; currentStock: number; safetyStock: number; unit: string }[] {
  const availMap = getAvailableStockByMaterial(inventories);
  const shortageList: { materialCode: string; materialName: string; currentStock: number; safetyStock: number; unit: string }[] = [];

  materials.forEach((mat) => {
    const stock = availMap[mat.code] || 0;
    if (stock < mat.safetyStock) {
      shortageList.push({
        materialCode: mat.code,
        materialName: mat.name,
        currentStock: stock,
        safetyStock: mat.safetyStock,
        unit: mat.unit,
      });
    }
  });

  return shortageList;
}

export function getCriticalShortageMaterials(
  inventories: MaterialInventory[],
  materials: Material[]
): { materialCode: string; materialName: string; currentStock: number; safetyStock: number; unit: string }[] {
  const availMap = getAvailableStockByMaterial(inventories);
  const criticalList: { materialCode: string; materialName: string; currentStock: number; safetyStock: number; unit: string }[] = [];

  materials.forEach((mat) => {
    const stock = availMap[mat.code] || 0;
    if (stock < mat.safetyStock * 0.5) {
      criticalList.push({
        materialCode: mat.code,
        materialName: mat.name,
        currentStock: stock,
        safetyStock: mat.safetyStock,
        unit: mat.unit,
      });
    }
  });

  return criticalList;
}

export function getExpiringLots(
  inventories: MaterialInventory[],
  refDate: string = getBusinessDate()
): MaterialInventory[] {
  const refTime = new Date(refDate).getTime();
  return inventories.filter((inv) => {
    if (!inv.expirationDate) return false;
    const expTime = new Date(inv.expirationDate).getTime();
    const diffDays = Math.ceil((expTime - refTime) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });
}

export function aggregateInboundByPeriod(
  inbounds: MaterialInbound[],
  startDate?: string,
  endDate?: string
): number {
  const filtered = filterByDateRange(inbounds, (i) => i.inboundDate, startDate, endDate);
  return filtered.filter((i) => i.inboundStatus !== "CANCELLED").length;
}

export function aggregateOutboundByPeriod(
  outbounds: MaterialOutbound[],
  startDate?: string,
  endDate?: string
): number {
  const filtered = filterByDateRange(outbounds, (o) => o.outboundDate, startDate, endDate);
  return filtered.filter((o) => o.outboundStatus !== "CANCELLED").length;
}
