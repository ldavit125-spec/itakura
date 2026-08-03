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

export async function fetchMaterialsSnapshot(): Promise<MaterialsSnapshot> {
  const [materials, suppliers, lines, users, workOrders, inbounds, inventories, outbounds, transactions, requests] =
    await Promise.all([
      supabase.from("materials").select("id,code,name"),
      supabase.from("suppliers").select("id,code,name"),
      supabase.from("production_lines").select("id,name"),
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

  const materialById = new Map((materials.data ?? []).map((row) => [row.id, row]));
  const supplierById = new Map((suppliers.data ?? []).map((row) => [row.id, row]));
  const lineById = new Map((lines.data ?? []).map((row) => [row.id, row.name]));
  const userById = new Map((users.data ?? []).map((row) => [row.id, row.name]));
  const workOrderById = new Map((workOrders.data ?? []).map((row) => [row.id, row.work_order_no]));
  const inboundById = new Map((inbounds.data ?? []).map((row) => [row.id, row.inbound_no]));
  const inventoryById = new Map((inventories.data ?? []).map((row) => [row.id, row]));

  return {
    inbounds: (inbounds.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      return {
        id: row.id,
        inboundNo: row.inbound_no,
        inboundDate: row.inbound_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        lotNo: row.lot_no,
        supplierName: row.supplier_id ? (supplierById.get(row.supplier_id)?.name ?? "") : "",
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
      return {
        id: row.id,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
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
        supplierName: row.supplier_id ? (supplierById.get(row.supplier_id)?.name ?? "") : "",
      };
    }),
    outbounds: (outbounds.data ?? []).map((row) => {
      const material = materialById.get(row.material_id);
      const inventory = inventoryById.get(row.inventory_lot_id);
      return {
        id: row.id,
        outboundNo: row.outbound_no,
        outboundDate: row.outbound_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        lotNo: inventory?.lot_no ?? "",
        quantity: Number(row.quantity),
        unit: row.unit,
        productionLine: lineById.get(row.production_line_id) ?? "",
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
      return {
        id: row.id,
        requestNo: row.request_no,
        requestDate: row.request_date,
        materialCode: material?.code ?? "",
        materialName: material?.name ?? "",
        supplierName: row.supplier_id ? (supplierById.get(row.supplier_id)?.name ?? "") : "",
        requestedQuantity: Number(row.requested_quantity),
        unit: row.unit,
        status: row.status,
        requester: row.requester_name || (row.requester_user_id ? userById.get(row.requester_user_id) : "") || "",
        receivedInboundNo: row.received_inbound_id ? inboundById.get(row.received_inbound_id) : undefined,
      };
    }),
  };
}

async function idBy(table: "materials" | "suppliers" | "production_lines" | "work_orders" | "business_users", column: string, value: string) {
  if (!value) return null;
  const { data, error } = await supabase.from(table).select("id").eq(column, value).maybeSingle();
  throwIfError(error);
  return data?.id ?? null;
}

async function inventoryByLot(lotNo: string) {
  const { data, error } = await supabase.from("material_inventory_lots").select("*").eq("lot_no", lotNo).single();
  throwIfError(error);
  return data;
}

export async function createInboundBundle(input: {
  inbound: MaterialInbound;
  inventory: MaterialInventory;
  transaction: MaterialTransaction;
  purchaseRequestId?: string | null;
}) {
  const materialId = await idBy("materials", "code", input.inbound.materialCode);
  const supplierId = await idBy("suppliers", "name", input.inbound.supplierName);
  if (!materialId) throw new Error("입고 자재 ID를 찾을 수 없습니다.");

  const { error: inboundError } = await supabase.from("material_inbounds").insert({
    id: input.inbound.id, inbound_no: input.inbound.inboundNo, inbound_date: input.inbound.inboundDate,
    material_id: materialId, lot_no: input.inbound.lotNo, supplier_id: supplierId,
    quantity: input.inbound.quantity, unit: input.inbound.unit,
    manufacture_date: input.inbound.manufactureDate || null, expiration_date: input.inbound.expirationDate,
    inspection_status: input.inbound.inspectionStatus, inbound_status: input.inbound.inboundStatus,
    remarks: input.inbound.remarks || null,
  });
  throwIfError(inboundError);

  const { error: inventoryError } = await supabase.from("material_inventory_lots").insert({
    id: input.inventory.id, material_id: materialId, inbound_id: input.inbound.id,
    lot_no: input.inventory.lotNo, current_stock: input.inventory.currentStock,
    available_stock: input.inventory.availableStock, hold_stock: input.inventory.holdStock,
    unit: input.inventory.unit, safety_stock: input.inventory.safetyStock,
    location: input.inventory.location, expiration_date: input.inventory.expirationDate,
    inventory_status: input.inventory.inventoryStatus, inspection_status: input.inventory.inspectionStatus,
    supplier_id: supplierId,
  });
  throwIfError(inventoryError);

  const handlerId = await idBy("business_users", "name", input.transaction.handler);
  const { error: transactionError } = await supabase.from("material_transactions").insert({
    id: input.transaction.id, occurred_at: input.transaction.timestamp,
    transaction_no: input.transaction.transactionNo, transaction_type: input.transaction.transactionType,
    material_id: materialId, inventory_lot_id: input.inventory.id,
    inbound_quantity: input.transaction.inboundQty, outbound_quantity: input.transaction.outboundQty,
    balance_after: input.transaction.balanceAfter, handler_user_id: handlerId,
    handler_name: input.transaction.handler, remarks: input.transaction.remarks || null,
  });
  throwIfError(transactionError);

  if (input.purchaseRequestId) {
    const { error } = await supabase.from("material_purchase_requests").update({
      status: "RECEIVED", received_inbound_id: input.inbound.id,
    }).eq("id", input.purchaseRequestId);
    throwIfError(error);
  }
}

export async function updateInboundRecord(id: string, updated: Partial<MaterialInbound>) {
  const payload: Record<string, unknown> = {};
  if (updated.inboundDate !== undefined) payload.inbound_date = updated.inboundDate;
  if (updated.quantity !== undefined) payload.quantity = updated.quantity;
  if (updated.unit !== undefined) payload.unit = updated.unit;
  if (updated.manufactureDate !== undefined) payload.manufacture_date = updated.manufactureDate || null;
  if (updated.expirationDate !== undefined) payload.expiration_date = updated.expirationDate;
  if (updated.inspectionStatus !== undefined) payload.inspection_status = updated.inspectionStatus;
  if (updated.remarks !== undefined) payload.remarks = updated.remarks || null;
  if (updated.materialCode !== undefined) payload.material_id = await idBy("materials", "code", updated.materialCode);
  if (updated.supplierName !== undefined) payload.supplier_id = await idBy("suppliers", "name", updated.supplierName);
  const { error } = await supabase.from("material_inbounds").update(payload).eq("id", id);
  throwIfError(error);
}

export async function cancelInboundBundle(inbound: MaterialInbound, transaction: MaterialTransaction) {
  const inventory = await inventoryByLot(inbound.lotNo);
  const materialId = await idBy("materials", "code", inbound.materialCode);
  const handlerId = await idBy("business_users", "name", transaction.handler);
  const { error: inboundError } = await supabase.from("material_inbounds").update({ inbound_status: "CANCELLED" }).eq("id", inbound.id);
  throwIfError(inboundError);
  const { error: inventoryError } = await supabase.from("material_inventory_lots").update({
    current_stock: Math.max(0, Number(inventory.current_stock) - inbound.quantity),
    available_stock: Math.max(0, Number(inventory.available_stock) - inbound.quantity),
  }).eq("id", inventory.id);
  throwIfError(inventoryError);
  const { error: transactionError } = await supabase.from("material_transactions").insert({
    id: transaction.id, occurred_at: transaction.timestamp, transaction_no: transaction.transactionNo,
    transaction_type: transaction.transactionType, material_id: materialId, inventory_lot_id: inventory.id,
    inbound_quantity: 0, outbound_quantity: transaction.outboundQty,
    balance_after: Math.max(0, Number(inventory.current_stock) - inbound.quantity),
    handler_user_id: handlerId, handler_name: transaction.handler, remarks: transaction.remarks || null,
  });
  throwIfError(transactionError);
}

export async function createOutboundBundle(outbound: MaterialOutbound, transaction: MaterialTransaction) {
  const inventory = await inventoryByLot(outbound.lotNo);
  if (Number(inventory.available_stock) < outbound.quantity) throw new Error("가용 재고가 부족합니다.");
  const materialId = await idBy("materials", "code", outbound.materialCode);
  const lineId = await idBy("production_lines", "name", outbound.productionLine);
  const workOrderId = await idBy("work_orders", "work_order_no", outbound.workOrderNo);
  const handlerId = await idBy("business_users", "name", outbound.handler);
  if (!materialId || !lineId || !workOrderId) throw new Error("출고 관계 ID를 찾을 수 없습니다.");
  const balance = Number(inventory.current_stock) - outbound.quantity;
  const available = Number(inventory.available_stock) - outbound.quantity;
  const status = balance < Number(inventory.safety_stock) * 0.5 ? "CRITICAL" : balance < Number(inventory.safety_stock) ? "LOW" : "NORMAL";
  const { error: outboundError } = await supabase.from("material_outbounds").insert({
    id: outbound.id, outbound_no: outbound.outboundNo, outbound_date: outbound.outboundDate,
    material_id: materialId, inventory_lot_id: inventory.id, quantity: outbound.quantity, unit: outbound.unit,
    production_line_id: lineId, work_order_id: workOrderId, handler_user_id: handlerId,
    handler_name: outbound.handler, outbound_status: outbound.outboundStatus, remarks: outbound.remarks || null,
  });
  throwIfError(outboundError);
  const { error: inventoryError } = await supabase.from("material_inventory_lots").update({
    current_stock: balance, available_stock: available, inventory_status: status,
  }).eq("id", inventory.id);
  throwIfError(inventoryError);
  const { error: transactionError } = await supabase.from("material_transactions").insert({
    id: transaction.id, occurred_at: transaction.timestamp, transaction_no: transaction.transactionNo,
    transaction_type: transaction.transactionType, material_id: materialId, inventory_lot_id: inventory.id,
    inbound_quantity: 0, outbound_quantity: outbound.quantity, balance_after: balance,
    handler_user_id: handlerId, handler_name: transaction.handler, remarks: transaction.remarks || null,
  });
  throwIfError(transactionError);
}

export async function cancelOutboundBundle(outbound: MaterialOutbound, transaction: MaterialTransaction) {
  const inventory = await inventoryByLot(outbound.lotNo);
  const materialId = await idBy("materials", "code", outbound.materialCode);
  const handlerId = await idBy("business_users", "name", transaction.handler);
  const balance = Number(inventory.current_stock) + outbound.quantity;
  const available = Number(inventory.available_stock) + outbound.quantity;
  const status = balance >= Number(inventory.safety_stock) ? "NORMAL" : balance < Number(inventory.safety_stock) * 0.5 ? "CRITICAL" : "LOW";
  const { error: outboundError } = await supabase.from("material_outbounds").update({ outbound_status: "CANCELLED" }).eq("id", outbound.id);
  throwIfError(outboundError);
  const { error: inventoryError } = await supabase.from("material_inventory_lots").update({
    current_stock: balance, available_stock: available, inventory_status: status,
  }).eq("id", inventory.id);
  throwIfError(inventoryError);
  const { error: transactionError } = await supabase.from("material_transactions").insert({
    id: transaction.id, occurred_at: transaction.timestamp, transaction_no: transaction.transactionNo,
    transaction_type: transaction.transactionType, material_id: materialId, inventory_lot_id: inventory.id,
    inbound_quantity: outbound.quantity, outbound_quantity: 0, balance_after: balance,
    handler_user_id: handlerId, handler_name: transaction.handler, remarks: transaction.remarks || null,
  });
  throwIfError(transactionError);
}

export async function updateShortageThreshold(materialCode: string, requiredStock: number) {
  const materialId = await idBy("materials", "code", materialCode);
  if (!materialId) throw new Error("자재 ID를 찾을 수 없습니다.");
  const { error: materialError } = await supabase.from("materials").update({ safety_stock: requiredStock }).eq("id", materialId);
  throwIfError(materialError);
  const { data: lots, error: lotError } = await supabase.from("material_inventory_lots").select("id,available_stock,inventory_status").eq("material_id", materialId);
  throwIfError(lotError);
  for (const lot of lots ?? []) {
    const status = lot.inventory_status === "HOLD" || lot.inventory_status === "EXPIRED"
      ? lot.inventory_status
      : Number(lot.available_stock) < requiredStock * 0.5 ? "CRITICAL" : Number(lot.available_stock) < requiredStock ? "LOW" : "NORMAL";
    const { error } = await supabase.from("material_inventory_lots").update({ safety_stock: requiredStock, inventory_status: status }).eq("id", lot.id);
    throwIfError(error);
  }
}

export async function createPurchaseRequests(requests: MaterialPurchaseRequest[]) {
  const rows = [];
  for (const request of requests) {
    const materialId = await idBy("materials", "code", request.materialCode);
    const supplierId = await idBy("suppliers", "name", request.supplierName);
    const requesterId = await idBy("business_users", "name", request.requester);
    rows.push({
      id: request.id, request_no: request.requestNo, request_date: request.requestDate,
      material_id: materialId, supplier_id: supplierId, requested_quantity: request.requestedQuantity,
      unit: request.unit, status: request.status, requester_user_id: requesterId,
      requester_name: request.requester, received_inbound_id: null,
    });
  }
  const { error } = await supabase.from("material_purchase_requests").insert(rows);
  throwIfError(error);
}
