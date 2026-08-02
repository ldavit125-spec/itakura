"use client";

import React, { useState } from "react";
import { useQuality } from "@/context/QualityContext";
import type {
  InspectionQueueItem,
  IncomingInspection,
  ProcessInspection,
  FinishedGoodsInspection,
  Nonconformity,
  CorrectiveAction,
  DefectHistory,
} from "@/types/quality";

import QualitySummaryCards from "./QualitySummaryCards";
import QualityTabs from "./QualityTabs";

import InspectionQueueTable from "./InspectionQueueTable";
import InspectionAssignmentModal from "./InspectionAssignmentModal";

import IncomingInspectionTable from "./IncomingInspectionTable";
import IncomingInspectionModal from "./IncomingInspectionModal";
import IncomingInspectionDetailModal from "./IncomingInspectionDetailModal";

import ProcessInspectionTable from "./ProcessInspectionTable";
import ProcessInspectionModal from "./ProcessInspectionModal";
import ProcessInspectionDetailModal from "./ProcessInspectionDetailModal";

import FinishedGoodsInspectionTable from "./FinishedGoodsInspectionTable";
import FinishedGoodsInspectionModal from "./FinishedGoodsInspectionModal";
import FinishedGoodsInspectionDetailModal from "./FinishedGoodsInspectionDetailModal";

import NonconformityTable from "./NonconformityTable";
import NonconformityModal from "./NonconformityModal";
import NonconformityDetailModal from "./NonconformityDetailModal";

import CorrectiveActionTable from "./CorrectiveActionTable";
import CorrectiveActionDetailModal from "./CorrectiveActionDetailModal";

import QualityToast from "./QualityToast";
import { useAdmin } from "@/context/AdminContext";
import DefectHistoryTable from "./DefectHistoryTable";
import DefectHistoryDetailModal from "./DefectHistoryDetailModal";
import QualityStatistics from "./QualityStatistics";
import DefectHistoryCreateModal from "./DefectHistoryCreateModal";
import CorrectiveActionCreateModal from "./CorrectiveActionCreateModal";

// ============================================================
// 품질관리 클라이언트 통합 메인 컨테이너
// ============================================================

