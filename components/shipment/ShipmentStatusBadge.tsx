import type { ShipmentStatus } from "@/types/shipment";

const STATUS: Record<ShipmentStatus, { label: string; style: string }> = {
  PLANNED: { label: "출하 예정", style: "bg-blue-100 text-blue-700" },
  READY: { label: "출하 준비", style: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "출하 완료", style: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "출하 취소", style: "bg-gray-100 text-gray-600" },
};

export const SHIPMENT_STATUS_LABELS = Object.fromEntries(
  Object.entries(STATUS).map(([key, value]) => [key, value.label])
) as Record<ShipmentStatus, string>;

export default function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const item = STATUS[status];
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${item.style}`}>{item.label}</span>;
}
