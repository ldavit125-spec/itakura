"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useProduction } from "@/context/ProductionContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import type { DefectHistory, DefectProcessingStatus, DefectType } from "@/types/quality";
import { DEFECT_TYPE_CODE_LIST, DEFECT_STATUS_CODE_LIST } from "./DefectHistoryTable";

// 불량 유형 코드 → 번역 키
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

// 불량 처리 상태 코드 → 번역 키
const DEFECT_STATUS_KEYS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "quality.defectStatus.investigating",
  CAUSE_ANALYZED: "quality.defectStatus.causeAnalyzed",
  REWORK: "quality.defectStatus.rework",
  DISCARDED: "quality.defectStatus.discarded",
  SHIPMENT_HOLD: "quality.defectStatus.shipmentHold",
  COMPLETED: "quality.defectStatus.completed",
};

export default function DefectHistoryCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<DefectHistory, "id" | "defectNo" | "createdAt" | "updatedAt">) => boolean;
}) {
  const { t, locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const { fgLots } = useProduction();
  const { activeUsers } = useAdmin();

  const [lotNumber, setLotNumber] = useState("");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [inspector, setInspector] = useState("");
  const [defectType, setDefectType] = useState<DefectType>("OTHER");
  const [defectQuantity, setDefectQuantity] = useState(1);
  const [cause, setCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [status, setStatus] = useState<DefectProcessingStatus>("INVESTIGATING");
  const [assignee, setAssignee] = useState("");

  const lot = useMemo(() => fgLots.find((item) => item.fgLotNo === lotNumber), [fgLots, lotNumber]);

  if (!isOpen) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!lot) return;
    const ok = onSubmit({
      lotNumber: lot.fgLotNo,
      productId: lot.productCode,
      productName: lot.productName,
      productionDate: lot.productionDate,
      inspectionDate,
      inspector,
      defectType,
      defectQuantity,
      defectRate: lot.totalQuantity > 0 ? Number((defectQuantity / lot.totalQuantity * 100).toFixed(3)) : 0,
      cause,
      correctiveAction,
      status,
      assignee,
    });
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold">{t("quality.btn.registerDefect")}</h3>
          <button onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={`${t("quality.col.fgLotNo")} *`}>
              <select required value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} className={input}>
                <option value="">{tr("LOT 선택", "LOTを選択")}</option>
                {fgLots.map((item) => (
                  <option key={item.id} value={item.fgLotNo}>
                    {item.fgLotNo} · {item.productName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`${t("quality.col.inspectionDate")} *`}>
              <input required type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} className={input} />
            </Field>
            <Field label={`${t("quality.col.inspectorName")} *`}>
              <input required list="defect-users" value={inspector} onChange={(e) => setInspector(e.target.value)} className={input} />
            </Field>
            <Field label={`${t("quality.col.handler")} *`}>
              <input required list="defect-users" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input} />
            </Field>
            <datalist id="defect-users">
              {activeUsers.map((user) => <option key={user.id} value={user.name} />)}
            </datalist>
            <Field label={`${t("quality.col.defectType")} *`}>
              <select value={defectType} onChange={(e) => setDefectType(e.target.value as DefectType)} className={input}>
                {DEFECT_TYPE_CODE_LIST.map((code) => (
                  <option key={code} value={code}>{t(DEFECT_TYPE_KEYS[code])}</option>
                ))}
              </select>
            </Field>
            <Field label={`${t("quality.col.defectQty")} *`}>
              <input required min={1} type="number" value={defectQuantity} onChange={(e) => setDefectQuantity(Number(e.target.value))} className={input} />
            </Field>
            <Field label={`${t("quality.col.defectStatus")} *`}>
              <select value={status} onChange={(e) => setStatus(e.target.value as DefectProcessingStatus)} className={input}>
                {DEFECT_STATUS_CODE_LIST.map((code) => (
                  <option key={code} value={code}>{t(DEFECT_STATUS_KEYS[code])}</option>
                ))}
              </select>
            </Field>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p className="text-gray-500">{t("quality.col.productName")} / {t("quality.col.defectRate")}</p>
              <p className="mt-1 font-bold">
                {lot?.productName ?? tr("LOT를 선택하세요", "LOTを選択してください")}{" "}
                {lot && `· ${(defectQuantity / lot.totalQuantity * 100).toFixed(2)}%`}
              </p>
            </div>
          </div>
          <Field label={tr("불량 내용 및 원인 *", "不良内容および原因 *")}>
            <textarea required rows={3} value={cause} onChange={(e) => setCause(e.target.value)} className={input} placeholder={tr("발견된 불량 내용과 원인을 입력하세요.", "発見された不良内容と原因を入力してください。")} />
          </Field>
          <Field label={tr("시정 조치 내용 *", "是正措置内容 *")}>
            <textarea required rows={3} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} className={input} placeholder={tr("불량에 대해 실시하거나 계획한 조치를 입력하세요.", "不良に対して実施または計画した措置を入力してください。")} />
          </Field>
          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">{t("common.cancel")}</button>
            <button className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white">{t("quality.btn.registerDefect")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500";
