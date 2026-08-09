"use client";

import { FormEvent, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import type { CorrectiveAction, DepartmentCode, Nonconformity } from "@/types/quality";

export default function CorrectiveActionCreateModal({ isOpen, onClose, nonconformities, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  nonconformities: Nonconformity[];
  onSubmit: (data: Omit<CorrectiveAction, "id" | "caNo" | "caStatus" | "verificationStatus">) => boolean;
}) {
  const { activeUsers } = useAdmin();
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const [ncNo, setNcNo] = useState("");
  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 10));
  const [department, setDepartment] = useState<DepartmentCode>("QUALITY");
  const [handler, setHandler] = useState("");
  const [problemSummary, setProblemSummary] = useState("");
  const [interimAction, setInterimAction] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [preventiveMeasure, setPreventiveMeasure] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const ok = onSubmit({ ncNo, requestDate, targetDepartment: department, handler, problemSummary, interimAction, actionPlan, preventiveMeasure, dueDate });
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold">{tr("시정조치 등록", "是正措置登録")}</h3>
          <button onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={tr("연결 부적합 번호 *", "関連不適合番号 *")}>
              <select required value={ncNo} onChange={(event) => { setNcNo(event.target.value); const nc = nonconformities.find((item) => item.ncNo === event.target.value); if (nc) setProblemSummary(nc.details); }} className={input}>
                <option value="">{tr("부적합 선택", "不適合を選択")}</option>
                {nonconformities.map((nc) => <option key={nc.id} value={nc.ncNo}>{nc.ncNo} · {localizedName({ locale, ko: nc.targetName })}</option>)}
              </select>
            </Field>
            <Field label={tr("요청일 *", "依頼日 *")}><input required type="date" lang={locale === "ja" ? "ja-JP" : "ko-KR"} value={requestDate} onChange={(event) => setRequestDate(event.target.value)} className={input} /></Field>
            <Field label={tr("담당 부서 *", "担当部署 *")}>
              <select value={department} onChange={(event) => setDepartment(event.target.value as DepartmentCode)} className={input}>
                <option value="MATERIALS">{tr("자재", "資材")}</option><option value="PRODUCTION">{tr("생산", "生産")}</option><option value="QUALITY">{tr("품질", "品質")}</option><option value="FACILITY">{tr("설비", "設備")}</option><option value="HYGIENE">{tr("위생", "衛生")}</option>
              </select>
            </Field>
            <Field label={tr("담당자 *", "担当者 *")}><input required list="ca-users" value={localizedName({ locale, ko: handler })} onChange={(event) => setHandler(event.target.value)} className={input} /><datalist id="ca-users">{activeUsers.map((user) => <option key={user.id} value={localizedName({ locale, ko: user.name })} />)}</datalist></Field>
            <Field label={tr("완료 예정일 *", "完了予定日 *")}><input required type="date" lang={locale === "ja" ? "ja-JP" : "ko-KR"} value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={input} /></Field>
          </div>
          <Field label={tr("불량 내용 / 문제 요약 *", "不良内容／問題要約 *")}><textarea required rows={3} value={problemSummary} onChange={(event) => setProblemSummary(event.target.value)} className={input} placeholder={tr("시정조치가 필요한 불량 내용을 입력하세요.", "是正措置が必要な不良内容を入力してください。")}/></Field>
          <Field label={tr("임시 조치", "暫定措置")}><textarea rows={2} value={interimAction} onChange={(event) => setInterimAction(event.target.value)} className={input}/></Field>
          <Field label={tr("시정 조치 내용 *", "是正措置内容 *")}><textarea required rows={3} value={actionPlan} onChange={(event) => setActionPlan(event.target.value)} className={input} placeholder={tr("실행할 시정 조치 내용을 입력하세요.", "実施する是正措置内容を入力してください。")}/></Field>
          <Field label={tr("재발 방지 대책", "再発防止対策")}><textarea rows={2} value={preventiveMeasure} onChange={(event) => setPreventiveMeasure(event.target.value)} className={input}/></Field>
          <div className="flex justify-end gap-2 border-t pt-4"><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">{tr("취소", "キャンセル")}</button><button className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white">{tr("시정조치 등록", "是正措置登録")}</button></div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-xs font-bold text-gray-700">{label}</span>{children}</label>; }
const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500";
