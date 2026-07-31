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
  ACTIVE: "사용",
  INACTIVE: "미사용",
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  BREAD: "식빵류",
  COOKED_BREAD: "조리빵류",
  SWEET_BREAD: "과자빵류",
  PASTRY: "페이스트리류",
};

export const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "BREAD", label: "식빵류" },
  { value: "COOKED_BREAD", label: "조리빵류" },
  { value: "SWEET_BREAD", label: "과자빵류" },
  { value: "PASTRY", label: "페이스트리류" },
];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  MAIN: "주원료",
  SUB: "부원료",
  DAIRY: "유제품",
  AGRICULTURAL: "농산물",
  PROCESSED: "가공원료",
};

export const MATERIAL_CATEGORY_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: "MAIN", label: "주원료" },
  { value: "SUB", label: "부원료" },
  { value: "DAIRY", label: "유제품" },
  { value: "AGRICULTURAL", label: "농산물" },
  { value: "PROCESSED", label: "가공원료" },
];

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  SUPPLIER: "공급업체",
  CUSTOMER: "고객사",
  PARTNER: "파트너",
};

export const SUPPLIER_TYPE_OPTIONS: { value: SupplierType; label: string }[] = [
  { value: "SUPPLIER", label: "공급업체" },
  { value: "CUSTOMER", label: "고객사" },
  { value: "PARTNER", label: "파트너" },
];

export const LINE_PROCESS_LABELS: Record<LineProcess, string> = {
  BREAD_PROCESS: "식빵 생산",
  SWEET_BREAD_PROCESS: "단과자빵 생산",
  PASTRY_PROCESS: "페이스트리 생산",
};

export const LINE_PROCESS_OPTIONS: { value: LineProcess; label: string }[] = [
  { value: "BREAD_PROCESS", label: "식빵 생산" },
  { value: "SWEET_BREAD_PROCESS", label: "단과자빵 생산" },
  { value: "PASTRY_PROCESS", label: "페이스트리 생산" },
];

export const MASTER_DATA_TAB_LABELS: Record<MasterDataTab, string> = {
  product: "제품 관리",
  material: "원재료 관리",
  supplier: "거래처 관리",
  line: "생산라인 관리",
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
