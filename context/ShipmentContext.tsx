"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { INITIAL_SHIPMENTS } from "@/data/shipments.mock";
import { useAdmin } from "@/context/AdminContext";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";
import { generateShipmentNumber, getShipmentKpi, getShipmentLotAvailability } from "@/lib/shipment-selectors";
import { getBusinessDate } from "@/lib/selectors/business-date";
import type { Shipment, ShipmentInput, ShipmentLotAvailability, ShipmentMutationResult, ShipmentStatus } from "@/types/shipment";

interface ShipmentContextValue {
  shipments: Shipment[];
  lotAvailability: ShipmentLotAvailability[];
  kpi: ReturnType<typeof getShipmentKpi>;
  createShipment: (input: ShipmentInput) => ShipmentMutationResult;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => ShipmentMutationResult;
  completeShipment: (id: string) => ShipmentMutationResult;
  cancelShipment: (id: string) => ShipmentMutationResult;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

function localDateTime() {
  return new Date().toLocaleString("sv-SE", { hour12: false }).replace("T", " ").slice(0, 16);
}

export function ShipmentProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const { fgLots } = useProduction();
  const { finished } = useQuality();
  const { hasPermission, recordAudit } = useAdmin();

  const lotAvailability = useMemo(
    () => fgLots.map((lot) => getShipmentLotAvailability(lot, finished, shipments)),
    [fgLots, finished, shipments]
  );
  const kpi = useMemo(() => getShipmentKpi(shipments), [shipments]);

  const createShipment = useCallback((input: ShipmentInput): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_CREATE")) return { success: false, message: "출하 등록 권한이 없습니다." };
    const lot = fgLots.find((item) => item.fgLotNo === input.lotNumber);
    if (!lot) return { success: false, message: "완제품 LOT를 찾을 수 없습니다." };
    const availability = getShipmentLotAvailability(lot, finished, shipments);
    if (!availability.canShip) return { success: false, message: availability.reason ?? "출하할 수 없는 LOT입니다." };
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { success: false, message: "출하수량은 0보다 커야 합니다." };
    if (input.quantity > availability.availableQuantity) {
      return { success: false, message: `출하 가능 재고가 부족합니다. 최대 ${availability.availableQuantity.toLocaleString()}개까지 등록할 수 있습니다.` };
    }
    if (!input.customer.trim() || !input.plannedDate || !input.manager.trim()) {
      return { success: false, message: "거래처, 출하 예정일, 출하 담당자를 입력하세요." };
    }

    const now = localDateTime();
    const shipment: Shipment = {
      id: `shipment-${Date.now()}`,
      shipmentNumber: generateShipmentNumber(getBusinessDate(), shipments.length + 1),
      lotNumber: lot.fgLotNo,
      productId: lot.productCode,
      productName: lot.productName,
      quantity: input.quantity,
      customer: input.customer.trim(),
      plannedDate: input.plannedDate,
      manager: input.manager.trim(),
      memo: input.memo?.trim(),
      status: "PLANNED",
      createdAt: now,
      updatedAt: now,
    };
    setShipments((previous) => [shipment, ...previous]);
    recordAudit("SHIPMENT_CREATED", "SHIPMENT", shipment.id, `${shipment.shipmentNumber} 출하를 등록했습니다.`, undefined, JSON.stringify(shipment));
    return { success: true, message: "출하가 등록되었습니다.", shipmentId: shipment.id };
  }, [fgLots, finished, hasPermission, recordAudit, shipments]);

  const updateShipmentStatus = useCallback((id: string, status: ShipmentStatus): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_UPDATE")) return { success: false, message: "출하 수정 권한이 없습니다." };
    if (status === "COMPLETED") return { success: false, message: "출하 완료 버튼을 이용하세요." };
    const target = shipments.find((item) => item.id === id);
    if (!target) return { success: false, message: "출하 정보를 찾을 수 없습니다." };
    if (target.status === "COMPLETED" || target.status === "CANCELLED") return { success: false, message: "완료 또는 취소된 출하는 변경할 수 없습니다." };
    const updated = { ...target, status, updatedAt: localDateTime() };
    setShipments((previous) => previous.map((item) => item.id === id ? updated : item));
    recordAudit("SHIPMENT_STATUS_UPDATED", "SHIPMENT", id, `${target.shipmentNumber} 상태를 변경했습니다.`, JSON.stringify(target), JSON.stringify(updated));
    return { success: true, message: "출하 상태가 변경되었습니다." };
  }, [hasPermission, recordAudit, shipments]);

  const completeShipment = useCallback((id: string): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_COMPLETE")) return { success: false, message: "출하 완료 권한이 없습니다." };
    const target = shipments.find((item) => item.id === id);
    if (!target) return { success: false, message: "출하 정보를 찾을 수 없습니다." };
    if (target.status !== "PLANNED" && target.status !== "READY") return { success: false, message: "예정 또는 준비 상태의 출하만 완료할 수 있습니다." };
    const lot = fgLots.find((item) => item.fgLotNo === target.lotNumber);
    if (!lot) return { success: false, message: "완제품 LOT를 찾을 수 없습니다." };
    const otherShipments = shipments.filter((item) => item.id !== target.id);
    const availability = getShipmentLotAvailability(lot, finished, otherShipments);
    if (!availability.inspectionCompleted) return { success: false, message: "품질검사가 완료되지 않았습니다." };
    if (!availability.inspectionPassed || lot.qualityStatus !== "PASSED" || !lot.isReleaseAvailable) {
      return { success: false, message: "품질검사 합격 LOT만 출하할 수 있습니다." };
    }
    if (target.quantity > availability.currentStock) return { success: false, message: "출하 가능 재고가 부족하여 완료할 수 없습니다." };

    const shippedDate = localDateTime();
    const updated: Shipment = { ...target, status: "COMPLETED", shippedDate, updatedAt: shippedDate };
    setShipments((previous) => previous.map((item) => item.id === id ? updated : item));
    recordAudit("SHIPMENT_COMPLETED", "SHIPMENT", id, `${target.shipmentNumber} 출하를 완료하고 LOT 재고 ${target.quantity.toLocaleString()}개를 차감했습니다.`, JSON.stringify(target), JSON.stringify(updated));
    return { success: true, message: "출하 완료 및 재고 차감이 처리되었습니다." };
  }, [fgLots, finished, hasPermission, recordAudit, shipments]);

  const cancelShipment = useCallback((id: string) => updateShipmentStatus(id, "CANCELLED"), [updateShipmentStatus]);

  return <ShipmentContext.Provider value={{ shipments, lotAvailability, kpi, createShipment, updateShipmentStatus, completeShipment, cancelShipment }}>{children}</ShipmentContext.Provider>;
}

export function useShipments() {
  const context = useContext(ShipmentContext);
  if (!context) throw new Error("useShipments must be used within ShipmentProvider");
  return context;
}
