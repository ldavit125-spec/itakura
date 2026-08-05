import type { ShipmentStatus } from "@/types/shipment";
import { useLanguage } from "@/context/LanguageContext";

const STATUS: Record<ShipmentStatus, { labelKey: string; style: string }> = {
  PLANNED: { labelKey: "shipment.status.planned", style: "bg-blue-100 text-blue-700" },
  READY: { labelKey: "shipment.status.ready", style: "bg-amber-100 text-amber-700" },
  COMPLETED: { labelKey: "shipment.status.completed", style: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { labelKey: "shipment.status.cancelled", style: "bg-gray-100 text-gray-600" },
};

export const SHIPMENT_STATUS_KEYS = Object.fromEntries(Object.entries(STATUS).map(([key, value]) => [key, value.labelKey])) as Record<ShipmentStatus, string>;

export default function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  const { t } = useLanguage();
  const item = STATUS[status];
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${item.style}`}>{t(item.labelKey)}</span>;
}
