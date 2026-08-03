import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import RealtimeDashboard from "@/components/dashboard/RealtimeDashboard";

export const metadata: Metadata = { title: "대시보드" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="nav.dashboard" description="dashboard.page.description" breadcrumb={["nav.dashboard"]} />
      <RealtimeDashboard />
    </>
  );
}
