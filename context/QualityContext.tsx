"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type {
  QualityTab,
  InspectionQueueItem,
  IncomingInspection,
  ProcessInspection,
  FinishedGoodsInspection,
  Nonconformity,
  CorrectiveAction,
  QualitySummary,
  QualityToastState,
  DefectHistory,
  DefectHistorySummary,
} from "@/types/quality";
import { fetchQualitySnapshot, saveCorrectiveAction, saveDefectHistory, saveFinishedInspection, saveIncomingInspection, saveInspectionRequest, saveNonconformity, saveProcessInspection } from "@/lib/supabase/quality";
import { getDefectHistorySummary } from "@/lib/defect-history";

import { useAdmin } from "./AdminContext";
import {
  calculatePassRate,
  calculateQualityDefectRate,
} from "@/lib/quality-calculations";
import {
  generateRequestNo,
  generateIQCNo,
  generatePQCNo,
  generateFQCNo,
  generateNCNo,
  generateCANo,
} from "@/lib/quality-number-generator";
import { validateJudgmentRules } from "@/lib/quality-validation";
import { getBusinessDate } from "@/lib/common-selectors";
import { useMaterials } from "./MaterialsContext";
import { useProduction } from "./ProductionContext";

// ============================================================
// 품질관리 통합 Context 인터페이스
// ============================================================

interface QualityContextType {
  activeTab: QualityTab;
  setActiveTab: (tab: QualityTab) => void;
  queue: InspectionQueueItem[];
  incoming: IncomingInspection[];
  processList: ProcessInspection[];
  finished: FinishedGoodsInspection[];
  nonconformities: Nonconformity[];
  correctiveActions: CorrectiveAction[];
  defectHistory: DefectHistory[];
  defectSummary: DefectHistorySummary;
  qualityLoading: boolean;
  qualityError: string | null;
  refreshQuality: () => Promise<void>;
  updateDefectStatus: (id: string, status: DefectHistory["status"]) => void;
  createDefectHistory: (data: Omit<DefectHistory, "id" | "defectNo" | "createdAt" | "updatedAt">) => boolean;
  summary: QualitySummary;
  toast: QualityToastState | null;
  showToast: (message: string, type?: "success" | "error") => void;
  closeToast: () => void;

  // 탭 1: 검사 대기
  createInspectionRequest: (
    data: Omit<InspectionQueueItem, "id" | "requestNo" | "requestTime" | "status">
  ) => boolean;
  assignInspector: (queueId: string, inspector: string) => void;
  startQueueInspection: (queueId: string) => boolean;

  // 탭 2: 원재료 입고검사
  submitIncomingInspection: (
    data: Omit<IncomingInspection, "id" | "iqcNo" | "status" | "statusHistory">
  ) => boolean;

  // 탭 3: 공정검사
  submitProcessInspection: (
    data: Omit<ProcessInspection, "id" | "pqcNo" | "status" | "statusHistory">
  ) => boolean;

  // 탭 4: 완제품검사
  submitFinishedGoodsInspection: (
    data: Omit<FinishedGoodsInspection, "id" | "fqcNo" | "status" | "statusHistory">
  ) => boolean;

  // 탭 5: 부적합 관리
  createNonconformity: (
    data: Omit<Nonconformity, "id" | "ncNo" | "ncStatus">
  ) => boolean;
  updateNonconformityStatus: (ncId: string, status: Nonconformity["ncStatus"]) => void;

  // 탭 6: 시정조치 (CAPA)
  createCorrectiveActionFromNC: (ncNo: string, handler: string) => boolean;
  createCorrectiveAction: (data: Omit<CorrectiveAction, "id" | "caNo" | "caStatus" | "verificationStatus">) => boolean;
  updateCorrectiveAction: (caId: string, updated: Partial<CorrectiveAction>) => boolean;
  verifyCorrectiveAction: (
    caId: string,
    verificationStatus: CorrectiveAction["verificationStatus"],
    content: string,
    verifier: string
  ) => boolean;
  closeCorrectiveAction: (caId: string) => boolean;
}

