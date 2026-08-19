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
import {
  saveMaterial,
  saveProduct,
  saveProductionLine,
  saveSupplier,
  deleteMasterData,
  updateMasterDataStatus,
} from "@/lib/supabase/master-data";

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
import { useLanguage } from "@/context/LanguageContext";

let toastIdCounter = 0;

export default function MasterDataClient() {
  const { t } = useLanguage();
  // ── 탭 상태 ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MasterDataTab>("product");

  // ── 엔티티 상태 (MasterDataContext 전역 연동) ─────────────────────
  const {
    products,
    materials,
    suppliers,
    productionLines: lines,
    masterDataLoading,
    masterDataError,
    refreshMasterData,
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
  const handleProductSave = async (data: Omit<Product, "id">) => {
    const isEdit = modal?.type === "product" && modal.mode === "edit";
    const item = { ...data, id: isEdit ? modal.item.id : crypto.randomUUID() };
    try {
      await saveProduct(item, lines);
      await refreshMasterData();
      showToast(isEdit ? "master.toast.productUpdated" : "master.toast.productCreated", "success");
      closeModal();
    } catch (error) {
      showToast("master.toast.productSaveFailed", "error");
    }
  };

  const handleProductToggle = async (id: string) => {
    const item = products.find((product) => product.id === id);
    if (!item) return;
    try {
      await updateMasterDataStatus("products", id, toggleStatus(item.status));
      await refreshMasterData();
      showToast("master.toast.statusUpdated", "success");
    } catch (error) {
      showToast("master.toast.statusUpdateFailed", "error");
    }
  };

  // ── 원재료 핸들러 ────────────────────────────────────────────
  const handleMaterialSave = async (data: Omit<Material, "id">) => {
    const isEdit = modal?.type === "material" && modal.mode === "edit";
    const item = { ...data, id: isEdit ? modal.item.id : crypto.randomUUID() };
    try {
      await saveMaterial(item, suppliers);
      await refreshMasterData();
      showToast(isEdit ? "master.toast.materialUpdated" : "master.toast.materialCreated", "success");
      closeModal();
    } catch (error) {
      showToast("master.toast.materialSaveFailed", "error");
    }
  };

  const handleMaterialToggle = async (id: string) => {
    const item = materials.find((material) => material.id === id);
    if (!item) return;
    try {
      await updateMasterDataStatus("materials", id, toggleStatus(item.status));
      await refreshMasterData();
      showToast("master.toast.statusUpdated", "success");
    } catch (error) {
      showToast("master.toast.statusUpdateFailed", "error");
    }
  };

  // ── 거래처 핸들러 ────────────────────────────────────────────
  const handleSupplierSave = async (data: Omit<Supplier, "id">) => {
    const isEdit = modal?.type === "supplier" && modal.mode === "edit";
    const item = { ...data, id: isEdit ? modal.item.id : crypto.randomUUID() };
    try {
      await saveSupplier(item);
      await refreshMasterData();
      showToast(isEdit ? "master.toast.supplierUpdated" : "master.toast.supplierCreated", "success");
      closeModal();
    } catch (error) {
      showToast("master.toast.supplierSaveFailed", "error");
    }
  };

  const handleSupplierToggle = async (id: string) => {
    const item = suppliers.find((supplier) => supplier.id === id);
    if (!item) return;
    try {
      await updateMasterDataStatus("suppliers", id, toggleStatus(item.status));
      await refreshMasterData();
      showToast("master.toast.statusUpdated", "success");
    } catch (error) {
      showToast("master.toast.statusUpdateFailed", "error");
    }
  };

  // ── 생산라인 핸들러 ──────────────────────────────────────────
  const handleLineSave = async (data: Omit<ProductionLine, "id">) => {
    const isEdit = modal?.type === "line" && modal.mode === "edit";
    const item = { ...data, id: isEdit ? modal.item.id : crypto.randomUUID() };
    try {
      await saveProductionLine(item);
      await refreshMasterData();
      showToast(isEdit ? "master.toast.lineUpdated" : "master.toast.lineCreated", "success");
      closeModal();
    } catch (error) {
      showToast("master.toast.lineSaveFailed", "error");
    }
  };

  const handleLineToggle = async (id: string) => {
    const item = lines.find((line) => line.id === id);
    if (!item) return;
    try {
      await updateMasterDataStatus("production_lines", id, toggleStatus(item.status));
      await refreshMasterData();
      showToast("master.toast.statusUpdated", "success");
    } catch (error) {
      showToast("master.toast.statusUpdateFailed", "error");
    }
  };

  const handleDelete = async (
    table: "products" | "materials" | "suppliers" | "production_lines",
    ids: string[],
  ) => {
    if (!window.confirm(t("master.confirmDelete", { count: ids.length }))) return false;
    try {
      await deleteMasterData(table, ids);
      await refreshMasterData();
      showToast(t("master.toast.deleted", { count: ids.length }), "success");
      return true;
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "";
      showToast(
        t(code === "23503" ? "master.toast.deleteReferenced" : code === "42501" ? "master.toast.deleteDenied" : "master.toast.deleteFailed"),
        "error",
      );
      return false;
    }
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
        title="nav.masterData" description="master.page.description" breadcrumb={["nav.masterData"]}
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <MasterDataTabs activeTab={activeTab} onChange={setActiveTab} />

        {masterDataLoading && (
          <p className="px-6 pt-5 text-sm text-gray-500">{t("master.loading")}</p>
        )}
        {masterDataError && (
          <div className="mx-6 mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t("master.loadFailed")} {masterDataError}
            <button type="button" onClick={() => void refreshMasterData()} className="ml-3 font-bold underline">
              {t("action.retry")}
            </button>
          </div>
        )}

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
              onDeleteSelected={(ids) => handleDelete("products", ids)}
            />
          )}
          {activeTab === "material" && (
            <MaterialTable
              items={materials}
              onAdd={() => setModal({ type: "material", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "material", mode: "edit", item })
              }
              onDeleteSelected={(ids) => handleDelete("materials", ids)}
            />
          )}
          {activeTab === "supplier" && (
            <SupplierTable
              items={suppliers}
              onAdd={() => setModal({ type: "supplier", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "supplier", mode: "edit", item })
              }
              onDeleteSelected={(ids) => handleDelete("suppliers", ids)}
            />
          )}
          {activeTab === "line" && (
            <ProductionLineTable
              items={lines}
              onAdd={() => setModal({ type: "line", mode: "create" })}
              onEdit={(item) =>
                setModal({ type: "line", mode: "edit", item })
              }
              onDeleteSelected={(ids) => handleDelete("production_lines", ids)}
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
