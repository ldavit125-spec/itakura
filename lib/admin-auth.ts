import type { AdminRole, AdminUser, AdminUserInput } from "@/types/admin";

export type AdminAuthFailure = "INVALID_CREDENTIALS" | "INACTIVE" | "NOT_ADMIN";

export function authenticateAdmin(
  users: AdminUser[],
  roles: AdminRole[],
  identifier: string
): { user?: AdminUser; failure?: AdminAuthFailure } {
  const normalized = identifier.trim().toLowerCase();
  const user = users.find((item) =>
    item.employeeNo.toLowerCase() === normalized || item.email.toLowerCase() === normalized
  );
  if (!user) return { failure: "INVALID_CREDENTIALS" };
  if (user.status !== "ACTIVE") return { failure: "INACTIVE" };
  if (!roles.some((role) => user.roleIds.includes(role.id) && role.code === "ADMIN")) return { failure: "NOT_ADMIN" };
  return { user };
}

export function validateUserAccount(
  users: AdminUser[],
  input: AdminUserInput | AdminUser,
  excludedUserId?: string
): string | undefined {
  if (!input.employeeNo.trim() || !input.name.trim() || !input.email.trim() || input.roleIds.length === 0) {
    return "사번, 이름, 이메일, 역할은 필수입니다.";
  }
  if (users.some((user) => user.id !== excludedUserId && user.employeeNo.toLowerCase() === input.employeeNo.trim().toLowerCase())) {
    return "이미 등록된 사번입니다.";
  }
  if (users.some((user) => user.id !== excludedUserId && user.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return "이미 등록된 이메일입니다.";
  }
}
