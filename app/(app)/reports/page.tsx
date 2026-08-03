import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ReportsClient from "@/components/reports/ReportsClient";

export const metadata: Metadata = {
  title: "보고서 및 통계관리",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="nav.reports" description="reports.page.description" breadcrumb={["nav.reports"]}
      />
      <ReportsClient />
    </>
  );
}
