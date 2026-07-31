import React from "react";
import type {
  InspectionStatus,
  InboundStatus,
  InventoryStatus,
  OutboundStatus,
  TransactionType,
} from "@/types/materials";
import {
  INSPECTION_STATUS_LABELS,
  INBOUND_STATUS_LABELS,
  INVENTORY_STATUS_LABELS,
  OUTBOUND_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/constants/material-labels";

// ============================================================
// 자재관리 배지 통합 컴포넌트
// ============================================================

export function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const styles: Record<InspectionStatus, string> = {
    PASSED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    HOLD: "bg-purple-100 text-purple-700 border-purple-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  };
  const dotStyles: Record<InspectionStatus, string> = {
    PASSED: "bg-green-500",
    PENDING: "bg-amber-500",
    HOLD: "bg-purple-500",
    FAILED: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {INSPECTION_STATUS_LABELS[status] || status}
    </span>
  );
}

export function InboundStatusBadge({ status }: { status: InboundStatus }) {
  const styles: Record<InboundStatus, string> = {
    RECEIVED: "bg-blue-100 text-blue-700 border-blue-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200 line-through",
  };
  const dotStyles: Record<InboundStatus, string> = {
    RECEIVED: "bg-blue-500",
    CANCELLED: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {INBOUND_STATUS_LABELS[status] || status}
    </span>
  );
}

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  const styles: Record<InventoryStatus, string> = {
    NORMAL: "bg-green-100 text-green-700 border-green-200",
    LOW: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    CRITICAL: "bg-red-100 text-red-800 border-red-300 font-bold animate-pulse",
    HOLD: "bg-purple-100 text-purple-700 border-purple-200",
    EXPIRED: "bg-red-200 text-red-900 border-red-400 font-semibold line-through",
  };
  const dotStyles: Record<InventoryStatus, string> = {
    NORMAL: "bg-green-500",
    LOW: "bg-amber-500",
    CRITICAL: "bg-red-600",
    HOLD: "bg-purple-500",
    EXPIRED: "bg-red-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {INVENTORY_STATUS_LABELS[status] || status}
    </span>
  );
}

export function OutboundStatusBadge({ status }: { status: OutboundStatus }) {
  const styles: Record<OutboundStatus, string> = {
    COMPLETED: "bg-indigo-100 text-indigo-700 border-indigo-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200 line-through",
  };
  const dotStyles: Record<OutboundStatus, string> = {
    COMPLETED: "bg-indigo-500",
    CANCELLED: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {OUTBOUND_STATUS_LABELS[status] || status}
    </span>
  );
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const styles: Record<TransactionType, string> = {
    INBOUND: "bg-green-100 text-green-700 border-green-200",
    OUTBOUND: "bg-blue-100 text-blue-700 border-blue-200",
    INBOUND_CANCEL: "bg-orange-100 text-orange-700 border-orange-200",
    OUTBOUND_CANCEL: "bg-sky-100 text-sky-700 border-sky-200",
    ADJUSTMENT_INCREASE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ADJUSTMENT_DECREASE: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
        styles[type] || "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {TRANSACTION_TYPE_LABELS[type] || type}
    </span>
  );
}
