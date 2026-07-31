"use client";

import { useAdmin } from "@/context/AdminContext";
import type { PermissionCode } from "@/types/admin";

export default function PermissionGate({ permission, children, fallback = null }: {
  permission: PermissionCode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission } = useAdmin();
  return hasPermission(permission) ? children : fallback;
}
