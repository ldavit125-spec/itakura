"use client";

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
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 품질관리 통합 상태 배지 컴포넌트 (다국어 지원)
// ============================================================

/** 검사 구분 배지 */
export function InspectionCategoryBadge({ category }: { category: InspectionCategory }) {
  const { t } = useLanguage();
  const styles: Record<InspectionCategory, string> = {
    INCOMING: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESS: "bg-purple-100 text-purple-800 border-purple-200",
    FINISHED_GOODS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  const labelKeys: Record<InspectionCategory, string> = {
    INCOMING: "quality.category.incoming",
    PROCESS: "quality.category.process",
    FINISHED_GOODS: "quality.category.finishedGoods",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${styles[category]}`}>
      {t(labelKeys[category])}
    </span>
  );
}

/** 검사 상태 배지 */
export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const { t } = useLanguage();
  const styles: Record<InspectionStatus, string> = {
    REQUESTED: "bg-gray-100 text-gray-700 border-gray-200",
    ASSIGNED: "bg-cyan-100 text-cyan-800 border-cyan-300 font-medium",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse",
    COMPLETED: "bg-green-100 text-green-700 border-green-200 font-semibold",
    CANCELLED: "bg-red-50 text-red-500 border-red-200 line-through",
  };
  const labelKeys: Record<InspectionStatus, string> = {
    REQUESTED: "quality.status.requested",
    ASSIGNED: "quality.status.assigned",
    IN_PROGRESS: "quality.status.inProgress",
    COMPLETED: "quality.status.completed",
    CANCELLED: "quality.status.cancelled",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(labelKeys[status])}
    </span>
  );
}

/** 판정 배지 */
export function InspectionJudgmentBadge({ judgment }: { judgment: InspectionJudgment }) {
  const { t } = useLanguage();
  const styles: Record<InspectionJudgment, string> = {
    PASSED: "bg-green-100 text-green-700 border-green-300 font-bold",
    CONDITIONAL_PASS: "bg-teal-100 text-teal-800 border-teal-300 font-semibold",
    HOLD: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
    FAILED: "bg-red-100 text-red-700 border-red-300 font-bold animate-pulse",
  };
  const labelKeys: Record<InspectionJudgment, string> = {
    PASSED: "quality.judgment.passed",
    CONDITIONAL_PASS: "quality.judgment.conditionalPass",
    HOLD: "quality.judgment.hold",
    FAILED: "quality.judgment.failed",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[judgment]}`}>
      {t(labelKeys[judgment])}
    </span>
  );
}

/** 아이템 결과 배지 */
export function ItemResultBadge({ result }: { result: ItemResultCode }) {
  const { t } = useLanguage();
  const styles: Record<ItemResultCode, string> = {
    NOT_TESTED: "bg-gray-100 text-gray-500 border-gray-200",
    PASS: "bg-green-100 text-green-700 border-green-200 font-semibold",
    FAIL: "bg-red-100 text-red-700 border-red-300 font-bold",
    NOT_APPLICABLE: "bg-gray-50 text-gray-400 border-gray-200",
  };
  const labelKeys: Record<ItemResultCode, string> = {
    NOT_TESTED: "quality.itemResult.notTested",
    PASS: "quality.itemResult.pass",
    FAIL: "quality.itemResult.fail",
    NOT_APPLICABLE: "quality.itemResult.notApplicable",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[result]}`}>
      {t(labelKeys[result])}
    </span>
  );
}

/** 심각도 배지 */
export function SeverityLevelBadge({ severity }: { severity: SeverityLevel }) {
  const { t } = useLanguage();
  const styles: Record<SeverityLevel, string> = {
    CRITICAL: "bg-red-100 text-red-800 border-red-300 font-extrabold shadow-sm animate-pulse",
    MAJOR: "bg-orange-100 text-orange-800 border-orange-300 font-bold",
    MINOR: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  const labelKeys: Record<SeverityLevel, string> = {
    CRITICAL: "quality.severity.critical",
    MAJOR: "quality.severity.major",
    MINOR: "quality.severity.minor",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${styles[severity]}`}>
      {t(labelKeys[severity])}
    </span>
  );
}

/** 부적합 상태 배지 */
export function NonconformityStatusBadge({ status }: { status: NonconformityStatus }) {
  const { t } = useLanguage();
  const styles: Record<NonconformityStatus, string> = {
    OPEN: "bg-red-100 text-red-700 border-red-200 font-semibold",
    INVESTIGATING: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    ACTION_REQUIRED: "bg-purple-100 text-purple-800 border-purple-300 font-semibold",
    ACTION_IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labelKeys: Record<NonconformityStatus, string> = {
    OPEN: "quality.ncStatus.open",
    INVESTIGATING: "quality.ncStatus.investigating",
    ACTION_REQUIRED: "quality.ncStatus.actionRequired",
    ACTION_IN_PROGRESS: "quality.ncStatus.actionInProgress",
    RESOLVED: "quality.ncStatus.resolved",
    CLOSED: "quality.ncStatus.closed",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(labelKeys[status])}
    </span>
  );
}

/** 시정조치 상태 배지 */
export function CorrectiveActionStatusBadge({ status }: { status: CorrectiveActionStatus }) {
  const { t } = useLanguage();
  const styles: Record<CorrectiveActionStatus, string> = {
    REQUESTED: "bg-red-100 text-red-700 border-red-200 font-medium",
    ANALYZING: "bg-purple-100 text-purple-800 border-purple-300 font-semibold",
    PLANNED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    COMPLETED: "bg-teal-100 text-teal-800 border-teal-200",
    VERIFIED: "bg-green-100 text-green-800 border-green-300 font-bold",
    CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const labelKeys: Record<CorrectiveActionStatus, string> = {
    REQUESTED: "quality.caStatus.requested",
    ANALYZING: "quality.caStatus.analyzing",
    PLANNED: "quality.caStatus.planned",
    IN_PROGRESS: "quality.caStatus.inProgress",
    COMPLETED: "quality.caStatus.completed",
    VERIFIED: "quality.caStatus.verified",
    CLOSED: "quality.caStatus.closed",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(labelKeys[status])}
    </span>
  );
}

/** 검증 상태 배지 */
export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useLanguage();
  const styles: Record<VerificationStatus, string> = {
    NOT_VERIFIED: "bg-gray-100 text-gray-500 border-gray-200",
    EFFECTIVE: "bg-green-100 text-green-700 border-green-300 font-bold",
    INEFFECTIVE: "bg-red-100 text-red-700 border-red-300 font-bold animate-pulse",
    RECHECK_REQUIRED: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
  };
  const labelKeys: Record<VerificationStatus, string> = {
    NOT_VERIFIED: "quality.verification.notVerified",
    EFFECTIVE: "quality.verification.effective",
    INEFFECTIVE: "quality.verification.ineffective",
    RECHECK_REQUIRED: "quality.verification.recheckRequired",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[status]}`}>
      {t(labelKeys[status])}
    </span>
  );
}
