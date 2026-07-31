import React from "react";
import type {
  PlanStatus,
  PlanPriority,
  MaterialReadiness,
  WorkStatus,
  MaterialIssueStatus,
  ResultStatus,
  QualityStatus,
} from "@/types/production";
import {
  PLAN_STATUS_LABELS,
  PLAN_PRIORITY_LABELS,
  MATERIAL_READINESS_LABELS,
  WORK_STATUS_LABELS,
  MATERIAL_ISSUE_STATUS_LABELS,
  RESULT_STATUS_LABELS,
  QUALITY_STATUS_LABELS,
} from "@/constants/production-labels";

// ============================================================
// 생산관리 통합 배지 컴포넌트
// ============================================================

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  const styles: Record<PlanStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-semibold animate-pulse",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-200 line-through",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {PLAN_STATUS_LABELS[status]}
    </span>
  );
}

export function PlanPriorityBadge({ priority }: { priority: PlanPriority }) {
  const styles: Record<PlanPriority, string> = {
    URGENT: "bg-red-100 text-red-700 border-red-300 font-bold",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200 font-semibold",
    NORMAL: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[priority]}`}>
      {PLAN_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function MaterialReadinessBadge({ readiness }: { readiness: MaterialReadiness }) {
  const styles: Record<MaterialReadiness, string> = {
    READY: "bg-green-100 text-green-700 border-green-200",
    PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-300",
    SHORTAGE: "bg-red-100 text-red-700 border-red-300 font-bold",
    NOT_CHECKED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${styles[readiness]}`}>
      {MATERIAL_READINESS_LABELS[readiness]}
    </span>
  );
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  const styles: Record<WorkStatus, string> = {
    WAITING: "bg-gray-100 text-gray-700 border-gray-200",
    READY: "bg-cyan-100 text-cyan-800 border-cyan-300 font-semibold",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse",
    PAUSED: "bg-purple-100 text-purple-700 border-purple-200 font-medium",
    COMPLETED: "bg-green-100 text-green-700 border-green-200 font-semibold",
    CANCELLED: "bg-red-100 text-red-600 border-red-200 line-through",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {WORK_STATUS_LABELS[status]}
    </span>
  );
}

export function MaterialIssueStatusBadge({ status }: { status: MaterialIssueStatus }) {
  const styles: Record<MaterialIssueStatus, string> = {
    NOT_ISSUED: "bg-gray-100 text-gray-600 border-gray-200",
    PARTIALLY_ISSUED: "bg-amber-100 text-amber-800 border-amber-300",
    ISSUED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    SHORTAGE: "bg-red-100 text-red-700 border-red-300 font-bold",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[status]}`}>
      {MATERIAL_ISSUE_STATUS_LABELS[status]}
    </span>
  );
}

export function ResultStatusBadge({ status }: { status: ResultStatus }) {
  const styles: Record<ResultStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200 font-bold",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {RESULT_STATUS_LABELS[status]}
    </span>
  );
}

export function QualityStatusBadge({ status }: { status: QualityStatus }) {
  const styles: Record<QualityStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 font-medium",
    PASSED: "bg-green-100 text-green-700 border-green-200 font-bold",
    HOLD: "bg-purple-100 text-purple-700 border-purple-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {QUALITY_STATUS_LABELS[status]}
    </span>
  );
}
