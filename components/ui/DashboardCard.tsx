import type { DashboardCardData, KpiStatus } from "@/types";

// ============================================================
// 대시보드 KPI 카드 컴포넌트
// ============================================================

interface DashboardCardProps {
  data: DashboardCardData;
}

/** 상태별 색상 클래스 */
const STATUS_STYLES: Record<KpiStatus, { badge: string; indicator: string }> = {
  GOOD: {
    badge: "bg-green-100 text-green-700",
    indicator: "bg-green-500",
  },
  WARNING: {
    badge: "bg-yellow-100 text-yellow-700",
    indicator: "bg-yellow-500",
  },
  DANGER: {
    badge: "bg-red-100 text-red-700",
    indicator: "bg-red-500",
  },
  NEUTRAL: {
    badge: "bg-gray-100 text-gray-600",
    indicator: "bg-gray-400",
  },
};

/** 상태 한국어 라벨 */
const STATUS_LABELS: Record<KpiStatus, string> = {
  GOOD: "정상",
  WARNING: "주의",
  DANGER: "위험",
  NEUTRAL: "보통",
};

export default function DashboardCard({ data }: DashboardCardProps) {
  const status = data.status ?? "NEUTRAL";
  const styles = STATUS_STYLES[status];

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3"
      id={`dashboard-card-${data.id}`}
    >
      {/* 제목 + 상태 뱃지 */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-600 leading-snug">
          {data.title}
        </h3>
        {data.status && (
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${styles.indicator}`} aria-hidden="true" />
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {/* 수치 */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-900 leading-none">
          {data.value}
        </span>
        {data.unit && (
          <span className="text-sm text-gray-500 font-medium">{data.unit}</span>
        )}
      </div>

      {/* 설명 */}
      {data.description && (
        <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 leading-relaxed">
          {data.description}
        </p>
      )}
    </div>
  );
}
