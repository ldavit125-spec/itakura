// ============================================================
// 기준정보 관리 — TypeScript 타입 정의 및 한국어 라벨 맵
// ============================================================

// ── 코드 타입 (내부 영문값) ──────────────────────────────────

export type ActiveStatus = "ACTIVE" | "INACTIVE";

export type ProductCategory = "BREAD" | "COOKED_BREAD" | "SWEET_BREAD" | "PASTRY";

export type MaterialCategory =
  | "MAIN"
  | "SUB"
  | "DAIRY"
  | "AGRICULTURAL"
  | "PROCESSED";

export type SupplierType = "SUPPLIER" | "CUSTOMER" | "PARTNER";

export type LineProcess =
  | "BREAD_PROCESS"
  | "SWEET_BREAD_PROCESS"
  | "PASTRY_PROCESS";

export type MasterDataTab = "product" | "material" | "supplier" | "line";

export type StatusFilter = "ALL" | ActiveStatus;

// ── 한국어 라벨 맵 ────────────────────────────────────────────

export const ACTIVE_STATUS_LABELS: Record<ActiveStatus, string> = {
  ACTIVE: "status.active",
  INACTIVE: "status.inactive",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  BREAD: "master.category.product.bread", COOKED_BREAD: "master.category.product.cookedBread", SWEET_BREAD: "master.category.product.sweetBread", PASTRY: "master.category.product.pastry",
};

export const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "BREAD", label: "master.category.product.bread" }, { value: "COOKED_BREAD", label: "master.category.product.cookedBread" }, { value: "SWEET_BREAD", label: "master.category.product.sweetBread" }, { value: "PASTRY", label: "master.category.product.pastry" },
];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  MAIN: "master.category.material.main", SUB: "master.category.material.sub", DAIRY: "master.category.material.dairy", AGRICULTURAL: "master.category.material.agricultural", PROCESSED: "master.category.material.processed",
};

export const MATERIAL_CATEGORY_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: "MAIN", label: "master.category.material.main" }, { value: "SUB", label: "master.category.material.sub" }, { value: "DAIRY", label: "master.category.material.dairy" }, { value: "AGRICULTURAL", label: "master.category.material.agricultural" }, { value: "PROCESSED", label: "master.category.material.processed" },
];

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  SUPPLIER: "master.supplierType.supplier", CUSTOMER: "master.supplierType.customer", PARTNER: "master.supplierType.partner",
};

export const SUPPLIER_TYPE_OPTIONS: { value: SupplierType; label: string }[] = [
  { value: "SUPPLIER", label: "master.supplierType.supplier" }, { value: "CUSTOMER", label: "master.supplierType.customer" }, { value: "PARTNER", label: "master.supplierType.partner" },
];

export const LINE_PROCESS_LABELS: Record<LineProcess, string> = {
  BREAD_PROCESS: "master.process.bread", SWEET_BREAD_PROCESS: "master.process.sweetBread", PASTRY_PROCESS: "master.process.pastry",
};

export const LINE_PROCESS_OPTIONS: { value: LineProcess; label: string }[] = [
  { value: "BREAD_PROCESS", label: "master.process.bread" }, { value: "SWEET_BREAD_PROCESS", label: "master.process.sweetBread" }, { value: "PASTRY_PROCESS", label: "master.process.pastry" },
];

export const MASTER_DATA_TAB_LABELS: Record<MasterDataTab, string> = {
  product: "master.tab.products", material: "master.tab.materials", supplier: "master.tab.suppliers", line: "master.tab.lines",
};

export const MASTER_DATA_TABS: MasterDataTab[] = [
  "product",
  "material",
  "supplier",
  "line",
];

// ── 엔티티 인터페이스 ──────────────────────────────────────────

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  unit: string;
  defaultLine: string;
  status: ActiveStatus;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  safetyStock: number;
  defaultSupplier: string;
  status: ActiveStatus;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: SupplierType;
  contactPerson: string;
  phone: string;
  status: ActiveStatus;
}

export interface ProductionLine {
  id: string;
  code: string;
  name: string;
  process: LineProcess;
  maxCapacity: number;
  unit: string;
  status: ActiveStatus;
}

// ── 모달 상태 union type ───────────────────────────────────────

export type ModalState =
  | { type: "product"; mode: "create" }
  | { type: "product"; mode: "edit"; item: Product }
  | { type: "material"; mode: "create" }
  | { type: "material"; mode: "edit"; item: Material }
  | { type: "supplier"; mode: "create" }
  | { type: "supplier"; mode: "edit"; item: Supplier }
  | { type: "line"; mode: "create" }
  | { type: "line"; mode: "edit"; item: ProductionLine };

// ── Toast 상태 ────────────────────────────────────────────────

export interface ToastState {
  id: number; // 동일 메시지 재표시 지원용
  message: string;
  type: "success" | "error";
}
