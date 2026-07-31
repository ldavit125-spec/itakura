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
        title="생산관리"
        description="제빵 공장의 생산계획, 작업지시, 생산 진행 상황, 생산실적 및 완제품 LOT를 통합 관리합니다."
        breadcrumb={["생산관리"]}
      />
      <ProductionClient />
    </>
  );
}
