import type {
  TraceTargetType,
  TraceDirection,
  TraceNodeType,
  TraceNodeStatus,
  TraceTab,
} from "@/types/traceability";

// ============================================================
// LOT 통합 추적관리 — 한국어 라벨 맵 및 노드 색상 맵
// ============================================================

export const TRACE_TARGET_TYPE_LABELS: Record<TraceTargetType, string> = {
  RAW_MATERIAL_LOT: "원재료 LOT",
  FINISHED_GOODS_LOT: "완제품 LOT",
  WORK_ORDER: "작업지시",
  PRODUCTION_RESULT: "생산실적",
  INSPECTION: "품질검사",
  NONCONFORMITY: "부적합",
  CORRECTIVE_ACTION: "시정조치",
};

export const TRACE_TARGET_TYPE_OPTIONS: { value: TraceTargetType | "ALL"; label: string }[] = [
  { value: "ALL", label: "대상 구분 전체" },
  { value: "RAW_MATERIAL_LOT", label: "원재료 LOT" },
  { value: "FINISHED_GOODS_LOT", label: "완제품 LOT" },
  { value: "WORK_ORDER", label: "작업지시" },
  { value: "PRODUCTION_RESULT", label: "생산실적" },
  { value: "INSPECTION", label: "품질검사" },
  { value: "NONCONFORMITY", label: "부적합" },
  { value: "CORRECTIVE_ACTION", label: "시정조치" },
];

export const TRACE_DIRECTION_LABELS: Record<TraceDirection, string> = {
  FORWARD: "정방향 추적",
  BACKWARD: "역방향 추적",
  INTEGRATED_SEARCH: "통합 검색",
  RELATION_VIEW: "관계도 조회",
};

export const TRACE_NODE_TYPE_LABELS: Record<TraceNodeType, string> = {
  RAW_MATERIAL_INBOUND: "원재료 입고",
  RAW_MATERIAL_LOT: "원재료 LOT",
  INCOMING_INSPECTION: "원재료 검사",
  MATERIAL_OUTBOUND: "자재 출고",
  WORK_ORDER: "작업지시",
  PROCESS_INSPECTION: "공정검사",
  PRODUCTION_RESULT: "생산실적",
  FINISHED_GOODS_LOT: "완제품 LOT",
  FINISHED_GOODS_INSPECTION: "완제품검사",
  NONCONFORMITY: "부적합",
  CORRECTIVE_ACTION: "시정조치",
};

export const TRACE_NODE_STATUS_LABELS: Record<TraceNodeStatus, string> = {
  NORMAL: "정상",
  PENDING: "대기",
  PASSED: "합격",
  HOLD: "보류",
  FAILED: "불합격",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export const TRACE_TAB_LABELS: Record<TraceTab, string> = {
  search: "통합 LOT 검색",
  forward: "원재료 정방향 추적",
  backward: "완제품 역방향 추적",
  diagram: "LOT 관계도",
  history: "추적 이력",
};

export const TRACE_TABS: TraceTab[] = [
  "search",
  "forward",
  "backward",
  "diagram",
  "history",
];

/** 노드 유형별 배지 스타일 */
export const NODE_TYPE_STYLES: Record<TraceNodeType, string> = {
  RAW_MATERIAL_INBOUND: "bg-blue-100 text-blue-800 border-blue-300",
  RAW_MATERIAL_LOT: "bg-purple-100 text-purple-800 border-purple-300 font-bold",
  INCOMING_INSPECTION: "bg-cyan-100 text-cyan-800 border-cyan-300",
  MATERIAL_OUTBOUND: "bg-indigo-100 text-indigo-800 border-indigo-300",
  WORK_ORDER: "bg-teal-100 text-teal-800 border-teal-300",
  PROCESS_INSPECTION: "bg-purple-100 text-purple-800 border-purple-300",
  PRODUCTION_RESULT: "bg-emerald-100 text-emerald-800 border-emerald-300",
  FINISHED_GOODS_LOT: "bg-blue-600 text-white border-blue-700 font-bold",
  FINISHED_GOODS_INSPECTION: "bg-sky-100 text-sky-800 border-sky-300",
  NONCONFORMITY: "bg-red-100 text-red-800 border-red-300 font-bold",
  CORRECTIVE_ACTION: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
};

/** 노드 상태별 시각적 스타일 (보류/불합격 강조) */
export const NODE_STATUS_STYLES: Record<TraceNodeStatus, string> = {
  NORMAL: "border-gray-200 text-gray-700 bg-white",
  PENDING: "border-gray-300 text-gray-600 bg-gray-50",
  PASSED: "border-green-400 text-green-700 bg-green-50 font-bold",
  HOLD: "border-amber-400 text-amber-900 bg-amber-100 font-extrabold shadow-sm ring-2 ring-amber-300",
  FAILED: "border-red-500 text-red-900 bg-red-100 font-extrabold shadow-md ring-2 ring-red-400 animate-pulse",
  IN_PROGRESS: "border-blue-400 text-blue-700 bg-blue-50 font-bold",
  COMPLETED: "border-green-300 text-green-800 bg-green-50",
  CANCELLED: "border-gray-300 text-gray-400 bg-gray-100 line-through",
};
