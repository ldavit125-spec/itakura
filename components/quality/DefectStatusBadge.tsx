"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { DefectProcessingStatus } from "@/types/quality";

// 불량 처리 상태 코드 → 번역 키 매핑
const DEFECT_STATUS_KEYS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "quality.defectStatus.investigating",
  CAUSE_ANALYZED: "quality.defectStatus.causeAnalyzed",
  REWORK: "quality.defectStatus.rework",
  DISCARDED: "quality.defectStatus.discarded",
  SHIPMENT_HOLD: "quality.defectStatus.shipmentHold",
  COMPLETED: "quality.defectStatus.completed",
};

const COLORS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "bg-blue-50 text-blue-700 border-blue-200",
  CAUSE_ANALYZED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REWORK: "bg-amber-50 text-amber-800 border-amber-200",
  DISCARDED: "bg-red-50 text-red-700 border-red-200",
  SHIPMENT_HOLD: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function DefectStatusBadge({ status }: { status: DefectProcessingStatus }) {
  const { t } = useLanguage();
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${COLORS[status]}`}>
      {t(DEFECT_STATUS_KEYS[status])}
    </span>
  );
}
