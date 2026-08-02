import type { MaterialRequirement, ProductionPlan } from "@/types/production";
import type { Material } from "@/types/master-data";
import type { MaterialOutbound, MaterialInventory } from "@/types/materials";
import { PRODUCT_BOM } from "@/data/production-bom";
import { calculateAchievementRate, calculateDefectRate } from "./selectors/production-selectors";

export { calculateAchievementRate, calculateDefectRate };

// ============================================================
// 생산관리 — 수량 및 시간 계산 유틸리티 (Live Context 연동)
// ============================================================

/** 시간 중복 검사 */
export function hasTimeOverlap(
  plans: ProductionPlan[],
  candidate: Pick<
    ProductionPlan,
    "plannedDate" | "productionLine" | "startTime" | "endTime"
  > & { id?: string }
): boolean {
  return plans.some((p) => {
    if (p.id === candidate.id) return false;
    if (
      p.productionLine !== candidate.productionLine ||
      p.plannedDate !== candidate.plannedDate
    ) {
      return false;
    }
    if (p.planStatus === "CANCELLED") return false;
    return candidate.startTime < p.endTime && candidate.endTime > p.startTime;
  });
}

/** 실제 작업시간(시간 단위) 계산 */
export function calculateWorkingHours(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "8시간 00분";
  const startClock = startTime.includes(" ") ? startTime.split(" ")[1] : startTime;
  const endClock = endTime.includes(" ") ? endTime.split(" ")[1] : endTime;
  const [sH, sM] = startClock.split(":").map(Number);
  const [eH, eM] = endClock.split(":").map(Number);
  const startMins = (sH || 0) * 60 + (sM || 0);
  const endMins = (eH || 0) * 60 + (eM || 0);
  const diffMins = Math.max(0, endMins - startMins);
  return `${Math.floor(diffMins / 60)}시간 ${String(diffMins % 60).padStart(2, "0")}분`;
}

/** BOM 기준 예상 자재 소요량 계산 */
export function calculateMaterialRequirements(
  productCode: string,
  orderedQuantity: number,
  workOrderNo?: string,
  contextData?: {
    materials?: Material[];
    outbounds?: MaterialOutbound[];
    inventories?: MaterialInventory[];
  }
): MaterialRequirement[] {
  const materialsList = contextData?.materials ?? [];
  const outboundList = contextData?.outbounds ?? [];
  const inventoryList = contextData?.inventories ?? [];

  const bomItems = PRODUCT_BOM.filter((b) => b.productCode === productCode);

  return bomItems.map((bom) => {
    const matInfo = materialsList.find((m) => m.code === bom.materialCode);
    const materialName = matInfo ? matInfo.name : bom.materialCode;
    const unit = matInfo ? matInfo.unit : "개";

    // 필요 수량 = 기준 소요량 × 지시 수량 ÷ 1,000
    const rawRequired = (bom.baseQuantity * orderedQuantity) / 1000;
    // 단위가 '판'인 경우 정수 반올림, 'kg'는 소수점 1자리
    const requiredQuantity =
      unit === "판" ? Math.ceil(rawRequired) : Math.round(rawRequired * 10) / 10;

    // 자재관리의 실제 출고 기록 확인
    let issuedQuantity = 0;
    if (workOrderNo) {
      const matchingOutbounds = outboundList.filter(
        (out) =>
          out.workOrderNo === workOrderNo &&
          out.materialCode === bom.materialCode &&
          out.outboundStatus === "COMPLETED"
      );
      issuedQuantity = matchingOutbounds.reduce((sum, out) => sum + out.quantity, 0);
    }

    // 자재관리의 현재 재고 보유량 확인
    const matInventories = inventoryList.filter(
      (inv) => inv.materialCode === bom.materialCode && inv.inspectionStatus === "PASSED"
    );
    const currentStock = matInventories.reduce((sum, inv) => sum + (inv.availableStock ?? inv.currentStock), 0);

    // 자재 출고 상태 판단
    let status: MaterialRequirement["status"] = "NOT_ISSUED";
    if (issuedQuantity >= requiredQuantity) {
      status = "ISSUED";
    } else if (issuedQuantity > 0) {
      status = "PARTIALLY_ISSUED";
    } else if (currentStock < requiredQuantity) {
      status = "SHORTAGE";
    }

    return {
      materialCode: bom.materialCode,
      materialName,
      unit,
      requiredQuantity,
      issuedQuantity,
      currentStock,
      status,
    };
  });
}

/** 생산계획 항목 전체의 자재 준비 상태 판단 */
export function checkPlanMaterialReadiness(
  plan: ProductionPlan,
  contextData?: {
    materials?: Material[];
    outbounds?: MaterialOutbound[];
    inventories?: MaterialInventory[];
  }
): "READY" | "PARTIAL" | "SHORTAGE" {
  const reqs = calculateMaterialRequirements(plan.productCode, plan.plannedQuantity, undefined, contextData);
  const hasShortage = reqs.some((r) => r.status === "SHORTAGE");
  const hasIssued = reqs.some((r) => r.issuedQuantity > 0);

  if (hasShortage) return "SHORTAGE";
  if (hasIssued) return "PARTIAL";
  return "READY";
}

/** 계획 수량과 사이클 타임(초)을 기반으로 예상 소요시간(시간) 계산 */
export function calculateEstimatedHours(quantity: number, cycleTimeSeconds: number = 2.5): number {
  if (quantity <= 0) return 0;
  const totalSeconds = quantity * cycleTimeSeconds;
  const hours = totalSeconds / 3600;
  return Math.round(hours * 10) / 10;
}
