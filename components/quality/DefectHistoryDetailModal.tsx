"use client";

import Link from "next/link";
import type { DefectHistory, DefectProcessingStatus } from "@/types/quality";
import DefectStatusBadge, { DEFECT_STATUS_LABELS } from "./DefectStatusBadge";
import { DEFECT_TYPE_LABELS } from "./DefectHistoryTable";

export default function DefectHistoryDetailModal({ item, onClose, onStatusChange }: {
  item?: DefectHistory; onClose: () => void; onStatusChange: (status: DefectProcessingStatus) => void;
}) {
  if (!item) return null;
  const rows = [
    ["불량번호", item.defectNo], ["LOT 번호", item.lotNumber], ["제품명", item.productName],
    ["생산일", item.productionDate], ["검사일", item.inspectionDate], ["검사자", item.inspector],
    ["불량 유형", DEFECT_TYPE_LABELS[item.defectType]], ["불량 수량", `${item.defectQuantity.toLocaleString()}개`],
    ["불량률", `${item.defectRate.toFixed(2)}%`], ["담당자", item.assignee],
  ];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex justify-between"><div><h2 className="text-xl font-bold">불량품 이력 상세</h2><Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="mt-1 inline-block font-mono text-sm text-blue-600 underline">{item.lotNumber}</Link></div><button onClick={onClose} className="text-2xl text-gray-400">×</button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-1 text-sm font-semibold text-gray-900">{value}</p></div>)}</div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-lg border border-gray-200 p-4"><p className="text-xs font-bold text-gray-500">원인 분석</p><p className="mt-2 text-sm leading-6">{item.cause}</p></div><div className="rounded-lg border border-gray-200 p-4"><p className="text-xs font-bold text-gray-500">조치 내용</p><p className="mt-2 text-sm leading-6">{item.correctiveAction}</p></div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className="flex items-center gap-3"><DefectStatusBadge status={item.status} /><select value={item.status} onChange={(e) => onStatusChange(e.target.value as DefectProcessingStatus)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">{Object.entries(DEFECT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex gap-2"><Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">LOT 추적</Link><button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold">닫기</button></div></div>
    </section>
  </div>;
}
