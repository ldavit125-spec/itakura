"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [isAuthenticated, isLoading, pathname, router]);
  if (isLoading || !isAuthenticated) return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">로그인 상태를 확인하고 있습니다.</div>;
  return children;
}
