"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdminAuthenticated, adminSessionReady } = useAdmin();
  const { t } = useLanguage();

  useEffect(() => {
    if (adminSessionReady && !isAdminAuthenticated) router.replace("/admin/login");
  }, [adminSessionReady, isAdminAuthenticated, router]);

  if (!adminSessionReady || !isAdminAuthenticated) {
    return <div className="py-20 text-center text-sm text-gray-500">{t("admin.guard.redirecting")}</div>;
  }
  return children;
}
