"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdminAuthenticated } = useAdmin();

  useEffect(() => {
    if (!isAdminAuthenticated) router.replace("/admin/login");
  }, [isAdminAuthenticated, router]);

  if (!isAdminAuthenticated) {
    return <div className="py-20 text-center text-sm text-gray-500">관리자 로그인 화면으로 이동 중입니다.</div>;
  }
  return children;
}
