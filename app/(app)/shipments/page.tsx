import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import ShipmentClient from "@/components/shipment/ShipmentClient";

export const metadata: Metadata = { title: "출하관리" };

export default function ShipmentsPage() {
  return (
    <>
      <PageHeader title="nav.shipments" description="shipments.page.description" breadcrumb={["nav.shipments"]} />
      <ShipmentClient />
    </>
  );
}
