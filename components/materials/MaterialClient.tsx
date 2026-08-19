"use client";

import React, { useState, useMemo } from "react";
import type {
  MaterialTab,
  MaterialInbound,
  MaterialInventory,
  MaterialOutbound,
  MaterialTransaction,
  MaterialShortageItem,
  MaterialSummary,
  MaterialToastState,
  InboundModalState,
  InventoryDetailModalState,
  OutboundModalState,
  InventoryStatus,
  MaterialPurchaseRequest,
} from "@/types/materials";
import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";
import { getShortageMaterials } from "@/lib/common-selectors";
import { useAdmin } from "@/context/AdminContext";
import { getBusinessDate } from "@/lib/selectors/business-date";
import {
  cancelInboundBundle,
  cancelOutboundBundle,
  createInboundBundle,
  createOutboundBundle,
  createPurchaseRequests,
  updateInboundRecord,
  updateShortageThreshold,
} from "@/lib/supabase/materials";

import MaterialTabs from "./MaterialTabs";
import MaterialInboundTable from "./MaterialInboundTable";
import MaterialInboundModal from "./MaterialInboundModal";
import MaterialInventoryTable from "./MaterialInventoryTable";
import MaterialInventoryDetailModal from "./MaterialInventoryDetailModal";
import MaterialOutboundTable from "./MaterialOutboundTable";
import MaterialOutboundModal from "./MaterialOutboundModal";
import MaterialTransactionTable from "./MaterialTransactionTable";
import MaterialShortageTable from "./MaterialShortageTable";
import MaterialShortageRegistrationModal from "./MaterialShortageRegistrationModal";
import MaterialToast from "./MaterialToast";
import { useLanguage } from "@/context/LanguageContext";
import { localizedMessage } from "@/lib/i18n/localized";

// ============================================================
// 자재관리 통합 클라이언트 컨테이너
// ============================================================

