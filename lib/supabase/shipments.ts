import { supabase } from "@/lib/supabase/client";
import type { Shipment } from "@/types/shipment";

function check(error: { message: string } | null) { if (error) throw new Error(error.message); }

async function findId(table: "finished_goods_lots" | "suppliers" | "business_users", column: string, value: string) {
  if (!value) return null;
  const result = await supabase.from(table).select("id").eq(column, value).maybeSingle();
  check(result.error);
  return result.data?.id ?? null;
}

export async function fetchShipments(): Promise<Shipment[]> {
  const [shipmentResult, lotResult, productResult] = await Promise.all([
    supabase.from("shipments").select("*").order("created_at", { ascending: false }),
    supabase.from("finished_goods_lots").select("id,fg_lot_no,product_id"),
    supabase.from("products").select("id,code,name"),
  ]);
  check(shipmentResult.error); check(lotResult.error); check(productResult.error);
  const lots = new Map((lotResult.data ?? []).map(row => [row.id, row]));
  const products = new Map((productResult.data ?? []).map(row => [row.id, row]));
  return (shipmentResult.data ?? []).map(row => {
    const lot = lots.get(row.finished_goods_lot_id);
    const product = lot ? products.get(lot.product_id) : undefined;
    return {
      id: row.id,
      shipmentNumber: row.shipment_number,
      lotNumber: lot?.fg_lot_no ?? "",
      productId: product?.code ?? "",
      productName: product?.name ?? "",
      quantity: Number(row.quantity),
      customer: row.customer_name,
      plannedDate: row.planned_date,
      shippedDate: row.shipped_date ?? undefined,
      status: row.status,
      manager: row.manager_name,
      memo: row.memo ?? undefined,
      createdAt: String(row.created_at).replace("T", " ").slice(0, 16),
      updatedAt: String(row.updated_at).replace("T", " ").slice(0, 16),
    };
  });
}

export async function saveShipment(shipment: Shipment): Promise<void> {
  const lotId = await findId("finished_goods_lots", "fg_lot_no", shipment.lotNumber);
  const customerId = await findId("suppliers", "name", shipment.customer);
  const managerId = await findId("business_users", "name", shipment.manager);
  if (!lotId) throw new Error("완제품 LOT ID를 찾을 수 없습니다.");
  const { error } = await supabase.from("shipments").upsert({
    id: shipment.id,
    shipment_number: shipment.shipmentNumber,
    finished_goods_lot_id: lotId,
    quantity: shipment.quantity,
    customer_supplier_id: customerId,
    customer_name: shipment.customer,
    planned_date: shipment.plannedDate,
    shipped_date: shipment.shippedDate?.slice(0, 10) ?? null,
    status: shipment.status,
    manager_user_id: managerId,
    manager_name: shipment.manager,
    memo: shipment.memo ?? null,
  }, { onConflict: "id" });
  check(error);
}
