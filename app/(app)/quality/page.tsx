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
        title="품질관리"
        description="제빵 공장의 원재료 입고검사, 공정검사, 완제품검사, 부적합 관리 및 시정조치(CAPA)를 통합 관리합니다."
        breadcrumb={["품질관리"]}
      />
      <QualityClient />
    </>
  );
}
