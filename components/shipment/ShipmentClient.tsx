"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useShipments } from "@/context/ShipmentContext";
import ShipmentStatusBadge, { SHIPMENT_STATUS_LABELS } from "./ShipmentStatusBadge";
import type { Shipment, ShipmentStatus, ShipmentTab } from "@/types/shipment";
import { getBusinessDate } from "@/lib/selectors/business-date";

const TABS: Array<{ id: ShipmentTab; label: string }> = [
  { id: "register", label: "출하 등록" },
  { id: "status", label: "출하 현황" },
  { id: "history", label: "출하 이력" },
];

export default function ShipmentClient() {
  const [tab, setTab] = useState<ShipmentTab>("register");
  const { shipments, lotAvailability, createShipment, updateShipmentStatus, completeShipment, cancelShipment } = useShipments();
  const { activeUsers, roles, hasPermission, auditLogs } = useAdmin();
  const managers = activeUsers.filter((user) => user.roleIds.some((roleId) => {
    const code = roles.find((role) => role.id === roleId)?.code;
    return code === "ADMIN" || code === "PRODUCTION_MANAGER";
  }));
  const [lotNumber, setLotNumber] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [customer, setCustomer] = useState("");
  const [plannedDate, setPlannedDate] = useState(getBusinessDate());
  const [manager, setManager] = useState(managers[0]?.name ?? "");
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const selectedLot = lotAvailability.find((item) => item.lotNumber === lotNumber);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = createShipment({ lotNumber, quantity: Number(quantity), customer, plannedDate, manager, memo });
    setMessage({ text: result.message, error: !result.success });
    if (result.success) {
      setQuantity("");
      setCustomer("");
      setMemo("");
      setTab("status");
    }
  };

  const runAction = (action: () => { success: boolean; message: string }) => {
    const result = action();
    setMessage({ text: result.message, error: !result.success });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5">
        <nav className="flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map((item) => <button key={item.id} onClick={() => { setTab(item.id); setMessage(null); }} className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold ${tab === item.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{item.label}</button>)}
        </nav>
      </div>

      {message && <div className={`mx-5 mt-5 rounded-lg border px-4 py-3 text-sm font-semibold ${message.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message.text}</div>}

      {tab === "register" && (
        <form onSubmit={submit} className="p-5">
          <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-gray-900">신규 출하 등록</h3><p className="mt-1 text-xs text-gray-500">품질검사에 합격하고 출하 가능한 재고가 있는 완제품 LOT만 선택할 수 있습니다.</p></div><span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-mono text-gray-600">출하번호 자동 생성</span></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="LOT 번호 *"><select value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} required className={inputClass}><option value="">LOT 선택</option>{lotAvailability.map((lot) => <option key={lot.lotNumber} value={lot.lotNumber}>{lot.lotNumber} · {lot.productName} · 가용 {lot.availableQuantity.toLocaleString()}개</option>)}</select></Field>
            <Field label="출하 수량 *"><input type="number" min={1} max={selectedLot?.availableQuantity} value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} required className={inputClass} /></Field>
            <Field label="거래처 *"><input value={customer} onChange={(e) => setCustomer(e.target.value)} required className={inputClass} placeholder="거래처명 입력" /></Field>
            <Field label="출하 예정일 *"><input type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} required className={inputClass} /></Field>
            <Field label="출하 담당자 *"><select value={manager} onChange={(e) => setManager(e.target.value)} required className={inputClass}>{managers.map((user) => <option key={user.id} value={user.name}>{user.name} · {user.employeeNo}</option>)}</select></Field>
            <Field label="비고"><input value={memo} onChange={(e) => setMemo(e.target.value)} className={inputClass} placeholder="선택 입력" /></Field>
          </div>
          {selectedLot && <LotSummary lot={selectedLot} />}
          <div className="mt-5 flex justify-end"><button disabled={!hasPermission("SHIPMENTS_CREATE")} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">출하 등록</button></div>
        </form>
      )}

      {tab === "status" && <ShipmentList items={shipments.filter((item) => item.status !== "COMPLETED")} onOpen={setDetail} actions={(item) => <div className="flex justify-end gap-1.5">{item.status === "PLANNED" && <button disabled={!hasPermission("SHIPMENTS_UPDATE")} onClick={() => runAction(() => updateShipmentStatus(item.id, "READY"))} className={smallButton}>준비</button>} {(item.status === "PLANNED" || item.status === "READY") && <button disabled={!hasPermission("SHIPMENTS_COMPLETE")} onClick={() => runAction(() => completeShipment(item.id))} className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white disabled:bg-gray-300">완료</button>} {(item.status === "PLANNED" || item.status === "READY") && <button disabled={!hasPermission("SHIPMENTS_UPDATE")} onClick={() => runAction(() => cancelShipment(item.id))} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 disabled:text-gray-300">취소</button>}</div>} />}
      {tab === "history" && <ShipmentList items={shipments.filter((item) => item.status === "COMPLETED")} history onOpen={setDetail} />}
      {detail && <ShipmentDetail item={detail} lot={lotAvailability.find((lot) => lot.lotNumber === detail.lotNumber)} audits={auditLogs.filter((log) => log.targetType === "SHIPMENT" && log.targetId === detail.id)} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ShipmentList({ items, history = false, onOpen, actions }: { items: Shipment[]; history?: boolean; onOpen: (item: Shipment) => void; actions?: (item: Shipment) => React.ReactNode }) {
  const [date, setDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "ALL">("ALL");
  const filtered = useMemo(() => items.filter((item) => {
    const matchesDate = !date || (history ? item.shippedDate?.startsWith(date) : item.plannedDate === date);
    const text = `${item.productName} ${item.lotNumber} ${item.customer}`.toLowerCase();
    return matchesDate && (!keyword || text.includes(keyword.toLowerCase())) && (status === "ALL" || item.status === status);
  }), [date, history, items, keyword, status]);
  return <div className="p-5"><div className="mb-4 grid gap-3 md:grid-cols-3"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} className={inputClass} placeholder="제품, LOT, 거래처 검색" /><select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus | "ALL")} className={inputClass}><option value="ALL">전체 상태</option>{Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">출하번호</th><th className="px-4 py-3">LOT</th><th className="px-4 py-3">제품명</th><th className="px-4 py-3">거래처</th><th className="px-4 py-3">{history ? "출하일" : "예정일"}</th><th className="px-4 py-3 text-right">수량</th><th className="px-4 py-3">담당자</th><th className="px-4 py-3">상태</th>{actions && <th className="px-4 py-3 text-right">작업</th>}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.id} className="cursor-pointer hover:bg-blue-50/40" onClick={() => onOpen(item)}><td className="px-4 py-3 font-mono font-bold text-blue-700">{item.shipmentNumber}</td><td className="px-4 py-3 font-mono text-xs">{item.lotNumber}</td><td className="px-4 py-3 font-semibold">{item.productName}</td><td className="px-4 py-3">{item.customer}</td><td className="px-4 py-3">{history ? item.shippedDate : item.plannedDate}</td><td className="px-4 py-3 text-right font-bold">{item.quantity.toLocaleString()}</td><td className="px-4 py-3">{item.manager}</td><td className="px-4 py-3"><ShipmentStatusBadge status={item.status} /></td>{actions && <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>{actions(item)}</td>}</tr>)}</tbody></table>{filtered.length === 0 && <p className="py-12 text-center text-sm text-gray-400">조회된 출하가 없습니다.</p>}</div></div>;
}

function LotSummary({ lot }: { lot: ReturnType<typeof useShipments>["lotAvailability"][number] }) {
  return <div className={`mt-5 rounded-xl border p-4 ${lot.canShip ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{[["제품명", lot.productName], ["생산일", lot.productionDate], ["생산수량", `${lot.productionQuantity.toLocaleString()}개`], ["품질 상태", lot.inspectionPassed ? "합격" : "미합격"], ["현재 재고", `${lot.currentStock.toLocaleString()}개`], ["출하 가능", `${lot.availableQuantity.toLocaleString()}개`]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-bold text-gray-900">{value}</p></div>)}</div>{lot.reason && <p className="mt-3 text-sm font-bold text-red-600">{lot.reason}</p>}</div>;
}

function ShipmentDetail({ item, lot, audits, onClose }: { item: Shipment; lot?: ReturnType<typeof useShipments>["lotAvailability"][number]; audits: ReturnType<typeof useAdmin>["auditLogs"]; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b p-5"><div><h3 className="text-lg font-bold">출하 상세</h3><p className="font-mono text-xs text-blue-600">{item.shipmentNumber}</p></div><button onClick={onClose} className="text-2xl text-gray-400">×</button></div><div className="grid gap-4 p-5 sm:grid-cols-2">{[["LOT 번호", item.lotNumber], ["제품명", item.productName], ["생산일", lot?.productionDate ?? "-"], ["생산수량", lot ? `${lot.productionQuantity.toLocaleString()}개` : "-"], ["품질검사 결과", lot?.inspectionPassed ? "합격" : "미합격/미완료"], ["현재 LOT 재고", lot ? `${lot.currentStock.toLocaleString()}개` : "-"], ["출하수량", `${item.quantity.toLocaleString()}개`], ["거래처", item.customer], ["출하 예정일", item.plannedDate], ["출하일", item.shippedDate ?? "-"], ["담당자", item.manager], ["상태", SHIPMENT_STATUS_LABELS[item.status]], ["비고", item.memo ?? "-"]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div><div className="border-t px-5 py-4"><h4 className="text-sm font-bold">감사 로그</h4>{audits.length ? audits.map((log) => <div key={log.id} className="mt-2 rounded-lg bg-gray-50 p-3 text-xs"><p className="font-bold">{log.action} · {log.actorName}</p><p className="mt-1 text-gray-500">{log.occurredAt} · {log.description}</p></div>) : <p className="mt-2 text-xs text-gray-400">현재 세션에서 기록된 감사 로그가 없습니다.</p>}</div><div className="flex justify-end gap-2 border-t p-5"><Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">LOT 추적</Link><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-bold">닫기</button></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-700">{label}</span>{children}</label>; }
const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const smallButton = "rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-600 disabled:text-gray-300";
