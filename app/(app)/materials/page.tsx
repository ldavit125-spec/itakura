import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import MaterialClient from "@/components/materials/MaterialClient";

export const metadata: Metadata = {
  title: "자재관리",
};

export default function MaterialsPage() {
  return (
    <>
      <PageHeader
        title="nav.materials" description="materials.page.description" breadcrumb={["nav.materials"]}
      />
      <MaterialClient />
    </>
  );
}
