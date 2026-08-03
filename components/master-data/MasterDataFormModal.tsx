"use client";

import { useState } from "react";
import MasterDataModal from "@/components/master-data/MasterDataModal";
import type {
  Product,
  Material,
  Supplier,
  ProductionLine,
  ProductCategory,
  MaterialCategory,
  SupplierType,
  LineProcess,
  ActiveStatus,
} from "@/types/master-data";
import {
  MATERIAL_CATEGORY_OPTIONS,
  SUPPLIER_TYPE_OPTIONS,
} from "@/types/master-data";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 공통 폼 필드 컴포넌트
// ============================================================

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
  const { t } = useLanguage();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t(label)}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}

const INPUT_CLASS =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const SELECT_CLASS =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white";

const INPUT_ERROR_CLASS =
  "w-full px-3 py-2 text-sm border border-red-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400";

// ── 저장/취소 버튼 공통 ────────────────────────────────────────

interface FormActionsProps {
  onClose: () => void;
  isEdit: boolean;
}

function FormActions({ onClose, isEdit }: FormActionsProps) {
  const { t } = useLanguage();
  return (
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {t("action.cancel")}
      </button>
      <button
        type="submit"
        id="modal-save-btn"
        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {t(isEdit ? "action.saveChanges" : "action.register")}
      </button>
    </div>
  );
}

// ============================================================
// 1. 제품 폼 모달
// ============================================================

interface ProductFormModalProps {
  mode: "create" | "edit";
  item?: Product;
  existingCodes: string[];
  onSave: (data: Omit<Product, "id">) => void;
  onClose: () => void;
}

export function ProductFormModal({
  mode,
  item,
  existingCodes,
  onSave,
  onClose,
}: ProductFormModalProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    item?.category ?? "BREAD"
  );
  const [unit, setUnit] = useState(item?.unit ?? "개");
  const [defaultLine, setDefaultLine] = useState(item?.defaultLine ?? "");
  const [status, setStatus] = useState<ActiveStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    if (!code.trim()) next.code = "master.validation.productCode";
    else if (existingCodes.includes(code.trim()))
      next.code = "master.validation.duplicateCode";
    if (!name.trim()) next.name = "master.validation.productName";
    if (!category.trim()) next.category = "master.validation.productCategory";
    if (!unit.trim()) next.unit = "master.validation.unit";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ code: code.trim(), name: name.trim(), category: category.trim() as ProductCategory, unit: unit.trim(), defaultLine: defaultLine.trim(), status });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "master.modal.productEdit" : "master.modal.productCreate"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="master.field.productCode" required error={errors.code}>
            <input
              id="product-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("master.placeholder.productCode")}
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.productName" required error={errors.name}>
            <input
              id="product-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("master.placeholder.productName")}
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.productCategory" required error={errors.category}>
            <input
              id="product-form-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              placeholder={t("master.placeholder.productCategory")}
              className={errors.category ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="common.unit" required error={errors.unit}>
            <input
              id="product-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={t("master.placeholder.unitItem")}
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.defaultLine">
            <input
              id="product-form-line"
              type="text"
              value={defaultLine}
              onChange={(e) => setDefaultLine(e.target.value)}
              placeholder={t("master.placeholder.defaultLine")}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.useStatus">
            <select
              id="product-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">{t("status.active")}</option><option value="INACTIVE">{t("status.inactive")}</option>
            </select>
          </FormField>
        </div>
        <FormActions onClose={onClose} isEdit={mode === "edit"} />
      </form>
    </MasterDataModal>
  );
}

// ============================================================
// 2. 원재료 폼 모달
// ============================================================

interface MaterialFormModalProps {
  mode: "create" | "edit";
  item?: Material;
  existingCodes: string[];
  onSave: (data: Omit<Material, "id">) => void;
  onClose: () => void;
}

export function MaterialFormModal({
  mode,
  item,
  existingCodes,
  onSave,
  onClose,
}: MaterialFormModalProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<MaterialCategory>(
    item?.category ?? "MAIN"
  );
  const [unit, setUnit] = useState(item?.unit ?? "kg");
  const [safetyStock, setSafetyStock] = useState(
    String(item?.safetyStock ?? 0)
  );
  const [defaultSupplier, setDefaultSupplier] = useState(
    item?.defaultSupplier ?? ""
  );
  const [status, setStatus] = useState<ActiveStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    if (!code.trim()) next.code = "master.validation.materialCode";
    else if (existingCodes.includes(code.trim()))
      next.code = "master.validation.duplicateCode";
    if (!name.trim()) next.name = "master.validation.materialName";
    if (!unit.trim()) next.unit = "master.validation.unit";
    const stock = Number(safetyStock);
    if (isNaN(stock) || stock < 0)
      next.safetyStock = "master.validation.nonNegative";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      code: code.trim(),
      name: name.trim(),
      category,
      unit: unit.trim(),
      safetyStock: Number(safetyStock),
      defaultSupplier: defaultSupplier.trim(),
      status,
    });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "master.modal.materialEdit" : "master.modal.materialCreate"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="master.field.materialCode" required error={errors.code}>
            <input
              id="material-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("master.placeholder.materialCode")}
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.materialName" required error={errors.name}>
            <input
              id="material-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("master.placeholder.materialName")}
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.materialCategory" required>
            <select
              id="material-form-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              className={SELECT_CLASS}
            >
              {MATERIAL_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="common.unit" required error={errors.unit}>
            <input
              id="material-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={t("master.placeholder.unitKg")}
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.safetyStock" required error={errors.safetyStock}>
            <input
              id="material-form-safety-stock"
              type="number"
              min={0}
              step={1}
              value={safetyStock}
              onChange={(e) => setSafetyStock(e.target.value)}
              placeholder="0"
              className={errors.safetyStock ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.defaultSupplier">
            <input
              id="material-form-supplier"
              type="text"
              value={defaultSupplier}
              onChange={(e) => setDefaultSupplier(e.target.value)}
              placeholder={t("master.placeholder.defaultSupplier")}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.useStatus">
            <select
              id="material-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">{t("status.active")}</option><option value="INACTIVE">{t("status.inactive")}</option>
            </select>
          </FormField>
        </div>
        <FormActions onClose={onClose} isEdit={mode === "edit"} />
      </form>
    </MasterDataModal>
  );
}

