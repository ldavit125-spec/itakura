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
} from "@/types/materials";
import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";
import { getShortageMaterials } from "@/lib/common-selectors";
import { useAdmin } from "@/context/AdminContext";

import MaterialTabs from "./MaterialTabs";
import MaterialInboundTable from "./MaterialInboundTable";
import MaterialInboundModal from "./MaterialInboundModal";
import MaterialInventoryTable from "./MaterialInventoryTable";
import MaterialInventoryDetailModal from "./MaterialInventoryDetailModal";
import MaterialOutboundTable from "./MaterialOutboundTable";
import MaterialOutboundModal from "./MaterialOutboundModal";
import MaterialTransactionTable from "./MaterialTransactionTable";
import MaterialShortageTable from "./MaterialShortageTable";
import MaterialToast from "./MaterialToast";

// ============================================================
// 자재관리 통합 클라이언트 컨테이너
// ============================================================

export default function MaterialClient() {
  const { hasPermission, currentUser } = useAdmin();
  // ── 1. 메인 탭 상태 ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MaterialTab>("inbound");

  // ── 2. 데이터 State (전역 공유 MaterialsContext 연동) ────────────
  const {
    inbounds,
    inventories,
    outbounds,
    transactions,
    setInbounds,
    setInventories,
    setOutbounds,
    setTransactions,
  } = useMaterials();
  const { materials } = useMasterData();

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
        orderStatus: "발주 필요",
      };
    });
  }, [inventories, materials]);

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
  const handleCreateInbound = (
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

    // 1. 입고 목록 추가
    setInbounds((prev) => [newInbound, ...prev]);

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

    setInventories((prev) => [newInventory, ...prev]);

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

    setTransactions((prev) => [newTxn, ...prev]);

    setInboundModal({ isOpen: false, mode: "create" });
    showToast(`신규 입고(${inboundNo}) 및 LOT가 정상 등록되고 재고에 반영되었습니다.`);
  };

  // ── 7. 입고 정보 수정 핸들러 ──────────────────────────────────
  const handleUpdateInbound = (id: string, updated: Partial<MaterialInbound>) => {
    setInbounds((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    setInboundModal({ isOpen: false, mode: "create" });
    showToast("입고 정보가 수정되었습니다.");
  };

  // ── 8. 입고 취소 핸들러 (연동 처리) ───────────────────────────
  const handleCancelInbound = (inbound: MaterialInbound) => {
    if (!window.confirm(`입고 건 [${inbound.inboundNo}]을 취소하시겠습니까?\n취소 시 재고가 차감 처리됩니다.`)) {
      return;
    }

    // 1. 입고 상태 변경
    setInbounds((prev) =>
      prev.map((item) =>
        item.id === inbound.id ? { ...item, inboundStatus: "CANCELLED" } : item
      )
    );

    // 2. 재고 LOT 차감
    setInventories((prev) =>
      prev.map((inv) => {
        if (inv.lotNo === inbound.lotNo) {
          const newCurrent = Math.max(0, inv.currentStock - inbound.quantity);
          const newAvailable = Math.max(0, inv.availableStock - inbound.quantity);
          return {
            ...inv,
            currentStock: newCurrent,
            availableStock: newAvailable,
          };
        }
        return inv;
      })
    );

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

    setTransactions((prev) => [newTxn, ...prev]);
    showToast(`입고 [${inbound.inboundNo}] 건이 취소 처리되었습니다.`);
  };

  // ── 9. 출고 등록 핸들러 (FEFO 차감 연동 처리) ─────────────────
  const handleCreateOutbound = (
    formData: Omit<MaterialOutbound, "id" | "outboundNo" | "outboundStatus">
  ) => {
    const dateTag = formData.outboundDate.replace(/-/g, "");
    const seqNum = String(outbounds.length + 1).padStart(3, "0");
    const outboundNo = `OUT-${dateTag}-${seqNum}`;

    const newOutbound: MaterialOutbound = {
      id: `out-${Date.now()}`,
      outboundNo,
      outboundStatus: "COMPLETED",
      ...formData,
    };

    // 1. 출고 목록 추가
    setOutbounds((prev) => [newOutbound, ...prev]);

    // 2. 재고 차감 처리
    let updatedBalance = 0;
    setInventories((prev) =>
      prev.map((inv) => {
        if (inv.lotNo === formData.lotNo) {
          const newCurrent = Math.max(0, inv.currentStock - formData.quantity);
          const newAvailable = Math.max(0, inv.availableStock - formData.quantity);
          updatedBalance = newCurrent;

          let newStatus = inv.inventoryStatus;
          if (newCurrent < inv.safetyStock * 0.5) {
            newStatus = "CRITICAL";
          } else if (newCurrent < inv.safetyStock) {
            newStatus = "LOW";
          }

          return {
            ...inv,
            currentStock: newCurrent,
            availableStock: newAvailable,
            inventoryStatus: newStatus,
          };
        }
        return inv;
      })
    );

    // 3. 수불 이력 추가
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newTxn: MaterialTransaction = {
      id: `txn-${Date.now()}`,
      timestamp: nowStr,
      transactionNo: `TXN-${dateTag}-${String(transactions.length + 1).padStart(3, "0")}`,
      transactionType: "OUTBOUND",
      materialCode: formData.materialCode,
      materialName: formData.materialName,
      lotNo: formData.lotNo,
      inboundQty: 0,
      outboundQty: formData.quantity,
      balanceAfter: updatedBalance,
      handler: formData.handler,
      remarks: `생산 출고 (${outboundNo}) / ${formData.productionLine}`,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    setOutboundModal({ isOpen: false, mode: "create" });
    showToast(`출고 [${outboundNo}] 처리 완료! 재고 ${formData.quantity}${formData.unit} 차감되었습니다.`);
  };

  // ── 10. 출고 취소 핸들러 (재고 복원 연동 처리) ────────────────
  const handleCancelOutbound = (outbound: MaterialOutbound) => {
    if (
      !window.confirm(
        `출고 건 [${outbound.outboundNo}]을 취소하시겠습니까?\n취소 시 차감되었던 재고가 다시 복원됩니다.`
      )
    ) {
      return;
    }

    // 1. 출고 상태 취소로 변경
    setOutbounds((prev) =>
      prev.map((item) =>
        item.id === outbound.id ? { ...item, outboundStatus: "CANCELLED" } : item
      )
    );

    // 2. 재고 복원
    let restoredBalance = 0;
    setInventories((prev) =>
      prev.map((inv) => {
        if (inv.lotNo === outbound.lotNo) {
          const newCurrent = inv.currentStock + outbound.quantity;
          const newAvailable = inv.availableStock + outbound.quantity;
          restoredBalance = newCurrent;

          let newStatus = inv.inventoryStatus;
          if (newCurrent >= inv.safetyStock) {
            newStatus = "NORMAL";
          } else if (newCurrent < inv.safetyStock * 0.5) {
            newStatus = "CRITICAL";
          } else {
            newStatus = "LOW";
          }

          return {
            ...inv,
            currentStock: newCurrent,
            availableStock: newAvailable,
            inventoryStatus: newStatus,
          };
        }
        return inv;
      })
    );

    // 3. 수불 이력 추가
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    const dateTag = outbound.outboundDate.replace(/-/g, "");
    const newTxn: MaterialTransaction = {
      id: `txn-${Date.now()}`,
      timestamp: nowStr,
      transactionNo: `TXN-${dateTag}-${String(transactions.length + 1).padStart(3, "0")}`,
      transactionType: "OUTBOUND_CANCEL",
      materialCode: outbound.materialCode,
      materialName: outbound.materialName,
      lotNo: outbound.lotNo,
      inboundQty: outbound.quantity,
      outboundQty: 0,
      balanceAfter: restoredBalance,
      handler: currentUser.name,
      remarks: `출고 취소 복원 (${outbound.outboundNo})`,
    };

    setTransactions((prev) => [newTxn, ...prev]);
    showToast(`출고 [${outbound.outboundNo}] 건이 취소되어 재고가 복원되었습니다.`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 1. 탭 네비게이션 */}
      <MaterialTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        shortageCount={summary.totalShortageCount}
      />

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
        <MaterialShortageTable shortageItems={shortageItems} summary={summary} />
      )}

      {/* 3. 각 탭 모달 */}
      <MaterialInboundModal
        isOpen={inboundModal.isOpen}
        mode={inboundModal.mode}
        item={inboundModal.item}
        onClose={() => setInboundModal({ isOpen: false, mode: "create" })}
        onSubmit={handleCreateInbound}
        onUpdate={handleUpdateInbound}
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

      {/* 4. Toast 알림 */}
      {toast && <MaterialToast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
