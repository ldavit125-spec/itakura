import { supabase } from "@/lib/supabase/client";
import type {
  MaterialInbound,
  MaterialInventory,
  MaterialOutbound,
  MaterialPurchaseRequest,
  MaterialTransaction,
} from "@/types/materials";

export interface MaterialsSnapshot {
  inbounds: MaterialInbound[];
  inventories: MaterialInventory[];
  outbounds: MaterialOutbound[];
  transactions: MaterialTransaction[];
  purchaseRequests: MaterialPurchaseRequest[];
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * DB에 name_ja 컬럼이 아직 없을 때 화면이 튕기지 않도록 방어하는 안전한 SELECT 헬퍼
 */
async function selectWithJaFallback(
  table: string,
  fullSelect: string,
  fallbackSelect: string,
) {
  const primary = await supabase.from(table).select(fullSelect);
  if (
    primary.error &&
    (primary.error.message.includes("does not exist") ||
      primary.error.code === "PGRST204" ||
      primary.error.code === "42703")
  ) {
    return await supabase.from(table).select(fallbackSelect);
  }
  return primary;
}

export async function fetchMaterialsSnapshot(): Promise<MaterialsSnapshot> {
  const [materials, suppliers, lines, users, workOrders, inbounds, inventories, outbounds, transactions, requests] =
    await Promise.all([
      selectWithJaFallback("materials", "id,code,name,name_ja", "id,code,name"),
      selectWithJaFallback("suppliers", "id,code,name,name_ja", "id,code,name"),
      selectWithJaFallback("production_lines", "id,name,name_ja", "id,name"),
      supabase.from("business_users").select("id,name"),
      supabase.from("work_orders").select("id,work_order_no"),
      supabase.from("material_inbounds").select("*").order("inbound_date", { ascending: false }),
      supabase.from("material_inventory_lots").select("*").order("expiration_date"),
      supabase.from("material_outbounds").select("*").order("outbound_date", { ascending: false }),
      supabase.from("material_transactions").select("*").order("occurred_at", { ascending: false }),
      supabase.from("material_purchase_requests").select("*").order("request_date", { ascending: false }),
    ]);

  for (const result of [materials, suppliers, lines, users, workOrders, inbounds, inventories, outbounds, transactions, requests]) {
    throwIfError(result.error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialById = new Map(((materials.data ?? []) as any[]).map((row) => [row.id, row]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supplierById = new Map(((suppliers.data ?? []) as any[]).map((row) => [row.id, row]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineById = new Map(((lines.data ?? []) as any[]).map((row) => [row.id, row]));
  const userById = new Map((users.data ?? []).map((row) => [row.id, row.name]));
  const workOrderById = new Map((workOrders.data ?? []).map((row) => [row.id, row.work_order_no]));
  const inboundById = new Map((inbounds.data ?? []).map((row) => [row.id, row.inbound_no]));
  const inventoryById = new Map((inventories.data ?? []).map((row) => [row.id, row]));

  return {
    inbounds: (inbounds.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const supplier = row.supplier_id ? supplierById.get(row.supplier_id) : undefined;
      return {
        id: row.id,
        inboundNo: row.inbound_no,
        inboundDate: row.inbound_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        materialNameJa: material?.name_ja ?? null,
        lotNo: row.lot_no,
        supplierName: supplier?.name ?? "",
        supplierNameJa: supplier?.name_ja ?? null,
        quantity: Number(row.quantity),
        unit: row.unit,
        manufactureDate: row.manufacture_date ?? "",
        expirationDate: row.expiration_date,
        inspectionStatus: row.inspection_status,
        inboundStatus: row.inbound_status,
        remarks: row.remarks ?? undefined,
      };
    }),
    inventories: (inventories.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const supplier = row.supplier_id ? supplierById.get(row.supplier_id) : undefined;
      return {
        id: row.id,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        materialNameJa: material?.name_ja ?? null,
        lotNo: row.lot_no,
        currentStock: Number(row.current_stock),
        availableStock: Number(row.available_stock),
        holdStock: Number(row.hold_stock),
        unit: row.unit,
        safetyStock: Number(row.safety_stock),
        location: row.location,
        expirationDate: row.expiration_date,
        inventoryStatus: row.inventory_status,
        inspectionStatus: row.inspection_status,
        supplierName: supplier?.name ?? "",
        supplierNameJa: supplier?.name_ja ?? null,
      };
    }),
    outbounds: (outbounds.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const inventory = inventoryById.get(row.inventory_lot_id);
      const line = lineById.get(row.production_line_id);
      return {
        id: row.id,
        outboundNo: row.outbound_no,
        outboundDate: row.outbound_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        materialNameJa: material?.name_ja ?? null,
        lotNo: inventory?.lot_no ?? "",
        quantity: Number(row.quantity),
        unit: row.unit,
        productionLine: line?.name ?? "",
        productionLineJa: line?.name_ja ?? null,
        workOrderNo: workOrderById.get(row.work_order_id) ?? "",
        handler: row.handler_name || (row.handler_user_id ? userById.get(row.handler_user_id) : "") || "",
        outboundStatus: row.outbound_status,
        remarks: row.remarks ?? undefined,
      };
    }),
    transactions: (transactions.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const inventory = row.inventory_lot_id ? inventoryById.get(row.inventory_lot_id) : undefined;
      return {
        id: row.id,
        timestamp: row.occurred_at,
        transactionNo: row.transaction_no,
        transactionType: row.transaction_type,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        materialNameJa: material?.name_ja ?? null,
        lotNo: inventory?.lot_no ?? "",
        inboundQty: Number(row.inbound_quantity),
        outboundQty: Number(row.outbound_quantity),
        balanceAfter: Number(row.balance_after),
        handler: row.handler_name || (row.handler_user_id ? userById.get(row.handler_user_id) : "") || "",
        remarks: row.remarks ?? undefined,
      };
    }),
    purchaseRequests: (requests.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const supplier = row.supplier_id ? supplierById.get(row.supplier_id) : undefined;
      return {
        id: row.id,
        requestNo: row.request_no,
        requestDate: row.request_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        materialNameJa: material?.name_ja ?? null,
        supplierName: supplier?.name ?? "",
        supplierNameJa: supplier?.name_ja ?? null,
        requestedQuantity: Number(row.requested_quantity),
        unit: row.unit,
        status: row.status,
        requester: row.requester_name || (row.requester_user_id ? userById.get(row.requester_user_id) : "") || "",
        receivedInboundNo: row.received_inbound_id ? inboundById.get(row.received_inbound_id) : undefined,
      };
    }),
  };
}

export async function createInboundBundle(
  payload: Omit<MaterialInbound, "id" | "inboundNo" | "lotNo" | "inboundStatus">,
  handlerName = "관리자",
): Promise<{ inboundNo: string; lotNo: string }> {
  const { data: material } = await supabase
    .from("materials")
    .select("id")
    .eq("code", payload.materialCode)
    .single();
  throwIfError(null);

  let supplierId: string | null = null;
  if (payload.supplierName) {
    const { data: supplier } = await supabase
      .from("suppliers")
      .select("id")
      .eq("name", payload.supplierName)
      .single();
    supplierId = supplier?.id ?? null;
  }

  const codeSeq = payload.materialCode.replace(/[^0-9]/g, "").slice(-3) || "001";
  const dateSeq = payload.inboundDate.replace(/-/g, "").slice(2);
  const lotNo = `LOT-${dateSeq}-${codeSeq}`;
  const inboundNo = `IN-${dateSeq}-${Math.floor(100 + Math.random() * 900)}`;

  const { data: inbound, error: inboundErr } = await supabase
    .from("material_inbounds")
    .insert({
      inbound_no: inboundNo,
      inbound_date: payload.inboundDate,
      material_id: material?.id,
      supplier_id: supplierId,
      lot_no: lotNo,
      quantity: payload.quantity,
      unit: payload.unit,
      manufacture_date: payload.manufactureDate || null,
      expiration_date: payload.expirationDate,
      inspection_status: payload.inspectionStatus,
      inbound_status: "RECEIVED",
      remarks: payload.remarks || null,
    })
    .select("id")
    .single();
  throwIfError(inboundErr);

  const { data: inventory, error: invErr } = await supabase
    .from("material_inventory_lots")
    .insert({
      material_id: material?.id,
      inbound_id: inbound?.id,
      lot_no: lotNo,
      current_stock: payload.quantity,
      available_stock: payload.quantity,
      hold_stock: 0,
      unit: payload.unit,
      safety_stock: 100,
      location: "원료창고 A-01",
      manufacture_date: payload.manufactureDate || null,
      expiration_date: payload.expirationDate,
      inventory_status: payload.inspectionStatus === "PASSED" ? "NORMAL" : "HOLD",
      inspection_status: payload.inspectionStatus,
      supplier_id: supplierId,
    })
    .select("id")
    .single();
  throwIfError(invErr);

  const { error: txnErr } = await supabase.from("material_transactions").insert({
    transaction_no: `TXN-${Date.now()}`,
    transaction_type: "INBOUND",
    material_id: material?.id,
    inventory_lot_id: inventory?.id,
    inbound_quantity: payload.quantity,
    outbound_quantity: 0,
    balance_after: payload.quantity,
    handler_name: handlerName,
    occurred_at: new Date().toISOString(),
    remarks: `자재 입고 (${inboundNo})`,
  });
  throwIfError(txnErr);

  return { inboundNo, lotNo };
}

export async function updateInboundRecord(
  id: string,
  updated: Partial<MaterialInbound>,
) {
  const payload: Record<string, unknown> = {};
  if (updated.inboundDate) payload.inbound_date = updated.inboundDate;
  if (updated.quantity !== undefined) payload.quantity = updated.quantity;
  if (updated.unit) payload.unit = updated.unit;
  if (updated.manufactureDate !== undefined) payload.manufacture_date = updated.manufactureDate || null;
  if (updated.expirationDate) payload.expiration_date = updated.expirationDate;
  if (updated.inspectionStatus) payload.inspection_status = updated.inspectionStatus;
  if (updated.remarks !== undefined) payload.remarks = updated.remarks || null;

  const { error } = await supabase.from("material_inbounds").update(payload).eq("id", id);
  throwIfError(error);
}

export async function cancelInboundBundle(
  inbound: MaterialInbound,
  handlerName = "관리자",
) {
  const { error: inboundErr } = await supabase
    .from("material_inbounds")
    .update({ inbound_status: "CANCELLED" })
    .eq("id", inbound.id);
  throwIfError(inboundErr);

  const { data: inv } = await supabase
    .from("material_inventory_lots")
    .select("id, current_stock")
    .eq("inbound_id", inbound.id)
    .single();

  if (inv) {
    await supabase.from("material_inventory_lots").delete().eq("id", inv.id);
  }

  const { data: material } = await supabase
    .from("materials")
    .select("id")
    .eq("code", inbound.materialCode)
    .single();

  await supabase.from("material_transactions").insert({
    transaction_no: `TXN-${Date.now()}`,
    transaction_type: "INBOUND_CANCEL",
    material_id: material?.id,
    inbound_quantity: 0,
    outbound_quantity: inbound.quantity,
    balance_after: Math.max(0, (inv?.current_stock ?? inbound.quantity) - inbound.quantity),
    handler_name: handlerName,
    occurred_at: new Date().toISOString(),
    remarks: `입고 취소 (${inbound.inboundNo})`,
  });
}

export async function createOutboundBundle(
  payload: Omit<MaterialOutbound, "id" | "outboundNo" | "outboundStatus">,
  handlerName = "관리자",
): Promise<{ outboundNo: string }> {
  const { data: inventory } = await supabase
    .from("material_inventory_lots")
    .select("id, material_id, current_stock, available_stock")
    .eq("lot_no", payload.lotNo)
    .single();

  const { data: line } = await supabase
    .from("production_lines")
    .select("id")
    .eq("name", payload.productionLine)
    .single();

  const dateSeq = payload.outboundDate.replace(/-/g, "").slice(2);
  const outboundNo = `OUT-${dateSeq}-${Math.floor(100 + Math.random() * 900)}`;

  const { error: outErr } = await supabase.from("material_outbounds").insert({
    outbound_no: outboundNo,
    outbound_date: payload.outboundDate,
    material_id: inventory?.material_id,
    inventory_lot_id: inventory?.id,
    production_line_id: line?.id,
    quantity: payload.quantity,
    unit: payload.unit,
    handler_name: handlerName,
    outbound_status: "COMPLETED",
    remarks: payload.remarks || null,
  });
  throwIfError(outErr);

  if (inventory) {
    const newStock = Math.max(0, inventory.current_stock - payload.quantity);
    const newAvailable = Math.max(0, inventory.available_stock - payload.quantity);
    await supabase
      .from("material_inventory_lots")
      .update({
        current_stock: newStock,
        available_stock: newAvailable,
        inventory_status: newStock === 0 ? "EXPIRED" : newStock < 50 ? "LOW" : "NORMAL",
      })
      .eq("id", inventory.id);

    await supabase.from("material_transactions").insert({
      transaction_no: `TXN-${Date.now()}`,
      transaction_type: "OUTBOUND",
      material_id: inventory.material_id,
      inventory_lot_id: inventory.id,
      inbound_quantity: 0,
      outbound_quantity: payload.quantity,
      balance_after: newStock,
      handler_name: handlerName,
      occurred_at: new Date().toISOString(),
      remarks: `자재 출고 (${outboundNo})`,
    });
  }

  return { outboundNo };
}

export async function cancelOutboundBundle(
  outbound: MaterialOutbound,
  handlerName = "관리자",
) {
  const { error: outErr } = await supabase
    .from("material_outbounds")
    .update({ outbound_status: "CANCELLED" })
    .eq("id", outbound.id);
  throwIfError(outErr);

  const { data: inventory } = await supabase
    .from("material_inventory_lots")
    .select("id, material_id, current_stock, available_stock")
    .eq("lot_no", outbound.lotNo)
    .single();

  if (inventory) {
    const newStock = inventory.current_stock + outbound.quantity;
    const newAvailable = inventory.available_stock + outbound.quantity;
    await supabase
      .from("material_inventory_lots")
      .update({
        current_stock: newStock,
        available_stock: newAvailable,
        inventory_status: "NORMAL",
      })
      .eq("id", inventory.id);

    await supabase.from("material_transactions").insert({
      transaction_no: `TXN-${Date.now()}`,
      transaction_type: "OUTBOUND_CANCEL",
      material_id: inventory.material_id,
      inventory_lot_id: inventory.id,
      inbound_quantity: outbound.quantity,
      outbound_quantity: 0,
      balance_after: newStock,
      handler_name: handlerName,
      occurred_at: new Date().toISOString(),
      remarks: `출고 취소 (${outbound.outboundNo})`,
    });
  }
}

export async function createPurchaseRequests(materialCodes: string[], requester = "관리자") {
  for (const code of materialCodes) {
    const { data: material } = await supabase
      .from("materials")
      .select("id, name, default_supplier_id")
      .eq("code", code)
      .single();

    if (material) {
      const requestNo = `PR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await supabase.from("material_purchase_requests").insert({
        request_no: requestNo,
        request_date: new Date().toISOString().split("T")[0],
        material_id: material.id,
        supplier_id: material.default_supplier_id,
        requested_quantity: 500,
        unit: "kg",
        status: "REQUESTED",
        requester_name: requester,
      });
    }
  }
}

export async function updateShortageThreshold(materialCode: string, safetyStock: number) {
  const { data: material } = await supabase
    .from("materials")
    .select("id")
    .eq("code", materialCode)
    .single();

  if (material) {
    await supabase
      .from("materials")
      .update({ safety_stock: safetyStock })
      .eq("id", material.id);

    await supabase
      .from("material_inventory_lots")
      .update({ safety_stock: safetyStock })
      .eq("material_id", material.id);
  }
}
