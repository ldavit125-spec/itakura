import type { TraceHistoryItem } from "@/types/traceability";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";

// ============================================================
// LOT 통합 추적관리 — 초기 추적 이력 Mock 데이터
// ============================================================

export const INITIAL_TRACE_HISTORY: TraceHistoryItem[] = [
  {
    id: "th-1",
    traceTimestamp: "2026-07-31 09:10",
    direction: "FORWARD",
    searchQuery: "LOT-FLOUR-260730-A",
    startNo: "LOT-FLOUR-260730-A",
    resultCount: 2,
    relatedRawLotCount: 1,
    relatedFGLotCount: 2,
    hasQualityAnomaly: false,
    user: EMPLOYEE_NAMES.executive,
  },
  {
    id: "th-2",
    traceTimestamp: "2026-07-31 08:45",
    direction: "BACKWARD",
    searchQuery: "FG-PRD001-20260730-001",
    startNo: "FG-PRD001-20260730-001",
    resultCount: 4,
    relatedRawLotCount: 4,
    relatedFGLotCount: 1,
    hasQualityAnomaly: false,
    user: EMPLOYEE_NAMES.productionPlanner,
  },
  {
    id: "th-3",
    traceTimestamp: "2026-07-15 11:30",
    direction: "FORWARD",
    searchQuery: "LOT-BUTTER-260715-H",
    startNo: "LOT-BUTTER-260715-H",
    resultCount: 1,
    relatedRawLotCount: 1,
    relatedFGLotCount: 0,
    hasQualityAnomaly: true,
    user: EMPLOYEE_NAMES.qualityManager,
  },
];
