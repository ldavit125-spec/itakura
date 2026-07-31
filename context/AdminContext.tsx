"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { INITIAL_ADMIN_PERMISSIONS, INITIAL_ADMIN_ROLES, INITIAL_ADMIN_USERS, INITIAL_AUDIT_LOGS } from "@/data/admin.mock";
import { canAccessModule as checkModule, canAccessPath as checkPath, canAccessProductionLine as checkLine, hasPermission as checkPermission } from "@/lib/rbac";
import { authenticateAdmin, validateUserAccount } from "@/lib/admin-auth";
import type {
  AdminLoginResult,
  AdminPermission,
  AdminRole,
  AdminUser,
  AdminUserInput,
  AuditLog,
  ModuleKey,
  PermissionCode,
  RoleCode,
} from "@/types/admin";

export interface UserMutationResult {
  success: boolean;
  message?: string;
  userId?: string;
}

interface AdminContextValue {
  users: AdminUser[];
  activeUsers: AdminUser[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  auditLogs: AuditLog[];
  currentUser: AdminUser;
  authenticatedAdmin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (identifier: string, password: string) => AdminLoginResult;
  logoutAdmin: () => void;
  switchDemoUser: (userId: string) => void;
  hasPermission: (permission: PermissionCode) => boolean;
  canAccessModule: (module: ModuleKey) => boolean;
  canAccessPath: (pathname: string) => boolean;
  canAccessProductionLine: (line: string) => boolean;
  getAssignableUsers: (roleCodes?: RoleCode[]) => AdminUser[];
  createUser: (input: AdminUserInput) => UserMutationResult;
  updateUser: (userId: string, patch: Partial<Omit<AdminUser, "id">>) => UserMutationResult;
  deleteInactiveUser: (userId: string) => UserMutationResult;
  deleteUserAccounts: (userIds: string[]) => UserMutationResult;
  updateRolePermissions: (roleId: string, permissionCodes: PermissionCode[]) => boolean;
  recordAudit: (
    action: string,
    targetType: AuditLog["targetType"],
    targetId: string,
    description: string,
    before?: string,
    after?: string
  ) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function nowText() {
  return new Date().toLocaleString("sv-SE", { hour12: false }).replace("T", " ");
}

function auditSnapshot(user: AdminUser) {
  const { password: _password, ...safe } = user;
  return JSON.stringify(safe);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(INITIAL_ADMIN_USERS);
  const [roles, setRoles] = useState(INITIAL_ADMIN_ROLES);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [currentUserId, setCurrentUserId] = useState("user-admin");
  const [authenticatedAdminId, setAuthenticatedAdminId] = useState<string | null>(null);

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];
  const authenticatedAdmin = users.find((user) => user.id === authenticatedAdminId) ?? null;
  const isAdminAuthenticated = Boolean(
    authenticatedAdmin
      && authenticatedAdmin.status === "ACTIVE"
      && roles.some((role) => authenticatedAdmin.roleIds.includes(role.id) && role.code === "ADMIN")
  );
  const activeUsers = useMemo(() => users.filter((user) => user.status === "ACTIVE"), [users]);

  const appendAudit = useCallback((
    actor: AdminUser,
    action: string,
    targetType: AuditLog["targetType"],
    targetId: string,
    description: string,
    before?: string,
    after?: string
  ) => {
    setAuditLogs((previous) => [{
      id: `audit-${Date.now()}-${previous.length}`,
      occurredAt: nowText(),
      actorUserId: actor.id,
      actorName: actor.name,
      action,
      targetType,
      targetId,
      description,
      before,
      after,
    }, ...previous]);
  }, []);

  const loginAdmin = useCallback((identifier: string, password: string): AdminLoginResult => {
    const auth = authenticateAdmin(users, roles, identifier, password);
    if (auth.failure === "INVALID_CREDENTIALS") return { success: false, message: "사번 또는 이메일, 비밀번호를 확인하세요." };
    if (auth.failure === "INACTIVE") return { success: false, message: "비활성 계정은 로그인할 수 없습니다." };
    if (auth.failure === "NOT_ADMIN") return { success: false, message: "ADMIN 역할이 있는 계정만 관리자 화면에 로그인할 수 있습니다." };
    const user = auth.user;
    if (!user) return { success: false, message: "로그인에 실패했습니다." };
    setAuthenticatedAdminId(user.id);
    setCurrentUserId(user.id);
    appendAudit(user, "ADMIN_LOGIN", "SESSION", user.id, "관리자 화면에 로그인했습니다.");
    return { success: true };
  }, [appendAudit, roles, users]);

  const logoutAdmin = useCallback(() => {
    if (authenticatedAdmin) appendAudit(authenticatedAdmin, "ADMIN_LOGOUT", "SESSION", authenticatedAdmin.id, "관리자 화면에서 로그아웃했습니다.");
    setAuthenticatedAdminId(null);
  }, [appendAudit, authenticatedAdmin]);

  const hasPermission = useCallback((permission: PermissionCode) => checkPermission(currentUser, roles, permission), [currentUser, roles]);
  const canAccessModule = useCallback((module: ModuleKey) => checkModule(currentUser, roles, module), [currentUser, roles]);
  const canAccessPath = useCallback((pathname: string) => checkPath(currentUser, roles, pathname), [currentUser, roles]);
  const canAccessProductionLine = useCallback((line: string) => checkLine(currentUser, line), [currentUser]);

  const switchDemoUser = useCallback((userId: string) => {
    const next = users.find((user) => user.id === userId && user.status === "ACTIVE");
    if (!next || next.id === currentUser.id) return;
    appendAudit(currentUser, "DEMO_USER_SWITCH", "SESSION", next.id, `데모 사용자를 ${next.name}(으)로 전환했습니다.`);
    setCurrentUserId(next.id);
  }, [appendAudit, currentUser, users]);

  const getAssignableUsers = useCallback((roleCodes?: RoleCode[]) => {
    if (!roleCodes?.length) return activeUsers;
    const roleIds = roles.filter((role) => roleCodes.includes(role.code)).map((role) => role.id);
    return activeUsers.filter((user) => user.roleIds.some((roleId) => roleIds.includes(roleId)));
  }, [activeUsers, roles]);

  const createUser = useCallback((input: AdminUserInput): UserMutationResult => {
    if (!isAdminAuthenticated || !authenticatedAdmin || !checkPermission(authenticatedAdmin, roles, "USERS_MANAGE")) {
      return { success: false, message: "ADMIN 사용자 관리 권한이 필요합니다." };
    }
    const employeeNo = input.employeeNo.trim();
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const validationError = validateUserAccount(users, { ...input, employeeNo, email, name });
    if (validationError) return { success: false, message: validationError };
    const newUser: AdminUser = {
      ...input,
      id: `user-${Date.now()}`,
      employeeNo,
      email,
      name,
      department: input.department.trim(),
      password: input.password.trim() || "demo1234",
      productionLines: input.productionLines.length ? input.productionLines : [],
      status: "ACTIVE",
    };
    setUsers((previous) => [...previous, newUser]);
    appendAudit(authenticatedAdmin, "USER_CREATED", "USER", newUser.id, `${newUser.name} 사용자 계정을 등록했습니다.`, undefined, auditSnapshot(newUser));
    return { success: true, userId: newUser.id };
  }, [appendAudit, authenticatedAdmin, isAdminAuthenticated, roles, users]);

  const updateUser = useCallback((userId: string, patch: Partial<Omit<AdminUser, "id">>): UserMutationResult => {
    if (!isAdminAuthenticated || !authenticatedAdmin || !checkPermission(authenticatedAdmin, roles, "USERS_MANAGE")) {
      return { success: false, message: "ADMIN 사용자 관리 권한이 필요합니다." };
    }
    const target = users.find((user) => user.id === userId);
    if (!target) return { success: false, message: "사용자를 찾을 수 없습니다." };
    const next = { ...target, ...patch };
    const validationError = validateUserAccount(users, next, userId);
    if (validationError) return { success: false, message: validationError };
    setUsers((previous) => previous.map((user) => user.id === userId ? next : user));
    const action = target.status !== next.status ? (next.status === "ACTIVE" ? "USER_ACTIVATED" : "USER_DEACTIVATED") : "USER_UPDATED";
    appendAudit(authenticatedAdmin, action, "USER", userId, `${target.name} 사용자 계정을 변경했습니다.`, auditSnapshot(target), auditSnapshot(next));
    if (next.status === "INACTIVE" && authenticatedAdminId === next.id) setAuthenticatedAdminId(null);
    return { success: true };
  }, [appendAudit, authenticatedAdmin, authenticatedAdminId, isAdminAuthenticated, roles, users]);

  const deleteInactiveUser = useCallback((userId: string): UserMutationResult => {
    if (!isAdminAuthenticated || !authenticatedAdmin || !checkPermission(authenticatedAdmin, roles, "USERS_MANAGE")) {
      return { success: false, message: "ADMIN 사용자 관리 권한이 필요합니다." };
    }
    const target = users.find((user) => user.id === userId);
    if (!target) return { success: false, message: "사용자를 찾을 수 없습니다." };
    if (target.status !== "INACTIVE") return { success: false, message: "비활성 계정만 삭제할 수 있습니다." };
    if (target.id === authenticatedAdmin.id) return { success: false, message: "로그인 중인 관리자 계정은 삭제할 수 없습니다." };
    setUsers((previous) => previous.filter((user) => user.id !== userId));
    appendAudit(
      authenticatedAdmin,
      "USER_ACCOUNT_DELETED",
      "USER",
      userId,
      `${target.name} 사용자의 시스템 계정을 삭제했습니다. 기존 업무 기록은 유지됩니다.`,
      auditSnapshot(target),
      JSON.stringify({ deleted: true, businessRecordsPreserved: true })
    );
    return { success: true };
  }, [appendAudit, authenticatedAdmin, isAdminAuthenticated, roles, users]);

  const deleteUserAccounts = useCallback((userIds: string[]): UserMutationResult => {
    if (!isAdminAuthenticated || !authenticatedAdmin || !checkPermission(authenticatedAdmin, roles, "USERS_MANAGE")) {
      return { success: false, message: "ADMIN 사용자 관리 권한이 필요합니다." };
    }
    const uniqueIds = [...new Set(userIds)].filter((id) => id !== authenticatedAdmin.id);
    const targets = users.filter((user) => uniqueIds.includes(user.id));
    if (targets.length === 0) return { success: false, message: "삭제할 계정을 선택하세요." };
    setUsers((previous) => previous.filter((user) => !targets.some((target) => target.id === user.id)));
    targets.forEach((target) => {
      appendAudit(
        authenticatedAdmin,
        "USER_ACCOUNT_DELETED",
        "USER",
        target.id,
        `${target.name} 사용자의 시스템 계정을 퇴사자 계정으로 삭제했습니다. 기존 업무 기록은 유지됩니다.`,
        auditSnapshot(target),
        JSON.stringify({ deleted: true, businessRecordsPreserved: true })
      );
    });
    return { success: true };
  }, [appendAudit, authenticatedAdmin, isAdminAuthenticated, roles, users]);

  const updateRolePermissions = useCallback((roleId: string, permissionCodes: PermissionCode[]) => {
    if (!isAdminAuthenticated || !authenticatedAdmin || !checkPermission(authenticatedAdmin, roles, "PERMISSIONS_MANAGE")) return false;
    const target = roles.find((role) => role.id === roleId);
    if (!target) return false;
    setRoles((previous) => previous.map((role) => role.id === roleId ? { ...role, permissionCodes } : role));
    appendAudit(authenticatedAdmin, "ROLE_PERMISSIONS_UPDATED", "PERMISSION", roleId, `${target.name} 역할의 권한을 변경했습니다.`, JSON.stringify(target.permissionCodes), JSON.stringify(permissionCodes));
    return true;
  }, [appendAudit, authenticatedAdmin, isAdminAuthenticated, roles]);

  const recordAudit = useCallback((
    action: string,
    targetType: AuditLog["targetType"],
    targetId: string,
    description: string,
    before?: string,
    after?: string
  ) => {
    appendAudit(currentUser, action, targetType, targetId, description, before, after);
  }, [appendAudit, currentUser]);

  const value = useMemo<AdminContextValue>(() => ({
    users, activeUsers, roles, permissions: INITIAL_ADMIN_PERMISSIONS, auditLogs, currentUser,
    authenticatedAdmin, isAdminAuthenticated, loginAdmin, logoutAdmin, switchDemoUser,
    hasPermission, canAccessModule, canAccessPath, canAccessProductionLine, getAssignableUsers,
    createUser, updateUser, deleteInactiveUser, deleteUserAccounts, updateRolePermissions, recordAudit,
  }), [activeUsers, auditLogs, authenticatedAdmin, canAccessModule, canAccessPath, canAccessProductionLine, createUser, currentUser, deleteInactiveUser, deleteUserAccounts, getAssignableUsers, hasPermission, isAdminAuthenticated, loginAdmin, logoutAdmin, recordAudit, roles, switchDemoUser, updateRolePermissions, updateUser, users]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
