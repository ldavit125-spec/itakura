import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ShipmentClient from "@/components/shipment/ShipmentClient";

export const metadata: Metadata = { title: "출하관리" };

export default function ShipmentsPage() {
  return (
    <>
      <PageHeader title="출하관리" description="품질검사에 합격한 완제품 LOT의 출하 등록, 진행 현황과 완료 이력을 관리합니다." breadcrumb={["출하관리"]} />
      <ShipmentClient />
    </>
  );
}
