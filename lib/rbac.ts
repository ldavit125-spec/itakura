import type { AdminRole, AdminUser, ModuleKey, PermissionCode } from "@/types/admin";

const MODULE_PERMISSION: Record<ModuleKey, PermissionCode> = {
  DASHBOARD: "DASHBOARD_VIEW",
  MASTER_DATA: "MASTER_DATA_VIEW",
  MATERIALS: "MATERIALS_VIEW",
  PRODUCTION: "PRODUCTION_VIEW",
  SHIPMENTS: "SHIPMENTS_VIEW",
  QUALITY: "QUALITY_VIEW",
  TRACEABILITY: "TRACEABILITY_VIEW",
  REPORTS: "REPORTS_VIEW",
  ADMIN: "ADMIN_VIEW",
};

const PATH_MODULE: ReadonlyArray<[string, ModuleKey]> = [
  ["/dashboard", "DASHBOARD"],
  ["/master-data", "MASTER_DATA"],
  ["/materials", "MATERIALS"],
  ["/production", "PRODUCTION"],
  ["/shipments", "SHIPMENTS"],
  ["/quality", "QUALITY"],
  ["/traceability", "TRACEABILITY"],
  ["/reports", "REPORTS"],
  ["/admin", "ADMIN"],
];

export function getEffectivePermissions(user: AdminUser | undefined, roles: AdminRole[]): Set<PermissionCode> {
  if (!user || user.status !== "ACTIVE") return new Set();
  return new Set(
    roles
      .filter((role) => user.roleIds.includes(role.id))
      .flatMap((role) => role.permissionCodes)
  );
}

export function hasPermission(user: AdminUser | undefined, roles: AdminRole[], permission: PermissionCode): boolean {
  return getEffectivePermissions(user, roles).has(permission);
}

export function canAccessModule(user: AdminUser | undefined, roles: AdminRole[], module: ModuleKey): boolean {
  return hasPermission(user, roles, MODULE_PERMISSION[module]);
}

export function getModuleForPath(pathname: string): ModuleKey | undefined {
  return PATH_MODULE.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1];
}

export function canAccessPath(user: AdminUser | undefined, roles: AdminRole[], pathname: string): boolean {
  const moduleKey = getModuleForPath(pathname);
  return moduleKey ? canAccessModule(user, roles, moduleKey) : true;
}

export function canAccessProductionLine(user: AdminUser | undefined, productionLine: string): boolean {
  return Boolean(user?.status === "ACTIVE" && (user.productionLines.includes("ALL") || user.productionLines.includes(productionLine)));
}
