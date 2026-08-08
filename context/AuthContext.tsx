"use client";

import type { Session, User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { PermissionCode, RoleCode } from "@/types/admin";

export interface AuthProfile {
  id: string;
  authUserId: string;
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  roles: RoleCode[];
  permissions: PermissionCode[];
  productionLines: string[];
}

export interface LoginResult { success: boolean; message?: string }

interface AuthContextValue {
  session: Session | null;
  authUser: User | null;
  profile: AuthProfile | null;
  role: RoleCode | null;
  roles: RoleCode[];
  permissions: PermissionCode[];
  isAdmin: boolean;
  permissionError: string | null;
  hasRole: (role: RoleCode) => boolean;
  hasPermission: (permission: PermissionCode) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const INACTIVE_MESSAGE = "비활성화된 계정입니다. 관리자에게 문의해주세요.";

function loginErrorMessage(message?: string) {
  const value = message?.toLowerCase() ?? "";
  if (value.includes("invalid login credentials") || value.includes("email not confirmed")) return "이메일 또는 비밀번호를 확인해주세요.";
  if (value.includes("disabled") || value.includes("banned")) return "사용할 수 없는 계정입니다.";
  return "로그인 처리 중 문제가 발생했습니다.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const loadProfile = useCallback(async (authUserId: string): Promise<AuthProfile | null> => {
    const { data, error } = await supabase.from("business_users")
      .select("id, auth_user_id, employee_no, name, email, department, status, user_roles(roles(code, role_permissions(permission_code))), user_production_lines(all_lines, production_lines(name))")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (error || !data) {
      setPermissionError("사용자 권한 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
      return null;
    }

    const relations = (data.user_roles ?? []) as Array<{ roles: { code: RoleCode; role_permissions?: Array<{ permission_code: PermissionCode }> } | Array<{ code: RoleCode; role_permissions?: Array<{ permission_code: PermissionCode }> }> | null }>;
    const roles = relations.flatMap(({ roles: item }) => Array.isArray(item) ? item.map(({ code }) => code) : item?.code ? [item.code] : []);
    const permissions = Array.from(new Set(relations.flatMap(({ roles: item }) => {
      const roleItems = Array.isArray(item) ? item : item ? [item] : [];
      return roleItems.flatMap((role) => role.role_permissions?.map(({ permission_code }) => permission_code) ?? []);
    })));
    const lineRelations = (data.user_production_lines ?? []) as Array<{ all_lines: boolean; production_lines: { name: string } | Array<{ name: string }> | null }>;
    const productionLines = lineRelations.some((item) => item.all_lines) ? ["ALL"] : lineRelations.flatMap(({ production_lines: item }) => Array.isArray(item) ? item.map(({ name }) => name) : item?.name ? [item.name] : []);
    setPermissionError(null);
    return { id: data.id, authUserId: data.auth_user_id, employeeNo: data.employee_no, name: data.name,
      email: data.email, department: data.department, status: data.status, roles, permissions, productionLines };
  }, []);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) { setProfile(null); setPermissionError(null); return; }
    const nextProfile = await loadProfile(nextSession.user.id);
    if (!nextProfile || nextProfile.status !== "ACTIVE") {
      setProfile(null); setSession(null);
      await supabase.auth.signOut();
      sessionStorage.setItem("auth_notice", nextProfile?.status === "INACTIVE" ? INACTIVE_MESSAGE : "사용할 수 없는 계정입니다.");
      return;
    }
    setProfile(nextProfile);
  }, [loadProfile]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => { if (!active) return; await applySession(data.session); if (active) setIsLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(async () => { if (!active) return; setIsLoading(true); await applySession(nextSession); if (active) setIsLoading(false); }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [applySession]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) { setIsLoading(false); return { success: false, message: loginErrorMessage(error?.message) }; }
    const nextProfile = await loadProfile(data.user.id);
    if (!nextProfile || nextProfile.status !== "ACTIVE") {
      await supabase.auth.signOut(); setIsLoading(false);
      return { success: false, message: nextProfile?.status === "INACTIVE" ? INACTIVE_MESSAGE : "사용할 수 없는 계정입니다." };
    }
    setSession(data.session); setProfile(nextProfile); setIsLoading(false); return { success: true };
  }, [loadProfile]);

  const logout = useCallback(async () => { setIsLoading(true); await supabase.auth.signOut(); setSession(null); setProfile(null); setIsLoading(false); }, []);
  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) return null;
    const nextProfile = await loadProfile(session.user.id);
    if (!nextProfile || nextProfile.status !== "ACTIVE") { await supabase.auth.signOut(); setSession(null); setProfile(null); return null; }
    setProfile(nextProfile); return nextProfile;
  }, [loadProfile, session]);
  const hasRole = useCallback((role: RoleCode) => profile?.roles.includes(role) ?? false, [profile]);
  const hasPermission = useCallback((permission: PermissionCode) => profile?.permissions.includes(permission) ?? false, [profile]);
  const value = useMemo<AuthContextValue>(() => ({ session, authUser: session?.user ?? null, profile,
    role: profile?.roles[0] ?? null, roles: profile?.roles ?? [], permissions: profile?.permissions ?? [],
    isAdmin: hasRole("ADMIN"), permissionError, hasRole, hasPermission,
    isAuthenticated: Boolean(session && profile?.status === "ACTIVE"), isLoading, login, logout, refreshProfile
  }), [hasPermission, hasRole, isLoading, login, logout, permissionError, profile, refreshProfile, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
