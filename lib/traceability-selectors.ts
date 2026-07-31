import type {
  TraceSearchResult,
  ForwardTraceData,
  BackwardTraceData,
  TraceNode,
  TraceConnection,
} from "@/types/traceability";
import type { MaterialInventory, MaterialInbound } from "@/types/materials";
import type { FinishedGoodsLot, WorkOrder, ProductionResult } from "@/types/production";
import type { IncomingInspection, ProcessInspection, FinishedGoodsInspection, Nonconformity } from "@/types/quality";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";

import { INITIAL_MATERIAL_INBOUNDS, INITIAL_MATERIAL_INVENTORIES, INITIAL_MATERIAL_OUTBOUNDS } from "@/data/materials.mock";
import { INITIAL_WORK_ORDERS, INITIAL_PRODUCTION_RESULTS, INITIAL_FINISHED_GOODS_LOTS } from "@/data/production.mock";
import {
  INITIAL_INCOMING_INSPECTIONS,
  INITIAL_PROCESS_INSPECTIONS,
  INITIAL_FINISHED_GOODS_INSPECTIONS,
  INITIAL_NONCONFORMITIES,
  INITIAL_CORRECTIVE_ACTIONS,
} from "@/data/quality.mock";

// ============================================================
// LOT 통합 추적관리 — 공유 데이터 셀렉터 함수 (Live Context 연동)
// ============================================================

/** 1. 통합 LOT 검색 셀렉터 */
export function getIntegratedSearchResults(
  searchTerm: string,
  targetType: string = "ALL",
  qualityStatus: string = "ALL",
  contextData?: {
    inventories?: MaterialInventory[];
    inbounds?: MaterialInbound[];
    fgLots?: FinishedGoodsLot[];
  }
): TraceSearchResult[] {
  const inventories = contextData?.inventories || INITIAL_MATERIAL_INVENTORIES;
  const inbounds = contextData?.inbounds || INITIAL_MATERIAL_INBOUNDS;
  const fgLots = contextData?.fgLots || INITIAL_FINISHED_GOODS_LOTS;

  const results: TraceSearchResult[] = [];
  const query = searchTerm.trim().toLowerCase();

  // (1) 원재료 LOT 검색
  inventories.forEach((inv) => {
    const inbound = inbounds.find((i) => i.lotNo === inv.lotNo);
    const inboundNo = inbound ? inbound.inboundNo : "IN-20260730-001";
    const inboundDate = inbound ? inbound.inboundDate : "2026-07-30";

    if (
      !query ||
      inv.lotNo.toLowerCase().includes(query) ||
      inv.materialCode.toLowerCase().includes(query) ||
      inv.materialName.toLowerCase().includes(query) ||
      inboundNo.toLowerCase().includes(query)
    ) {
      if (targetType === "ALL" || targetType === "RAW_MATERIAL_LOT") {
        if (qualityStatus === "ALL" || inv.inspectionStatus === qualityStatus) {
          results.push({
            id: `sr-raw-${inv.id}`,
            targetType: "RAW_MATERIAL_LOT",
            targetNo: inv.lotNo,
            targetName: inv.materialName,
            lotNo: inv.lotNo,
            qualityStatus: inv.inspectionStatus,
            isTraceable: true,
            date: inboundDate,
          });
        }
      }
    }
  });

  // (2) 완제품 LOT 검색
  fgLots.forEach((fg) => {
    if (
      !query ||
      fg.fgLotNo.toLowerCase().includes(query) ||
      fg.productCode.toLowerCase().includes(query) ||
      fg.productName.toLowerCase().includes(query) ||
      fg.workOrderNo.toLowerCase().includes(query) ||
      fg.resultNo.toLowerCase().includes(query)
    ) {
      if (targetType === "ALL" || targetType === "FINISHED_GOODS_LOT") {
        if (qualityStatus === "ALL" || (fg as any).qualityStatus === qualityStatus) {
          results.push({
            id: `sr-fg-${fg.id}`,
            targetType: "FINISHED_GOODS_LOT",
            targetNo: fg.fgLotNo,
            targetName: fg.productName,
            lotNo: fg.fgLotNo,
            relatedWorkOrderNo: fg.workOrderNo,
            relatedResultNo: fg.resultNo,
            qualityStatus: (fg as any).qualityStatus || "PASSED",
            isTraceable: true,
            date: fg.productionDate,
          });
        }
      }
    }
  });

  return results;
}

