"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProduction } from "@/context/ProductionContext";
import type {
  PlanModalState,
  WorkOrderModalState,
  ProgressModalState,
  ResultModalState,
  FGLotDetailModalState,
  ProductionPlan,
  WorkOrder,
} from "@/types/production";

import ProductionSummaryCards from "./ProductionSummaryCards";
import ProductionTabs from "./ProductionTabs";

import ProductionPlanTable from "./ProductionPlanTable";
import ProductionPlanModal from "./ProductionPlanModal";
import ProductionPlanDetailModal from "./ProductionPlanDetailModal";

import WorkOrderTable from "./WorkOrderTable";
import WorkOrderDetailModal from "./WorkOrderDetailModal";

import ProductionProgressTable from "./ProductionProgressTable";
import ProductionProgressModal from "./ProductionProgressModal";
import ProductionPauseModal from "./ProductionPauseModal";

import ProductionResultModal from "./ProductionResultModal";
import ProductionPerformanceAnalytics from "./ProductionPerformanceAnalytics";

import FinishedGoodsLotTable from "./FinishedGoodsLotTable";
import FinishedGoodsLotDetailModal from "./FinishedGoodsLotDetailModal";

import ProductionToast from "./ProductionToast";
import { useAdmin } from "@/context/AdminContext";
import { useQuality } from "@/context/QualityContext";

// ============================================================
// 생산관리 통합 클라이언트 컨테이너
// ============================================================

