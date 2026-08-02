export type RoleCode =
  | "ADMIN"
  | "MATERIAL_MANAGER"
  | "PRODUCTION_MANAGER"
  | "QUALITY_MANAGER"
  | "WORKER";

export type ModuleKey =
  | "DASHBOARD"
  | "MASTER_DATA"
  | "MATERIALS"
  | "PRODUCTION"
  | "SHIPMENTS"
  | "QUALITY"
  | "TRACEABILITY"
  | "REPORTS"
  | "ADMIN";

export type PermissionCode =
  | "DASHBOARD_VIEW"
  | "MASTER_DATA_VIEW"
  | "MATERIALS_VIEW"
  | "MATERIALS_CREATE"
  | "MATERIALS_UPDATE"
  | "MATERIALS_CANCEL"
  | "PRODUCTION_VIEW"
  | "PRODUCTION_CREATE"
  | "PRODUCTION_UPDATE"
  | "PRODUCTION_APPROVE"
  | "PRODUCTION_EXECUTE"
  | "SHIPMENTS_VIEW"
  | "SHIPMENTS_CREATE"
  | "SHIPMENTS_UPDATE"
  | "SHIPMENTS_COMPLETE"
  | "QUALITY_VIEW"
  | "QUALITY_CREATE"
  | "QUALITY_UPDATE"
  | "QUALITY_APPROVE"
  | "TRACEABILITY_VIEW"
  | "REPORTS_VIEW"
  | "REPORTS_EXPORT"
  | "ADMIN_VIEW"
  | "USERS_MANAGE"
  | "ROLES_MANAGE"
  | "PERMISSIONS_MANAGE"
  | "AUDIT_VIEW";

export interface AdminPermission {
  code: PermissionCode;
  module: ModuleKey;
  name: string;
  description: string;
}

export interface AdminRole {
  id: string;
  code: RoleCode;
  name: string;
  description: string;
  permissionCodes: PermissionCode[];
  isSystem: boolean;
}

export interface AdminUser {
  id: string;
  employeeNo: string;
  name: string;
  email: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  roleIds: string[];
  productionLines: string[];
}

export interface AuditLog {
  id: string;
  occurredAt: string;
  actorUserId: string;
  actorName: string;
  action: string;
  targetType: "USER" | "ROLE" | "PERMISSION" | "SESSION" | "SHIPMENT";
  targetId: string;
  description: string;
  before?: string;
  after?: string;
}

export type AdminUserInput = Omit<AdminUser, "id" | "status">;

export interface AdminLoginResult {
  success: boolean;
  message?: string;
}
