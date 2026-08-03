import type { ActiveStatus } from "@/types/master-data";
import { ACTIVE_STATUS_LABELS } from "@/types/master-data";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 사용/미사용 상태 뱃지
// ============================================================

interface StatusBadgeProps {
  status: ActiveStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
        aria-hidden="true"
      />
      {t(ACTIVE_STATUS_LABELS[status])}
    </span>
  );
}
