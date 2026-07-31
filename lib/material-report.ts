import type {
  ReportFilter,
  MaterialReportSummary,
  MaterialInventoryMetric,
  LotInventoryMetric,
} from "@/types/reports";
import type { MaterialInbound, MaterialInventory, MaterialOutbound } from "@/types/materials";
import type { Material } from "@/types/master-data";
import { isDateInRange, calculateRemainingDays, getExpirationStatus } from "./report-date-utils";
import {
  getAvailableStockByMaterial,
  getCriticalShortageMaterials,
  getShortageMaterials,
} from "./selectors/material-selectors";

// ============================================================
// 보고서 및 통계관리 — 자재·재고 보고서 집계 유틸리티 (단위 안전 집계 적용)
// ============================================================

export interface MaterialReportData {
  summary: MaterialReportSummary;
  inOutTrendChartData: { period: string; inboundQty: number; outboundQty: number }[];
  stockByMaterialChartData: { name: string; stock: number; unit: string }[];
  stockVsSafetyChartData: { name: string; stock: number; safetyStock: number }[];
  inventoryStatusRatioChartData: { name: string; value: number }[];

  materialAggTable: MaterialInventoryMetric[];
  lotInventoryTable: LotInventoryMetric[];
}

export function aggregateMaterialReport(
  filter: ReportFilter,
  contextData: {
    inbounds: MaterialInbound[];
    inventories: MaterialInventory[];
    outbounds: MaterialOutbound[];
    materials: Material[];
  }
): MaterialReportData {
  const { inbounds, inventories, outbounds, materials } = contextData;

  const { startDate, endDate, materialCode, supplierName } = filter;

  // 1. 데이터 필터링
  const filteredInbounds = inbounds.filter((inb) => {
    if (!isDateInRange(inb.inboundDate, startDate, endDate)) return false;
    if (materialCode !== "ALL" && inb.materialCode !== materialCode) return false;
    if (supplierName !== "ALL" && inb.supplierName !== supplierName) return false;
    return true;
  });

  const filteredOutbounds = outbounds.filter((out) => {
    if (!isDateInRange(out.outboundDate, startDate, endDate)) return false;
    if (materialCode !== "ALL" && out.materialCode !== materialCode) return false;
    return true;
  });

  const filteredInventories = inventories.filter((inv) => {
    if (materialCode !== "ALL" && inv.materialCode !== materialCode) return false;
    if (supplierName !== "ALL" && inv.supplierName !== supplierName) return false;
    return true;
  });

  // 2. 상단 요약 카운트 계산 (단위 상이하므로 처리 건수로 집계)
  const totalInboundQuantity = filteredInbounds.length;
  const totalOutboundQuantity = filteredOutbounds.length;

  const currentStockMaterialCount = materials.length;
  const shortageMaterialCount = getShortageMaterials(
    filteredInventories,
    materials
  ).length;
  const criticalShortageCount = getCriticalShortageMaterials(
    filteredInventories,
    materials
  ).length;
  const availableStockMap = getAvailableStockByMaterial(filteredInventories);

  const expiringSoonLotCount = filteredInventories.filter((inv) => {
    const days = calculateRemainingDays(inv.expirationDate);
    return days >= 1 && days <= 7;
  }).length;

  const holdLotCount = filteredInventories.filter(
    (inv) => inv.inspectionStatus === "HOLD" || inv.inventoryStatus === "HOLD"
  ).length;

  const expiredLotCount = filteredInventories.filter((inv) => {
    const days = calculateRemainingDays(inv.expirationDate);
    return days <= 0;
  }).length;

  const summary: MaterialReportSummary = {
    totalInboundQuantity,
    totalOutboundQuantity,
    currentStockMaterialCount,
    shortageMaterialCount,
    criticalShortageCount,
    expiringSoonLotCount,
    holdLotCount,
    expiredLotCount,
  };

  // 3. 차트 1: 기간별 입고/출고 건수 추이
  const dateMap: Record<string, { inQty: number; outQty: number }> = {};
  filteredInbounds.forEach((inb) => {
    if (!dateMap[inb.inboundDate]) dateMap[inb.inboundDate] = { inQty: 0, outQty: 0 };
    dateMap[inb.inboundDate].inQty += 1;
  });

  filteredOutbounds.forEach((out) => {
    if (!dateMap[out.outboundDate]) dateMap[out.outboundDate] = { inQty: 0, outQty: 0 };
    dateMap[out.outboundDate].outQty += 1;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const inOutTrendChartData = sortedDates.map((date) => ({
    period: date.substring(5),
    inboundQty: dateMap[date].inQty,
    outboundQty: dateMap[date].outQty,
  }));

  // 4. 차트 2: 자재별 현재 재고
  const stockByMaterialChartData = materials.map((mat) => {
    const stock = availableStockMap[mat.code] || 0;
    return {
      name: mat.name,
      stock,
      unit: mat.unit,
    };
  });

  // 5. 차트 3: 안전재고 대비 현재 재고
  const stockVsSafetyChartData = materials.map((mat) => {
    const stock = availableStockMap[mat.code] || 0;
    return {
      name: mat.name,
      stock,
      safetyStock: mat.safetyStock,
    };
  });

  // 6. 차트 4: 재고 상태 비율 (도넛)
  const statusCounts = {
    정상: 0,
    "유통기한 임박": 0,
    만료: 0,
    보류: 0,
  };

  filteredInventories.forEach((inv) => {
    const remDays = calculateRemainingDays(inv.expirationDate);
    const expStatus = getExpirationStatus(remDays);

    if (inv.inspectionStatus === "HOLD" || inv.inventoryStatus === "HOLD") {
      statusCounts["보류"] += 1;
    } else if (expStatus === "EXPIRED") {
      statusCounts["만료"] += 1;
    } else if (expStatus === "EXPIRING_SOON" || expStatus === "WARNING") {
      statusCounts["유통기한 임박"] += 1;
    } else {
      statusCounts["정상"] += 1;
    }
  });

  const inventoryStatusRatioChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // 7. 자재별 집계 테이블
  const materialAggTable: MaterialInventoryMetric[] = materials.map((mat) => {
    const matInbounds = filteredInbounds.filter((i) => i.materialCode === mat.code);
    const matOutbounds = filteredOutbounds.filter((o) => o.materialCode === mat.code);
    const matInventories = filteredInventories.filter((inv) => inv.materialCode === mat.code);

    const totalInboundQty = matInbounds.reduce((sum, i) => sum + i.quantity, 0);
    const totalOutboundQty = matOutbounds.reduce((sum, o) => sum + o.quantity, 0);

    const physicalStock = matInventories.reduce((sum, inv) => sum + inv.currentStock, 0);
    const holdStock = matInventories
      .filter((inv) => inv.inspectionStatus === "HOLD" || inv.inventoryStatus === "HOLD")
      .reduce((sum, inv) => sum + inv.currentStock, 0);
    const availableStock = availableStockMap[mat.code] || 0;

    const shortageQty = Math.max(0, mat.safetyStock - availableStock);
    const inventoryStatus = availableStock < mat.safetyStock ? "LOW" : "NORMAL";

    return {
      materialCode: mat.code,
      materialName: mat.name,
      totalInboundQty,
      totalOutboundQty,
      currentStock: physicalStock,
      availableStock,
      holdStock,
      safetyStock: mat.safetyStock,
      shortageQty,
      unit: mat.unit,
      inventoryStatus,
      defaultSupplier: mat.defaultSupplier,
    };
  });

  // 8. LOT별 재고 상세 테이블
  const lotInventoryTable: LotInventoryMetric[] = filteredInventories.map((inv) => {
    const matchingInbound = inbounds.find((i) => i.lotNo === inv.lotNo);
    const matchingOutbounds = outbounds.filter((o) => o.lotNo === inv.lotNo);
    const outboundQty = matchingOutbounds.reduce((sum, o) => sum + o.quantity, 0);

    const remainingDays = calculateRemainingDays(inv.expirationDate);
    const expirationStatus = getExpirationStatus(remainingDays);

    return {
      materialCode: inv.materialCode,
      materialName: inv.materialName,
      lotNo: inv.lotNo,
      inboundQty: matchingInbound ? matchingInbound.quantity : inv.currentStock,
      outboundQty,
      currentStock: inv.currentStock,
      manufactureDate: matchingInbound ? matchingInbound.manufactureDate : "2026-07-20",
      expirationDate: inv.expirationDate,
      remainingDays,
      inspectionStatus: inv.inspectionStatus,
      expirationStatus,
    };
  });

  return {
    summary,
    inOutTrendChartData,
    stockByMaterialChartData,
    stockVsSafetyChartData,
    inventoryStatusRatioChartData,
    materialAggTable,
    lotInventoryTable,
  };
}
