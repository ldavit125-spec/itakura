"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from "react";
import type {
  ProductionTab,
  ProductionPlan,
  WorkOrder,
  ProductionResult,
  FinishedGoodsLot,
  ProductionSummary,
  ProductionToastState,
  WorkStatus,
} from "@/types/production";
import { useMasterData } from "./MasterDataContext";
import { useMaterials } from "./MaterialsContext";
import { useAdmin } from "./AdminContext";
import {
  fetchProductionSnapshot,
  saveFinishedGoodsLot,
  saveProductionPlan,
  saveProductionResult,
  saveWorkOrder,
} from "@/lib/supabase/production";

import {
  calculateMaterialRequirements,
  hasTimeOverlap,
  calculateAchievementRate,
  calculateDefectRate,
  calculateWorkingHours,
} from "@/lib/production-calculations";
import {
  generatePlanNo,
  generateWorkOrderNo,
  generateResultNo,
  generateFGLotNo,
} from "@/lib/production-number-generator";
import { calculateFGExpirationDate } from "@/constants/production-rules";
import {
  getBusinessDate,
  getProductionPlansByDateRange,
  getProductionResultsByDateRange,
  getPlannedQuantity,
  getProducedQuantity,
  calculateAchievementRate as calculateAggregateAchievementRate,
} from "@/lib/common-selectors";

// ============================================================
// 생산관리 통합 Context 인터페이스
// ============================================================

interface ProductionContextType {
  activeTab: ProductionTab;
  setActiveTab: (tab: ProductionTab) => void;
  plans: ProductionPlan[];
  workOrders: WorkOrder[];
  results: ProductionResult[];
  fgLots: FinishedGoodsLot[];
  summary: ProductionSummary;
  toast: ProductionToastState | null;
  showToast: (message: string, type?: "success" | "error") => void;
  closeToast: () => void;
  productionLoading: boolean;
  productionError: string | null;
  refreshProduction: () => Promise<void>;

  // 탭 1: 생산계획
  addPlan: (plan: Omit<ProductionPlan, "id" | "planNo" | "planStatus" | "materialReadiness">) => boolean;
  updatePlan: (id: string, plan: Partial<ProductionPlan>) => boolean;
  confirmPlan: (id: string) => boolean;
  cancelPlan: (id: string) => void;

  // 탭 2: 작업지시
  createWorkOrderFromPlan: (planId: string, handler: string) => boolean;
  assignHandler: (workOrderId: string, handler: string) => void;
  markWorkOrderReady: (workOrderId: string) => void;
  cancelWorkOrder: (workOrderId: string) => void;

  // 탭 3: 생산 진행
  startWorkOrder: (workOrderId: string) => boolean;
  pauseWorkOrder: (workOrderId: string, reason: string) => void;
  resumeWorkOrder: (workOrderId: string) => void;
  updateCurrentQuantity: (workOrderId: string, quantity: number) => void;
  completeWorkOrderRequest: (workOrderId: string) => void;

  // 탭 4: 생산실적
  createProductionResult: (
    resultData: Omit<
      ProductionResult,
      "id" | "resultNo" | "achievementRate" | "defectRate" | "workingHours" | "resultStatus"
    >
  ) => boolean;
  confirmProductionResult: (resultId: string) => boolean;
  updateWorkOrderQualityStatus: (
    workOrderNo: string,
    status: WorkStatus,
    remarks?: string
  ) => void;
  updateFinishedGoodsLotQuality: (
    fgLotNo: string,
    qualityStatus: FinishedGoodsLot["qualityStatus"],
    isReleaseAvailable: boolean
  ) => void;

  // 탭 5: 완제품 LOT
  // (실적 확정 시 자동 생성)
}

const ProductionContext = createContext<ProductionContextType | null>(null);

