import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import RealtimeDashboard from "@/components/dashboard/RealtimeDashboard";

export const metadata: Metadata = { title: "대시보드" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="대시보드" description="오늘 생산실적과 불량 현황을 실시간으로 확인합니다." breadcrumb={["대시보드"]} />
      <RealtimeDashboard />
    </>
  );
}