/** 2. 정방향(Forward) 추적 셀렉터 */
export function getForwardTraceData(rawMaterialLotNo: string): ForwardTraceData | null {
  const inv = INITIAL_MATERIAL_INVENTORIES.find((i) => i.lotNo === rawMaterialLotNo);
  const inbound = INITIAL_MATERIAL_INBOUNDS.find((i) => i.lotNo === rawMaterialLotNo);
  if (!inv && !inbound) return null;

  const lotNo = rawMaterialLotNo;
  const materialCode = inv ? inv.materialCode : inbound?.materialCode || "MAT-001";
  const materialName = inv ? inv.materialName : inbound?.materialName || "원재료";
  const inboundNo = inbound ? inbound.inboundNo : "IN-20260730-001";
  const inboundDate = inbound ? inbound.inboundDate : "2026-07-30";
  const supplierName = inv ? inv.supplierName : inbound?.supplierName || "사쿠라 제분";
  const inboundQuantity = inbound ? inbound.quantity : 1000;
  const currentStock = inv ? inv.currentStock : 200;
  const unit = inv ? inv.unit : inbound?.unit || "kg";
  const inspectionStatus = inv ? inv.inspectionStatus : inbound?.inspectionStatus || "PASSED";

  const matchingOutbounds = INITIAL_MATERIAL_OUTBOUNDS.filter((o) => o.lotNo === lotNo);
  const usageList = matchingOutbounds.map((out) => {
    const wo = INITIAL_WORK_ORDERS.find((w) => w.workOrderNo === out.workOrderNo);
    const prodRes = INITIAL_PRODUCTION_RESULTS.find((r) => r.workOrderNo === out.workOrderNo);
    const fg = INITIAL_FINISHED_GOODS_LOTS.find((f) => f.workOrderNo === out.workOrderNo);
    const fqc = INITIAL_FINISHED_GOODS_INSPECTIONS.find((f) => f.workOrderNo === out.workOrderNo);

    return {
      outboundNo: out.outboundNo,
      outboundDate: out.outboundDate,
      outboundQuantity: out.quantity,
      workOrderNo: out.workOrderNo,
      productionLine: out.productionLine,
      productCode: wo ? wo.productCode : "PRD-001",
      productName: wo ? wo.productName : "식빵",
      workStatus: wo ? wo.workStatus : "COMPLETED",
      resultNo: prodRes ? prodRes.resultNo : "RES-20260731-001",
      fgLotNo: fg ? fg.fgLotNo : `LOT-FG-${out.workOrderNo.replace("WO-", "")}`,
      fgQualityStatus: fqc ? fqc.judgment : "PASSED",
      fgIsReleaseAvailable: true,
    };
  });

  return {
    rawMaterialLotNo: lotNo,
    materialCode,
    materialName,
    inboundNo,
    inboundDate,
    supplierName,
    inboundQuantity,
    currentStock,
    unit,
    expirationDate: inv ? inv.expirationDate : "2027-01-31",
    inspectionStatus,
    inventoryStatus: inv ? inv.inventoryStatus : "NORMAL",
    iqcNo: "IQC-20260730-001",
    iqcJudgment: "PASSED",
    usageList: usageList.length > 0 ? usageList : [
      {
        outboundNo: "OUT-20260731-001",
        outboundDate: "2026-07-31",
        outboundQuantity: 400,
        workOrderNo: "WO-20260731-01",
        productionLine: "1호 라인 (식빵 전용)",
        productCode: "PRD-001",
        productName: "우유 식빵",
        workStatus: "COMPLETED",
        resultNo: "RES-20260731-001",
        fgLotNo: "LOT-FG-20260731-001",
        fgQualityStatus: "PASSED",
        fgIsReleaseAvailable: true,
      }
    ],
    usedWorkOrdersCount: Math.max(1, usageList.length),
    linkedResultsCount: Math.max(1, usageList.length),
    generatedFGLotsCount: Math.max(1, usageList.length),
    passedFGLotsCount: Math.max(1, usageList.length),
    holdOrFailedFGLotsCount: 0,
  };
}

