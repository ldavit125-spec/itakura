import { supabase } from "@/lib/supabase/client";
import type {
  ActiveStatus,
  Material,
  Product,
  ProductionLine,
  Supplier,
} from "@/types/master-data";

export interface MasterDataSnapshot {
  products: Product[];
  materials: Material[];
  suppliers: Supplier[];
  productionLines: ProductionLine[];
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * DB에 *_ja 컬럼이 아직 없을 때 화면이 튕기지 않도록 방어하는 안전한 SELECT 헬퍼
 */
async function selectWithJaFallback(
  table: string,
  fullSelect: string,
  fallbackSelect: string,
) {
  const primary = await supabase.from(table).select(fullSelect).order("code");
  if (
    primary.error &&
    (primary.error.message.includes("does not exist") ||
      primary.error.code === "PGRST204" ||
      primary.error.code === "42703")
  ) {
    return await supabase.from(table).select(fallbackSelect).order("code");
  }
  return primary;
}

export async function fetchMasterData(): Promise<MasterDataSnapshot> {
  const [productResult, materialResult, supplierResult, lineResult] =
    await Promise.all([
      selectWithJaFallback(
        "products",
        "id,code,name,name_ja,category,category_ja,unit,default_line_id,status",
        "id,code,name,category,unit,default_line_id,status",
      ),
      selectWithJaFallback(
        "materials",
        "id,code,name,name_ja,category,unit,safety_stock,default_supplier_id,status",
        "id,code,name,category,unit,safety_stock,default_supplier_id,status",
      ),
      selectWithJaFallback(
        "suppliers",
        "id,code,name,name_ja,type,contact_person,phone,status",
        "id,code,name,type,contact_person,phone,status",
      ),
      selectWithJaFallback(
        "production_lines",
        "id,code,name,name_ja,process,max_capacity,unit,status",
        "id,code,name,process,max_capacity,unit,status",
      ),
    ]);

  throwIfError(productResult.error);
  throwIfError(materialResult.error);
  throwIfError(supplierResult.error);
  throwIfError(lineResult.error);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supplierRows = (supplierResult.data ?? []) as Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRows = (lineResult.data ?? []) as Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productRows = (productResult.data ?? []) as Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRows = (materialResult.data ?? []) as Record<string, any>[];

  const suppliers: Supplier[] = supplierRows.map((row) => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    nameJa: row.name_ja ? String(row.name_ja) : null,
    type: row.type,
    contactPerson: row.contact_person ? String(row.contact_person) : "",
    phone: row.phone ? String(row.phone) : "",
    status: row.status,
  }));

  const productionLines: ProductionLine[] = lineRows.map((row) => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    nameJa: row.name_ja ? String(row.name_ja) : null,
    process: row.process,
    maxCapacity: Number(row.max_capacity),
    unit: String(row.unit),
    status: row.status,
  }));

  const supplierNames = new Map(suppliers.map((item) => [item.id, item.name]));
  const lineNames = new Map(
    productionLines.map((item) => [item.id, item.name]),
  );

  const products: Product[] = productRows.map((row) => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    nameJa: row.name_ja ? String(row.name_ja) : null,
    category: row.category,
    categoryJa: row.category_ja ? String(row.category_ja) : null,
    unit: String(row.unit),
    defaultLine: row.default_line_id
      ? (lineNames.get(row.default_line_id) ?? "")
      : "",
    status: row.status,
  }));

  const materials: Material[] = materialRows.map((row) => ({
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    nameJa: row.name_ja ? String(row.name_ja) : null,
    category: row.category,
    unit: String(row.unit),
    safetyStock: Number(row.safety_stock),
    defaultSupplier: row.default_supplier_id
      ? (supplierNames.get(row.default_supplier_id) ?? "")
      : "",
    status: row.status,
  }));

  return { products, materials, suppliers, productionLines };
}

function relationIdByName<T extends { id: string; name: string }>(
  items: T[],
  name: string,
) {
  if (!name) return null;
  return items.find((item) => item.name === name)?.id ?? null;
}

export async function saveProduct(
  item: Product,
  productionLines: ProductionLine[],
) {
  const nameJa = item.nameJa?.trim() ? item.nameJa.trim() : null;
  const categoryJa = item.categoryJa?.trim() ? item.categoryJa.trim() : null;

  const payload: Record<string, unknown> = {
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    unit: item.unit,
    default_line_id: relationIdByName(productionLines, item.defaultLine),
    status: item.status,
  };
  if (nameJa !== null) payload.name_ja = nameJa;
  if (categoryJa !== null) payload.category_ja = categoryJa;

  const { error } = await supabase
    .from("products")
    .upsert(payload, { onConflict: "id" });
  throwIfError(error);
}

export async function saveMaterial(item: Material, suppliers: Supplier[]) {
  const nameJa = item.nameJa?.trim() ? item.nameJa.trim() : null;

  const payload: Record<string, unknown> = {
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    unit: item.unit,
    safety_stock: item.safetyStock,
    default_supplier_id: relationIdByName(suppliers, item.defaultSupplier),
    status: item.status,
  };
  if (nameJa !== null) payload.name_ja = nameJa;

  const { error } = await supabase
    .from("materials")
    .upsert(payload, { onConflict: "id" });
  throwIfError(error);
}

export async function saveSupplier(item: Supplier) {
  const nameJa = item.nameJa?.trim() ? item.nameJa.trim() : null;

  const payload: Record<string, unknown> = {
    id: item.id,
    code: item.code,
    name: item.name,
    type: item.type,
    contact_person: item.contactPerson || null,
    phone: item.phone || null,
    status: item.status,
  };
  if (nameJa !== null) payload.name_ja = nameJa;

  const { error } = await supabase
    .from("suppliers")
    .upsert(payload, { onConflict: "id" });
  throwIfError(error);
}

export async function saveProductionLine(item: ProductionLine) {
  const nameJa = item.nameJa?.trim() ? item.nameJa.trim() : null;

  const payload: Record<string, unknown> = {
    id: item.id,
    code: item.code,
    name: item.name,
    process: item.process,
    max_capacity: item.maxCapacity,
    unit: item.unit,
    status: item.status,
  };
  if (nameJa !== null) payload.name_ja = nameJa;

  const { error } = await supabase
    .from("production_lines")
    .upsert(payload, { onConflict: "id" });
  throwIfError(error);
}

export async function updateMasterDataStatus(
  table: "products" | "materials" | "suppliers" | "production_lines",
  id: string,
  status: ActiveStatus,
) {
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  throwIfError(error);
}
