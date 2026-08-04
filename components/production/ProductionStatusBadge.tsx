"use client";

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
import { useLanguage } from "@/context/LanguageContext";

const PLAN_STATUS_KEYS: Record<PlanStatus, string> = {
  DRAFT: "production.status.plan.draft",
  CONFIRMED: "production.status.plan.confirmed",
  IN_PROGRESS: "production.status.plan.inProgress",
  COMPLETED: "production.status.plan.completed",
  CANCELLED: "production.status.plan.cancelled",
};

const PLAN_PRIORITY_KEYS: Record<PlanPriority, string> = {
  URGENT: "production.priority.urgent",
  HIGH: "production.priority.high",
  NORMAL: "production.priority.normal",
  LOW: "production.priority.low",
};

const MATERIAL_READINESS_KEYS: Record<MaterialReadiness, string> = {
  READY: "production.material.ready",
  PARTIAL: "production.material.partial",
  SHORTAGE: "production.material.shortage",
  NOT_CHECKED: "production.material.notChecked",
};

const WORK_STATUS_KEYS: Record<WorkStatus, string> = {
  WAITING: "production.status.work.waiting",
  READY: "production.status.work.ready",
  IN_PROGRESS: "production.status.work.inProgress",
  PAUSED: "production.status.work.paused",
  COMPLETED: "production.status.work.completed",
  CANCELLED: "production.status.work.cancelled",
};

const MATERIAL_ISSUE_STATUS_KEYS: Record<MaterialIssueStatus, string> = {
  NOT_ISSUED: "production.issue.notIssued",
  PARTIALLY_ISSUED: "production.issue.partiallyIssued",
  ISSUED: "production.issue.issued",
  SHORTAGE: "production.issue.shortage",
};

const RESULT_STATUS_KEYS: Record<ResultStatus, string> = {
  DRAFT: "production.resultStatus.draft",
  SUBMITTED: "production.resultStatus.submitted",
  CONFIRMED: "production.resultStatus.confirmed",
};

const QUALITY_STATUS_KEYS: Record<QualityStatus, string> = {
  PENDING: "production.qualityStatus.pending",
  PASSED: "production.qualityStatus.passed",
  HOLD: "production.qualityStatus.hold",
  FAILED: "production.qualityStatus.failed",
};

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  const { t } = useLanguage();
  const styles: Record<PlanStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300 font-semibold animate-pulse",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-200 line-through",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(PLAN_STATUS_KEYS[status])}
    </span>
  );
}

export function PlanPriorityBadge({ priority }: { priority: PlanPriority }) {
  const { t } = useLanguage();
  const styles: Record<PlanPriority, string> = {
    URGENT: "bg-red-100 text-red-700 border-red-300 font-bold",
    HIGH: "bg-orange-100 text-orange-700 border-orange-200 font-semibold",
    NORMAL: "bg-blue-100 text-blue-700 border-blue-200",
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[priority]}`}>
      {t(PLAN_PRIORITY_KEYS[priority])}
    </span>
  );
}

export function MaterialReadinessBadge({ readiness }: { readiness: MaterialReadiness }) {
  const { t } = useLanguage();
  const styles: Record<MaterialReadiness, string> = {
    READY: "bg-green-100 text-green-700 border-green-200",
    PARTIAL: "bg-yellow-100 text-yellow-800 border-yellow-300",
    SHORTAGE: "bg-red-100 text-red-700 border-red-300 font-bold",
    NOT_CHECKED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${styles[readiness]}`}>
      {t(MATERIAL_READINESS_KEYS[readiness])}
    </span>
  );
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  const { t } = useLanguage();
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
      {t(WORK_STATUS_KEYS[status])}
    </span>
  );
}

export function MaterialIssueStatusBadge({ status }: { status: MaterialIssueStatus }) {
  const { t } = useLanguage();
  const styles: Record<MaterialIssueStatus, string> = {
    NOT_ISSUED: "bg-gray-100 text-gray-600 border-gray-200",
    PARTIALLY_ISSUED: "bg-amber-100 text-amber-800 border-amber-300",
    ISSUED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    SHORTAGE: "bg-red-100 text-red-700 border-red-300 font-bold",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[status]}`}>
      {t(MATERIAL_ISSUE_STATUS_KEYS[status])}
    </span>
  );
}

export function ResultStatusBadge({ status }: { status: ResultStatus }) {
  const { t } = useLanguage();
  const styles: Record<ResultStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    SUBMITTED: "bg-blue-100 text-blue-700 border-blue-200 font-semibold",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200 font-bold",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(RESULT_STATUS_KEYS[status])}
    </span>
  );
}

export function QualityStatusBadge({ status }: { status: QualityStatus }) {
  const { t } = useLanguage();
  const styles: Record<QualityStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 font-medium",
    PASSED: "bg-green-100 text-green-700 border-green-200 font-bold",
    HOLD: "bg-purple-100 text-purple-700 border-purple-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {t(QUALITY_STATUS_KEYS[status])}
    </span>
  );
}
