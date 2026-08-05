"use client";

import { FormEvent, useState } from "react";
import type { AdminRole, AdminUser, AdminUserInput } from "@/types/admin";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

export default function UserAccountModal({
  user,
  roles,
  productionLines,
  onClose,
  onSave,
}: {
  user?: AdminUser;
  roles: AdminRole[];
  productionLines: string[];
  onClose: () => void;
  onSave: (input: AdminUserInput | Partial<Omit<AdminUser, "id">>) => { success: boolean; message?: string };
}) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const [employeeNo, setEmployeeNo] = useState(user?.employeeNo ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [roleIds, setRoleIds] = useState<string[]>(user?.roleIds ?? []);
  const [lines, setLines] = useState<string[]>(user?.productionLines ?? []);
  const [error, setError] = useState("");

  const toggleRole = (roleId: string) => setRoleIds((previous) =>
    previous.includes(roleId) ? previous.filter((id) => id !== roleId) : [...previous, roleId]
  );
  const toggleLine = (line: string) => setLines((previous) => {
    if (line === "ALL") return previous.includes("ALL") ? [] : ["ALL"];
    const withoutAll = previous.filter((value) => value !== "ALL");
    return withoutAll.includes(line) ? withoutAll.filter((value) => value !== line) : [...withoutAll, line];
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!employeeNo.trim() || !name.trim() || !email.trim() || roleIds.length === 0) {
      setError(isJa ? "社員番号、名前、メール、役割は必須です。" : "사번, 이름, 이메일, 역할은 필수입니다.");
      return;
    }
    const result = onSave({
      employeeNo,
      name,
      email,
      department,
      roleIds,
      productionLines: lines,
    });
    if (result.success) onClose();
    else setError(result.message ?? (isJa ? "保存できませんでした。" : "저장하지 못했습니다."));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user ? (isJa ? "ユーザーアカウント編集" : "사용자 계정 수정") : (isJa ? "新規ユーザー登録" : "신규 사용자 등록")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isJa ? "現場システム接続アカウントと業務範囲を設定します。" : "현장 시스템 접속 계정과 업무 범위를 설정합니다."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>
        {user && (
          <label className="mt-5 block text-xs font-semibold text-gray-500">
            {isJa ? "ユーザーID" : "사용자 ID"}
            <input value={user.id} disabled className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
          </label>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={isJa ? "社員番号 *" : "사번 *"} value={employeeNo} onChange={setEmployeeNo} />
          <Field label={isJa ? "名前 *" : "이름 *"} value={name} onChange={setName} />
          <Field label={isJa ? "メール *" : "이메일 *"} type="email" value={email} onChange={setEmail} />
          <Field label={isJa ? "部署" : "부서"} value={department} onChange={setDepartment} />
        </div>
        <h3 className="mt-6 text-sm font-bold text-gray-800">{isJa ? "役割 *" : "역할 *"}</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm">
              <input type="checkbox" checked={roleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />
              <span>
                <strong className="block">{localizedName({ locale, ko: role.name })}</strong>
                <span className="text-xs text-gray-500">{role.code}</span>
              </span>
            </label>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-bold text-gray-800">{isJa ? "担当生産ライン" : "담당 생산라인"}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {["ALL", ...productionLines].map((line) => (
            <label key={line} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={lines.includes(line)} onChange={() => toggleLine(line)} />
              {line === "ALL" ? (isJa ? "全ライン" : "전체 라인") : localizedName({ locale, ko: line })}
            </label>
          ))}
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600">
            {isJa ? "キャンセル" : "취소"}
          </button>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            {isJa ? "保存" : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string;
}) {
  return <label className="text-xs font-semibold text-gray-600">{label}<input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500" /></label>;
}