export default function MaterialClient() {
  const { hasPermission, currentUser } = useAdmin();
  const { locale } = useLanguage();
  // ── 1. 메인 탭 상태 ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MaterialTab>("inbound");

  // ── 2. 데이터 State (전역 공유 MaterialsContext 연동) ────────────
  const {
    inbounds,
    inventories,
    outbounds,
    transactions,
    purchaseRequests,
    materialsLoading,
    materialsError,
    refreshMaterials,
  } = useMaterials();
  const { materials, refreshMasterData } = useMasterData();

  // ── 3. 모달 State ────────────────────────────────────────────
  const [inboundModal, setInboundModal] = useState<InboundModalState>({
    isOpen: false,
    mode: "create",
  });

  const [inventoryModal, setInventoryModal] = useState<InventoryDetailModalState>({
    isOpen: false,
  });

  const [outboundModal, setOutboundModal] = useState<OutboundModalState>({
    isOpen: false,
    mode: "create",
  });

  const [shortageModalOpen, setShortageModalOpen] = useState(false);
  const [receivingRequestId, setReceivingRequestId] = useState<string | null>(null);

  // ── 4. Toast 알림 State ──────────────────────────────────────
  const [toast, setToast] = useState<MaterialToastState | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  // ── 5. 동적 부족 현황 및 요약 정보 계산 ────────────────────────
  const shortageItems = useMemo<MaterialShortageItem[]>(() => {
    return getShortageMaterials(inventories, materials).map((item) => {
      let inventoryStatus: InventoryStatus = "LOW";
      if (item.currentStock < item.safetyStock * 0.5) {
        inventoryStatus = "CRITICAL";
      }

      return {
        ...item,
        shortageQty: item.safetyStock - item.currentStock,
        defaultSupplier:
          materials.find((material) => material.code === item.materialCode)
            ?.defaultSupplier || "",
        inventoryStatus,
        orderStatus: purchaseRequests.some(
          (request) => request.materialCode === item.materialCode && request.status === "REQUESTED"
        ) ? "REQUESTED" : "REQUIRED",
      };
    });
  }, [inventories, materials, purchaseRequests]);

  const summary = useMemo<MaterialSummary>(() => {
    const totalShortageCount = shortageItems.length;
    const criticalShortageCount = shortageItems.filter(
      (item) => item.inventoryStatus === "CRITICAL"
    ).length;

    const thirtyDaysLater = "2026-08-30";
    const expiringLotCount = inventories.filter(
      (inv) => inv.expirationDate <= thirtyDaysLater
    ).length;

    const holdLotCount = inventories.filter(
      (inv) => inv.inspectionStatus === "HOLD"
    ).length;

    return {
      totalShortageCount,
      criticalShortageCount,
      expiringLotCount,
      holdLotCount,
    };
  }, [shortageItems, inventories]);

  // ── 6. 입고 등록 핸들러 (연동 처리) ───────────────────────────
  const handleCreateInbound = async (
    formData: Omit<MaterialInbound, "id" | "inboundNo" | "lotNo" | "inboundStatus">
  ) => {
    const dateTag = formData.inboundDate.replace(/-/g, "");
    const seqNum = String(inbounds.length + 1).padStart(3, "0");
    const inboundNo = `IN-${dateTag}-${seqNum}`;

    // LOT 번호 생성 예시: LOT-MAT001-20260731-001
    const matCodeClean = formData.materialCode.replace("-", "");
    const lotNo = `LOT-${matCodeClean}-${dateTag}-${seqNum}`;

    const newInbound: MaterialInbound = {
      id: `inb-${Date.now()}`,
      inboundNo,
      lotNo,
      inboundStatus: "RECEIVED",
      ...formData,
    };

    // 2. 재고 현황 생성/업데이트
    const availableQty = formData.inspectionStatus === "PASSED" ? formData.quantity : 0;
    const holdQty = formData.inspectionStatus === "HOLD" ? formData.quantity : 0;

    let invStatus: InventoryStatus = "NORMAL";
    if (formData.inspectionStatus === "HOLD") {
      invStatus = "HOLD";
    }

    const matInfo = materials.find((material) => material.code === formData.materialCode);
    const safetyStock = matInfo ? matInfo.safetyStock : 100;

    const newInventory: MaterialInventory = {
      id: `inv-${Date.now()}`,
      materialCode: formData.materialCode,
      materialName: formData.materialName,
      lotNo,
      currentStock: formData.quantity,
      availableStock: availableQty,
      holdStock: holdQty,
      unit: formData.unit,
      safetyStock,
      location: "원료창고 A-01",
      expirationDate: formData.expirationDate,
      inventoryStatus: invStatus,
      inspectionStatus: formData.inspectionStatus,
      supplierName: formData.supplierName,
    };

    // 3. 수불 이력 기록
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newTxn: MaterialTransaction = {
      id: `txn-${Date.now()}`,
      timestamp: nowStr,
      transactionNo: `TXN-${dateTag}-${String(transactions.length + 1).padStart(3, "0")}`,
      transactionType: "INBOUND",
      materialCode: formData.materialCode,
      materialName: formData.materialName,
      lotNo,
      inboundQty: formData.quantity,
      outboundQty: 0,
      balanceAfter: formData.quantity,
      handler: currentUser.name,
      remarks: `입고 등록 (${inboundNo})`,
    };

    try {
      const { inboundNo } = await createInboundBundle(formData, currentUser.name, receivingRequestId);
      await refreshMaterials();
      setReceivingRequestId(null);
      setInboundModal({ isOpen: false, mode: "create" });
      showToast(`신규 입고(${inboundNo}) 및 LOT가 정상 등록되고 재고에 반영되었습니다.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "입고 등록에 실패했습니다.", "error");
    }
  };

  // ── 7. 입고 정보 수정 핸들러 ──────────────────────────────────
  const handleUpdateInbound = async (id: string, updated: Partial<MaterialInbound>) => {
    try {
      await updateInboundRecord(id, updated);
      await refreshMaterials();
      setInboundModal({ isOpen: false, mode: "create" });
      showToast("입고 정보가 수정되었습니다.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "입고 수정에 실패했습니다.", "error");
    }
  };

  // ── 8. 입고 취소 핸들러 (연동 처리) ───────────────────────────
  const handleCancelInbound = async (inbound: MaterialInbound) => {
    if (!window.confirm(localizedMessage(locale, `입고 건 [${inbound.inboundNo}]을 취소하시겠습니까?\n취소 시 재고가 차감 처리됩니다.`))) {
      return;
    }

    // 3. 수불 이력 추가
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const dateTag = inbound.inboundDate.replace(/-/g, "");
    const newTxn: MaterialTransaction = {
      id: `txn-${Date.now()}`,
      timestamp: nowStr,
      transactionNo: `TXN-${dateTag}-${String(transactions.length + 1).padStart(3, "0")}`,
      transactionType: "INBOUND_CANCEL",
      materialCode: inbound.materialCode,
      materialName: inbound.materialName,
      lotNo: inbound.lotNo,
      inboundQty: 0,
      outboundQty: inbound.quantity,
      balanceAfter: 0,
      handler: currentUser.name,
      remarks: `입고 취소 (${inbound.inboundNo})`,
    };

    try {
      await cancelInboundBundle(inbound, currentUser.name);
      await refreshMaterials();
      showToast(`입고 [${inbound.inboundNo}] 건이 취소 처리되었습니다.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "입고 취소에 실패했습니다.", "error");
    }
  };

  // ── 9. 출고 등록 핸들러 (FEFO 차감 연동 처리) ─────────────────
  const handleCreateOutbound = async (
    formData: Omit<MaterialOutbound, "id" | "outboundNo" | "outboundStatus">
  ) => {
    try {
      const { outboundNo } = await createOutboundBundle(formData, currentUser.name);
      await refreshMaterials();
      setOutboundModal({ isOpen: false, mode: "create" });
      showToast(`출고 [${outboundNo}] 처리 완료! 재고 ${formData.quantity}${formData.unit} 차감되었습니다.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "출고 처리에 실패했습니다.", "error");
    }
  };

  // ── 10. 출고 취소 핸들러 (재고 복원 연동 처리) ────────────────
  const handleCancelOutbound = async (outbound: MaterialOutbound) => {
    if (
      !window.confirm(localizedMessage(
        locale,
        `출고 건 [${outbound.outboundNo}]을 취소하시겠습니까?\n취소 시 차감되었던 재고가 다시 복원됩니다.`
      ))
    ) {
      return;
    }

    try {
      await cancelOutboundBundle(outbound, currentUser.name);
      await refreshMaterials();
      showToast(`출고 [${outbound.outboundNo}] 건이 취소되어 재고가 복원되었습니다.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "출고 취소에 실패했습니다.", "error");
    }
  };

  const handleRegisterShortage = async (
    materialCode: string,
    requiredStock: number,
    remarks: string
  ) => {
    const material = materials.find((item) => item.code === materialCode);
    if (!material) {
      showToast("선택한 자재를 찾을 수 없습니다.", "error");
      return;
    }

    try {
      await updateShortageThreshold(materialCode, requiredStock);
      await Promise.all([refreshMasterData(), refreshMaterials()]);
      setShortageModalOpen(false);
      showToast(
        `${material.name}의 필요 재고 기준을 ${requiredStock.toLocaleString()}${material.unit}로 등록했습니다.${remarks ? ` (${remarks})` : ""}`
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "부족 기준 등록에 실패했습니다.", "error");
    }
  };

  const handleRequestPurchase = async (materialCodes: string[]) => {
    const requestableItems = shortageItems.filter(
      (item) => materialCodes.includes(item.materialCode) && item.orderStatus === "REQUIRED"
    );
    if (requestableItems.length === 0) return;

    const requestDate = getBusinessDate();
    const dateTag = requestDate.replace(/-/g, "");
    const createdAt = Date.now();
    const newRequests: MaterialPurchaseRequest[] = requestableItems.map((item, index) => ({
      id: `purchase-${createdAt}-${index}`,
      requestNo: `PO-${dateTag}-${String(purchaseRequests.length + index + 1).padStart(3, "0")}`,
      requestDate,
      materialCode: item.materialCode,
      materialName: item.materialName,
      supplierName: item.defaultSupplier,
      requestedQuantity: item.shortageQty,
      unit: item.unit,
      status: "REQUESTED",
      requester: currentUser.name,
    }));

    try {
      await createPurchaseRequests(newRequests);
      await refreshMaterials();
      showToast(`${materialCodes.length}건의 부족 자재를 발주 요청했습니다.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "발주 요청에 실패했습니다.", "error");
    }
  };

  const handleReceiveRequestedMaterial = (materialCode: string) => {
    const request = purchaseRequests.find(
      (item) => item.materialCode === materialCode && item.status === "REQUESTED"
    );
    if (!request) {
      showToast("입고 대기 중인 발주 요청을 찾을 수 없습니다.", "error");
      return;
    }

    setReceivingRequestId(request.id);
    setInboundModal({ isOpen: true, mode: "create" });
  };

  const receivingRequest = purchaseRequests.find((request) => request.id === receivingRequestId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 1. 탭 네비게이션 */}
      <MaterialTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        shortageCount={summary.totalShortageCount}
      />

      {materialsLoading && (
        <p className="px-6 py-3 text-sm text-gray-500">Supabase 자재 데이터를 불러오는 중입니다...</p>
      )}
      {materialsError && (
        <div className="mx-6 my-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          자재 데이터를 불러오지 못했습니다: {materialsError}
          <button type="button" onClick={() => void refreshMaterials()} className="ml-3 font-bold underline">
            다시 시도
          </button>
        </div>
      )}

      {/* 2. 탭별 메인 뷰 컨텐츠 */}
      {activeTab === "inbound" && (
        <MaterialInboundTable
          inbounds={inbounds}
          onOpenCreate={() => hasPermission("MATERIALS_CREATE") && setInboundModal({ isOpen: true, mode: "create" })}
          onOpenEdit={(item) => hasPermission("MATERIALS_UPDATE") && setInboundModal({ isOpen: true, mode: "edit", item })}
          onOpenDetail={(item) => setInboundModal({ isOpen: true, mode: "detail", item })}
          onCancelInbound={(item) => { if (hasPermission("MATERIALS_CANCEL")) handleCancelInbound(item); }}
        />
      )}

      {activeTab === "inventory" && (
        <MaterialInventoryTable
          inventories={inventories}
          onOpenDetail={(item) => setInventoryModal({ isOpen: true, item })}
        />
      )}

      {activeTab === "outbound" && (
        <MaterialOutboundTable
          outbounds={outbounds}
          onOpenCreate={() => hasPermission("MATERIALS_CREATE") && setOutboundModal({ isOpen: true, mode: "create" })}
          onOpenDetail={(item) => setOutboundModal({ isOpen: true, mode: "detail", item })}
          onCancelOutbound={(item) => { if (hasPermission("MATERIALS_CANCEL")) handleCancelOutbound(item); }}
        />
      )}

      {activeTab === "transaction" && (
        <MaterialTransactionTable transactions={transactions} />
      )}

      {activeTab === "shortage" && (
        <MaterialShortageTable
          shortageItems={shortageItems}
          summary={summary}
          onRequestPurchase={handleRequestPurchase}
          onReceiveMaterial={handleReceiveRequestedMaterial}
          canManage={hasPermission("MATERIALS_CREATE")}
          onOpenCreate={
            hasPermission("MATERIALS_UPDATE") ? () => setShortageModalOpen(true) : undefined
          }
        />
      )}

      {/* 3. 각 탭 모달 */}
      <MaterialInboundModal
        isOpen={inboundModal.isOpen}
        mode={inboundModal.mode}
        item={inboundModal.item}
        onClose={() => {
          setInboundModal({ isOpen: false, mode: "create" });
          setReceivingRequestId(null);
        }}
        onSubmit={handleCreateInbound}
        onUpdate={handleUpdateInbound}
        initialValues={receivingRequest ? {
          inboundDate: getBusinessDate(),
          materialCode: receivingRequest.materialCode,
          materialName: receivingRequest.materialName,
          supplierName: receivingRequest.supplierName,
          quantity: receivingRequest.requestedQuantity,
          unit: receivingRequest.unit,
          remarks: `발주 요청 ${receivingRequest.requestNo} 입고`,
        } : undefined}
      />

      <MaterialInventoryDetailModal
        isOpen={inventoryModal.isOpen}
        item={inventoryModal.item}
        onClose={() => setInventoryModal({ isOpen: false })}
      />

      <MaterialOutboundModal
        isOpen={outboundModal.isOpen}
        mode={outboundModal.mode}
        item={outboundModal.item}
        inventories={inventories}
        onClose={() => setOutboundModal({ isOpen: false, mode: "create" })}
        onSubmit={handleCreateOutbound}
      />

      {shortageModalOpen && (
        <MaterialShortageRegistrationModal
          isOpen
          materials={materials}
          inventories={inventories}
          onClose={() => setShortageModalOpen(false)}
          onSubmit={handleRegisterShortage}
        />
      )}

      {/* 4. Toast 알림 */}
      {toast && <MaterialToast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
