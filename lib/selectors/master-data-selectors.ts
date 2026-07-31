import type { Product, Material, Supplier, ProductionLine } from "@/types/master-data";

export function getProductByCode(products: Product[], code: string): Product | undefined {
  return products.find((p) => p.code === code);
}

export function getMaterialByCode(materials: Material[], code: string): Material | undefined {
  return materials.find((m) => m.code === code);
}

export function getSupplierByCode(suppliers: Supplier[], code: string): Supplier | undefined {
  return suppliers.find((s) => s.code === code);
}

export function getProductionLineByCode(lines: ProductionLine[], code: string): ProductionLine | undefined {
  return lines.find((l) => l.code === code || l.name === code);
}