export default function QualityClient() {
  const { hasPermission, canAccessProductionLine } = useAdmin();
  const {
    activeTab,
    setActiveTab,
    queue,
    incoming,
    processList,
    finished,
    nonconformities,
    correctiveActions,
    defectHistory,
    defectSummary,
    qualityLoading,
    qualityError,
    refreshQuality,
    updateDefectStatus,
    createDefectHistory,
    summary,
    toast,
    closeToast,
    assignInspector,
    startQueueInspection,
    submitIncomingInspection,
    submitProcessInspection,
    submitFinishedGoodsInspection,
    createNonconformity,
    updateNonconformityStatus,
    createCorrectiveActionFromNC,
    createCorrectiveAction,
    updateCorrectiveAction,
    verifyCorrectiveAction,
    closeCorrectiveAction,
  } = useQuality();

  // 모달 상태 관리
  const [assignModal, setAssignModal] = useState<{ isOpen: boolean; item?: InspectionQueueItem }>({ isOpen: false });

  const [incomingModal, setIncomingModal] = useState({ isOpen: false });
  const [incomingDetailModal, setIncomingDetailModal] = useState<{ isOpen: boolean; item?: IncomingInspection }>({ isOpen: false });

  const [processModal, setProcessModal] = useState({ isOpen: false });
  const [processDetailModal, setProcessDetailModal] = useState<{ isOpen: boolean; item?: ProcessInspection }>({ isOpen: false });

  const [fgModal, setFgModal] = useState({ isOpen: false });
  const [fgDetailModal, setFgDetailModal] = useState<{ isOpen: boolean; item?: FinishedGoodsInspection }>({ isOpen: false });

  const [ncModal, setNcModal] = useState({ isOpen: false });
  const [ncDetailModal, setNcDetailModal] = useState<{ isOpen: boolean; item?: Nonconformity }>({ isOpen: false });

  const [caDetailModal, setCaDetailModal] = useState<{ isOpen: boolean; item?: CorrectiveAction }>({ isOpen: false });
  const [resultView, setResultView] = useState<"incoming" | "process" | "finished">("incoming");
  const [defectView, setDefectView] = useState<"history" | "nonconformity" | "corrective">("history");
  const [defectDetail, setDefectDetail] = useState<DefectHistory | undefined>();
  const [defectCreateOpen, setDefectCreateOpen] = useState(false);
  const [correctiveCreateOpen, setCorrectiveCreateOpen] = useState(false);

  if (qualityLoading) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">품질 데이터를 불러오는 중입니다...</div>;
  if (qualityError) return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"><p className="mb-4 text-red-700">{qualityError}</p><button onClick={() => void refreshQuality()} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">다시 시도</button></div>;

  return (
    <div className="space-y-6">
      {/* 1. 상단 요약 카드 8종 */}
      <QualitySummaryCards summary={summary} />

      {/* 2. 메인 탭 래퍼 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <QualityTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          queueCount={summary.totalQueueCount}
          unresolvedCACount={summary.unresolvedCACount}
          defectCount={defectSummary.totalCount}
        />

        {/* 탭 1: 검사 대기 */}
        {activeTab === "inspection" && (
          <InspectionQueueTable
            queue={queue.filter((item) => !item.lineOrSupplier.includes("라인") || canAccessProductionLine(item.lineOrSupplier))}
            onOpenAssign={(item) => hasPermission("QUALITY_UPDATE") && setAssignModal({ isOpen: true, item })}
            onStartInspection={(id) => { if (hasPermission("QUALITY_UPDATE")) startQueueInspection(id); }}
          />
        )}

        {/* 탭 2: 원재료 입고검사 */}
        {activeTab === "results" && (
          <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
            {([["incoming", "원재료 검사"], ["process", "공정 검사"], ["finished", "완제품 검사"]] as const).map(([value, label]) => (
              <button key={value} onClick={() => setResultView(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${resultView === value ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}>{label}</button>
            ))}
          </div>
        )}
        {activeTab === "results" && resultView === "incoming" && (
          <IncomingInspectionTable
            inspections={incoming}
            onOpenCreate={() => hasPermission("QUALITY_CREATE") && setIncomingModal({ isOpen: true })}
            onOpenDetail={(item) => setIncomingDetailModal({ isOpen: true, item })}
          />
        )}

        {/* 탭 3: 공정검사 */}
        {activeTab === "results" && resultView === "process" && (
          <ProcessInspectionTable
            inspections={processList.filter((item) => canAccessProductionLine(item.productionLine))}
            onOpenCreate={() => hasPermission("QUALITY_CREATE") && setProcessModal({ isOpen: true })}
            onOpenDetail={(item) => setProcessDetailModal({ isOpen: true, item })}
          />
        )}

        {/* 탭 4: 완제품검사 */}
        {activeTab === "results" && resultView === "finished" && (
          <FinishedGoodsInspectionTable
            inspections={finished.filter((item) => canAccessProductionLine(item.productionLine))}
            onOpenCreate={() => hasPermission("QUALITY_CREATE") && setFgModal({ isOpen: true })}
            onOpenDetail={(item) => setFgDetailModal({ isOpen: true, item })}
          />
        )}

        {/* 탭 5: 부적합 관리 */}
        {activeTab === "defects" && (
          <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
            {([["history", "불량품 이력"], ["nonconformity", "부적합 관리"], ["corrective", "시정조치"]] as const).map(([value, label]) => (
              <button key={value} onClick={() => setDefectView(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${defectView === value ? "bg-red-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}>{label}</button>
            ))}
          </div>
        )}
        {activeTab === "defects" && defectView === "history" && <DefectHistoryTable items={defectHistory} onOpen={setDefectDetail} onCreate={() => hasPermission("QUALITY_CREATE") && setDefectCreateOpen(true)} />}
        {activeTab === "defects" && defectView === "nonconformity" && (
          <NonconformityTable
            nonconformities={nonconformities}
            onOpenCreate={() => hasPermission("QUALITY_CREATE") && setNcModal({ isOpen: true })}
            onOpenDetail={(item) => setNcDetailModal({ isOpen: true, item })}
            onUpdateStatus={updateNonconformityStatus}
            onRequestCA={(ncNo, handler) => {
              createCorrectiveActionFromNC(ncNo, handler);
              setDefectView("corrective");
            }}
          />
        )}

        {/* 탭 6: 시정조치 (CAPA) */}
        {activeTab === "defects" && defectView === "corrective" && (
          <CorrectiveActionTable
            correctiveActions={correctiveActions}
            onOpenDetail={(item) => setCaDetailModal({ isOpen: true, item })}
            onCloseCA={closeCorrectiveAction}
            onCreate={() => hasPermission("QUALITY_CREATE") && setCorrectiveCreateOpen(true)}
          />
        )}
        {activeTab === "statistics" && <QualityStatistics quality={summary} defects={defectHistory} />}
      </div>

      {/* 3. 각 탭 모달 */}
      <InspectionAssignmentModal
        isOpen={assignModal.isOpen}
        item={assignModal.item}
        onClose={() => setAssignModal({ isOpen: false })}
        onAssign={assignInspector}
      />

      <IncomingInspectionModal
        isOpen={incomingModal.isOpen}
        onClose={() => setIncomingModal({ isOpen: false })}
        onSubmit={submitIncomingInspection}
      />

      <IncomingInspectionDetailModal
        isOpen={incomingDetailModal.isOpen}
        item={incomingDetailModal.item}
        onClose={() => setIncomingDetailModal({ isOpen: false })}
      />

      <ProcessInspectionModal
        isOpen={processModal.isOpen}
        onClose={() => setProcessModal({ isOpen: false })}
        onSubmit={submitProcessInspection}
      />

      <ProcessInspectionDetailModal
        isOpen={processDetailModal.isOpen}
        item={processDetailModal.item}
        onClose={() => setProcessDetailModal({ isOpen: false })}
      />

      <FinishedGoodsInspectionModal
        isOpen={fgModal.isOpen}
        onClose={() => setFgModal({ isOpen: false })}
        onSubmit={submitFinishedGoodsInspection}
      />

      <FinishedGoodsInspectionDetailModal
        isOpen={fgDetailModal.isOpen}
        item={fgDetailModal.item}
        onClose={() => setFgDetailModal({ isOpen: false })}
      />

      <NonconformityModal
        isOpen={ncModal.isOpen}
        onClose={() => setNcModal({ isOpen: false })}
        onSubmit={createNonconformity}
      />

      <NonconformityDetailModal
        isOpen={ncDetailModal.isOpen}
        item={ncDetailModal.item}
        onClose={() => setNcDetailModal({ isOpen: false })}
        onUpdateStatus={updateNonconformityStatus}
        onRequestCA={(ncNo, handler) => {
          createCorrectiveActionFromNC(ncNo, handler);
          setActiveTab("defects");
          setDefectView("corrective");
        }}
      />

      <CorrectiveActionDetailModal
        isOpen={caDetailModal.isOpen}
        item={caDetailModal.item}
        onClose={() => setCaDetailModal({ isOpen: false })}
        onUpdate={updateCorrectiveAction}
        onVerify={verifyCorrectiveAction}
        onCloseCA={closeCorrectiveAction}
      />

      <DefectHistoryDetailModal
        item={defectDetail}
        onClose={() => setDefectDetail(undefined)}
        onStatusChange={(status) => {
          if (!defectDetail || !hasPermission("QUALITY_UPDATE")) return;
          updateDefectStatus(defectDetail.id, status);
          setDefectDetail({ ...defectDetail, status });
        }}
      />

      <DefectHistoryCreateModal isOpen={defectCreateOpen} onClose={() => setDefectCreateOpen(false)} onSubmit={createDefectHistory} />
      <CorrectiveActionCreateModal isOpen={correctiveCreateOpen} onClose={() => setCorrectiveCreateOpen(false)} nonconformities={nonconformities} onSubmit={createCorrectiveAction} />

      {/* 4. 알림 Toast */}
      {toast && <QualityToast toast={toast} onClose={closeToast} />}
    </div>
  );
}
