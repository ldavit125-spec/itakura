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
        title="보고서 및 통계관리"
        description="생산·자재·품질·LOT 추적 데이터를 기간별로 실시간 집계하여 시각적 차트와 종합 보고서를 제공합니다."
        breadcrumb={["보고서 및 통계관리"]}
      />
      <ReportsClient />
    </>
  );
}
