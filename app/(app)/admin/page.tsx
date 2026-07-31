import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import AdminClient from "@/components/AdminClient";
import AdminRouteGuard from "@/components/AdminRouteGuard";

export const metadata: Metadata = { title: "관리자 설정" };

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <PageHeader title="관리자 설정" description="사용자, 복수 역할, 권한, 생산라인 접근 범위와 감사 로그를 관리합니다." breadcrumb={["관리자 설정"]} />
      <AdminClient />
    </AdminRouteGuard>
  );
}
