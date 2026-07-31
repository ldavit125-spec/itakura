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
        title="자재관리"
        description="제빵 생산에 필요한 원재료의 입고, LOT, 재고, 출고, 수불이력을 통합 관리합니다."
        breadcrumb={["자재관리"]}
      />
      <MaterialClient />
    </>
  );
}
