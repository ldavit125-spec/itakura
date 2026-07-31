import type {
  ReportFilter,
  LotReportSummary,
  FGLotTraceMetric,
  RawLotImpactMetric,
} from "@/types/reports";
import type { MaterialInbound, MaterialInventory, MaterialOutbound } from "@/types/materials";
import type { FinishedGoodsLot, ProductionResult } from "@/types/production";
import type { FinishedGoodsInspection, Nonconformity, CorrectiveAction } from "@/types/quality";

import { isDateInRange } from "./report-date-utils";

// ============================================================
// 보고서 및 통계관리 — LOT 추적 보고서 집계 유틸리티 (Live Context 연동)
// ============================================================

export interface LotReportData {
  summary: LotReportSummary;
  fgLotTrendChartData: { period: string; count: number }[];
  fgQualityRatioChartData: { name: string; value: number }[];
  fgLotByProductChartData: { name: string; count: number }[];
  rawLotBySupplierChartData: { name: string; count: number }[];

  fgLotTraceTable: FGLotTraceMetric[];
  rawLotImpactTable: RawLotImpactMetric[];
}

export function aggregateLotReport(
  filter: ReportFilter,
  contextData: {
    inventories: MaterialInventory[];
    inbounds: MaterialInbound[];
    outbounds: MaterialOutbound[];
    fgLots: FinishedGoodsLot[];
    results: ProductionResult[];
    finishedInspections: FinishedGoodsInspection[];
    nonconformities: Nonconformity[];
    correctiveActions: CorrectiveAction[];
  }
): LotReportData {
  const {
    inventories,
    inbounds,
    outbounds,
    fgLots,
    results,
    finishedInspections,
    nonconformities,
    correctiveActions,
  } = contextData;

  const { startDate, endDate, productCode, materialCode, supplierName } = filter;

  // 1. 데이터 필터링
  const filteredFGLots = fgLots.filter((fg) => {
    if (!isDateInRange(fg.productionDate, startDate, endDate)) return false;
    if (productCode !== "ALL" && fg.productCode !== productCode) return false;
    return true;
  });

  const filteredRawLots = inventories.filter((inv) => {
    if (materialCode !== "ALL" && inv.materialCode !== materialCode) return false;
    if (supplierName !== "ALL" && inv.supplierName !== supplierName) return false;
    return true;
  });

  // 2. 상단 요약 카운트 계산
  const traceableRawLotCount = filteredRawLots.length;
  const traceableFGLotCount = filteredFGLots.length;
  const filteredFGLotNumbers = new Set(filteredFGLots.map((lot) => lot.fgLotNo));
  const linkedWorkOrderCount = new Set(
    filteredFGLots.map((lot) => lot.workOrderNo)
  ).size;

  const normalLotCount = filteredFGLots.filter((fg) => {
    const fqc = finishedInspections.find((f) => f.fgLotNo === fg.fgLotNo);
    const status = fqc?.judgment ?? fg.qualityStatus;
    return status === "PASSED" || status === "CONDITIONAL_PASS";
  }).length;

  const holdLotCount = filteredFGLots.filter((fg) => {
    const fqc = finishedInspections.find((f) => f.fgLotNo === fg.fgLotNo);
    return (fqc?.judgment ?? fg.qualityStatus) === "HOLD";
  }).length;

  const failedLotCount = filteredFGLots.filter((fg) => {
    const fqc = finishedInspections.find((f) => f.fgLotNo === fg.fgLotNo);
    return (fqc?.judgment ?? fg.qualityStatus) === "FAILED";
  }).length;

  const filteredNonconformities = nonconformities.filter((item) =>
    filteredFGLotNumbers.has(item.lotNo)
  );
  const linkedNCNumbers = new Set(
    filteredNonconformities.map((item) => item.ncNo)
  );
  const ncLinkedLotCount = new Set(
    filteredNonconformities.map((item) => item.lotNo)
  ).size;
  const inProgressCALotCount = correctiveActions.filter(
    (action) =>
      linkedNCNumbers.has(action.ncNo) &&
      action.caStatus !== "CLOSED" &&
      action.caStatus !== "VERIFIED"
  ).length;

  const summary: LotReportSummary = {
    traceableRawLotCount,
    traceableFGLotCount,
    linkedWorkOrderCount,
    normalLotCount,
    holdLotCount,
    failedLotCount,
    ncLinkedLotCount,
    inProgressCALotCount,
  };

  // 3. 차트 1: 기간별 완제품 LOT 생성 추이
  const dateMap: Record<string, number> = {};
  filteredFGLots.forEach((fg) => {
    dateMap[fg.productionDate] = (dateMap[fg.productionDate] || 0) + 1;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const fgLotTrendChartData = sortedDates.map((date) => ({
    period: date.substring(5),
    count: dateMap[date],
  }));

  // 4. 차트 3: 완제품 품질 상태 비율
  const fgQualityRatioChartData = [
    { name: "정상 (합격)", value: normalLotCount },
    { name: "보류", value: holdLotCount },
    { name: "불합격", value: failedLotCount },
  ];

  // 5. 차트 4: 제품별 완제품 LOT 수
  const productLotMap: Record<string, number> = {};
  filteredFGLots.forEach((fg) => {
    productLotMap[fg.productName] = (productLotMap[fg.productName] || 0) + 1;
  });

  const fgLotByProductChartData = Object.entries(productLotMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 6. 차트 5: 거래처별 원재료 LOT 수
  const supplierLotMap: Record<string, number> = {};
  filteredRawLots.forEach((raw) => {
    const sName = raw.supplierName || "기본 거래처";
    supplierLotMap[sName] = (supplierLotMap[sName] || 0) + 1;
  });

  const rawLotBySupplierChartData = Object.entries(supplierLotMap).map(([name, count]) => ({
    name,
    count,
  }));

  // 7. 완제품 LOT 추적 상세 테이블
  const fgLotTraceTable: FGLotTraceMetric[] = filteredFGLots.map((fg) => {
    const relatedOutbounds = outbounds.filter(
      (outbound) =>
        outbound.workOrderNo === fg.workOrderNo &&
        outbound.outboundStatus !== "CANCELLED"
    );
    const usedRawLots = new Set(
      relatedOutbounds.map((outbound) => outbound.lotNo)
    );
    const usedMaterialTypes = new Set(
      relatedOutbounds.map((outbound) => outbound.materialCode)
    );
    const fqc = finishedInspections.find((f) => f.fgLotNo === fg.fgLotNo);
    const nc = nonconformities.find((n) => n.lotNo === fg.fgLotNo);
    const ca = nc ? correctiveActions.find((c) => c.ncNo === nc.ncNo) : undefined;

    return {
      fgLotNo: fg.fgLotNo,
      productCode: fg.productCode,
      productName: fg.productName,
      productionDate: fg.productionDate,
      workOrderNo: fg.workOrderNo,
      resultNo: fg.resultNo,
      usedMaterialTypesCount: usedMaterialTypes.size,
      linkedRawLotCount: usedRawLots.size,
      qualityStatus: fqc ? fqc.judgment : fg.qualityStatus,
      ncNo: nc?.ncNo,
      caNo: ca?.caNo,
      isTraceable: true,
    };
  });

  // 8. 원재료 영향 범위 테이블
  const rawLotImpactTable: RawLotImpactMetric[] = filteredRawLots.map((raw) => {
    const matchingInbound = inbounds.find((inbound) => inbound.lotNo === raw.lotNo);
    const linkedOutbounds = outbounds.filter(
      (outbound) =>
        outbound.lotNo === raw.lotNo && outbound.outboundStatus !== "CANCELLED"
    );
    const linkedWorkOrderNos = new Set(
      linkedOutbounds.map((outbound) => outbound.workOrderNo)
    );
    const linkedLots = fgLots.filter((lot) =>
      linkedWorkOrderNos.has(lot.workOrderNo)
    );
    const linkedLotNumbers = new Set(linkedLots.map((lot) => lot.fgLotNo));
    const affectedProductionQuantity = results
      .filter((result) => linkedWorkOrderNos.has(result.workOrderNo))
      .reduce((sum, result) => sum + result.totalQuantity, 0);
    const linkedJudgments = linkedLots.map((lot) => {
      const inspection = finishedInspections.find(
        (item) => item.fgLotNo === lot.fgLotNo
      );
      return inspection?.judgment ?? lot.qualityStatus;
    });

    return {
      rawMaterialLotNo: raw.lotNo,
      materialCode: raw.materialCode,
      materialName: raw.materialName,
      supplierName: matchingInbound ? matchingInbound.supplierName : "사쿠라 제분",
      usedWorkOrdersCount: linkedWorkOrderNos.size,
      linkedFGLotsCount: linkedLotNumbers.size,
      affectedProductionQuantity,
      passedLotCount: linkedJudgments.filter(
        (judgment) =>
          judgment === "PASSED" || judgment === "CONDITIONAL_PASS"
      ).length,
      holdLotCount: linkedJudgments.filter((judgment) => judgment === "HOLD")
        .length,
      failedLotCount: linkedJudgments.filter(
        (judgment) => judgment === "FAILED"
      ).length,
    };
  });

  return {
    summary,
    fgLotTrendChartData,
    fgQualityRatioChartData,
    fgLotByProductChartData,
    rawLotBySupplierChartData,
    fgLotTraceTable,
    rawLotImpactTable,
  };
}
