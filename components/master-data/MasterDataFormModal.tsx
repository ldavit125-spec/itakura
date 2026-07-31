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
  PRODUCT_CATEGORY_OPTIONS,
  MATERIAL_CATEGORY_OPTIONS,
  SUPPLIER_TYPE_OPTIONS,
  LINE_PROCESS_OPTIONS,
} from "@/types/master-data";

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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-500" role="alert">
          {error}
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
  return (
    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
      >
        취소
      </button>
      <button
        type="submit"
        id="modal-save-btn"
        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {isEdit ? "수정 저장" : "등록"}
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
    if (!code.trim()) next.code = "제품 코드를 입력하세요.";
    else if (existingCodes.includes(code.trim()))
      next.code = "이미 사용 중인 코드입니다.";
    if (!name.trim()) next.name = "제품명을 입력하세요.";
    if (!unit.trim()) next.unit = "단위를 입력하세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ code: code.trim(), name: name.trim(), category, unit: unit.trim(), defaultLine: defaultLine.trim(), status });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "제품 수정" : "제품 신규 등록"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="제품 코드" required error={errors.code}>
            <input
              id="product-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: PRD-006"
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="제품명" required error={errors.name}>
            <input
              id="product-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 소보로빵"
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="제품 분류" required>
            <select
              id="product-form-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className={SELECT_CLASS}
            >
              {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="단위" required error={errors.unit}>
            <input
              id="product-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: 개"
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="기본 생산라인">
            <input
              id="product-form-line"
              type="text"
              value={defaultLine}
              onChange={(e) => setDefaultLine(e.target.value)}
              placeholder="예: 1호 라인"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="사용 여부">
            <select
              id="product-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">사용</option>
              <option value="INACTIVE">미사용</option>
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
    if (!code.trim()) next.code = "자재 코드를 입력하세요.";
    else if (existingCodes.includes(code.trim()))
      next.code = "이미 사용 중인 코드입니다.";
    if (!name.trim()) next.name = "자재명을 입력하세요.";
    if (!unit.trim()) next.unit = "단위를 입력하세요.";
    const stock = Number(safetyStock);
    if (isNaN(stock) || stock < 0)
      next.safetyStock = "0 이상의 숫자를 입력하세요.";
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
      title={mode === "edit" ? "원재료 수정" : "원재료 신규 등록"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="자재 코드" required error={errors.code}>
            <input
              id="material-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: MAT-006"
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="자재명" required error={errors.name}>
            <input
              id="material-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 박력분"
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="자재 분류" required>
            <select
              id="material-form-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              className={SELECT_CLASS}
            >
              {MATERIAL_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="단위" required error={errors.unit}>
            <input
              id="material-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: kg"
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="안전재고" required error={errors.safetyStock}>
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
          <FormField label="기본 거래처">
            <input
              id="material-form-supplier"
              type="text"
              value={defaultSupplier}
              onChange={(e) => setDefaultSupplier(e.target.value)}
              placeholder="예: 사쿠라 제분"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="사용 여부">
            <select
              id="material-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">사용</option>
              <option value="INACTIVE">미사용</option>
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
  const [code, setCode] = useState(item?.code ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [type, setType] = useState<SupplierType>(item?.type ?? "SUPPLIER");
  const [contactPerson, setContactPerson] = useState(item?.contactPerson ?? "");
  const [phone, setPhone] = useState(item?.phone ?? "");
  const [status, setStatus] = useState<ActiveStatus>(item?.status ?? "ACTIVE");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<string, string>> = {};
    if (!code.trim()) next.code = "거래처 코드를 입력하세요.";
    else if (existingCodes.includes(code.trim()))
      next.code = "이미 사용 중인 코드입니다.";
    if (!name.trim()) next.name = "거래처명을 입력하세요.";
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
      title={mode === "edit" ? "거래처 수정" : "거래처 신규 등록"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="거래처 코드" required error={errors.code}>
            <input
              id="supplier-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: SUP-006"
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="거래처명" required error={errors.name}>
            <input
              id="supplier-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 오사카 제분"
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="거래처 구분" required>
            <select
              id="supplier-form-type"
              value={type}
              onChange={(e) => setType(e.target.value as SupplierType)}
              className={SELECT_CLASS}
            >
              {SUPPLIER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="담당자">
            <input
              id="supplier-form-contact"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="예: 직원 이름"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="연락처">
            <input
              id="supplier-form-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="예: 02-1234-5678"
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="사용 여부">
            <select
              id="supplier-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">사용</option>
              <option value="INACTIVE">미사용</option>
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
    if (!code.trim()) next.code = "라인 코드를 입력하세요.";
    else if (existingCodes.includes(code.trim()))
      next.code = "이미 사용 중인 코드입니다.";
    if (!name.trim()) next.name = "생산라인명을 입력하세요.";
    if (!unit.trim()) next.unit = "단위를 입력하세요.";
    const cap = Number(maxCapacity);
    if (isNaN(cap) || cap < 0)
      next.maxCapacity = "0 이상의 숫자를 입력하세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      code: code.trim(),
      name: name.trim(),
      process,
      maxCapacity: Number(maxCapacity),
      unit: unit.trim(),
      status,
    });
  };

  return (
    <MasterDataModal
      title={mode === "edit" ? "생산라인 수정" : "생산라인 신규 등록"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="라인 코드" required error={errors.code}>
            <input
              id="line-form-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="예: LINE-04"
              className={errors.code ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="생산라인명" required error={errors.name}>
            <input
              id="line-form-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 4호 라인"
              className={errors.name ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="담당 공정" required>
            <select
              id="line-form-process"
              value={process}
              onChange={(e) => setProcess(e.target.value as LineProcess)}
              className={SELECT_CLASS}
            >
              {LINE_PROCESS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="최대 생산량" required error={errors.maxCapacity}>
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
          <FormField label="단위" required error={errors.unit}>
            <input
              id="line-form-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: 개"
              className={errors.unit ? INPUT_ERROR_CLASS : INPUT_CLASS}
            />
          </FormField>
          <FormField label="사용 여부">
            <select
              id="line-form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ActiveStatus)}
              className={SELECT_CLASS}
            >
              <option value="ACTIVE">사용</option>
              <option value="INACTIVE">미사용</option>
            </select>
          </FormField>
        </div>
        <FormActions onClose={onClose} isEdit={mode === "edit"} />
      </form>
    </MasterDataModal>
  );
}
