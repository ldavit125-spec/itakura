"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import MasterDataTabs from "@/components/master-data/MasterDataTabs";
import ProductTable from "@/components/master-data/ProductTable";
import MaterialTable from "@/components/master-data/MaterialTable";
import SupplierTable from "@/components/master-data/SupplierTable";
import ProductionLineTable from "@/components/master-data/ProductionLineTable";
import {
  ProductFormModal,
  MaterialFormModal,
  SupplierFormModal,
  ProductionLineFormModal,
} from "@/components/master-data/MasterDataFormModal";
import Toast from "@/components/master-data/Toast";



import type {
  Product,
  Material,
  Supplier,
  ProductionLine,
  MasterDataTab,
  ModalState,
  ToastState,
  ActiveStatus,
} from "@/types/master-data";

// ============================================================
// 기준정보 관리 — 클라이언트 상태 오케스트레이터
// ============================================================

import { useMasterData } from "@/context/MasterDataContext";

let toastIdCounter = 0;

export default function MasterDataClient() {
  // ── 탭 상태 ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MasterDataTab>("product");

  // ── 엔티티 상태 (MasterDataContext 전역 연동) ─────────────────────
  const {
    products,
    setProducts,
    materials,
    setMaterials,
    suppliers,
    setSuppliers,
    productionLines: lines,
    setProductionLines: setLines,
  } = useMasterData();

  // ── 모달·Toast 상태 ──────────────────────────────────────────
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ id: ++toastIdCounter, message, type });
  };

  const closeModal = () => setModal(null);

  // ── 상태 토글 헬퍼 ───────────────────────────────────────────
  const toggleStatus = (status: ActiveStatus): ActiveStatus =>
    status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  // ── 제품 핸들러 ──────────────────────────────────────────────
  const handleProductSave = (data: Omit<Product, "id">) => {
    if (modal?.type === "product" && modal.mode === "edit") {
      const targetId = modal.item.id;
      setProducts((prev) =>
        prev.map((p) => (p.id === targetId ? { ...data, id: targetId } : p))
      );
      showToast("제품 정보가 수정되었습니다.", "success");
    } else {
      setProducts((prev) => [
        ...prev,
        { ...data, id: `prd-${Date.now()}` },
      ]);
      showToast("새 제품이 등록되었습니다.", "success");
    }
    closeModal();
  };

  const handleProductToggle = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: toggleStatus(p.status) } : p
      )
    );
    showToast("사용 여부가 변경되었습니다.", "success");
  };

  // ── 원재료 핸들러 ────────────────────────────────────────────
  const handleMaterialSave = (data: Omit<Material, "id">) => {
    if (modal?.type === "material" && modal.mode === "edit") {
      const targetId = modal.item.id;
      setMaterials((prev) =>
        prev.map((m) => (m.id === targetId ? { ...data, id: targetId } : m))
      );
      showToast("원재료 정보가 수정되었습니다.", "success");
    } else {
      setMaterials((prev) => [
        ...prev,
        { ...data, id: `mat-${Date.now()}` },
      ]);
      showToast("새 원재료가 등록되었습니다.", "success");
    }
    closeModal();
  };

  const handleMaterialToggle = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: toggleStatus(m.status) } : m
      )
    );
    showToast("사용 여부가 변경되었습니다.", "success");
  };

  // ── 거래처 핸들러 ────────────────────────────────────────────
  const handleSupplierSave = (data: Omit<Supplier, "id">) => {
    if (modal?.type === "supplier" && modal.mode === "edit") {
      const targetId = modal.item.id;
      setSuppliers((prev) =>
        prev.map((s) => (s.id === targetId ? { ...data, id: targetId } : s))
      );
      showToast("거래처 정보가 수정되었습니다.", "success");
    } else {
      setSuppliers((prev) => [
        ...prev,
        { ...data, id: `sup-${Date.now()}` },
      ]);
      showToast("새 거래처가 등록되었습니다.", "success");
    }
    closeModal();
  };

  const handleSupplierToggle = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: toggleStatus(s.status) } : s
      )
    );
    showToast("사용 여부가 변경되었습니다.", "success");
  };

  // ── 생산라인 핸들러 ──────────────────────────────────────────
  const handleLineSave = (data: Omit<ProductionLine, "id">) => {
    if (modal?.type === "line" && modal.mode === "edit") {
      const targetId = modal.item.id;
      setLines((prev) =>
        prev.map((l) => (l.id === targetId ? { ...data, id: targetId } : l))
      );
      showToast("생산라인 정보가 수정되었습니다.", "success");
    } else {
      setLines((prev) => [
        ...prev,
        { ...data, id: `line-${Date.now()}` },
      ]);
      showToast("새 생산라인이 등록되었습니다.", "success");
    }
    closeModal();
  };

  const handleLineToggle = (id: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: toggleStatus(l.status) } : l
      )
    );
    showToast("사용 여부가 변경되었습니다.", "success");
  };

  // ── 코드 목록 (중복 체크용, 편집 중인 항목 제외) ─────────────
  const productCodes = (editId?: string) =>
    products.filter((p) => p.id !== editId).map((p) => p.code);
  const materialCodes = (editId?: string) =>
    materials.filter((m) => m.id !== editId).map((m) => m.code);
  const supplierCodes = (editId?: string) =>
    suppliers.filter((s) => s.id !== editId).map((s) => s.code);
  const lineCodes = (editId?: string) =>
    lines.filter((l) => l.id !== editId).map((l) => l.code);

  return (
    <>
      <PageHeader
        title="기준정보 관리"
        description="생산과 자재 업무에 공통으로 사용되는 기본 정보를 관리합니다."
        breadcrumb={["기준정보 관리"]}
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <MasterDataTabs activeTab={activeTab} onChange={setActiveTab} />

        <div
          className="p-6"
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === "product" && (
            <ProductTable
              items={products}
              onAdd={() => setModal({ type: "product", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "product", mode: "edit", item })
              }
              onToggleStatus={handleProductToggle}
            />
          )}
          {activeTab === "material" && (
            <MaterialTable
              items={materials}
              onAdd={() => setModal({ type: "material", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "material", mode: "edit", item })
              }
              onToggleStatus={handleMaterialToggle}
            />
          )}
          {activeTab === "supplier" && (
            <SupplierTable
              items={suppliers}
              onAdd={() => setModal({ type: "supplier", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "supplier", mode: "edit", item })
              }
              onToggleStatus={handleSupplierToggle}
            />
          )}
          {activeTab === "line" && (
            <ProductionLineTable
              items={lines}
              onAdd={() => setModal({ type: "line", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "line", mode: "edit", item })
              }
              onToggleStatus={handleLineToggle}
            />
          )}
        </div>
      </div>

      {/* ── 모달 ──────────────────────────────────────────────── */}
      {modal?.type === "product" && (
        <ProductFormModal
          mode={modal.mode}
          item={modal.mode === "edit" ? modal.item : undefined}
          existingCodes={
            modal.mode === "edit"
              ? productCodes(modal.item.id)
              : productCodes()
          }
          onSave={handleProductSave}
          onClose={closeModal}
        />
      )}
      {modal?.type === "material" && (
        <MaterialFormModal
          mode={modal.mode}
          item={modal.mode === "edit" ? modal.item : undefined}
          existingCodes={
            modal.mode === "edit"
              ? materialCodes(modal.item.id)
              : materialCodes()
          }
          onSave={handleMaterialSave}
          onClose={closeModal}
        />
      )}
      {modal?.type === "supplier" && (
        <SupplierFormModal
          mode={modal.mode}
          item={modal.mode === "edit" ? modal.item : undefined}
          existingCodes={
            modal.mode === "edit"
              ? supplierCodes(modal.item.id)
              : supplierCodes()
          }
          onSave={handleSupplierSave}
          onClose={closeModal}
        />
      )}
      {modal?.type === "line" && (
        <ProductionLineFormModal
          mode={modal.mode}
          item={modal.mode === "edit" ? modal.item : undefined}
          existingCodes={
            modal.mode === "edit" ? lineCodes(modal.item.id) : lineCodes()
          }
          onSave={handleLineSave}
          onClose={closeModal}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}
    </>
  );
}
