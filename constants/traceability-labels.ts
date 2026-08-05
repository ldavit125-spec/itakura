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

export const TRACE_TARGET_TYPE_LABELS: Record<TraceTargetType, { ko: string; ja: string }> = {
  RAW_MATERIAL_LOT: { ko: "원재료 LOT", ja: "原材料LOT" },
  FINISHED_GOODS_LOT: { ko: "완제품 LOT", ja: "完成品LOT" },
  WORK_ORDER: { ko: "작업지시", ja: "作業指示" },
  PRODUCTION_RESULT: { ko: "생산실적", ja: "生産実績" },
  INSPECTION: { ko: "품질검사", ja: "品質検査" },
  NONCONFORMITY: { ko: "부적합", ja: "不適合" },
  CORRECTIVE_ACTION: { ko: "시정조치", ja: "시정조치 / CAPA" },
};

export const TRACE_DIRECTION_LABELS: Record<TraceDirection, { ko: string; ja: string }> = {
  FORWARD: { ko: "정방향 추적", ja: "順方向追跡" },
  BACKWARD: { ko: "역방향 추적", ja: "逆方向追跡" },
  INTEGRATED_SEARCH: { ko: "통합 검색", ja: "統合検索" },
  RELATION_VIEW: { ko: "관계도 조회", ja: "関係図照会" },
};

export const TRACE_NODE_TYPE_LABELS: Record<TraceNodeType, { ko: string; ja: string }> = {
  RAW_MATERIAL_INBOUND: { ko: "원재료 입고", ja: "原材料入荷" },
  RAW_MATERIAL_LOT: { ko: "원재료 LOT", ja: "原材料LOT" },
  INCOMING_INSPECTION: { ko: "원재료 검사", ja: "原材料検査" },
  MATERIAL_OUTBOUND: { ko: "자재 출고", ja: "資材出庫" },
  WORK_ORDER: { ko: "작업지시", ja: "作業指示" },
  PROCESS_INSPECTION: { ko: "공정검사", ja: "工程検査" },
  PRODUCTION_RESULT: { ko: "생산실적", ja: "生産実績" },
  FINISHED_GOODS_LOT: { ko: "완제품 LOT", ja: "完成品LOT" },
  FINISHED_GOODS_INSPECTION: { ko: "완제품검사", ja: "完成品検査" },
  NONCONFORMITY: { ko: "부적합", ja: "不適合" },
  CORRECTIVE_ACTION: { ko: "시정조치", ja: "시정조치 / CAPA" },
};

export const TRACE_NODE_STATUS_LABELS: Record<TraceNodeStatus, { ko: string; ja: string }> = {
  NORMAL: { ko: "정상", ja: "正常" },
  PENDING: { ko: "대기", ja: "保留/待機" },
  PASSED: { ko: "합격", ja: "合格" },
  HOLD: { ko: "보류", ja: "保留" },
  FAILED: { ko: "불합격", ja: "不合格" },
  IN_PROGRESS: { ko: "진행 중", ja: "進行中" },
  COMPLETED: { ko: "완료", ja: "完了" },
  CANCELLED: { ko: "취소", ja: "取消" },
};

export const TRACE_TAB_LABELS: Record<TraceTab, { ko: string; ja: string }> = {
  search: { ko: "통합 LOT 검색", ja: "統合LOT検索" },
  forward: { ko: "원재료 정방향 추적", ja: "原材料順方向追跡" },
  backward: { ko: "완제품 역방향 추적", ja: "完成品逆方向追跡" },
  history: { ko: "추적 이력", ja: "追跡履歴" },
};

export const TRACE_TABS: TraceTab[] = [
  "search",
  "forward",
  "backward",
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
