import type { Shipment } from "@/types/shipment";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "shipment-1",
    shipmentNumber: "SHP-20260731-001",
    lotNumber: "FG-PRD001-20260730-001",
    productId: "PRD-001",
    productName: "식빵",
    quantity: 800,
    customer: "도쿄 베이커리 유통",
    plannedDate: "2026-07-31",
    shippedDate: "2026-07-31 11:30",
    status: "COMPLETED",
    manager: EMPLOYEE_NAMES.outboundWorker,
    memo: "오전 정기 출하",
    createdAt: "2026-07-31 08:40",
    updatedAt: "2026-07-31 11:30",
  },
  {
    id: "shipment-2",
    shipmentNumber: "SHP-20260731-002",
    lotNumber: "FG-PRD001-20260730-001",
    productId: "PRD-001",
    productName: "식빵",
    quantity: 500,
    customer: "요코하마 푸드서비스",
    plannedDate: "2026-07-31",
    status: "READY",
    manager: EMPLOYEE_NAMES.productionManager,
    memo: "오후 차량 배차 완료",
    createdAt: "2026-07-31 09:10",
    updatedAt: "2026-07-31 10:00",
  },
];
