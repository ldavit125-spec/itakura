import type { DefectProcessingStatus } from "@/types/quality";

export const DEFECT_STATUS_LABELS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "조사중",
  CAUSE_ANALYZED: "원인 분석 완료",
  REWORK: "재작업",
  DISCARDED: "폐기",
  SHIPMENT_HOLD: "출하 보류",
  COMPLETED: "처리 완료",
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
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${COLORS[status]}`}>{DEFECT_STATUS_LABELS[status]}</span>;
}