export default function ProductionClient() {
  const router = useRouter();
  const { canAccessProductionLine, hasPermission, currentUser } = useAdmin();
  const { defectHistory } = useQuality();
  const {
    activeTab,
    setActiveTab,
    plans,
    workOrders,
    results,
    fgLots,
    summary,
    toast,
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
  } = useProduction();
  const scopedPlans = useMemo(() => plans.filter((item) => canAccessProductionLine(item.productionLine)), [plans, canAccessProductionLine]);
  const scopedWorkOrders = useMemo(() => workOrders.filter((item) => canAccessProductionLine(item.productionLine)), [workOrders, canAccessProductionLine]);
  const scopedResults = useMemo(() => results.filter((item) => canAccessProductionLine(item.productionLine)), [results, canAccessProductionLine]);
  const scopedFgLots = useMemo(() => fgLots.filter((item) => canAccessProductionLine(item.productionLine)), [fgLots, canAccessProductionLine]);

  // 모달 상태관리
  const [planModal, setPlanModal] = useState<PlanModalState>({ isOpen: false, mode: "create" });
  const [planDetailModal, setPlanDetailModal] = useState<{ isOpen: boolean; item?: ProductionPlan }>({ isOpen: false });

  const [workOrderModal, setWorkOrderModal] = useState<WorkOrderModalState>({ isOpen: false, mode: "detail" });

  const [progressModal, setProgressModal] = useState<ProgressModalState>({ isOpen: false });
  const [pauseTarget, setPauseTarget] = useState<WorkOrder | null>(null);

  const [resultModal, setResultModal] = useState<ResultModalState>({ isOpen: false, mode: "create" });
  const [fgLotDetailModal, setFgLotDetailModal] = useState<FGLotDetailModalState>({ isOpen: false });

  // 자재 출고 화면으로 이동 핸들러
  const handleNavigateToMaterials = () => {
    router.push("/materials");
  };

  // 확정 계획에서 작업지시 생성 핸들러
  const handleCreateWorkOrderFromPlan = (plan: ProductionPlan) => {
    const success = createWorkOrderFromPlan(plan.id, plan.manager || currentUser.name);
    if (success) {
      setActiveTab("work-order");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 6종 요약 카드 */}
      <ProductionSummaryCards summary={summary} />

      {productionLoading && (
        <p className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm text-gray-500">
          Supabase 생산 데이터를 불러오는 중입니다...
        </p>
      )}
      {productionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          생산 데이터를 불러오지 못했습니다: {productionError}
          <button type="button" onClick={() => void refreshProduction()} className="ml-3 font-bold underline">
            다시 시도
          </button>
        </div>
      )}

      {/* 2. 메인 탭 래퍼 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ProductionTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          inProgressCount={summary.inProgressCount}
        />

        {/* 탭 1: 생산계획 */}
        {activeTab === "plan" && (
          <ProductionPlanTable
            plans={scopedPlans}
            onOpenCreate={() => hasPermission("PRODUCTION_CREATE") && setPlanModal({ isOpen: true, mode: "create" })}
            onOpenEdit={(item) => hasPermission("PRODUCTION_UPDATE") && setPlanModal({ isOpen: true, mode: "edit", item })}
            onOpenDetail={(item) => setPlanDetailModal({ isOpen: true, item })}
            onConfirmPlan={(id) => hasPermission("PRODUCTION_APPROVE") && confirmPlan(id)}
            onCancelPlan={(id) => hasPermission("PRODUCTION_UPDATE") && cancelPlan(id)}
            onCreateWorkOrder={(plan) => hasPermission("PRODUCTION_CREATE") && handleCreateWorkOrderFromPlan(plan)}
          />
        )}

        {/* 탭 2: 작업지시 */}
        {activeTab === "work-order" && (
          <WorkOrderTable
            workOrders={scopedWorkOrders}
            onOpenDetail={(item) => setWorkOrderModal({ isOpen: true, mode: "detail", item })}
            onAssignHandler={(item) => setWorkOrderModal({ isOpen: true, mode: "assign", item })}
            onMarkReady={(id) => hasPermission("PRODUCTION_UPDATE") && markWorkOrderReady(id)}
            onCancelWorkOrder={(id) => hasPermission("PRODUCTION_UPDATE") && cancelWorkOrder(id)}
            onNavigateToMaterials={handleNavigateToMaterials}
          />
        )}

        {/* 탭 3: 생산 진행 */}
        {activeTab === "progress" && (
          <ProductionProgressTable
            workOrders={scopedWorkOrders}
            onStartWork={(id) => hasPermission("PRODUCTION_EXECUTE") && startWorkOrder(id)}
            onPauseWork={(item) => hasPermission("PRODUCTION_EXECUTE") && setPauseTarget(item)}
            onResumeWork={(id) => hasPermission("PRODUCTION_EXECUTE") && resumeWorkOrder(id)}
            onOpenQuantityModal={(item) => setProgressModal({ isOpen: true, item })}
            onCompleteRequest={(id) => {
              completeWorkOrderRequest(id);
              setActiveTab("result");
              setResultModal({ isOpen: true, mode: "create" });
            }}
            onOpenDetail={(item) => setWorkOrderModal({ isOpen: true, mode: "detail", item })}
          />
        )}

        {/* 탭 4: 생산실적 */}
        {activeTab === "result" && (
          <ProductionPerformanceAnalytics
            plans={scopedPlans}
            results={scopedResults}
            lots={scopedFgLots}
            defects={defectHistory}
            canCreate={hasPermission("PRODUCTION_CREATE")}
            canApprove={hasPermission("PRODUCTION_APPROVE")}
            onOpenCreate={() => hasPermission("PRODUCTION_CREATE") && setResultModal({ isOpen: true, mode: "create" })}
            onOpenDetail={(item) => setResultModal({ isOpen: true, mode: "detail", item })}
            onConfirmResult={(id) => hasPermission("PRODUCTION_APPROVE") && confirmProductionResult(id)}
          />
        )}

        {/* 탭 5: 완제품 LOT */}
        {activeTab === "fg-lot" && (
          <FinishedGoodsLotTable
            fgLots={scopedFgLots}
            onOpenDetail={(item) => setFgLotDetailModal({ isOpen: true, item })}
          />
        )}
      </div>

      {/* 3. 각 탭 모달 */}
      <ProductionPlanModal
        isOpen={planModal.isOpen}
        mode={planModal.mode}
        item={planModal.item}
        onClose={() => setPlanModal({ isOpen: false, mode: "create" })}
        onSubmit={addPlan}
        onUpdate={updatePlan}
      />

      <ProductionPlanDetailModal
        isOpen={planDetailModal.isOpen}
        item={planDetailModal.item}
        onClose={() => setPlanDetailModal({ isOpen: false })}
        onConfirmPlan={confirmPlan}
        onCreateWorkOrder={handleCreateWorkOrderFromPlan}
      />

      <WorkOrderDetailModal
        isOpen={workOrderModal.isOpen}
        item={workOrderModal.item}
        onClose={() => setWorkOrderModal({ isOpen: false, mode: "detail" })}
        onAssignHandler={assignHandler}
        onMarkReady={markWorkOrderReady}
        onNavigateToMaterials={handleNavigateToMaterials}
      />

      <ProductionProgressModal
        isOpen={progressModal.isOpen}
        item={progressModal.item}
        onClose={() => setProgressModal({ isOpen: false })}
        onSubmit={updateCurrentQuantity}
      />

      {pauseTarget && (
        <ProductionPauseModal
          item={pauseTarget}
          onClose={() => setPauseTarget(null)}
          onSubmit={(workOrderId, reason) => {
            pauseWorkOrder(workOrderId, reason);
            setPauseTarget(null);
          }}
        />
      )}

      <ProductionResultModal
        isOpen={resultModal.isOpen}
        mode={resultModal.mode}
        item={resultModal.item}
        workOrders={scopedWorkOrders}
        onClose={() => setResultModal({ isOpen: false, mode: "create" })}
        onSubmit={createProductionResult}
      />

      <FinishedGoodsLotDetailModal
        isOpen={fgLotDetailModal.isOpen}
        item={fgLotDetailModal.item}
        onClose={() => setFgLotDetailModal({ isOpen: false })}
      />

      {/* 4. Toast 알림 */}
      {toast && <ProductionToast toast={toast} onClose={closeToast} />}
    </div>
  );
}
