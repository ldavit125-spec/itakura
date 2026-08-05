"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useMasterData } from "@/context/MasterDataContext";
import type { AdminUser, PermissionCode } from "@/types/admin";
import UserAccountModal from "@/components/UserAccountModal";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

type Tab = "users" | "roles" | "audit";

export default function AdminClient() {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const { users, roles, permissions, auditLogs, createUser, updateUser, deleteUserAccounts, updateRolePermissions, authenticatedAdmin } = useAdmin();
  const { productionLines } = useMasterData();
  const [tab, setTab] = useState<Tab>("users");
  const [editingUser, setEditingUser] = useState<AdminUser | "NEW" | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const keyword = search.trim().toLowerCase();
    if (keyword && !user.name.toLowerCase().includes(keyword) && !user.employeeNo.toLowerCase().includes(keyword)) return false;
    if (roleFilter !== "ALL" && !user.roleIds.includes(roleFilter)) return false;
    if (lineFilter !== "ALL" && !user.productionLines.includes("ALL") && !user.productionLines.includes(lineFilter)) return false;
    return statusFilter === "ALL" || user.status === statusFilter;
  }), [lineFilter, roleFilter, search, statusFilter, users]);

  const togglePermission = (code: PermissionCode) => {
    if (!selectedRole) return;
    updateRolePermissions(selectedRole.id, selectedRole.permissionCodes.includes(code)
      ? selectedRole.permissionCodes.filter((item) => item !== code)
      : [...selectedRole.permissionCodes, code]);
  };

  const changeStatus = (user: AdminUser) => {
    const result = updateUser(user.id, { status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
    const displayName = localizedName({ locale, ko: user.name });
    setMessage(
      result.success
        ? isJa ? `${displayName}のアカウント状態を変更しました。` : `${displayName} 계정 상태를 변경했습니다.`
        : result.message ?? (isJa ? "変更できませんでした。" : "변경하지 못했습니다.")
    );
  };

  const selectableFilteredIds = filteredUsers.filter((user) => user.id !== authenticatedAdmin?.id).map((user) => user.id);
  const allFilteredSelected = selectableFilteredIds.length > 0 && selectableFilteredIds.every((id) => selectedUserIds.includes(id));

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((previous) => previous.includes(userId) ? previous.filter((id) => id !== userId) : [...previous, userId]);
  };

  const toggleAllFiltered = () => {
    setSelectedUserIds((previous) => allFilteredSelected
      ? previous.filter((id) => !selectableFilteredIds.includes(id))
      : [...new Set([...previous, ...selectableFilteredIds])]);
  };

  const deleteSelectedAccounts = () => {
    const targets = users.filter((user) => selectedUserIds.includes(user.id));
    if (targets.length === 0) {
      setMessage(isJa ? "退職者として削除するアカウントを選択してください。" : "퇴사자로 삭제할 계정을 선택하세요.");
      return;
    }
    const confirmMsg = isJa
      ? `選択した${targets.length}個のシステムアカウントを削除しますか？\n既存の生産・資材・品質・LOT業務記録は維持されます。`
      : `선택한 ${targets.length}개 시스템 계정을 삭제하시겠습니까?\n기존 생산·자재·품질·LOT 업무 기록은 유지됩니다.`;
    if (!window.confirm(confirmMsg)) return;

    const result = deleteUserAccounts(selectedUserIds);
    if (result.success) setSelectedUserIds([]);
    setMessage(
      result.success
        ? isJa ? `${targets.length}個のアカウントを削除しました。既存の業務記録は維持されます。` : `${targets.length}개 계정을 삭제했습니다. 기존 업무 기록은 유지됩니다.`
        : result.message ?? (isJa ? "削除できませんでした。" : "삭제하지 못했습니다.")
    );
  };

  const tabOptions: Array<[Tab, string, string]> = [
    ["users", "사용자 관리", "ユーザー管理"],
    ["roles", "역할·권한 관리", "役割・権限管理"],
    ["audit", "감사 로그", "監査ログ"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2">
          {tabOptions.map(([value, labelKo, labelJa]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {isJa ? labelJa : labelKo}
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-gray-500 sm:block">
          {isJa ? "ログイン管理者: " : "로그인 관리자: "}{authenticatedAdmin?.name === "이임원" ? "이임원" : localizedName({ locale, ko: authenticatedAdmin?.name })}
        </span>
      </div>

      {message && <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}

      {tab === "users" && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row">
              <div>
                <h2 className="font-bold text-gray-900">{isJa ? "現場システムユーザー" : "현장 시스템 사용자"}</h2>
                <p className="mt-1 text-xs text-gray-500">{isJa ? "人事情報ではなくシステムアカウント・役割・担当ラインを管理します。" : "인사정보가 아닌 시스템 계정·역할·담당라인을 관리합니다."}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingUser("NEW")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
                  {isJa ? "+ 新規ユーザー登録" : "+ 신규 사용자 등록"}
                </button>
                <button type="button" onClick={deleteSelectedAccounts} disabled={selectedUserIds.length === 0} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40">
                  {isJa ? "退職者削除" : "퇴사자 삭제"}{selectedUserIds.length > 0 ? ` (${selectedUserIds.length})` : ""}
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isJa ? "名前または社員番号検索" : "이름 또는 사번 검색"} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ALL">{isJa ? "全役割" : "전체 역할"}</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{localizedName({ locale, ko: role.name })}</option>)}
              </select>
              <select value={lineFilter} onChange={(event) => setLineFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ALL">{isJa ? "全生産ライン" : "전체 생산라인"}</option>
                {productionLines.map((line) => <option key={line.id} value={line.name}>{localizedName({ locale, ko: line.name })}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ALL">{isJa ? "全状態" : "전체 상태"}</option>
                <option value="ACTIVE">{isJa ? "有効" : "활성"}</option>
                <option value="INACTIVE">{isJa ? "無効" : "비활성"}</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="w-12 px-4 py-3 text-center">
                    <input type="checkbox" aria-label={isJa ? "現在のリスト全選択" : "현재 목록 전체 선택"} checked={allFilteredSelected} onChange={toggleAllFiltered} />
                  </th>
                  <th className="px-4 py-3">{isJa ? "ユーザーID" : "사용자 ID"}</th>
                  <th className="px-4 py-3">{isJa ? "社員番号" : "사번"}</th>
                  <th className="px-4 py-3">{isJa ? "名前" : "이름"}</th>
                  <th className="px-4 py-3">{isJa ? "部署" : "부서"}</th>
                  <th className="px-4 py-3">{isJa ? "役割" : "역할"}</th>
                  <th className="px-4 py-3">{isJa ? "担当生産ライン" : "담당 생산라인"}</th>
                  <th className="px-4 py-3">{isJa ? "状態" : "상태"}</th>
                  <th className="px-4 py-3">{isJa ? "作業" : "작업"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const displayName = user.name === "이임원" ? "이임원" : localizedName({ locale, ko: user.name });
                  const displayDept = localizedName({ locale, ko: user.department });
                  const displayRoles = roles.filter((role) => user.roleIds.includes(role.id)).map((role) => localizedName({ locale, ko: role.name })).join(", ");
                  const displayLines = user.productionLines.includes("ALL")
                    ? (isJa ? "全体" : "전체")
                    : user.productionLines.map((line) => localizedName({ locale, ko: line })).join(", ") || "-";

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" aria-label={isJa ? `${displayName} アカウント選択` : `${user.name} 계정 선택`} checked={selectedUserIds.includes(user.id)} disabled={user.id === authenticatedAdmin?.id} onChange={() => toggleUserSelection(user.id)} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{user.id}</td>
                      <td className="px-4 py-3 font-semibold">{user.employeeNo}</td>
                      <td className="px-4 py-3">
                        <strong className="block text-gray-900">{displayName}</strong>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </td>
                      <td className="px-4 py-3">{displayDept || "-"}</td>
                      <td className="px-4 py-3">{displayRoles}</td>
                      <td className="px-4 py-3">{displayLines}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {user.status === "ACTIVE" ? (isJa ? "有効" : "활성") : (isJa ? "無効" : "비활성")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setEditingUser(user)} className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            {isJa ? "編集" : "수정"}
                          </button>
                          <button type="button" disabled={user.id === authenticatedAdmin?.id} onClick={() => changeStatus(user)} className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-40">
                            {user.status === "ACTIVE" ? (isJa ? "無効化" : "비활성화") : (isJa ? "有効化" : "활성화")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "roles" && (
        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            {roles.map((role) => (
              <button key={role.id} type="button" onClick={() => setSelectedRoleId(role.id)} className={`mb-2 w-full rounded-lg p-3 text-left ${selectedRoleId === role.id ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}>
                <strong className="block text-sm">{localizedName({ locale, ko: role.name })}</strong>
                <span className="text-xs opacity-75">{role.code} · {role.permissionCodes.length}{isJa ? "個の権限" : "개 권한"}</span>
              </button>
            ))}
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">{localizedName({ locale, ko: selectedRole?.name })}{isJa ? " 権限" : " 권한"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {permissions.map((permission) => (
                <label key={permission.code} className="flex gap-3 rounded-lg border border-gray-200 p-3">
                  <input type="checkbox" checked={selectedRole?.permissionCodes.includes(permission.code) ?? false} onChange={() => togglePermission(permission.code)} />
                  <span>
                    <strong className="block text-sm">{localizedName({ locale, ko: permission.name })}</strong>
                    <span className="text-xs text-gray-500">{permission.code}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "audit" && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-bold">{isJa ? "管理者変更監査ログ" : "관리자 변경 감사 로그"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3">{isJa ? "処理日時" : "처리 시각"}</th>
                  <th className="px-4 py-3">{isJa ? "実行管理者" : "실행 관리자"}</th>
                  <th className="px-4 py-3">{isJa ? "作業種類" : "작업 종류"}</th>
                  <th className="px-4 py-3">{isJa ? "対象ユーザー" : "대상 사용자"}</th>
                  <th className="px-4 py-3">{isJa ? "変更前" : "변경 전"}</th>
                  <th className="px-4 py-3">{isJa ? "変更後" : "변경 후"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => {
                  const displayActorName = log.actorName === "이임원" ? "이임원" : localizedName({ locale, ko: log.actorName });
                  const displayDesc = localizedName({ locale, ko: log.description });

                  return (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-4 py-3">{log.occurredAt}</td>
                      <td className="px-4 py-3 font-semibold">{displayActorName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-700">{log.action}</td>
                      <td className="px-4 py-3">
                        {log.targetId}
                        <span className="block text-xs text-gray-500">{displayDesc}</span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-500" title={log.before}>{log.before ?? "-"}</td>
                      <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-500" title={log.after}>{log.after ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {editingUser && <UserAccountModal key={editingUser === "NEW" ? "new" : editingUser.id} user={editingUser === "NEW" ? undefined : editingUser} roles={roles} productionLines={productionLines.map((line) => line.name)} onClose={() => setEditingUser(null)} onSave={(input) => editingUser === "NEW" ? createUser(input as Parameters<typeof createUser>[0]) : updateUser(editingUser.id, input)} />}
    </div>
  );
}
