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
        title="nav.traceability" description="traceability.page.description" breadcrumb={["nav.traceability"]}
      />
      <TraceabilityClient />
    </>
  );
}
