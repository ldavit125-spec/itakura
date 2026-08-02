import { supabase } from "@/lib/supabase/client";
import type { FinishedGoodsLot, ProductionPlan, ProductionResult, WorkOrder } from "@/types/production";

export interface ProductionSnapshot {
  plans: ProductionPlan[];
  workOrders: WorkOrder[];
  results: ProductionResult[];
  fgLots: FinishedGoodsLot[];
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function idBy(table: "products" | "production_lines" | "business_users" | "production_plans" | "work_orders" | "production_results", column: string, value: string) {
  if (!value) return null;
  const { data, error } = await supabase.from(table).select("id").eq(column, value).maybeSingle();
  throwIfError(error);
  return data?.id ?? null;
}

export async function fetchProductionSnapshot(): Promise<ProductionSnapshot> {
  const [products, lines, users, plans, workOrders, results, defects, lots] = await Promise.all([
    supabase.from("products").select("id,code,name"),
    supabase.from("production_lines").select("id,name"),
    supabase.from("business_users").select("id,name"),
    supabase.from("production_plans").select("*").order("planned_date", { ascending: false }),
    supabase.from("work_orders").select("*").order("planned_date", { ascending: false }),
    supabase.from("production_results").select("*").order("production_date", { ascending: false }),
    supabase.from("production_result_defects").select("*"),
    supabase.from("finished_goods_lots").select("*").order("production_date", { ascending: false }),
  ]);
  for (const result of [products, lines, users, plans, workOrders, results, defects, lots]) throwIfError(result.error);

  const productById = new Map((products.data ?? []).map((row) => [row.id, row]));
  const lineById = new Map((lines.data ?? []).map((row) => [row.id, row.name]));
  const userById = new Map((users.data ?? []).map((row) => [row.id, row.name]));
  const planById = new Map((plans.data ?? []).map((row) => [row.id, row.plan_no]));
  const workOrderById = new Map((workOrders.data ?? []).map((row) => [row.id, row.work_order_no]));
  const resultById = new Map((results.data ?? []).map((row) => [row.id, row.result_no]));
  const defectsByResult = new Map<string, Array<{ type: ProductionResult["defectBreakdown"][number]["type"]; quantity: number }>>();
  for (const row of defects.data ?? []) {
    const list = defectsByResult.get(row.production_result_id) ?? [];
    list.push({ type: row.defect_type, quantity: Number(row.quantity) });
    defectsByResult.set(row.production_result_id, list);
  }

  return {
    plans: (plans.data ?? []).map((row) => {
      const product = productById.get(row.product_id);
      return {
        id: row.id, planNo: row.plan_no, plannedDate: row.planned_date,
        productCode: product?.code ?? "", productName: product?.name ?? "",
        productionLine: lineById.get(row.production_line_id) ?? "",
        plannedQuantity: Number(row.planned_quantity), unit: row.unit,
        startTime: String(row.start_time).slice(0, 5), endTime: String(row.end_time).slice(0, 5),
        priority: row.priority, planStatus: row.plan_status, materialReadiness: row.material_readiness,
        manager: row.manager_name || (row.manager_user_id ? userById.get(row.manager_user_id) : "") || "",
        remarks: row.remarks ?? undefined,
      };
    }),
    workOrders: (workOrders.data ?? []).map((row) => {
      const product = productById.get(row.product_id);
      return {
        id: row.id, workOrderNo: row.work_order_no, planNo: planById.get(row.production_plan_id) ?? "",
        plannedDate: row.planned_date, productCode: product?.code ?? "", productName: product?.name ?? "",
        productionLine: lineById.get(row.production_line_id) ?? "", orderedQuantity: Number(row.ordered_quantity),
        unit: row.unit, startTime: String(row.start_time).slice(0, 5), endTime: String(row.end_time).slice(0, 5),
        handler: row.handler_name || (row.handler_user_id ? userById.get(row.handler_user_id) : "") || "",
        materialIssueStatus: row.material_issue_status, workStatus: row.work_status,
        actualStartTime: row.actual_start_time ?? undefined, actualEndTime: row.actual_end_time ?? undefined,
        currentQuantity: Number(row.current_quantity), pauseReason: row.pause_reason ?? undefined,
        pausedAt: row.paused_at ?? undefined, remarks: row.remarks ?? undefined,
      };
    }),
    results: (results.data ?? []).map((row) => {
      const product = productById.get(row.product_id);
      return {
        id: row.id, resultNo: row.result_no, workOrderNo: workOrderById.get(row.work_order_id) ?? "",
        productionDate: row.production_date, productCode: product?.code ?? "", productName: product?.name ?? "",
        productionLine: lineById.get(row.production_line_id) ?? "", orderedQuantity: Number(row.ordered_quantity),
        totalQuantity: Number(row.total_quantity), goodQuantity: Number(row.good_quantity),
        defectQuantity: Number(row.defect_quantity), reworkQuantity: Number(row.rework_quantity),
        achievementRate: Number(row.achievement_rate), defectRate: Number(row.defect_rate),
        actualStartTime: row.actual_start_time, actualEndTime: row.actual_end_time,
        workingHours: row.working_hours, handler: row.handler_name || (row.handler_user_id ? userById.get(row.handler_user_id) : "") || "",
        resultStatus: row.result_status, defectBreakdown: defectsByResult.get(row.id) ?? [], remarks: row.remarks ?? undefined,
      };
    }),
    fgLots: (lots.data ?? []).map((row) => {
      const product = productById.get(row.product_id);
      return {
        id: row.id, fgLotNo: row.fg_lot_no, resultNo: resultById.get(row.production_result_id) ?? "",
        workOrderNo: workOrderById.get(row.work_order_id) ?? "", productionDate: row.production_date,
        productCode: product?.code ?? "", productName: product?.name ?? "",
        productionLine: lineById.get(row.production_line_id) ?? "", totalQuantity: Number(row.total_quantity),
        goodQuantity: Number(row.good_quantity), unit: row.unit, expirationDate: row.expiration_date,
        qualityStatus: row.quality_status, isReleaseAvailable: row.is_release_available,
      };
    }),
  };
}

export async function saveProductionPlan(plan: ProductionPlan) {
  const productId = await idBy("products", "code", plan.productCode);
  const lineId = await idBy("production_lines", "name", plan.productionLine);
  const managerId = await idBy("business_users", "name", plan.manager);
  if (!productId || !lineId) throw new Error("생산계획 관계 ID를 찾을 수 없습니다.");
  const { error } = await supabase.from("production_plans").upsert({
    id: plan.id, plan_no: plan.planNo, planned_date: plan.plannedDate, product_id: productId,
    production_line_id: lineId, planned_quantity: plan.plannedQuantity, unit: plan.unit,
    start_time: plan.startTime, end_time: plan.endTime, priority: plan.priority,
    plan_status: plan.planStatus, material_readiness: plan.materialReadiness,
    manager_user_id: managerId, manager_name: plan.manager, remarks: plan.remarks || null,
  }, { onConflict: "id" });
  throwIfError(error);
}

export async function saveWorkOrder(workOrder: WorkOrder) {
  const planId = await idBy("production_plans", "plan_no", workOrder.planNo);
  const productId = await idBy("products", "code", workOrder.productCode);
  const lineId = await idBy("production_lines", "name", workOrder.productionLine);
  const handlerId = await idBy("business_users", "name", workOrder.handler);
  if (!planId || !productId || !lineId) throw new Error("작업지시 관계 ID를 찾을 수 없습니다.");
  const { error } = await supabase.from("work_orders").upsert({
    id: workOrder.id, work_order_no: workOrder.workOrderNo, production_plan_id: planId,
    planned_date: workOrder.plannedDate, product_id: productId, production_line_id: lineId,
    ordered_quantity: workOrder.orderedQuantity, unit: workOrder.unit, start_time: workOrder.startTime,
    end_time: workOrder.endTime, handler_user_id: handlerId, handler_name: workOrder.handler,
    material_issue_status: workOrder.materialIssueStatus, work_status: workOrder.workStatus,
    actual_start_time: workOrder.actualStartTime || null, actual_end_time: workOrder.actualEndTime || null,
    current_quantity: workOrder.currentQuantity, pause_reason: workOrder.pauseReason || null,
    paused_at: workOrder.pausedAt || null, remarks: workOrder.remarks || null,
  }, { onConflict: "id" });
  throwIfError(error);
}

export async function saveProductionResult(result: ProductionResult) {
  const workOrderId = await idBy("work_orders", "work_order_no", result.workOrderNo);
  const productId = await idBy("products", "code", result.productCode);
  const lineId = await idBy("production_lines", "name", result.productionLine);
  const handlerId = await idBy("business_users", "name", result.handler);
  if (!workOrderId || !productId || !lineId) throw new Error("생산실적 관계 ID를 찾을 수 없습니다.");
  const { error } = await supabase.from("production_results").upsert({
    id: result.id, result_no: result.resultNo, work_order_id: workOrderId, production_date: result.productionDate,
    product_id: productId, production_line_id: lineId, ordered_quantity: result.orderedQuantity,
    total_quantity: result.totalQuantity, good_quantity: result.goodQuantity, defect_quantity: result.defectQuantity,
    rework_quantity: result.reworkQuantity, achievement_rate: result.achievementRate, defect_rate: result.defectRate,
    actual_start_time: result.actualStartTime, actual_end_time: result.actualEndTime,
    working_hours: result.workingHours, handler_user_id: handlerId, handler_name: result.handler,
    result_status: result.resultStatus, remarks: result.remarks || null,
  }, { onConflict: "id" });
  throwIfError(error);
  for (const defect of result.defectBreakdown) {
    const { error: defectError } = await supabase.from("production_result_defects").upsert({
      id: `${result.id}-${defect.type}`, production_result_id: result.id,
      defect_type: defect.type, quantity: defect.quantity,
    }, { onConflict: "production_result_id,defect_type" });
    throwIfError(defectError);
  }
}

export async function saveFinishedGoodsLot(lot: FinishedGoodsLot) {
  const resultId = await idBy("production_results", "result_no", lot.resultNo);
  const workOrderId = await idBy("work_orders", "work_order_no", lot.workOrderNo);
  const productId = await idBy("products", "code", lot.productCode);
  const lineId = await idBy("production_lines", "name", lot.productionLine);
  if (!resultId || !workOrderId || !productId || !lineId) throw new Error("완제품 LOT 관계 ID를 찾을 수 없습니다.");
  const { error } = await supabase.from("finished_goods_lots").upsert({
    id: lot.id, fg_lot_no: lot.fgLotNo, production_result_id: resultId, work_order_id: workOrderId,
    production_date: lot.productionDate, product_id: productId, production_line_id: lineId,
    total_quantity: lot.totalQuantity, good_quantity: lot.goodQuantity, unit: lot.unit,
    expiration_date: lot.expirationDate, quality_status: lot.qualityStatus,
    is_release_available: lot.isReleaseAvailable,
  }, { onConflict: "id" });
  throwIfError(error);
}
