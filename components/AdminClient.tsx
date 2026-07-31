"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/context/AdminContext";
import { useMasterData } from "@/context/MasterDataContext";
import type { AdminUser, PermissionCode } from "@/types/admin";
import UserAccountModal from "@/components/UserAccountModal";

type Tab = "users" | "roles" | "audit";

export default function AdminClient() {
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
    setMessage(result.success ? `${user.name} 계정 상태를 변경했습니다.` : result.message ?? "변경하지 못했습니다.");
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
      setMessage("퇴사자로 삭제할 계정을 선택하세요.");
      return;
    }
    if (!window.confirm(`선택한 ${targets.length}개 시스템 계정을 삭제하시겠습니까?\n기존 생산·자재·품질·LOT 업무 기록은 유지됩니다.`)) return;
    const result = deleteUserAccounts(selectedUserIds);
    if (result.success) setSelectedUserIds([]);
    setMessage(result.success ? `${targets.length}개 계정을 삭제했습니다. 기존 업무 기록은 유지됩니다.` : result.message ?? "삭제하지 못했습니다.");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2">
          {([["users", "사용자 관리"], ["roles", "역할·권한 관리"], ["audit", "감사 로그"]] as Array<[Tab, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{label}</button>
          ))}
        </div>
        <span className="hidden text-xs text-gray-500 sm:block">로그인 관리자: {authenticatedAdmin?.name}</span>
      </div>

      {message && <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}

      {tab === "users" && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <div className="flex flex-col justify-between gap-3 lg:flex-row">
              <div><h2 className="font-bold text-gray-900">현장 시스템 사용자</h2><p className="mt-1 text-xs text-gray-500">인사정보가 아닌 시스템 계정·역할·담당라인을 관리합니다.</p></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingUser("NEW")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">+ 신규 사용자 등록</button>
                <button type="button" onClick={deleteSelectedAccounts} disabled={selectedUserIds.length === 0} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40">퇴사자 삭제{selectedUserIds.length > 0 ? ` (${selectedUserIds.length})` : ""}</button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="이름 또는 사번 검색" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="ALL">전체 역할</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select>
              <select value={lineFilter} onChange={(event) => setLineFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="ALL">전체 생산라인</option>{productionLines.map((line) => <option key={line.id} value={line.name}>{line.name}</option>)}</select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="ALL">전체 상태</option><option value="ACTIVE">활성</option><option value="INACTIVE">비활성</option></select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="w-12 px-4 py-3 text-center"><input type="checkbox" aria-label="현재 목록 전체 선택" checked={allFilteredSelected} onChange={toggleAllFiltered} /></th><th className="px-4 py-3">사용자 ID</th><th className="px-4 py-3">사번</th><th className="px-4 py-3">이름</th><th className="px-4 py-3">부서</th><th className="px-4 py-3">역할</th><th className="px-4 py-3">담당 생산라인</th><th className="px-4 py-3">상태</th><th className="px-4 py-3">작업</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center"><input type="checkbox" aria-label={`${user.name} 계정 선택`} checked={selectedUserIds.includes(user.id)} disabled={user.id === authenticatedAdmin?.id} onChange={() => toggleUserSelection(user.id)} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{user.id}</td><td className="px-4 py-3 font-semibold">{user.employeeNo}</td>
                    <td className="px-4 py-3"><strong className="block text-gray-900">{user.name}</strong><span className="text-xs text-gray-500">{user.email}</span></td>
                    <td className="px-4 py-3">{user.department || "-"}</td>
                    <td className="px-4 py-3">{roles.filter((role) => user.roleIds.includes(role.id)).map((role) => role.name).join(", ")}</td>
                    <td className="px-4 py-3">{user.productionLines.includes("ALL") ? "전체" : user.productionLines.join(", ") || "-"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{user.status === "ACTIVE" ? "활성" : "비활성"}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-1"><button type="button" onClick={() => setEditingUser(user)} className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">수정</button><button type="button" disabled={user.id === authenticatedAdmin?.id} onClick={() => changeStatus(user)} className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 disabled:opacity-40">{user.status === "ACTIVE" ? "비활성화" : "활성화"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "roles" && (
        <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
          <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">{roles.map((role) => <button key={role.id} type="button" onClick={() => setSelectedRoleId(role.id)} className={`mb-2 w-full rounded-lg p-3 text-left ${selectedRoleId === role.id ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}><strong className="block text-sm">{role.name}</strong><span className="text-xs opacity-75">{role.code} · {role.permissionCodes.length}개 권한</span></button>)}</section>
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-900">{selectedRole?.name} 권한</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{permissions.map((permission) => <label key={permission.code} className="flex gap-3 rounded-lg border border-gray-200 p-3"><input type="checkbox" checked={selectedRole?.permissionCodes.includes(permission.code) ?? false} onChange={() => togglePermission(permission.code)} /><span><strong className="block text-sm">{permission.name}</strong><span className="text-xs text-gray-500">{permission.code}</span></span></label>)}</div></section>
        </div>
      )}

      {tab === "audit" && (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 px-5 py-4"><h2 className="font-bold">관리자 변경 감사 로그</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">처리 시각</th><th className="px-4 py-3">실행 관리자</th><th className="px-4 py-3">작업 종류</th><th className="px-4 py-3">대상 사용자</th><th className="px-4 py-3">변경 전</th><th className="px-4 py-3">변경 후</th></tr></thead><tbody className="divide-y divide-gray-100">{auditLogs.map((log) => <tr key={log.id}><td className="whitespace-nowrap px-4 py-3">{log.occurredAt}</td><td className="px-4 py-3 font-semibold">{log.actorName}</td><td className="px-4 py-3 font-mono text-xs text-blue-700">{log.action}</td><td className="px-4 py-3">{log.targetId}<span className="block text-xs text-gray-500">{log.description}</span></td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-500" title={log.before}>{log.before ?? "-"}</td><td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-500" title={log.after}>{log.after ?? "-"}</td></tr>)}</tbody></table></div></section>
      )}

      {editingUser && <UserAccountModal key={editingUser === "NEW" ? "new" : editingUser.id} user={editingUser === "NEW" ? undefined : editingUser} roles={roles} productionLines={productionLines.map((line) => line.name)} onClose={() => setEditingUser(null)} onSave={(input) => editingUser === "NEW" ? createUser(input as Parameters<typeof createUser>[0]) : updateUser(editingUser.id, input)} />}
    </div>
  );
}
