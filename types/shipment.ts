export type ShipmentStatus = "PLANNED" | "READY" | "COMPLETED" | "CANCELLED";
export type ShipmentTab = "plan" | "register" | "waiting" | "completed" | "history";

export interface Shipment {
  id: string;
  shipmentNumber: string;
  lotNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  customer: string;
  plannedDate: string;
  shippedDate?: string;
  status: ShipmentStatus;
  manager: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentInput = Pick<
  Shipment,
  "lotNumber" | "quantity" | "customer" | "plannedDate" | "manager" | "memo"
>;

export interface ShipmentMutationResult {
  success: boolean;
  message: string;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
  shipmentId?: string;
}

export interface ShipmentLotAvailability {
  lotNumber: string;
  productId: string;
  productName: string;
  productNameJa?: string | null;
  productionDate: string;
  productionQuantity: number;
  qualityStatus: string;
  inspectionCompleted: boolean;
  inspectionPassed: boolean;
  currentStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  canShip: boolean;
  reason?: string;
  reasonKey?: string;
}

export interface ShipmentKpi {
  todayShipmentCount: number;
  todayShipmentQuantity: number;
  completionRate: number;
}