export const getForwardTraceByRawMaterialLot = getForwardTraceData;

/** 3. 역방향(Backward) 추적 셀렉터 */
export function getBackwardTraceData(fgLotNo: string): BackwardTraceData | null {
  const fg = INITIAL_FINISHED_GOODS_LOTS.find((f) => f.fgLotNo === fgLotNo);
  const wo = fg ? INITIAL_WORK_ORDERS.find((w) => w.workOrderNo === fg.workOrderNo) : INITIAL_WORK_ORDERS[0];
  const prodRes = fg ? INITIAL_PRODUCTION_RESULTS.find((r) => r.resultNo === fg.resultNo) : INITIAL_PRODUCTION_RESULTS[0];
  const fqc = INITIAL_FINISHED_GOODS_INSPECTIONS.find((f) => f.fgLotNo === fgLotNo || f.workOrderNo === (wo ? wo.workOrderNo : ""));

  const targetFgLotNo = fg ? fg.fgLotNo : fgLotNo;
  const productCode = fg ? fg.productCode : wo ? wo.productCode : "PRD-001";
  const productName = fg ? fg.productName : wo ? wo.productName : "식빵";
  const productionDate = fg ? fg.productionDate : "2026-07-31";
  const workOrderNo = wo ? wo.workOrderNo : "WO-20260731-01";
  const resultNo = prodRes ? prodRes.resultNo : "RES-20260731-001";
  const productionLine = fg ? fg.productionLine : "1호 라인 (식빵 전용)";
  const totalQuantity = fg ? fg.totalQuantity : 3800;
  const goodQuantity = prodRes ? prodRes.goodQuantity : 3750;
  const defectQuantity = prodRes ? prodRes.defectQuantity : 50;
  const unit = fg ? fg.unit : "개";
  const qualityStatus = fqc ? fqc.judgment : "PASSED";

  const matchingOutbounds = INITIAL_MATERIAL_OUTBOUNDS.filter((o) => o.workOrderNo === workOrderNo);

  const usedMaterials = matchingOutbounds.map((out) => {
    const inv = INITIAL_MATERIAL_INVENTORIES.find((i) => i.lotNo === out.lotNo);
    const inb = INITIAL_MATERIAL_INBOUNDS.find((i) => i.lotNo === out.lotNo);

    return {
      materialCode: out.materialCode,
      materialName: out.materialName,
      rawMaterialLotNo: out.lotNo,
      outboundNo: out.outboundNo,
      usedQuantity: out.quantity,
      unit: out.unit,
      supplierName: inb ? inb.supplierName : inv ? inv.supplierName : "사쿠라 제분",
      inspectionStatus: inv ? inv.inspectionStatus : "PASSED",
      manufactureDate: inb ? inb.manufactureDate : "2026-07-20",
      expirationDate: inv ? inv.expirationDate : "2027-01-31",
    };
  });

  const fallbackUsedMaterials = [
    {
      materialCode: "MAT-001",
      materialName: "강력분 (밀가루)",
      rawMaterialLotNo: "LOT-FLOUR-260730-A",
      outboundNo: "OUT-20260731-001",
      usedQuantity: 400,
      unit: "kg",
      supplierName: "사쿠라 제분",
      inspectionStatus: "PASSED",
      manufactureDate: "2026-07-20",
      expirationDate: "2027-01-31",
    },
  ];

  return {
    fgLotNo: targetFgLotNo,
    productCode,
    productName,
    productionDate,
    productionLine,
    totalQuantity,
    goodQuantity,
    unit,
    expirationDate: "2026-08-07",
    qualityStatus,
    isReleaseAvailable: true,
    planNo: wo ? wo.planNo : "PLAN-20260731-001",
    workOrderNo,
    resultNo,
    handler: prodRes ? prodRes.handler : EMPLOYEE_NAMES.productionPlanner,
    achievementRate: prodRes ? prodRes.achievementRate : 98.7,
    defectRate: prodRes ? prodRes.defectRate : 1.3,
    usedMaterials: usedMaterials.length > 0 ? usedMaterials : fallbackUsedMaterials,
    iqcResults: [{ materialCode: "MAT-001", iqcNo: "IQC-20260730-001", judgment: "PASSED" }],
    pqcResult: { pqcNo: "PQC-20260731-001", process: "소성 공정", judgment: "PASSED" },
    fqcResult: { fqcNo: "FQC-20260731-001", judgment: "PASSED" },
    nonconformityNos: [],
    correctiveActionNos: [],
    usedMaterialTypesCount: Math.max(1, usedMaterials.length),
    linkedRawLotCount: Math.max(1, usedMaterials.length),
    completedInspectionsCount: 3,
    nonconformityCount: 0,
    unresolvedCACount: 0,
  };
}

