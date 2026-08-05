"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";
import { generateShipmentNumber, getShipmentKpi, getShipmentLotAvailability } from "@/lib/shipment-selectors";
import { getBusinessDate } from "@/lib/selectors/business-date";
import type { Shipment, ShipmentInput, ShipmentLotAvailability, ShipmentMutationResult, ShipmentStatus } from "@/types/shipment";
import { fetchShipments, saveShipment } from "@/lib/supabase/shipments";

interface ShipmentContextValue {
  shipments: Shipment[];
  lotAvailability: ShipmentLotAvailability[];
  kpi: ReturnType<typeof getShipmentKpi>;
  shipmentLoading: boolean;
  shipmentError: string | null;
  refreshShipments: () => Promise<void>;
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
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentLoading, setShipmentLoading] = useState(true);
  const [shipmentError, setShipmentError] = useState<string | null>(null);
  const { fgLots } = useProduction();
  const { finished } = useQuality();
  const { hasPermission, recordAudit } = useAdmin();

  const refreshShipments = useCallback(async () => {
    setShipmentLoading(true);
    try { setShipments(await fetchShipments()); setShipmentError(null); }
    catch (error) { setShipmentError(error instanceof Error ? error.message : "출하 데이터를 불러오지 못했습니다."); }
    finally { setShipmentLoading(false); }
  }, []);
  useEffect(() => { const timer=setTimeout(()=>void refreshShipments(),0); return()=>clearTimeout(timer); }, [refreshShipments]);
  const persist = useCallback((operation: Promise<void>) => {
    void operation.then(refreshShipments).catch(error => setShipmentError(error instanceof Error ? error.message : "출하 데이터 저장에 실패했습니다."));
  }, [refreshShipments]);

  const lotAvailability = useMemo(
    () => fgLots.map((lot) => getShipmentLotAvailability(lot, finished, shipments)),
    [fgLots, finished, shipments]
  );
  const kpi = useMemo(() => getShipmentKpi(shipments), [shipments]);

  const createShipment = useCallback((input: ShipmentInput): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_CREATE")) return { success: false, message: "출하 등록 권한이 없습니다.", messageKey: "shipment.message.noCreatePermission" };
    const lot = fgLots.find((item) => item.fgLotNo === input.lotNumber);
    if (!lot) return { success: false, message: "완제품 LOT를 찾을 수 없습니다.", messageKey: "shipment.message.lotNotFound" };
    const availability = getShipmentLotAvailability(lot, finished, shipments);
    if (!availability.canShip) return { success: false, message: availability.reason ?? "출하할 수 없는 LOT입니다.", messageKey: availability.reasonKey ?? "shipment.message.lotUnavailable" };
    if (!Number.isFinite(input.quantity) || input.quantity <= 0) return { success: false, message: "출하수량은 0보다 커야 합니다.", messageKey: "shipment.message.invalidQuantity" };
    if (input.quantity > availability.availableQuantity) {
      return { success: false, message: `출하 가능 재고가 부족합니다. 최대 ${availability.availableQuantity.toLocaleString()}개까지 등록할 수 있습니다.`, messageKey: "shipment.message.maxQuantity", messageParams: { quantity: availability.availableQuantity.toLocaleString() } };
    }
    if (!input.customer.trim() || !input.plannedDate || !input.manager.trim()) {
      return { success: false, message: "거래처, 출하 예정일, 출하 담당자를 입력하세요.", messageKey: "shipment.message.requiredFields" };
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
    persist(saveShipment(shipment));
    recordAudit("SHIPMENT_CREATED", "SHIPMENT", shipment.id, `${shipment.shipmentNumber} 출하를 등록했습니다.`, undefined, JSON.stringify(shipment));
    return { success: true, message: "출하가 등록되었습니다.", messageKey: "shipment.message.created", shipmentId: shipment.id };
  }, [fgLots, finished, hasPermission, persist, recordAudit, shipments]);

  const updateShipmentStatus = useCallback((id: string, status: ShipmentStatus): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_UPDATE")) return { success: false, message: "출하 수정 권한이 없습니다.", messageKey: "shipment.message.noUpdatePermission" };
    if (status === "COMPLETED") return { success: false, message: "출하 완료 버튼을 이용하세요.", messageKey: "shipment.message.useCompleteAction" };
    const target = shipments.find((item) => item.id === id);
    if (!target) return { success: false, message: "출하 정보를 찾을 수 없습니다.", messageKey: "shipment.message.notFound" };
    if (target.status === "COMPLETED" || target.status === "CANCELLED") return { success: false, message: "완료 또는 취소된 출하는 변경할 수 없습니다.", messageKey: "shipment.message.finalized" };
    const updated = { ...target, status, updatedAt: localDateTime() };
    setShipments((previous) => previous.map((item) => item.id === id ? updated : item));
    persist(saveShipment(updated));
    recordAudit("SHIPMENT_STATUS_UPDATED", "SHIPMENT", id, `${target.shipmentNumber} 상태를 변경했습니다.`, JSON.stringify(target), JSON.stringify(updated));
    return { success: true, message: "출하 상태가 변경되었습니다.", messageKey: "shipment.message.statusUpdated" };
  }, [hasPermission, persist, recordAudit, shipments]);

  const completeShipment = useCallback((id: string): ShipmentMutationResult => {
    if (!hasPermission("SHIPMENTS_COMPLETE")) return { success: false, message: "출하 완료 권한이 없습니다.", messageKey: "shipment.message.noCompletePermission" };
    const target = shipments.find((item) => item.id === id);
    if (!target) return { success: false, message: "출하 정보를 찾을 수 없습니다.", messageKey: "shipment.message.notFound" };
    if (target.status !== "PLANNED" && target.status !== "READY") return { success: false, message: "예정 또는 준비 상태의 출하만 완료할 수 있습니다.", messageKey: "shipment.message.invalidCompleteStatus" };
    const lot = fgLots.find((item) => item.fgLotNo === target.lotNumber);
    if (!lot) return { success: false, message: "완제품 LOT를 찾을 수 없습니다.", messageKey: "shipment.message.lotNotFound" };
    const otherShipments = shipments.filter((item) => item.id !== target.id);
    const availability = getShipmentLotAvailability(lot, finished, otherShipments);
    if (!availability.inspectionCompleted) return { success: false, message: "품질검사가 완료되지 않았습니다.", messageKey: "shipment.reason.inspectionIncomplete" };
    if (!availability.inspectionPassed || lot.qualityStatus !== "PASSED" || !lot.isReleaseAvailable) {
      return { success: false, message: "품질검사 합격 LOT만 출하할 수 있습니다.", messageKey: "shipment.message.passedOnly" };
    }
    if (target.quantity > availability.currentStock) return { success: false, message: "출하 가능 재고가 부족하여 완료할 수 없습니다.", messageKey: "shipment.message.insufficientCompletionStock" };

    const shippedDate = localDateTime();
    const updated: Shipment = { ...target, status: "COMPLETED", shippedDate, updatedAt: shippedDate };
    setShipments((previous) => previous.map((item) => item.id === id ? updated : item));
    persist(saveShipment(updated));
    recordAudit("SHIPMENT_COMPLETED", "SHIPMENT", id, `${target.shipmentNumber} 출하를 완료하고 LOT 재고 ${target.quantity.toLocaleString()}개를 차감했습니다.`, JSON.stringify(target), JSON.stringify(updated));
    return { success: true, message: "출하 완료 및 재고 차감이 처리되었습니다.", messageKey: "shipment.message.completed" };
  }, [fgLots, finished, hasPermission, persist, recordAudit, shipments]);

  const cancelShipment = useCallback((id: string) => updateShipmentStatus(id, "CANCELLED"), [updateShipmentStatus]);

  return <ShipmentContext.Provider value={{ shipments, lotAvailability, kpi, shipmentLoading, shipmentError, refreshShipments, createShipment, updateShipmentStatus, completeShipment, cancelShipment }}>{children}</ShipmentContext.Provider>;
}

export function useShipments() {
  const context = useContext(ShipmentContext);
  if (!context) throw new Error("useShipments must be used within ShipmentProvider");
  return context;
}
