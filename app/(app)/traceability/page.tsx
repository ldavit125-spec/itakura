import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import TraceabilityClient from "@/components/traceability/TraceabilityClient";

export const metadata: Metadata = {
  title: "LOT 통합 추적관리",
};

export default function TraceabilityPage() {
  return (
    <>
      <PageHeader
        title="LOT 통합 추적관리"
        description="원재료 입고부터 자재 출고, 생산, 완제품, 품질검사, 부적합 및 시정조치까지 전 과정 이력을 정방향과 역방향으로 통합 추적합니다."
        breadcrumb={["LOT 통합 추적관리"]}
      />
      <TraceabilityClient />
    </>
  );
}
