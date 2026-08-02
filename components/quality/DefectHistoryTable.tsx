"use client";

import { useMemo, useState } from "react";
import type { DefectHistory, DefectProcessingStatus, DefectType } from "@/types/quality";
import DefectStatusBadge, { DEFECT_STATUS_LABELS } from "./DefectStatusBadge";

export const DEFECT_TYPE_LABELS: Record<DefectType, string> = {
  FOREIGN_MATERIAL: "이물 혼입", WEIGHT: "중량 불량", PACKAGING: "포장 불량", APPEARANCE: "외관 불량",
  SEALING: "밀봉 불량", LABEL: "라벨 불량", DAMAGE: "파손", OTHER: "기타",
};

export default function DefectHistoryTable({ items, onOpen, onCreate }: { items: DefectHistory[]; onOpen: (item: DefectHistory) => void; onCreate?: () => void }) {
  const [date, setDate] = useState("");
  const [lot, setLot] = useState("");
  const [product, setProduct] = useState("");
  const [inspector, setInspector] = useState("");
  const [type, setType] = useState<DefectType | "ALL">("ALL");
  const [status, setStatus] = useState<DefectProcessingStatus | "ALL">("ALL");
  const filtered = useMemo(() => items.filter((item) =>
    (!date || item.inspectionDate === date)
    && (!lot || item.lotNumber.toLowerCase().includes(lot.toLowerCase()))
    && (!product || item.productName.toLowerCase().includes(product.toLowerCase()))
    && (!inspector || item.inspector.toLowerCase().includes(inspector.toLowerCase()))
    && (type === "ALL" || item.defectType === type)
    && (status === "ALL" || item.status === status)
  ), [date, inspector, items, lot, product, status, type]);

  return <div className="p-4 sm:p-6 space-y-4">
    <div className="flex justify-end">{onCreate && <button onClick={onCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">불량품 이력 등록</button>}</div>
    <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="LOT 번호" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="제품명" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <input value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="검사자" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <select value={type} onChange={(e) => setType(e.target.value as DefectType | "ALL")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="ALL">전체 불량 유형</option>{Object.entries(DEFECT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={status} onChange={(e) => setStatus(e.target.value as DefectProcessingStatus | "ALL")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="ALL">전체 처리 상태</option>{Object.entries(DEFECT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>
    <p className="text-xs text-gray-500">총 {filtered.length}건 · 행을 클릭하면 상세 정보를 확인할 수 있습니다.</p>
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[1450px] text-sm">
        <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">불량번호</th><th className="px-4 py-3">LOT 번호</th><th className="px-4 py-3">제품명</th><th className="px-4 py-3">생산일</th><th className="px-4 py-3">검사일</th><th className="px-4 py-3">검사자</th><th className="px-4 py-3">불량 유형</th><th className="px-4 py-3 text-right">불량 수량</th><th className="px-4 py-3 text-right">불량률(%)</th><th className="px-4 py-3 text-center">처리 상태</th><th className="px-4 py-3">담당자</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.id} onClick={() => onOpen(item)} className="cursor-pointer hover:bg-blue-50/50"><td className="px-4 py-3 font-mono font-bold text-blue-700">{item.defectNo}</td><td className="px-4 py-3 font-mono text-xs text-blue-600 underline">{item.lotNumber}</td><td className="px-4 py-3 font-semibold">{item.productName}</td><td className="px-4 py-3">{item.productionDate}</td><td className="px-4 py-3">{item.inspectionDate}</td><td className="px-4 py-3">{item.inspector}</td><td className="px-4 py-3">{DEFECT_TYPE_LABELS[item.defectType]}</td><td className="px-4 py-3 text-right font-bold text-red-600">{item.defectQuantity.toLocaleString()}</td><td className="px-4 py-3 text-right">{item.defectRate.toFixed(2)}%</td><td className="px-4 py-3 text-center"><DefectStatusBadge status={item.status} /></td><td className="px-4 py-3">{item.assignee}</td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
