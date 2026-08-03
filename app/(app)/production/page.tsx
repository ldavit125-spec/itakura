import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ProductionClient from "@/components/production/ProductionClient";

export const metadata: Metadata = {
  title: "생산관리",
};

export default function ProductionPage() {
  return (
    <>
      <PageHeader
        title="nav.production" description="production.page.description" breadcrumb={["nav.production"]}
      />
      <ProductionClient />
    </>
  );
}
