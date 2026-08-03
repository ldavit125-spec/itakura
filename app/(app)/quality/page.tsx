import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import QualityClient from "@/components/quality/QualityClient";

export const metadata: Metadata = {
  title: "품질관리",
};

export default function QualityPage() {
  return (
    <>
      <PageHeader
        title="nav.quality" description="quality.page.description" breadcrumb={["nav.quality"]}
      />
      <QualityClient />
    </>
  );
}
