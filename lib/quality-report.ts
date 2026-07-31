import type {
  ReportFilter,
  QualityReportSummary,
  CategoryInspectionMetric,
  NonconformityMetric,
  DepartmentCAMetric,
} from "@/types/reports";
import type {
  IncomingInspection,
  ProcessInspection,
  FinishedGoodsInspection,
  Nonconformity,
  CorrectiveAction,
} from "@/types/quality";
import { isDateInRange, calculateDaysBetween } from "./report-date-utils";
import { getBusinessDate } from "./selectors/business-date";
import { NONCONFORMITY_TYPE_LABELS, DEPARTMENT_CODE_LABELS } from "@/constants/quality-labels";

// ============================================================
// 보고서 및 통계관리 — 품질분석 보고서 집계 유틸리티 (Live Context 연동)
// ============================================================

export interface QualityReportData {
  summary: QualityReportSummary;
  qualityPassRateTrendChartData: { period: string; passRate: number }[];
  inspectionCategoryChartData: { category: string; passed: number; hold: number; failed: number }[];
  ncTypeChartData: { name: string; count: number }[];
  ncSeverityChartData: { name: string; value: number }[];
  lineDefectChartData: { name: string; count: number }[];
  caStatusChartData: { name: string; count: number }[];

  categoryInspectionTable: CategoryInspectionMetric[];
  nonconformityTable: NonconformityMetric[];
  departmentCATable: DepartmentCAMetric[];
}