export function ProductionProvider({ children }: { children: React.ReactNode }) {
  const { materials } = useMasterData();
  const { outbounds, inventories } = useMaterials();
  const { currentUser } = useAdmin();
  const [activeTab, setActiveTab] = useState<ProductionTab>("plan");
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [results, setResults] = useState<ProductionResult[]>([]);
  const [fgLots, setFgLots] = useState<FinishedGoodsLot[]>([]);
  const [toast, setToast] = useState<ProductionToastState | null>(null);
  const [productionLoading, setProductionLoading] = useState(true);
  const [productionError, setProductionError] = useState<string | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  };
  const closeToast = () => setToast(null);

  const refreshProduction = useCallback(async () => {
    await Promise.resolve();
    setProductionLoading(true);
    setProductionError(null);
    try {
      const snapshot = await fetchProductionSnapshot();
      setPlans(snapshot.plans);
      setWorkOrders(snapshot.workOrders);
      setResults(snapshot.results);
      setFgLots(snapshot.fgLots);
    } catch (error) {
      setProductionError(error instanceof Error ? error.message : "생산 데이터를 불러오지 못했습니다.");
    } finally {
      setProductionLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshProduction(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshProduction]);

  const persist = (operation: () => Promise<void>) => {
    void operation()
      .then(refreshProduction)
      .catch((error) => showToast(error instanceof Error ? error.message : "Supabase 저장에 실패했습니다.", "error"));
  };

  // ── 0. 동적 상단 요약 카드 집계 ─────────────────────────────
  const summary = useMemo<ProductionSummary>(() => {
    const todayStr = getBusinessDate();

    const todayPlans = getProductionPlansByDateRange(plans, todayStr, todayStr);
    const todayPlanCount = todayPlans.length;
    const todayPlannedQty = getPlannedQuantity(todayPlans);

    const inProgressCount = workOrders.filter((w) => w.workStatus === "IN_PROGRESS").length;

    const todayResults = getProductionResultsByDateRange(results, todayStr, todayStr);
    const todayResultQty = getProducedQuantity(todayResults);

    const avgAchievementRate = calculateAggregateAchievementRate(
      todayResultQty,
      todayPlannedQty
    );

    const materialNotReadyCount = workOrders.filter(
      (w) => w.materialIssueStatus !== "ISSUED" && w.workStatus !== "CANCELLED" && w.workStatus !== "COMPLETED"
    ).length;

    return {
      todayPlanCount,
      todayPlannedQty,
      inProgressCount,
      todayResultQty,
      avgAchievementRate,
      materialNotReadyCount,
    };
  }, [plans, workOrders, results]);

  const updateWorkOrderQualityStatus = (
    workOrderNo: string,
    status: WorkStatus,
    remarks?: string
  ) => {
    const target = workOrders.find((workOrder) => workOrder.workOrderNo === workOrderNo);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: status, remarks: remarks ?? target.remarks }));
    setWorkOrders((prev) =>
      prev.map((workOrder) =>
        workOrder.workOrderNo === workOrderNo
          ? { ...workOrder, workStatus: status, remarks: remarks ?? workOrder.remarks }
          : workOrder
      )
    );
  };

  const updateFinishedGoodsLotQuality = (
    fgLotNo: string,
    qualityStatus: FinishedGoodsLot["qualityStatus"],
    isReleaseAvailable: boolean
  ) => {
    const target = fgLots.find((lot) => lot.fgLotNo === fgLotNo);
    if (target) persist(() => saveFinishedGoodsLot({ ...target, qualityStatus, isReleaseAvailable }));
    setFgLots((prev) =>
      prev.map((lot) =>
        lot.fgLotNo === fgLotNo
          ? { ...lot, qualityStatus, isReleaseAvailable }
          : lot
      )
    );
  };

  // ── 탭 1: 생산계획 핸들러 ────────────────────────────────────
  const addPlan = (
    planData: Omit<ProductionPlan, "id" | "planNo" | "planStatus" | "materialReadiness">
  ): boolean => {
    // 동일 라인 시간 중복 검사
    if (
      hasTimeOverlap(plans, {
        plannedDate: planData.plannedDate,
        productionLine: planData.productionLine,
        startTime: planData.startTime,
        endTime: planData.endTime,
      })
    ) {
      showToast(
        `[${planData.productionLine}] 해당 시간대(${planData.startTime}~${planData.endTime})에 이미 다른 확정/등록된 계획이 존재합니다.`,
        "error"
      );
      return false;
    }

    const seq = plans.length + 1;
    const planNo = generatePlanNo(planData.plannedDate, seq);

    const newPlan: ProductionPlan = {
      id: `plan-${Date.now()}`,
      planNo,
      planStatus: "DRAFT",
      materialReadiness: "READY",
      ...planData,
    };

    setPlans((prev) => [newPlan, ...prev]);
    persist(() => saveProductionPlan(newPlan));
    showToast(`신규 생산계획(${planNo})이 정상 등록되었습니다.`);
    return true;
  };

  const updatePlan = (id: string, planData: Partial<ProductionPlan>): boolean => {
    const target = plans.find((p) => p.id === id);
    if (!target) return false;
    if (target.planStatus !== "DRAFT") {
      showToast("작성 중(DRAFT) 상태인 생산계획만 수정할 수 있습니다.", "error");
      return false;
    }

    const merged = { ...target, ...planData };

    if (
      hasTimeOverlap(plans, {
        id,
        plannedDate: merged.plannedDate,
        productionLine: merged.productionLine,
        startTime: merged.startTime,
        endTime: merged.endTime,
      })
    ) {
      showToast(
        `[${merged.productionLine}] 해당 시간대(${merged.startTime}~${merged.endTime})에 시간 중복이 있습니다.`,
        "error"
      );
      return false;
    }

    setPlans((prev) => prev.map((p) => (p.id === id ? merged : p)));
    persist(() => saveProductionPlan(merged));
    showToast(`생산계획(${target.planNo}) 수정이 완료되었습니다.`);
    return true;
  };

  const confirmPlan = (id: string): boolean => {
    const target = plans.find((p) => p.id === id);
    if (!target) return false;

    if (
      hasTimeOverlap(plans, {
        id,
        plannedDate: target.plannedDate,
        productionLine: target.productionLine,
        startTime: target.startTime,
        endTime: target.endTime,
      })
    ) {
      showToast(
        `[${target.productionLine}] 동일 날짜/시간대에 확정된 계획이 중복되어 확정할 수 없습니다.`,
        "error"
      );
      return false;
    }

    const confirmed = { ...target, planStatus: "CONFIRMED" as const };
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, planStatus: "CONFIRMED" } : p))
    );
    persist(() => saveProductionPlan(confirmed));
    showToast(`생산계획(${target.planNo})이 확정 처리되었습니다.`);
    return true;
  };

  const cancelPlan = (id: string) => {
    const target = plans.find((plan) => plan.id === id);
    if (target) persist(() => saveProductionPlan({ ...target, planStatus: "CANCELLED" }));
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, planStatus: "CANCELLED" } : p))
    );
    showToast("생산계획이 취소되었습니다.");
  };

  // ── 탭 2: 작업지시 핸들러 ────────────────────────────────────
  const createWorkOrderFromPlan = (planId: string, handler: string): boolean => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return false;

    // 이미 생성된 작업지시 중복 체크
    const exists = workOrders.some((w) => w.planNo === plan.planNo && w.workStatus !== "CANCELLED");
    if (exists) {
      showToast(`동일한 생산계획(${plan.planNo})에서 이미 작업지시가 생성되었습니다.`, "error");
      return false;
    }

    const seq = workOrders.length + 1;
    const workOrderNo = generateWorkOrderNo(plan.plannedDate, seq);

    // BOM 기준 자재 소요량 및 출고 현황 계산
    const reqs = calculateMaterialRequirements(plan.productCode, plan.plannedQuantity, workOrderNo, {
      materials,
      outbounds,
      inventories,
    });

    let issueStatus: WorkOrder["materialIssueStatus"] = "ISSUED";
    if (reqs.some((r) => r.status === "SHORTAGE")) {
      issueStatus = "SHORTAGE";
    } else if (reqs.some((r) => r.status === "PARTIALLY_ISSUED" || r.status === "NOT_ISSUED")) {
      issueStatus = reqs.every((r) => r.status === "NOT_ISSUED") ? "NOT_ISSUED" : "PARTIALLY_ISSUED";
    }

    const newWO: WorkOrder = {
      id: `wo-${Date.now()}`,
      workOrderNo,
      planNo: plan.planNo,
      plannedDate: plan.plannedDate,
      productCode: plan.productCode,
      productName: plan.productName,
      productionLine: plan.productionLine,
      orderedQuantity: plan.plannedQuantity,
      unit: plan.unit,
      startTime: plan.startTime,
      endTime: plan.endTime,
      handler: handler || currentUser.name,
      materialIssueStatus: issueStatus,
      workStatus: "WAITING",
      currentQuantity: 0,
      remarks: plan.remarks,
    };

    setWorkOrders((prev) => [newWO, ...prev]);
    persist(() => saveWorkOrder(newWO));
    showToast(`확정계획(${plan.planNo}) 기반 작업지시서(${workOrderNo})가 성공적으로 발행되었습니다.`);
    return true;
  };

  const assignHandler = (workOrderId: string, handler: string) => {
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, handler }));
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === workOrderId ? { ...w, handler } : w))
    );
    showToast("작업지시 담당자가 지정되었습니다.");
  };

  const markWorkOrderReady = (workOrderId: string) => {
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: "READY" }));
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === workOrderId ? { ...w, workStatus: "READY" } : w))
    );
    showToast("작업 준비 완료 처리되었습니다.");
  };

  const cancelWorkOrder = (workOrderId: string) => {
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: "CANCELLED" }));
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === workOrderId ? { ...w, workStatus: "CANCELLED" } : w))
    );
    showToast("작업지시가 취소 처리되었습니다.");
  };

  // ── 탭 3: 생산 진행 핸들러 ────────────────────────────────────
  const startWorkOrder = (workOrderId: string): boolean => {
    const wo = workOrders.find((w) => w.id === workOrderId);
    if (!wo) return false;

    // 작업 시작 검증 조건 3가지:
    // 1. workStatus === 'READY'
    // 2. materialIssueStatus === 'ISSUED'
    // 3. handler 필수
    if (wo.workStatus !== "READY") {
      showToast("작업 상태가 '작업 준비 완료'일 때만 작업을 시작할 수 있습니다.", "error");
      return false;
    }
    if (wo.materialIssueStatus !== "ISSUED") {
      showToast(
        `자재 출고 상태가 완료(ISSUED)되어야 시작할 수 있습니다. (현재: ${wo.materialIssueStatus})`,
        "error"
      );
      return false;
    }
    if (!wo.handler || wo.handler.trim() === "") {
      showToast("담당자가 배정되지 않아 작업을 시작할 수 없습니다.", "error");
      return false;
    }

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const startedWorkOrder: WorkOrder = {
      ...wo,
      workStatus: "IN_PROGRESS",
      actualStartTime: wo.actualStartTime || nowStr,
    };
    const linkedPlan = plans.find((plan) => plan.planNo === wo.planNo);
    persist(async () => {
      await saveWorkOrder(startedWorkOrder);
      if (linkedPlan) await saveProductionPlan({ ...linkedPlan, planStatus: "IN_PROGRESS" });
    });

    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? {
              ...w,
              workStatus: "IN_PROGRESS",
              actualStartTime: wo.actualStartTime || nowStr,
            }
          : w
      )
    );

    // 연동된 계획의 상태도 'IN_PROGRESS'로 업데이트
    setPlans((prev) =>
      prev.map((p) => (p.planNo === wo.planNo ? { ...p, planStatus: "IN_PROGRESS" } : p))
    );

    showToast(`작업지시 [${wo.workOrderNo}] 생산이 시작되었습니다.`);
    return true;
  };

  const pauseWorkOrder = (workOrderId: string, reason: string) => {
    const pausedAt = new Date().toISOString().replace("T", " ").substring(0, 16);
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: "PAUSED", pauseReason: reason, pausedAt }));
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? { ...w, workStatus: "PAUSED", pauseReason: reason, pausedAt }
          : w
      )
    );
    showToast(`작업이 일시정지 되었습니다. 사유: ${reason}`);
  };

  const resumeWorkOrder = (workOrderId: string) => {
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: "IN_PROGRESS" }));
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === workOrderId ? { ...w, workStatus: "IN_PROGRESS" } : w))
    );
    showToast("작업이 재개되었습니다.");
  };

  const updateCurrentQuantity = (workOrderId: string, quantity: number) => {
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, currentQuantity: quantity }));
    setWorkOrders((prev) =>
      prev.map((w) => (w.id === workOrderId ? { ...w, currentQuantity: quantity } : w))
    );
  };

  const completeWorkOrderRequest = (workOrderId: string) => {
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const target = workOrders.find((workOrder) => workOrder.id === workOrderId);
    if (target) persist(() => saveWorkOrder({ ...target, workStatus: "COMPLETED", actualEndTime: nowStr }));
    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === workOrderId
          ? { ...w, workStatus: "COMPLETED", actualEndTime: nowStr }
          : w
      )
    );
    showToast("작업 완수가 요청되어 실적 입력 단계로 이동합니다.");
  };

  // ── 탭 4: 생산실적 핸들러 ────────────────────────────────────
  const createProductionResult = (
    resultData: Omit<
      ProductionResult,
      "id" | "resultNo" | "achievementRate" | "defectRate" | "workingHours" | "resultStatus"
    >
  ): boolean => {
    // 1. 총 생산량 > 0 검증
    if (resultData.totalQuantity <= 0) {
      showToast("총 생산량은 0보다 커야 합니다.", "error");
      return false;
    }

    // 2. 양품 + 불량 + 재작업 = 총생산량 엄격 검증
    const sum =
      resultData.goodQuantity + resultData.defectQuantity + resultData.reworkQuantity;
    if (sum !== resultData.totalQuantity) {
      showToast(
        `양품(${resultData.goodQuantity}) + 불량(${resultData.defectQuantity}) + 재작업(${resultData.reworkQuantity})의 합계(${sum})가 총 생산량(${resultData.totalQuantity})과 일치해야 합니다.`,
        "error"
      );
      return false;
    }

    // 3. 동일 작업지시에 실적 중복 등록 금지
    const exists = results.some((r) => r.workOrderNo === resultData.workOrderNo);
    if (exists) {
      showToast(`이미 실적이 등록된 작업지시(${resultData.workOrderNo})입니다.`, "error");
      return false;
    }

    const seq = results.length + 1;
    const resultNo = generateResultNo(resultData.productionDate, seq);

    const achievementRate = calculateAchievementRate(
      resultData.totalQuantity,
      resultData.orderedQuantity
    );
    const defectRate = calculateDefectRate(
      resultData.defectQuantity,
      resultData.totalQuantity
    );
    const workingHours = calculateWorkingHours(
      resultData.actualStartTime,
      resultData.actualEndTime
    );

    const newResult: ProductionResult = {
      id: `res-${Date.now()}`,
      resultNo,
      resultStatus: "DRAFT",
      achievementRate,
      defectRate,
      workingHours,
      ...resultData,
    };

    setResults((prev) => [newResult, ...prev]);
    persist(() => saveProductionResult(newResult));
    showToast(`생산실적(${resultNo})이 임시저장(DRAFT) 되었습니다.`);
    return true;
  };

  const confirmProductionResult = (resultId: string): boolean => {
    const target = results.find((r) => r.id === resultId);
    if (!target) return false;

    // 1. 실적 상태 CONFIRMED 로 변경
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, resultStatus: "CONFIRMED" } : r))
    );

    // 2. 연동된 작업지시 및 생산계획 상태 COMPLETED 로 변경
    setWorkOrders((prev) =>
      prev.map((w) => (w.workOrderNo === target.workOrderNo ? { ...w, workStatus: "COMPLETED" } : w))
    );
    const wo = workOrders.find((w) => w.workOrderNo === target.workOrderNo);
    if (wo) {
      setPlans((prev) =>
        prev.map((p) => (p.planNo === wo.planNo ? { ...p, planStatus: "COMPLETED" } : p))
      );
    }

    // 3. 완제품 LOT 자동 생성
    const fgSeq = fgLots.length + 1;
    const fgLotNo = generateFGLotNo(target.productCode, target.productionDate, fgSeq);
    const expirationDate = calculateFGExpirationDate(target.productCode, target.productionDate);

    const newFGLot: FinishedGoodsLot = {
      id: `fg-${Date.now()}`,
      fgLotNo,
      resultNo: target.resultNo,
      workOrderNo: target.workOrderNo,
      productionDate: target.productionDate,
      productCode: target.productCode,
      productName: target.productName,
      productionLine: target.productionLine,
      totalQuantity: target.totalQuantity,
      goodQuantity: target.goodQuantity,
      unit: "개",
      expirationDate,
      qualityStatus: "PENDING",
      isReleaseAvailable: false,
    };

    setFgLots((prev) => [newFGLot, ...prev]);
    persist(async () => {
      await saveProductionResult({ ...target, resultStatus: "CONFIRMED" });
      if (wo) {
        await saveWorkOrder({ ...wo, workStatus: "COMPLETED" });
        const linkedPlan = plans.find((plan) => plan.planNo === wo.planNo);
        if (linkedPlan) await saveProductionPlan({ ...linkedPlan, planStatus: "COMPLETED" });
      }
      await saveFinishedGoodsLot(newFGLot);
    });
    showToast(`생산실적(${target.resultNo}) 확정 완료! 완제품 LOT [${fgLotNo}]가 자동 생성되었습니다.`);
    return true;
  };

  return (
    <ProductionContext.Provider
      value={{
        activeTab,
        setActiveTab,
        plans,
        workOrders,
        results,
        fgLots,
        summary,
        toast,
        showToast,
        closeToast,
        productionLoading,
        productionError,
        refreshProduction,
        addPlan,
        updatePlan,
        confirmPlan,
        cancelPlan,
        createWorkOrderFromPlan,
        assignHandler,
        markWorkOrderReady,
        cancelWorkOrder,
        startWorkOrder,
        pauseWorkOrder,
        resumeWorkOrder,
        updateCurrentQuantity,
        completeWorkOrderRequest,
        createProductionResult,
        confirmProductionResult,
        updateWorkOrderQualityStatus,
        updateFinishedGoodsLotQuality,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error("useProduction must be used within a ProductionProvider");
  }
  return context;
}
