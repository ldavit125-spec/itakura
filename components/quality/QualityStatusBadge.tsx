import React from "react";
import type {
  InspectionCategory,
  InspectionStatus,
  InspectionJudgment,
  ItemResultCode,
  SeverityLevel,
  NonconformityStatus,
  CorrectiveActionStatus,
  VerificationStatus,
} from "@/types/quality";
import {
  INSPECTION_CATEGORY_LABELS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_JUDGMENT_LABELS,
  ITEM_RESULT_LABELS,
  SEVERITY_LEVEL_LABELS,
  NONCONFORMITY_STATUS_LABELS,
  CORRECTIVE_ACTION_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
} from "@/constants/quality-labels";

// ============================================================
// 품질관리 통합 상태 배지 컴포넌트
// ============================================================

export function InspectionCategoryBadge({ category }: { category: InspectionCategory }) {
  const styles: Record<InspectionCategory, string> = {
    INCOMING: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESS: "bg-purple-100 text-purple-800 border-purple-200",
    FINISHED_GOODS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${styles[category]}`}>
      {INSPECTION_CATEGORY_LABELS[category]}
    </span>
  );
}

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const styles: Record<InspectionStatus, string> = {
    REQUESTED: "bg-gray-100 text-gray-700 border-gray-200",
    ASSIGNED: "bg-cyan-100 text-cyan-800 border-cyan-300 font-medium",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse",
    COMPLETED: "bg-green-100 text-green-700 border-green-200 font-semibold",
    CANCELLED: "bg-red-50 text-red-500 border-red-200 line-through",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {INSPECTION_STATUS_LABELS[status]}
    </span>
  );
}

export function InspectionJudgmentBadge({ judgment }: { judgment: InspectionJudgment }) {
  const styles: Record<InspectionJudgment, string> = {
    PASSED: "bg-green-100 text-green-700 border-green-300 font-bold",
    CONDITIONAL_PASS: "bg-teal-100 text-teal-800 border-teal-300 font-semibold",
    HOLD: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
    FAILED: "bg-red-100 text-red-700 border-red-300 font-bold animate-pulse",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[judgment]}`}>
      {INSPECTION_JUDGMENT_LABELS[judgment]}
    </span>
  );
}

export function ItemResultBadge({ result }: { result: ItemResultCode }) {
  const styles: Record<ItemResultCode, string> = {
    NOT_TESTED: "bg-gray-100 text-gray-500 border-gray-200",
    PASS: "bg-green-100 text-green-700 border-green-200 font-semibold",
    FAIL: "bg-red-100 text-red-700 border-red-300 font-bold",
    NOT_APPLICABLE: "bg-gray-50 text-gray-400 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[result]}`}>
      {ITEM_RESULT_LABELS[result]}
    </span>
  );
}

export function SeverityLevelBadge({ severity }: { severity: SeverityLevel }) {
  const styles: Record<SeverityLevel, string> = {
    CRITICAL: "bg-red-100 text-red-800 border-red-300 font-extrabold shadow-sm animate-pulse",
    MAJOR: "bg-orange-100 text-orange-800 border-orange-300 font-bold",
    MINOR: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${styles[severity]}`}>
      {SEVERITY_LEVEL_LABELS[severity]}
    </span>
  );
}

export function NonconformityStatusBadge({ status }: { status: NonconformityStatus }) {
  const styles: Record<NonconformityStatus, string> = {
    OPEN: "bg-red-100 text-red-700 border-red-200 font-semibold",
    INVESTIGATING: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    ACTION_REQUIRED: "bg-purple-100 text-purple-800 border-purple-300 font-semibold",
    ACTION_IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {NONCONFORMITY_STATUS_LABELS[status]}
    </span>
  );
}

export function CorrectiveActionStatusBadge({ status }: { status: CorrectiveActionStatus }) {
  const styles: Record<CorrectiveActionStatus, string> = {
    REQUESTED: "bg-red-100 text-red-700 border-red-200 font-medium",
    ANALYZING: "bg-purple-100 text-purple-800 border-purple-300 font-semibold",
    PLANNED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    COMPLETED: "bg-teal-100 text-teal-800 border-teal-200",
    VERIFIED: "bg-green-100 text-green-800 border-green-300 font-bold",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {CORRECTIVE_ACTION_STATUS_LABELS[status]}
    </span>
  );
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const styles: Record<VerificationStatus, string> = {
    NOT_VERIFIED: "bg-gray-100 text-gray-500 border-gray-200",
    EFFECTIVE: "bg-green-100 text-green-700 border-green-300 font-bold",
    INEFFECTIVE: "bg-red-100 text-red-700 border-red-300 font-bold animate-pulse",
    RECHECK_REQUIRED: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[status]}`}>
      {VERIFICATION_STATUS_LABELS[status]}
    </span>
  );
}