export function aggregateQualityReport(
  filter: ReportFilter,
  contextData: {
    incoming: IncomingInspection[];
    processList: ProcessInspection[];
    finished: FinishedGoodsInspection[];
    nonconformities: Nonconformity[];
    correctiveActions: CorrectiveAction[];
  }
): QualityReportData {
  const {
    incoming,
    processList,
    finished,
    nonconformities,
    correctiveActions,
  } = contextData;

  const { startDate, endDate } = filter;

  // 1. 품질 데이터 필터링
  const filteredIQC = incoming.filter((i) => isDateInRange(i.inspectionDate, startDate, endDate));
  const filteredPQC = processList.filter((p) => isDateInRange(p.inspectionDate, startDate, endDate));
  const filteredFQC = finished.filter((f) => isDateInRange(f.inspectionDate, startDate, endDate));

  const filteredNC = nonconformities.filter((n) => isDateInRange(n.occurredDate, startDate, endDate));
  const filteredCA = correctiveActions.filter((c) => isDateInRange(c.requestDate, startDate, endDate));

  // 2. 총 검사 건수 및 판정 집계
  const allInspections = [...filteredIQC, ...filteredPQC, ...filteredFQC];
  const totalInspectionCount = allInspections.length;
  const completedInspections = allInspections.filter((i) => i.status === "COMPLETED");
  const completedInspectionCount = completedInspections.length;

  const passedCount = completedInspections.filter((i) => i.judgment === "PASSED").length;
  const conditionalPassCount = completedInspections.filter((i) => i.judgment === "CONDITIONAL_PASS").length;
  const holdCount = completedInspections.filter((i) => i.judgment === "HOLD").length;
  const failedCount = completedInspections.filter((i) => i.judgment === "FAILED").length;

  const totalPassRate =
    completedInspectionCount > 0
      ? Number((((passedCount + conditionalPassCount) / completedInspectionCount) * 100).toFixed(1))
      : 0;

  const unresolvedCACount = filteredCA.filter((c) => c.caStatus !== "CLOSED" && c.caStatus !== "VERIFIED").length;

  const summary: QualityReportSummary = {
    totalInspectionCount,
    completedInspectionCount,
    passedCount,
    conditionalPassCount,
    holdCount,
    failedCount,
    totalPassRate,
    unresolvedCACount,
  };

  // 3. 차트 1: 기간별 합격률 추이
  const datePassMap: Record<string, { total: number; passed: number }> = {};
  completedInspections.forEach((i) => {
    const date = i.inspectionDate.split(" ")[0];
    if (!datePassMap[date]) datePassMap[date] = { total: 0, passed: 0 };
    datePassMap[date].total += 1;
    if (i.judgment === "PASSED" || i.judgment === "CONDITIONAL_PASS") {
      datePassMap[date].passed += 1;
    }
  });

  const sortedDates = Object.keys(datePassMap).sort();
  const qualityPassRateTrendChartData = sortedDates.map((date) => {
    const tot = datePassMap[date].total;
    const pas = datePassMap[date].passed;
    return {
      period: date.substring(5),
      passRate: tot > 0 ? Number(((pas / tot) * 100).toFixed(1)) : 0,
    };
  });

  // 4. 차트 2: 검사 구분별 판정 현황 (IQC, PQC, FQC)
  const calcCatMetric = (label: string, list: typeof allInspections): CategoryInspectionMetric => {
    const completed = list.filter((i) => i.status === "COMPLETED");
    const p = completed.filter((i) => i.judgment === "PASSED").length;
    const cp = completed.filter((i) => i.judgment === "CONDITIONAL_PASS").length;
    const h = completed.filter((i) => i.judgment === "HOLD").length;
    const f = completed.filter((i) => i.judgment === "FAILED").length;
    const pr = completed.length > 0 ? Number((((p + cp) / completed.length) * 100).toFixed(1)) : 0;
    return {
      categoryLabel: label,
      totalCount: list.length,
      passedCount: p,
      conditionalPassCount: cp,
      holdCount: h,
      failedCount: f,
      passRate: pr,
    };
  };

  const iqcMetric = calcCatMetric("원재료 입고검사", filteredIQC);
  const pqcMetric = calcCatMetric("공정검사", filteredPQC);
  const fqcMetric = calcCatMetric("완제품검사", filteredFQC);

  const categoryInspectionTable = [iqcMetric, pqcMetric, fqcMetric];

  const inspectionCategoryChartData = categoryInspectionTable.map((c) => ({
    category: c.categoryLabel,
    passed: c.passedCount + c.conditionalPassCount,
    hold: c.holdCount,
    failed: c.failedCount,
  }));

  // 5. 차트 3 & 4: 부적합 유형별 및 심각도 비율
  const ncTypeMap: Record<string, { label: string; count: number; crit: number; maj: number; min: number; resolved: number; totalDays: number }> = {};

  filteredNC.forEach((n) => {
    const label = NONCONFORMITY_TYPE_LABELS[n.ncType] || n.ncType;
    if (!ncTypeMap[n.ncType]) {
      ncTypeMap[n.ncType] = { label, count: 0, crit: 0, maj: 0, min: 0, resolved: 0, totalDays: 0 };
    }
    ncTypeMap[n.ncType].count += 1;
    if (n.severity === "CRITICAL") ncTypeMap[n.ncType].crit += 1;
    else if (n.severity === "MAJOR") ncTypeMap[n.ncType].maj += 1;
    else ncTypeMap[n.ncType].min += 1;

    if (n.ncStatus === "CLOSED") {
      ncTypeMap[n.ncType].resolved += 1;
      const days = calculateDaysBetween(n.occurredDate, getBusinessDate());
      ncTypeMap[n.ncType].totalDays += Math.max(1, days);
    }
  });

  const ncTypeChartData = Object.values(ncTypeMap).map((t) => ({
    name: t.label,
    count: t.count,
  }));

  const ncSeverityCounts = {
    "치명 (Critical)": filteredNC.filter((n) => n.severity === "CRITICAL").length,
    "중대 (Major)": filteredNC.filter((n) => n.severity === "MAJOR").length,
    "경미 (Minor)": filteredNC.filter((n) => n.severity === "MINOR").length,
  };

  const ncSeverityChartData = Object.entries(ncSeverityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const nonconformityTable: NonconformityMetric[] = Object.entries(ncTypeMap).map(([type, t]) => ({
    ncType: type,
    ncTypeLabel: t.label,
    totalCount: t.count,
    criticalCount: t.crit,
    majorCount: t.maj,
    minorCount: t.min,
    resolvedCount: t.resolved,
    unresolvedCount: t.count - t.resolved,
    averageResolutionDays: t.resolved > 0 ? Number((t.totalDays / t.resolved).toFixed(1)) : 0,
  }));

  // 6. 차트 5: 생산라인별 불합격 건수
  const lineDefectMap: Record<string, number> = {
    "1호 라인 (식빵 전용)": 0,
    "2호 라인 (단과자빵 전용)": 0,
    "3호 라인 (패스츄리 전용)": 0,
  };

  filteredPQC.forEach((p) => {
    if (p.judgment === "FAILED" || p.judgment === "HOLD") {
      lineDefectMap[p.productionLine] = (lineDefectMap[p.productionLine] || 0) + 1;
    }
  });

  const lineDefectChartData = Object.entries(lineDefectMap).map(([name, count]) => ({
    name: name.split(" ")[0],
    count,
  }));

  // 7. 차트 6: 시정조치 부서별 집계 테이블 & 차트
  const deptCAMap: Record<string, DepartmentCAMetric> = {};

  filteredCA.forEach((c) => {
    const deptName = DEPARTMENT_CODE_LABELS[c.targetDepartment] || c.targetDepartment;
    if (!deptCAMap[c.targetDepartment]) {
      deptCAMap[c.targetDepartment] = {
        departmentCode: c.targetDepartment,
        departmentName: deptName,
        totalCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        verifiedCount: 0,
        overdueCount: 0,
        effectiveCount: 0,
        ineffectiveCount: 0,
      };
    }

    const d = deptCAMap[c.targetDepartment];
    d.totalCount += 1;
    if (c.caStatus === "IN_PROGRESS" || c.caStatus === "PLANNED" || c.caStatus === "ANALYZING") d.inProgressCount += 1;
    else if (c.caStatus === "COMPLETED") d.completedCount += 1;
    else if (c.caStatus === "VERIFIED" || c.caStatus === "CLOSED") d.verifiedCount += 1;

    if (c.verificationStatus === "EFFECTIVE") d.effectiveCount += 1;
    else if (c.verificationStatus === "INEFFECTIVE") d.ineffectiveCount += 1;
  });

  const departmentCATable = Object.values(deptCAMap);

  const caStatusCounts = {
    "진행 중": filteredCA.filter((c) => c.caStatus !== "CLOSED" && c.caStatus !== "VERIFIED").length,
    "조치 완료": filteredCA.filter((c) => c.caStatus === "COMPLETED").length,
    "검증 완료": filteredCA.filter((c) => c.caStatus === "VERIFIED" || c.caStatus === "CLOSED").length,
  };

  const caStatusChartData = Object.entries(caStatusCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    summary,
    qualityPassRateTrendChartData,
    inspectionCategoryChartData,
    ncTypeChartData,
    ncSeverityChartData,
    lineDefectChartData,
    caStatusChartData,
    categoryInspectionTable,
    nonconformityTable,
    departmentCATable,
  };
}
