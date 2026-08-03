import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import AdminClient from "@/components/AdminClient";
import AdminRouteGuard from "@/components/AdminRouteGuard";

export const metadata: Metadata = { title: "관리자 설정" };

export default function AdminPage() {
  return (
    <AdminRouteGuard>
      <PageHeader title="nav.admin" description="admin.page.description" breadcrumb={["nav.admin"]} />
      <AdminClient />
    </AdminRouteGuard>
  );
}
