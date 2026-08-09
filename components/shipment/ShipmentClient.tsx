"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useShipments } from "@/context/ShipmentContext";
import ShipmentStatusBadge, { SHIPMENT_STATUS_KEYS } from "./ShipmentStatusBadge";
import type { Shipment, ShipmentStatus, ShipmentTab } from "@/types/shipment";
import { getBusinessDate } from "@/lib/selectors/business-date";
import { localizedMessage, localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";
import { generateShipmentNumber } from "@/lib/shipment-selectors";

const TABS: Array<{ id: ShipmentTab; labelKey: string }> = [
  { id: "register", labelKey: "shipment.tab.register" },
  { id: "waiting", labelKey: "shipment.tab.waiting" },
  { id: "completed", labelKey: "shipment.tab.completed" },
  { id: "history", labelKey: "shipment.tab.history" },
];

function displayName(locale: "ko" | "ja", ko: string, ja?: string | null) {
  if (locale === "ja" && ja?.trim()) return ja.trim();
  return localizedName({ locale, ko });
}

export default function ShipmentClient() {
  const [tab, setTab] = useState<ShipmentTab>("register");
  const { shipments, lotAvailability, shipmentLoading, shipmentError, refreshShipments, createShipment, updateShipmentStatus, completeShipment, cancelShipment } = useShipments();
  const { currentUser, hasPermission, auditLogs } = useAdmin();
  const { suppliers } = useMasterData();
  const { t, locale } = useLanguage();
  const [lotNumber, setLotNumber] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [customer, setCustomer] = useState("");
  const [plannedDate, setPlannedDate] = useState(getBusinessDate());
  const [manager, setManager] = useState(currentUser.name);
  const [memo, setMemo] = useState("");
  const [message, setMessage] = useState<{ text: string; key?: string; params?: Record<string, string | number>; error: boolean } | null>(null);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const selectedLot = lotAvailability.find((item) => item.lotNumber === lotNumber);
  const productJaByCode = useMemo(() => new Map(lotAvailability.map((lot) => [lot.productId, lot.productNameJa ?? null])), [lotAvailability]);
  const customerJaByName = useMemo(() => new Map(suppliers.map((supplier) => [supplier.name, supplier.nameJa ?? null])), [suppliers]);
  const nextShipmentNumber = useMemo(
    () => generateShipmentNumber(getBusinessDate(), shipments.length + 1),
    [shipments.length],
  );

  if (shipmentLoading) return <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">{t("shipment.loading")}</div>;
  if (shipmentError) {
    const errorMessage = shipmentError === "출하 데이터를 불러오지 못했습니다."
      ? t("shipment.error.load")
      : shipmentError === "출하 데이터 저장에 실패했습니다."
        ? t("shipment.error.save")
        : shipmentError;
    return <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"><p className="mb-4 text-red-700">{errorMessage}</p><button onClick={() => void refreshShipments()} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">{t("action.retry")}</button></div>;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = createShipment({ lotNumber, quantity: Number(quantity), customer, plannedDate, manager, memo });
    setMessage({ text: result.message, key: result.messageKey, params: result.messageParams, error: !result.success });
    if (result.success) {
      setQuantity("");
      setCustomer("");
      setMemo("");
      setTab("waiting");
    }
  };

  const runAction = (action: () => ReturnType<ReturnType<typeof useShipments>["completeShipment"]>) => {
    const result = action();
    setMessage({ text: result.message, key: result.messageKey, params: result.messageParams, error: !result.success });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5">
        <nav className="flex gap-2 overflow-x-auto" role="tablist">
          {TABS.map((item) => <button key={item.id} onClick={() => { setTab(item.id); setMessage(null); }} className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-bold ${tab === item.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{t(item.labelKey)}</button>)}
        </nav>
      </div>

      {message && <div className={`mx-5 mt-5 rounded-lg border px-4 py-3 text-sm font-semibold ${message.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message.key ? t(message.key, message.params) : localizedMessage(locale, message.text)}</div>}

      {tab === "register" && (
        <form onSubmit={submit} className="p-5">
          <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-gray-900">{t("shipment.register.title")}</h3><p className="mt-1 text-xs text-gray-500">{t("shipment.register.description")}</p></div><button type="button" onClick={() => setMessage({ text: "", key: "shipment.message.numberGenerated", params: { shipmentNumber: nextShipmentNumber }, error: false })} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">{t("shipment.register.autoNumber")} · <span className="font-mono">{nextShipmentNumber}</span></button></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label={`${t("shipment.field.lotNumber")} *`}><select value={lotNumber} onChange={(e) => { e.currentTarget.setCustomValidity(""); setLotNumber(e.target.value); }} onInvalid={(e) => e.currentTarget.setCustomValidity(t("shipment.placeholder.selectLot"))} required className={inputClass}><option value="">{t("shipment.placeholder.selectLot")}</option>{lotAvailability.map((lot) => <option key={lot.lotNumber} value={lot.lotNumber}>{lot.lotNumber} · {displayName(locale, lot.productName, lot.productNameJa)} · {t("shipment.available")} {lot.availableQuantity.toLocaleString()}{t("unit.item")}</option>)}</select></Field>
            <Field label={`${t("shipment.field.quantity")} *`}><input type="number" min={1} max={selectedLot?.availableQuantity} value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))} required className={inputClass} /></Field>
            <Field label={`${t("shipment.field.customer")} *`}><input list="shipment-customers" value={customer} onChange={(e) => setCustomer(e.target.value)} required className={inputClass} placeholder={t("shipment.placeholder.customer")} /><datalist id="shipment-customers">{suppliers.filter((supplier) => supplier.type !== "SUPPLIER").map((supplier) => <option key={supplier.id} value={supplier.name}>{displayName(locale, supplier.name, supplier.nameJa)}</option>)}</datalist></Field>
            <Field label={`${t("shipment.field.plannedDate")} *`}><DateInput value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} required className={inputClass} /></Field>
            <Field label={`${t("shipment.field.manager")} *`}><input type="text" value={manager} onChange={(e) => setManager(e.target.value)} required className={inputClass} placeholder={t("shipment.placeholder.manager")} /></Field>
            <Field label={t("shipment.field.memo")}><input value={memo} onChange={(e) => setMemo(e.target.value)} className={inputClass} placeholder={t("shipment.placeholder.optional")} /></Field>
          </div>
          {selectedLot && <LotSummary lot={selectedLot} />}
          <div className="mt-5 flex justify-end"><button disabled={!hasPermission("SHIPMENTS_CREATE")} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300">{t("shipment.action.register")}</button></div>
        </form>
      )}

      {tab === "waiting" && <ShipmentList items={shipments.filter((item) => item.status === "PLANNED" || item.status === "READY")} productJaByCode={productJaByCode} customerJaByName={customerJaByName} onOpen={setDetail} actions={(item) => <ShipmentActions item={item} hasPermission={hasPermission} runAction={runAction} updateShipmentStatus={updateShipmentStatus} completeShipment={completeShipment} cancelShipment={cancelShipment} /> } />}
      {tab === "completed" && <ShipmentList items={shipments.filter((item) => item.status === "COMPLETED")} productJaByCode={productJaByCode} customerJaByName={customerJaByName} history defaultDate={getBusinessDate()} onOpen={setDetail} />}
      {tab === "history" && <ShipmentList items={shipments} productJaByCode={productJaByCode} customerJaByName={customerJaByName} history onOpen={setDetail} />}
      {detail && <ShipmentDetail item={detail} productNameJa={productJaByCode.get(detail.productId)} customerNameJa={customerJaByName.get(detail.customer)} lot={lotAvailability.find((lot) => lot.lotNumber === detail.lotNumber)} audits={auditLogs.filter((log) => log.targetType === "SHIPMENT" && log.targetId === detail.id)} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ShipmentList({ items, history = false, defaultDate = "", productJaByCode, customerJaByName, onOpen, actions }: { items: Shipment[]; history?: boolean; defaultDate?: string; productJaByCode: Map<string, string | null>; customerJaByName: Map<string, string | null>; onOpen: (item: Shipment) => void; actions?: (item: Shipment) => React.ReactNode }) {
  const { t, locale } = useLanguage();
  const [date, setDate] = useState(defaultDate);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "ALL">("ALL");
  const filtered = useMemo(() => items.filter((item) => {
    const matchesDate = !date || (history ? item.shippedDate?.startsWith(date) : item.plannedDate === date);
    const text = `${item.productName} ${item.lotNumber} ${item.customer}`.toLowerCase();
    return matchesDate && (!keyword || text.includes(keyword.toLowerCase())) && (status === "ALL" || item.status === status);
  }), [date, history, items, keyword, status]);
  const totalQuantity = useMemo(() => filtered.reduce((sum, item) => sum + item.quantity, 0), [filtered]);

  return <div className="p-5"><div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div className="grid gap-3 flex-1 md:grid-cols-3"><DateInput aria-label={t("shipment.filter.date")} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} className={inputClass} placeholder={t("shipment.placeholder.search")} /><select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus | "ALL")} className={inputClass}><option value="ALL">{t("shipment.filter.allStatus")}</option>{Object.entries(SHIPMENT_STATUS_KEYS).filter(([value]) => value !== "PLANNED").map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}</select></div><div className="text-xs font-semibold text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">{t("shipment.field.quantity")} {t("action.reset") === "초기화" ? "합계" : "合計"}: <strong className="text-blue-600 text-sm ml-1">{totalQuantity.toLocaleString()}</strong> {t("unit.item")} ({filtered.length}{t("common.count.item")})</div></div><div className="overflow-x-auto rounded-lg border border-gray-200"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">{t("shipment.field.shipmentNumber")}</th><th className="px-4 py-3">LOT</th><th className="px-4 py-3">{t("shipment.field.productName")}</th><th className="px-4 py-3">{t("shipment.field.customer")}</th><th className="px-4 py-3">{t(history ? "shipment.field.shippedDate" : "shipment.field.plannedDate")}</th><th className="px-4 py-3 text-right">{t("shipment.field.quantity")}</th><th className="px-4 py-3">{t("shipment.field.manager")}</th><th className="px-4 py-3">{t("shipment.field.status")}</th>{actions && <th className="px-4 py-3 text-right">{t("shipment.field.action")}</th>}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.id} className="cursor-pointer hover:bg-blue-50/40" onClick={() => onOpen(item)}><td className="px-4 py-3 font-mono font-bold text-blue-700">{item.shipmentNumber}</td><td className="px-4 py-3 font-mono text-xs">{item.lotNumber}</td><td className="px-4 py-3 font-semibold">{displayName(locale, item.productName, productJaByCode.get(item.productId))}</td><td className="px-4 py-3">{displayName(locale, item.customer, customerJaByName.get(item.customer))}</td><td className="px-4 py-3">{history ? item.shippedDate : item.plannedDate}</td><td className="px-4 py-3 text-right font-bold">{item.quantity.toLocaleString()}</td><td className="px-4 py-3">{localizedName({ locale, ko: item.manager })}</td><td className="px-4 py-3"><ShipmentStatusBadge status={item.status} /></td>{actions && <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>{actions(item)}</td>}</tr>)}</tbody></table>{filtered.length === 0 && <p className="py-12 text-center text-sm text-gray-400">{t("shipment.empty.search")}</p>}</div></div>;
}

function ShipmentActions({ item, hasPermission, runAction, updateShipmentStatus, completeShipment, cancelShipment }: {
  item: Shipment;
  hasPermission: ReturnType<typeof useAdmin>["hasPermission"];
  runAction: (action: () => ReturnType<ReturnType<typeof useShipments>["completeShipment"]>) => void;
  updateShipmentStatus: ReturnType<typeof useShipments>["updateShipmentStatus"];
  completeShipment: ReturnType<typeof useShipments>["completeShipment"];
  cancelShipment: ReturnType<typeof useShipments>["cancelShipment"];
}) {
  const { t } = useLanguage();
  return <div className="flex justify-end gap-1">
    {item.status === "PLANNED" && <button disabled={!hasPermission("SHIPMENTS_UPDATE")} onClick={() => runAction(() => updateShipmentStatus(item.id, "READY"))} className={smallButton}>{t("shipment.action.ready")}</button>}
    {(item.status === "PLANNED" || item.status === "READY") && <button disabled={!hasPermission("SHIPMENTS_COMPLETE")} onClick={() => runAction(() => completeShipment(item.id))} className={smallButton}>{t("shipment.action.complete")}</button>}
    {(item.status === "PLANNED" || item.status === "READY") && <button disabled={!hasPermission("SHIPMENTS_UPDATE")} onClick={() => runAction(() => cancelShipment(item.id))} className={smallButton}>{t("common.cancel")}</button>}
  </div>;
}

function LotSummary({ lot }: { lot: ReturnType<typeof useShipments>["lotAvailability"][number] }) {
  const { t, locale } = useLanguage();
  const unit = t("unit.item");
  const values = [
    [t("shipment.field.productName"), displayName(locale, lot.productName, lot.productNameJa)],
    [t("shipment.field.productionDate"), lot.productionDate],
    [t("shipment.field.productionQuantity"), `${lot.productionQuantity.toLocaleString()}${unit}`],
    [t("shipment.field.qualityStatus"), t(lot.inspectionPassed ? "quality.judgment.passed" : "quality.judgment.failed")],
    [t("shipment.field.currentStock"), `${lot.currentStock.toLocaleString()}${unit}`],
    [t("shipment.field.availableQuantity"), `${lot.availableQuantity.toLocaleString()}${unit}`],
  ];
  return <div className={`mt-5 rounded-xl border p-4 ${lot.canShip ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{values.map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-bold text-gray-900">{value}</p></div>)}</div>{lot.reason && <p className="mt-3 text-sm font-bold text-red-600">{lot.reasonKey ? t(lot.reasonKey) : lot.reason}</p>}</div>;
}

function ShipmentDetail({ item, productNameJa, customerNameJa, lot, audits, onClose }: { item: Shipment; productNameJa?: string | null; customerNameJa?: string | null; lot?: ReturnType<typeof useShipments>["lotAvailability"][number]; audits: ReturnType<typeof useAdmin>["auditLogs"]; onClose: () => void }) {
  const { t, locale } = useLanguage();
  const unit = t("unit.item");
  const auditDescription = (action: string, original: string) => {
    if (action === "SHIPMENT_CREATED") return t("shipment.audit.created", { shipmentNumber: item.shipmentNumber });
    if (action === "SHIPMENT_STATUS_UPDATED") return t("shipment.audit.statusUpdated", { shipmentNumber: item.shipmentNumber });
    if (action === "SHIPMENT_COMPLETED") return t("shipment.audit.completed", { shipmentNumber: item.shipmentNumber, quantity: item.quantity.toLocaleString() });
    return original;
  };
  const values = [
    [t("shipment.field.lotNumber"), item.lotNumber],
    [t("shipment.field.productName"), displayName(locale, item.productName, productNameJa)],
    [t("shipment.field.productionDate"), lot?.productionDate ?? "-"],
    [t("shipment.field.productionQuantity"), lot ? `${lot.productionQuantity.toLocaleString()}${unit}` : "-"],
    [t("shipment.field.inspectionResult"), t(lot?.inspectionPassed ? "quality.judgment.passed" : "shipment.quality.notPassed")],
    [t("shipment.field.lotStock"), lot ? `${lot.currentStock.toLocaleString()}${unit}` : "-"],
    [t("shipment.field.quantity"), `${item.quantity.toLocaleString()}${unit}`],
    [t("shipment.field.customer"), displayName(locale, item.customer, customerNameJa)],
    [t("shipment.field.plannedDate"), item.plannedDate],
    [t("shipment.field.shippedDate"), item.shippedDate ?? "-"],
    [t("shipment.field.manager"), localizedName({ locale, ko: item.manager })],
    [t("shipment.field.status"), t(SHIPMENT_STATUS_KEYS[item.status])],
    [t("shipment.field.memo"), item.memo ?? "-"],
  ];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b p-5"><div><h3 className="text-lg font-bold">{t("shipment.detail.title")}</h3><p className="font-mono text-xs text-blue-600">{item.shipmentNumber}</p></div><button aria-label={t("common.close")} onClick={onClose} className="text-2xl text-gray-400">×</button></div><div className="grid gap-4 p-5 sm:grid-cols-2">{values.map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div><div className="border-t px-5 py-4"><h4 className="text-sm font-bold">{t("shipment.detail.auditLog")}</h4>{audits.length ? audits.map((log) => <div key={log.id} className="mt-2 rounded-lg bg-gray-50 p-3 text-xs"><p className="font-bold">{log.action} · {localizedName({ locale, ko: log.actorName })}</p><p className="mt-1 text-gray-500">{log.occurredAt} · {auditDescription(log.action, log.description)}</p></div>) : <p className="mt-2 text-xs text-gray-400">{t("shipment.detail.noAudit")}</p>}</div><div className="flex justify-end gap-2 border-t p-5"><Link href={`/traceability?lot=${encodeURIComponent(item.lotNumber)}`} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">{t("shipment.detail.traceLot")}</Link><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-bold">{t("common.close")}</button></div></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-700">{label}</span>{children}</label>; }
const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const smallButton = "rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-600 disabled:text-gray-300";
