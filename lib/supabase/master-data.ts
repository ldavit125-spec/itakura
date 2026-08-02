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

export async function fetchMasterData(): Promise<MasterDataSnapshot> {
  const [productResult, materialResult, supplierResult, lineResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,code,name,category,unit,default_line_id,status")
        .order("code"),
      supabase
        .from("materials")
        .select(
          "id,code,name,category,unit,safety_stock,default_supplier_id,status",
        )
        .order("code"),
      supabase
        .from("suppliers")
        .select("id,code,name,type,contact_person,phone,status")
        .order("code"),
      supabase
        .from("production_lines")
        .select("id,code,name,process,max_capacity,unit,status")
        .order("code"),
    ]);

  throwIfError(productResult.error);
  throwIfError(materialResult.error);
  throwIfError(supplierResult.error);
  throwIfError(lineResult.error);

  const suppliers: Supplier[] = (supplierResult.data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    status: row.status,
  }));

  const productionLines: ProductionLine[] = (lineResult.data ?? []).map(
    (row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      process: row.process,
      maxCapacity: Number(row.max_capacity),
      unit: row.unit,
      status: row.status,
    }),
  );

  const supplierNames = new Map(suppliers.map((item) => [item.id, item.name]));
  const lineNames = new Map(
    productionLines.map((item) => [item.id, item.name]),
  );

  const products: Product[] = (productResult.data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    unit: row.unit,
    defaultLine: row.default_line_id
      ? (lineNames.get(row.default_line_id) ?? "")
      : "",
    status: row.status,
  }));

  const materials: Material[] = (materialResult.data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    unit: row.unit,
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
  const { error } = await supabase.from("products").upsert(
    {
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      default_line_id: relationIdByName(productionLines, item.defaultLine),
      status: item.status,
    },
    { onConflict: "id" },
  );
  throwIfError(error);
}

export async function saveMaterial(item: Material, suppliers: Supplier[]) {
  const { error } = await supabase.from("materials").upsert(
    {
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      safety_stock: item.safetyStock,
      default_supplier_id: relationIdByName(suppliers, item.defaultSupplier),
      status: item.status,
    },
    { onConflict: "id" },
  );
  throwIfError(error);
}

export async function saveSupplier(item: Supplier) {
  const { error } = await supabase.from("suppliers").upsert(
    {
      id: item.id,
      code: item.code,
      name: item.name,
      type: item.type,
      contact_person: item.contactPerson || null,
      phone: item.phone || null,
      status: item.status,
    },
    { onConflict: "id" },
  );
  throwIfError(error);
}

export async function saveProductionLine(item: ProductionLine) {
  const { error } = await supabase.from("production_lines").upsert(
    {
      id: item.id,
      code: item.code,
      name: item.name,
      process: item.process,
      max_capacity: item.maxCapacity,
      unit: item.unit,
      status: item.status,
    },
    { onConflict: "id" },
  );
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