const QualityContext = createContext<QualityContextType | null>(null);

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAdmin();
  const { setInventories } = useMaterials();
  const { updateWorkOrderQualityStatus, updateFinishedGoodsLotQuality } =
    useProduction();
  const [activeTab, setActiveTab] = useState<QualityTab>("inspection");
  const [queue, setQueue] = useState<InspectionQueueItem[]>([]);
  const [incoming, setIncoming] = useState<IncomingInspection[]>([]);
  const [processList, setProcessList] = useState<ProcessInspection[]>([]);
  const [finished, setFinished] = useState<FinishedGoodsInspection[]>([]);
  const [nonconformities, setNonconformities] = useState<Nonconformity[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [defectHistory, setDefectHistory] = useState<DefectHistory[]>([]);
  const [qualityLoading, setQualityLoading] = useState(true);
  const [qualityError, setQualityError] = useState<string | null>(null);
  const refreshQuality = async () => {
    setQualityLoading(true);
    try {
      const data = await fetchQualitySnapshot();
      setQueue(data.queue); setIncoming(data.incoming); setProcessList(data.processList);
      setFinished(data.finished); setNonconformities(data.nonconformities);
      setCorrectiveActions(data.correctiveActions); setDefectHistory(data.defectHistory);
      setQualityError(null);
    } catch (error) { setQualityError(error instanceof Error ? error.message : "품질 데이터를 불러오지 못했습니다."); }
    finally { setQualityLoading(false); }
  };
  useEffect(() => { const timer=setTimeout(()=>void refreshQuality(),0); return()=>clearTimeout(timer); }, []);
  const persist = (operation: Promise<void>) => { void operation.then(refreshQuality).catch(error => { setQualityError(error instanceof Error ? error.message : "품질 데이터 저장에 실패했습니다."); showToast("품질 데이터 저장에 실패했습니다.", "error"); }); };
  const defectSummary = useMemo(() => getDefectHistorySummary(defectHistory), [defectHistory]);
  const updateDefectStatus = (id: string, status: DefectHistory["status"]) => {
    const target = defectHistory.find(item => item.id === id);
    setDefectHistory((previous) => previous.map((item) =>
      item.id === id
        ? { ...item, status, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16) }
        : item
    ));
    if (target) persist(saveDefectHistory({ ...target, status, updatedAt: new Date().toISOString() }));
    showToast("불량품 처리 상태를 변경했습니다.");
  };

  const createDefectHistory = (data: Omit<DefectHistory, "id" | "defectNo" | "createdAt" | "updatedAt">): boolean => {
    const now = new Date().toISOString();
    const cleanDate = data.inspectionDate.slice(0, 10).replace(/-/g, "");
    const defectNo = `DEF-${cleanDate}-${String(defectHistory.length + 1).padStart(3, "0")}`;
    const item: DefectHistory = {
      ...data,
      id: `def-${cleanDate}-${String(defectHistory.length + 1).padStart(3, "0")}`,
      defectNo,
      createdAt: now,
      updatedAt: now,
    };
    setDefectHistory(previous => [item, ...previous]);
    persist(saveDefectHistory(item));
    showToast(`불량품 이력 ${item.defectNo}가 등록되었습니다.`);
    return true;
  };

  const [toast, setToast] = useState<QualityToastState | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  };
  const closeToast = () => setToast(null);

  // ── 0. 동적 상단 요약 카드 집계 ─────────────────────────────
  const summary = useMemo<QualitySummary>(() => {
    const totalQueueCount = queue.filter((q) => q.status !== "COMPLETED" && q.status !== "CANCELLED").length;
    const incomingQueueCount = queue.filter((q) => q.category === "INCOMING" && q.status !== "COMPLETED").length;
    const processInProgressCount = queue.filter((q) => q.category === "PROCESS" && q.status === "IN_PROGRESS").length;
    const finishedQueueCount = queue.filter((q) => q.category === "FINISHED_GOODS" && q.status !== "COMPLETED").length;

    const todayStr = getBusinessDate();
    const todayFailCount =
      incoming.filter((i) => i.inspectionDate.includes(todayStr) && i.judgment === "FAILED").length +
      processList.filter((p) => p.inspectionDate.includes(todayStr) && p.judgment === "FAILED").length +
      finished.filter((f) => f.inspectionDate.includes(todayStr) && f.judgment === "FAILED").length;

    const unresolvedCACount = correctiveActions.filter(
      (c) => c.caStatus !== "CLOSED" && c.caStatus !== "VERIFIED"
    ).length;

    // 합격률 & 불량률 계산
    const allCompleted = [
      ...incoming.filter((i) => i.status === "COMPLETED"),
      ...processList.filter((p) => p.status === "COMPLETED"),
      ...finished.filter((f) => f.status === "COMPLETED"),
    ];
    const totalCompleted = allCompleted.length;
    const passedCount = allCompleted.filter((c) => c.judgment === "PASSED" || c.judgment === "CONDITIONAL_PASS").length;
    const failedCount = allCompleted.filter((c) => c.judgment === "FAILED").length;

    const thisMonthPassRate = calculatePassRate(passedCount, totalCompleted);
    const thisMonthDefectRate = calculateQualityDefectRate(failedCount, totalCompleted);

    return {
      totalQueueCount,
      incomingQueueCount,
      processInProgressCount,
      finishedQueueCount,
      todayFailCount,
      unresolvedCACount,
      thisMonthPassRate,
      thisMonthDefectRate,
    };
  }, [queue, incoming, processList, finished, correctiveActions]);

  // ── 탭 1: 검사 대기 핸들러 ────────────────────────────────────
  const createInspectionRequest = (
    data: Omit<InspectionQueueItem, "id" | "requestNo" | "requestTime" | "status">
  ): boolean => {
    const seq = queue.length + 1;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const requestNo = generateRequestNo(dateStr, seq);
    const timeStr = now.toISOString().replace("T", " ").substring(0, 16);

    const newItem: InspectionQueueItem = {
      ...data,
      id: `req-${Date.now()}`,
      requestNo,
      requestTime: timeStr,
      status: "REQUESTED",
    };

    setQueue((prev) => [newItem, ...prev]);
    persist(saveInspectionRequest(newItem));
    showToast(`신규 검사 요청 [${requestNo}]가 등록되었습니다.`);
    return true;
  };

  const assignInspector = (queueId: string, inspector: string) => {
    const target = queue.find(q => q.id === queueId);
    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? { ...q, inspector, status: "ASSIGNED" } : q))
    );
    if (target) persist(saveInspectionRequest({ ...target, inspector, status: "ASSIGNED" }));
    showToast("검사 담당자가 성공적으로 배정되었습니다.");
  };

  const startQueueInspection = (queueId: string): boolean => {
    const target = queue.find((q) => q.id === queueId);
    if (!target) return false;

    if (target.status === "CANCELLED") {
      showToast("취소된 검사 요청은 시작할 수 없습니다.", "error");
      return false;
    }

    const inspectorName = target.inspector && target.inspector.trim() !== "" ? target.inspector : (currentUser?.name || "품질담당자");

    const updatedItem: InspectionQueueItem = {
      ...target,
      inspector: inspectorName,
      status: "IN_PROGRESS",
    };

    setQueue((prev) =>
      prev.map((q) => (q.id === queueId ? updatedItem : q))
    );
    persist(saveInspectionRequest(updatedItem));

    // 해당 탭으로 자동 이동 안내
    setActiveTab("results");

    showToast(`검사 [${target.requestNo}]가 시작되었습니다 (검사원: ${inspectorName}).`);
    return true;
  };


  // ── 탭 2: 원재료 입고검사 핸들러 (자재 모듈 연동) ─────────────
  const submitIncomingInspection = (
    data: Omit<IncomingInspection, "id" | "iqcNo" | "status" | "statusHistory">
  ): boolean => {
    // 검증 규칙 적용
    const val = validateJudgmentRules(data.items, data.judgment, data.judgmentReason);
    if (!val.isValid) {
      showToast(val.errorMessage || "검사 판정이 유효하지 않습니다.", "error");
      return false;
    }

    const seq = incoming.length + 1;
    const dateStr = data.inspectionDate.split(" ")[0] || getBusinessDate();
    const iqcNo = generateIQCNo(dateStr, seq);

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newIQC: IncomingInspection = {
      id: `iqc-${Date.now()}`,
      iqcNo,
      status: "COMPLETED",
      statusHistory: [
        { id: "h-start", changeTime: nowStr, previousStatus: "REQUESTED", newStatus: "IN_PROGRESS", changedBy: data.inspector },
        { id: "h-end", changeTime: nowStr, previousStatus: "IN_PROGRESS", newStatus: "COMPLETED", changedBy: data.inspector, reason: data.judgmentReason },
      ],
      ...data,
    };

    setIncoming((prev) => [newIQC, ...prev]);
    persist(saveIncomingInspection(newIQC));

    // 자재관리의 해당 LOT 검사 상태 연동 업데이트
    let newMatStatus: "PASSED" | "HOLD" | "FAILED" = "PASSED";
    if (data.judgment === "HOLD") newMatStatus = "HOLD";
    else if (data.judgment === "FAILED") newMatStatus = "FAILED";

    setInventories((prev) =>
      prev.map((inv) => {
        if (inv.lotNo !== data.lotNo) return inv;
        if (newMatStatus === "HOLD" || newMatStatus === "FAILED") {
          return {
            ...inv,
            inspectionStatus: newMatStatus,
            holdStock: inv.currentStock,
            availableStock: 0,
            inventoryStatus: newMatStatus === "HOLD" ? "HOLD" : "EXPIRED",
          };
        }
        return {
          ...inv,
          inspectionStatus: newMatStatus,
          availableStock: inv.currentStock,
          holdStock: 0,
        };
      })
    );

    // 부적합 자동 생성 (FAILED 판정인 경우)
    if (data.judgment === "FAILED") {
      const ncSeq = nonconformities.length + 1;
      const ncNo = generateNCNo(dateStr, ncSeq);

      const newNC: Nonconformity = {
        id: `nc-${Date.now()}`,
        ncNo,
        occurredDate: dateStr,
        category: "INCOMING",
        inspectionNo: iqcNo,
        targetNo: data.inboundNo,
        targetName: data.materialName,
        lotNo: data.lotNo,
        ncType: "MATERIAL_DEFECT",
        defectQuantity: data.quantity,
        unit: data.unit,
        severity: "MAJOR",
        ncStatus: "OPEN",
        handler: data.inspector,
        dueDate: "2026-08-05",
        details: `원재료 입고검사 불합격 (${data.judgmentReason || "품질 기준 미달"})`,
        interimAction: "원재료 사용보류 구역 격리",
      };

      setNonconformities((prev) => [newNC, ...prev]);
      persist(saveNonconformity(newNC));
    }

    // 대기열 상태도 COMPLETED 로 전환
    setQueue((prev) =>
      prev.map((q) => (q.lotNo === data.lotNo ? { ...q, status: "COMPLETED" } : q))
    );

    showToast(`원재료 검사(${iqcNo}) 판정이 완료되고 자재 LOT 상태가 [${newMatStatus}]로 갱신되었습니다.`);
    return true;
  };

  // ── 탭 3: 공정검사 핸들러 (생산 모듈 연동) ───────────────────
  const submitProcessInspection = (
    data: Omit<ProcessInspection, "id" | "pqcNo" | "status" | "statusHistory">
  ): boolean => {
    // 동일 작업지시 동일 공정 중복 검사 차단
    const exists = processList.some(
      (p) => p.workOrderNo === data.workOrderNo && p.process === data.process && p.status === "COMPLETED"
    );
    if (exists) {
      showToast(`해당 작업지시(${data.workOrderNo})의 동일 공정 검사가 이미 등록되어 있습니다.`, "error");
      return false;
    }

    const val = validateJudgmentRules(data.items, data.judgment, data.judgmentReason);
    if (!val.isValid) {
      showToast(val.errorMessage || "검사 판정이 유효하지 않습니다.", "error");
      return false;
    }

    const seq = processList.length + 1;
    const dateStr = data.inspectionDate.split(" ")[0] || getBusinessDate();
    const pqcNo = generatePQCNo(dateStr, seq);

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newPQC: ProcessInspection = {
      id: `pqc-${Date.now()}`,
      pqcNo,
      status: "COMPLETED",
      statusHistory: [
        { id: "hp-1", changeTime: nowStr, previousStatus: "REQUESTED", newStatus: "IN_PROGRESS", changedBy: data.inspector },
        { id: "hp-2", changeTime: nowStr, previousStatus: "IN_PROGRESS", newStatus: "COMPLETED", changedBy: data.inspector, reason: data.judgmentReason },
      ],
      ...data,
    };

    setProcessList((prev) => [newPQC, ...prev]);
    persist(saveProcessInspection(newPQC));

    // 생산관리 연동: HOLD 또는 FAILED 시 생산 작업지시 PAUSED(일시정지)로 변경
    if (data.judgment === "HOLD" || data.judgment === "FAILED") {
      updateWorkOrderQualityStatus(
        data.workOrderNo,
        "PAUSED",
        `[공정검사 ${data.judgment} 판정] ${
          data.judgmentReason || "생산 일시정지"
        }`
      );
    }

    // FAILED 시 부적합 내역 자동 생성
    if (data.judgment === "FAILED") {
      const ncSeq = nonconformities.length + 1;
      const ncNo = generateNCNo(dateStr, ncSeq);

      const newNC: Nonconformity = {
        id: `nc-${Date.now()}`,
        ncNo,
        occurredDate: dateStr,
        category: "PROCESS",
        inspectionNo: pqcNo,
        targetNo: data.workOrderNo,
        targetName: `${data.productName} (${data.process})`,
        lotNo: data.workOrderNo,
        ncType: "PROCESS_DEVIATION",
        defectQuantity: 1,
        unit: "건",
        severity: "MAJOR",
        ncStatus: "OPEN",
        handler: data.inspector,
        dueDate: "2026-08-05",
        details: `공정검사 불합격 (${data.judgmentReason || "공정 이탈"})`,
        interimAction: "생산라인 기계 가동 일시정지",
      };

      setNonconformities((prev) => [newNC, ...prev]);
      persist(saveNonconformity(newNC));
    }

    setQueue((prev) =>
      prev.map((q) => (q.targetNo === data.workOrderNo ? { ...q, status: "COMPLETED" } : q))
    );

    showToast(`공정검사(${pqcNo}) 판정 완료! ${data.judgment === "HOLD" || data.judgment === "FAILED" ? "생산 라인이 일시정지(PAUSED) 되었습니다." : ""}`);
    return true;
  };

  // ── 탭 4: 완제품검사 핸들러 (완제품 LOT 연동) ─────────────────
  const submitFinishedGoodsInspection = (
    data: Omit<FinishedGoodsInspection, "id" | "fqcNo" | "status" | "statusHistory">
  ): boolean => {
    const val = validateJudgmentRules(data.items, data.judgment, data.judgmentReason);
    if (!val.isValid) {
      showToast(val.errorMessage || "검사 판정이 유효하지 않습니다.", "error");
      return false;
    }

    const seq = finished.length + 1;
    const dateStr = data.inspectionDate.split(" ")[0] || getBusinessDate();
    const fqcNo = generateFQCNo(dateStr, seq);

    const isRelease = data.judgment === "PASSED" || data.judgment === "CONDITIONAL_PASS";

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newFQC: FinishedGoodsInspection = {
      id: `fqc-${Date.now()}`,
      fqcNo,
      status: "COMPLETED",
      statusHistory: [
        { id: "hf-1", changeTime: nowStr, previousStatus: "REQUESTED", newStatus: "IN_PROGRESS", changedBy: data.inspector },
        { id: "hf-2", changeTime: nowStr, previousStatus: "IN_PROGRESS", newStatus: "COMPLETED", changedBy: data.inspector, reason: data.judgmentReason },
      ],
      ...data,
      isReleaseAvailable: isRelease,
    };

    setFinished((prev) => [newFQC, ...prev]);
    persist(saveFinishedInspection(newFQC));

    // 완제품 LOT 품질 상태 및 출고 가능 여부 연동 반영
    let newQualityStatus: "PASSED" | "HOLD" | "FAILED" = "PASSED";
    if (data.judgment === "HOLD") newQualityStatus = "HOLD";
    else if (data.judgment === "FAILED") newQualityStatus = "FAILED";

    updateFinishedGoodsLotQuality(data.fgLotNo, newQualityStatus, isRelease);

    if (data.judgment === "FAILED") {
      const ncSeq = nonconformities.length + 1;
      const ncNo = generateNCNo(dateStr, ncSeq);

      const newNC: Nonconformity = {
        id: `nc-${Date.now()}`,
        ncNo,
        occurredDate: dateStr,
        category: "FINISHED_GOODS",
        inspectionNo: fqcNo,
        targetNo: data.fgLotNo,
        targetName: data.productName,
        lotNo: data.fgLotNo,
        ncType: "APPEARANCE_DEFECT",
        defectQuantity: data.defectiveSampleQuantity || 1,
        unit: "개",
        severity: "CRITICAL",
        ncStatus: "OPEN",
        handler: data.inspector,
        dueDate: "2026-08-05",
        details: `완제품 검사 불합격 (${data.judgmentReason || "관능 및 중량 미달"})`,
        interimAction: "완제품 출하 보류 창고 격리",
      };

      setNonconformities((prev) => [newNC, ...prev]);
      persist(saveNonconformity(newNC));
    }

    setQueue((prev) =>
      prev.map((q) => (q.lotNo === data.fgLotNo ? { ...q, status: "COMPLETED" } : q))
    );

    showToast(`완제품 검사(${fqcNo}) 판정 완료! 완제품 LOT 출고가능여부: [${isRelease ? "가능" : "불가"}]`);
    return true;
  };

  // ── 탭 5: 부적합 관리 핸들러 ──────────────────────────────────
  const createNonconformity = (
    data: Omit<Nonconformity, "id" | "ncNo" | "ncStatus">
  ): boolean => {
    const dateStr = data.occurredDate;
    const seq = nonconformities.length + 1;
    const ncNo = generateNCNo(dateStr, seq);

    const newNC: Nonconformity = {
      id: `nc-${Date.now()}`,
      ncNo,
      ncStatus: "OPEN",
      ...data,
    };

    // CRITICAL 또는 MAJOR 인 경우 시정조치(CAPA) 자동 요청
    let caNoStr = "";
    let autoCA: CorrectiveAction | null = null;
    if (data.severity === "CRITICAL" || data.severity === "MAJOR") {
      const caSeq = correctiveActions.length + 1;
      caNoStr = generateCANo(dateStr, caSeq);

      const newCA: CorrectiveAction = {
        id: `ca-${Date.now()}`,
        caNo: caNoStr,
        ncNo,
        requestDate: dateStr,
        targetDepartment: data.category === "INCOMING" ? "MATERIALS" : "PRODUCTION",
        handler: data.handler,
        problemSummary: `[${data.severity}] ${data.targetName} ${data.details}`,
        interimAction: data.interimAction,
        caStatus: "REQUESTED",
        dueDate: data.dueDate,
        verificationStatus: "NOT_VERIFIED",
      };

      setCorrectiveActions((prev) => [newCA, ...prev]);
      autoCA = newCA;
      newNC.correctiveActionNo = caNoStr;
    }

    setNonconformities((prev) => [newNC, ...prev]);
    persist(saveNonconformity(newNC).then(() => autoCA ? saveCorrectiveAction(autoCA) : undefined));
    showToast(`부적합 내역(${ncNo})이 등록되었습니다. ${caNoStr ? `(시정조치 ${caNoStr} 자동 발행)` : ""}`);
    return true;
  };

  const updateNonconformityStatus = (ncId: string, status: Nonconformity["ncStatus"]) => {
    const target = nonconformities.find(nc => nc.id === ncId);
    setNonconformities((prev) =>
      prev.map((nc) => (nc.id === ncId ? { ...nc, ncStatus: status } : nc))
    );
    if (target) persist(saveNonconformity({ ...target, ncStatus: status }));
    showToast("부적합 처리 상태가 변경되었습니다.");
  };

  // ── 탭 6: 시정조치 (CAPA) 핸들러 ──────────────────────────────
  const createCorrectiveActionFromNC = (ncNo: string, handler: string): boolean => {
    const nc = nonconformities.find((n) => n.ncNo === ncNo);
    if (!nc) return false;

    const dateStr = getBusinessDate();
    const caSeq = correctiveActions.length + 1;
    const caNo = generateCANo(dateStr, caSeq);

    const newCA: CorrectiveAction = {
      id: `ca-${Date.now()}`,
      caNo,
      ncNo,
      requestDate: dateStr,
      targetDepartment: nc.category === "INCOMING" ? "MATERIALS" : "PRODUCTION",
      handler: handler || nc.handler,
      problemSummary: `[${nc.severity}] ${nc.targetName} 부적합 조치 요구`,
      interimAction: nc.interimAction,
      caStatus: "REQUESTED",
      dueDate: nc.dueDate,
      verificationStatus: "NOT_VERIFIED",
    };

    setCorrectiveActions((prev) => [newCA, ...prev]);
    persist(saveCorrectiveAction(newCA));

    setNonconformities((prev) =>
      prev.map((n) => (n.ncNo === ncNo ? { ...n, correctiveActionNo: caNo } : n))
    );
    persist(saveNonconformity({ ...nc, correctiveActionNo: caNo }));

    showToast(`시정조치(${caNo})가 생성되었습니다.`);
    return true;
  };

  const createCorrectiveAction = (data: Omit<CorrectiveAction, "id" | "caNo" | "caStatus" | "verificationStatus">): boolean => {
    const nc = nonconformities.find(item => item.ncNo === data.ncNo);
    if (!nc) { showToast("연결할 부적합 내역을 선택하세요.", "error"); return false; }
    const caNo = generateCANo(data.requestDate, correctiveActions.length + 1);
    const item: CorrectiveAction = {
      ...data,
      id: `ca-${Date.now()}`,
      caNo,
      caStatus: "REQUESTED",
      verificationStatus: "NOT_VERIFIED",
    };
    setCorrectiveActions(previous => [item, ...previous]);
    setNonconformities(previous => previous.map(value => value.id === nc.id ? { ...value, correctiveActionNo: caNo } : value));
    persist(saveCorrectiveAction(item));
    showToast(`시정조치 ${caNo}가 등록되었습니다.`);
    return true;
  };

  const updateCorrectiveAction = (caId: string, updated: Partial<CorrectiveAction>): boolean => {
    const target = correctiveActions.find(ca => ca.id === caId);
    setCorrectiveActions((prev) =>
      prev.map((ca) => (ca.id === caId ? { ...ca, ...updated } : ca))
    );
    if (target) persist(saveCorrectiveAction({ ...target, ...updated }));
    showToast("시정조치 계획/원인 분석이 수정되었습니다.");
    return true;
  };

  const verifyCorrectiveAction = (
    caId: string,
    verificationStatus: CorrectiveAction["verificationStatus"],
    content: string,
    verifier: string
  ): boolean => {
    const target = correctiveActions.find(ca => ca.id === caId);
    const dateStr = getBusinessDate();
    let newCAStatus: CorrectiveAction["caStatus"] = "VERIFIED";

    if (verificationStatus === "INEFFECTIVE" || verificationStatus === "RECHECK_REQUIRED") {
      newCAStatus = "IN_PROGRESS"; // 효과 없음 시 조치 진행 중으로 되돌림
    }

    setCorrectiveActions((prev) =>
      prev.map((ca) =>
        ca.id === caId
          ? {
              ...ca,
              verificationStatus,
              verificationContent: content,
              verifier,
              verificationDate: dateStr,
              caStatus: newCAStatus,
            }
          : ca
      )
    );
    if (target) persist(saveCorrectiveAction({ ...target, verificationStatus, verificationContent: content, verifier, verificationDate: dateStr, caStatus: newCAStatus }));

    showToast(
      `효과 검증이 [${verificationStatus}]로 등록되었습니다. ${
        verificationStatus === "INEFFECTIVE" ? "(효과 미흡으로 조치 재진행 필요)" : ""
      }`
    );
    return true;
  };

  const closeCorrectiveAction = (caId: string): boolean => {
    const target = correctiveActions.find((c) => c.id === caId);
    if (!target) return false;

    // 검증 결과가 INEFFECTIVE 이거나 RECHECK_REQUIRED 인 경우 종결 불가 차단
    if (
      target.verificationStatus === "INEFFECTIVE" ||
      target.verificationStatus === "RECHECK_REQUIRED" ||
      target.verificationStatus === "NOT_VERIFIED"
    ) {
      showToast("효과 검증이 [EFFECTIVE(효과 있음)] 상태인 경우에만 시정조치를 종결(CLOSED)할 수 있습니다.", "error");
      return false;
    }

    setCorrectiveActions((prev) =>
      prev.map((ca) => (ca.id === caId ? { ...ca, caStatus: "CLOSED" } : ca))
    );
    persist(saveCorrectiveAction({ ...target, caStatus: "CLOSED" }));

    showToast(`시정조치 [${target.caNo}]가 최종 종결(CLOSED) 되었습니다.`);
    return true;
  };

  return (
    <QualityContext.Provider
      value={{
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
        showToast,
        closeToast,
        createInspectionRequest,
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
      }}
    >
      {children}
    </QualityContext.Provider>
  );
}

export function useQuality() {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error("useQuality must be used within a QualityProvider");
  }
  return context;
}