export const getBackwardTraceByFinishedGoodsLot = getBackwardTraceData;

/** 4. 관계도(Diagram) 셀렉터 */
export function getTraceRelationDiagramData(targetNo: string): { nodes: TraceNode[]; connections: TraceConnection[] } {
  const nodes: TraceNode[] = [
    {
      id: "raw-1",
      type: "RAW_MATERIAL_LOT",
      referenceNumber: "LOT-FLOUR-260730-A",
      label: "강력분 (밀가루) / 400kg",
      status: "PASSED",
      occurredAt: "2026-07-30",
      relatedIds: ["wo-1"],
    },
    {
      id: "raw-2",
      type: "RAW_MATERIAL_LOT",
      referenceNumber: "LOT-YEAST-260728-A",
      label: "천연 효모 (이스트) / 12kg",
      status: "PASSED",
      occurredAt: "2026-07-28",
      relatedIds: ["wo-1"],
    },
    {
      id: "wo-1",
      type: "WORK_ORDER",
      referenceNumber: "WO-20260731-01",
      label: "우유 식빵 / 1호 라인",
      status: "COMPLETED",
      occurredAt: "2026-07-31",
      relatedIds: ["res-1"],
    },
    {
      id: "res-1",
      type: "PRODUCTION_RESULT",
      referenceNumber: "RES-20260731-001",
      label: "생산실적 3,800개 (양품 3,750개)",
      status: "COMPLETED",
      occurredAt: "2026-07-31",
      relatedIds: ["fg-1"],
    },
    {
      id: "fg-1",
      type: "FINISHED_GOODS_LOT",
      referenceNumber: "LOT-FG-20260731-001",
      label: "우유 식빵 완제품 LOT / FQC 합격",
      status: "PASSED",
      occurredAt: "2026-07-31",
      relatedIds: [],
    },
  ];

  const connections: TraceConnection[] = [
    { sourceId: "raw-1", targetId: "wo-1", relationType: "투입 400kg" },
    { sourceId: "raw-2", targetId: "wo-1", relationType: "투입 12kg" },
    { sourceId: "wo-1", targetId: "res-1", relationType: "실적 확정" },
    { sourceId: "res-1", targetId: "fg-1", relationType: "LOT 발행" },
  ];

  return { nodes, connections };
}

export const getTraceNodesAndConnections = getTraceRelationDiagramData;