// ============================================================
// 3. 거래처 폼 모달
// ============================================================

interface SupplierFormModalProps {
  mode: "create" | "edit";
  item?: Supplier;
  existingCodes: string[];
  onSave: (data: Omit<Supplier, "id">) => void;
  onClose: () => void;
}

export function SupplierFormModal({
  mode,
  item,
  existingCodes,
  onSave,
  onClose,
}: SupplierFormModalProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [type, setType] = useState<SupplierType>(item?.type ?? "SUPPLIER");
  const [contactPerson, setContactPerson] = useState(item?.contactPerson ?? "");
  const [phone, setPhone] = useState(item?.phone ?? "");
  const [status, setStatus] = useState<ActiveStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    if (!code.trim()) next.code = "master.validation.supplierCode";
    else if (existingCodes.includes(code.trim()))
      next.code = "master.validation.duplicateCode";
    if (!name.trim()) next.name = "master.validation.supplierName";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      code: code.trim(),
      name: name.trim(),
      type,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      status,
    });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "master.modal.supplierEdit" : "master.modal.supplierCreate"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="master.field.supplierCode" required error={errors.code}>
            <input
              id="supplier-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("master.placeholder.supplierCode")}
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.supplierName" required error={errors.name}>
            <input
              id="supplier-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("master.placeholder.supplierName")}
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.supplierType" required>
            <select
              id="supplier-form-type"
              value={type}
              onChange={(e) => setType(e.target.value as SupplierType)}
              className={SELECT_CLASS}
            >
              {SUPPLIER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="master.field.manager">
            <input
              id="supplier-form-contact"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder={t("master.placeholder.manager")}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.contact">
            <input
              id="supplier-form-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("master.placeholder.contact")}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.useStatus">
            <select
              id="supplier-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">{t("status.active")}</option><option value="INACTIVE">{t("status.inactive")}</option>
            </select>
          </FormField>
        </div>
        <FormActions onClose={onClose} isEdit={mode === "edit"} />
      </form>
    </MasterDataModal>
  );
}

// ============================================================
// 4. 생산라인 폼 모달
// ============================================================

interface ProductionLineFormModalProps {
  mode: "create" | "edit";
  item?: ProductionLine;
  existingCodes: string[];
  onSave: (data: Omit<ProductionLine, "id">) => void;
  onClose: () => void;
}

export function ProductionLineFormModal({
  mode,
  item,
  existingCodes,
  onSave,
  onClose,
}: ProductionLineFormModalProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [process, setProcess] = useState<LineProcess>(
    item?.process ?? "BREAD_PROCESS"
  );
  const [maxCapacity, setMaxCapacity] = useState(
    String(item?.maxCapacity ?? 0)
  );
  const [unit, setUnit] = useState(item?.unit ?? "개");
  const [status, setStatus] = useState<ActiveStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    if (!code.trim()) next.code = "master.validation.lineCode";
    else if (existingCodes.includes(code.trim()))
      next.code = "master.validation.duplicateCode";
    if (!name.trim()) next.name = "master.validation.lineName";
    if (!process.trim()) next.process = "master.validation.process";
    if (!unit.trim()) next.unit = "master.validation.unit";
    const cap = Number(maxCapacity);
    if (isNaN(cap) || cap < 0)
      next.maxCapacity = "master.validation.nonNegative";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      code: code.trim(),
      name: name.trim(),
      process: process.trim() as LineProcess,
      maxCapacity: Number(maxCapacity),
      unit: unit.trim(),
      status,
    });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "master.modal.lineEdit" : "master.modal.lineCreate"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="master.field.lineCode" required error={errors.code}>
            <input
              id="line-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("master.placeholder.lineCode")}
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.lineName" required error={errors.name}>
            <input
              id="line-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("master.placeholder.lineName")}
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.process" required error={errors.process}>
            <input
              id="line-form-process"
              type="text"
              value={process}
              onChange={(e) => setProcess(e.target.value as LineProcess)}
              placeholder={t("master.placeholder.process")}
              className={errors.process ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.maxCapacity" required error={errors.maxCapacity}>
            <input
              id="line-form-capacity"
              type="number"
              min={0}
              step={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="0"
              className={errors.maxCapacity ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="common.unit" required error={errors.unit}>
            <input
              id="line-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={t("master.placeholder.unitItem")}
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="master.field.useStatus">
            <select
              id="line-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">{t("status.active")}</option><option value="INACTIVE">{t("status.inactive")}</option>
            </select>
          </FormField>
        </div>
        <FormActions onClose={onClose} isEdit={mode === "edit"} />
      </form>
    </MasterDataModal>
  );
}
