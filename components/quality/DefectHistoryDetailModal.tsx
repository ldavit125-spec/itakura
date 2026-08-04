"use client";

import Link from "next/link";
import type { DefectHistory, DefectProcessingStatus, DefectType } from "@/types/quality";
import DefectStatusBadge from "./DefectStatusBadge";
import { DEFECT_STATUS_CODE_LIST, DEFECT_TYPE_CODE_LIST } from "./DefectHistoryTable";
import { useLanguage } from "@/context/LanguageContext";

// 번역 키 매핑 (모달 내부에서 재정의)
const DEFECT_TYPE_KEYS: Record<DefectType, string> = {
  FOREIGN_MATERIAL: "quality.defectType.foreignMaterial",
  WEIGHT: "quality.defectType.weight",
  PACKAGING: "quality.defectType.packaging",
  APPEARANCE: "quality.defectType.appearance",
  SEALING: "quality.defectType.sealing",
  LABEL: "quality.defectType.label",
  DAMAGE: "quality.defectType.damage",
  OTHER: "quality.defectType.other",
};

const DEFECT_STATUS_KEYS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "quality.defectStatus.investigating",
  CAUSE_ANALYZED: "quality.defectStatus.causeAnalyzed",
  REWORK: "quality.defectStatus.rework",
  DISCARDED: "quality.defectStatus.discarded",
  SHIPMENT_HOLD: "quality.defectStatus.shipmentHold",
  COMPLETED: "quality.defectStatus.completed",
};

export default function DefectHistoryDetailModal({
  item,
  onClose,
  onStatusChange,
}: {
  item?: DefectHistory;
  onClose: () => void;
  onStatusChange: (status: DefectProcessingStatus) => void;
}) {
  const { t } = useLanguage();
  if (!item) return null;

  const rows: [string, string][] = [
    [t("quality.col.defectNo"), item.defectNo],
    [t("quality.col.lotNo"), item.lotNumber],
    [t("quality.col.productName"), item.productName],
    [t("quality.col.productionDate"), item.productionDate],
    [t("quality.col.inspectionDate"), item.inspectionDate],
    [t("quality.col.inspectorName"), item.inspector],
    [t("quality.col.defectType"), t(DEFECT_TYPE_KEYS[item.defectType])],
    [t("quality.col.defectQty"), `${item.defectQuantity.toLocaleString()}${t("unit.item")}`],
    [t("quality.col.defectRate"), `${item.defectRate.toFixed(2)}%`],
    [t("quality.col.handler"), item.assignee],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold">{t("quality.tab.history")} 상세</h2>
            <Link
              href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`}
              className="mt-1 inline-block font-mono text-sm text-blue-600 underline"
            >
              {item.lotNumber}
            </Link>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">원인 분석</p>
            <p className="mt-2 text-sm leading-6">{item.cause}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500">조치 내용</p>
            <p className="mt-2 text-sm leading-6">{item.correctiveAction}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-center gap-3">
            <DefectStatusBadge status={item.status} />
            <select
              value={item.status}
              onChange={(e) => onStatusChange(e.target.value as DefectProcessingStatus)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {DEFECT_STATUS_CODE_LIST.map((code) => (
                <option key={code} value={code}>
                  {t(DEFECT_STATUS_KEYS[code])}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
            >
              LOT 추적
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
            >
              {t("action.close")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
