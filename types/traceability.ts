// ============================================================
// LOT 통합 추적관리 — TypeScript 타입 정의
// ============================================================

/** 추적 대상 구분 코드 */
export type TraceTargetType =
  | "RAW_MATERIAL_LOT"
  | "FINISHED_GOODS_LOT"
  | "WORK_ORDER"
  | "PRODUCTION_RESULT"
  | "INSPECTION"
  | "NONCONFORMITY"
  | "CORRECTIVE_ACTION";

/** 추적 방향/유형 코드 */
export type TraceDirection =
  | "FORWARD"
  | "BACKWARD"
  | "INTEGRATED_SEARCH"
  | "RELATION_VIEW";

/** LOT 관계도 노드 유형 코드 */
export type TraceNodeType =
  | "RAW_MATERIAL_INBOUND"
  | "RAW_MATERIAL_LOT"
  | "INCOMING_INSPECTION"
  | "MATERIAL_OUTBOUND"
  | "WORK_ORDER"
  | "PROCESS_INSPECTION"
  | "PRODUCTION_RESULT"
  | "FINISHED_GOODS_LOT"
  | "FINISHED_GOODS_INSPECTION"
  | "NONCONFORMITY"
  | "CORRECTIVE_ACTION";

/** LOT 관계도 노드 상태 코드 */
export type TraceNodeStatus =
  | "NORMAL"
  | "PENDING"
  | "PASSED"
  | "HOLD"
  | "FAILED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

/** LOT 추적 탭 코드 */
export type TraceTab =
  | "search"
  | "forward"
  | "backward"
  | "diagram"
  | "history";

// ── 데이터 엔티티 ──────────────────────────────────────────────

/** 통합 LOT 검색 결과 항목 */
export interface TraceSearchResult {
  id: string;
  targetType: TraceTargetType;
  targetNo: string;
  targetName: string;
  lotNo: string;
  relatedWorkOrderNo?: string;
  relatedResultNo?: string;
  qualityStatus: string;
  isTraceable: boolean;
  date: string;
}

/** 원재료 정방향 추적 결과 */
export interface ForwardTraceData {
  // 상단 기본 원재료 정보
  rawMaterialLotNo: string;
  materialCode: string;
  materialName: string;
  inboundNo: string;
  inboundDate: string;
  supplierName: string;
  inboundQuantity: number;
  currentStock: number;
  unit: string;
  expirationDate: string;
  inspectionStatus: string;
  inventoryStatus: string;

  // 관련 검사 및 부적합
  iqcNo?: string;
  iqcJudgment?: string;

  // 연동 사용 내역 (1개 원재료 LOT -> 다중 작업지시/완제품)
  usageList: {
    outboundNo: string;
    outboundDate: string;
    outboundQuantity: number;
    workOrderNo: string;
    productionLine: string;
    productCode: string;
    productName: string;
    workStatus: string;
    resultNo?: string;
    fgLotNo?: string;
    fgQualityStatus?: string;
    fgIsReleaseAvailable?: boolean;
    nonconformityNo?: string;
    correctiveActionNo?: string;
  }[];

  // 정방향 추적 집계 요약
  usedWorkOrdersCount: number;
  linkedResultsCount: number;
  generatedFGLotsCount: number;
  passedFGLotsCount: number;
  holdOrFailedFGLotsCount: number;
}

/** 완제품 역방향 추적 결과 */
export interface BackwardTraceData {
  // 상단 완제품 기본 정보
  fgLotNo: string;
  productCode: string;
  productName: string;
  productionDate: string;
  productionLine: string;
  totalQuantity: number;
  goodQuantity: number;
  unit: string;
  expirationDate: string;
  qualityStatus: string;
  isReleaseAvailable: boolean;

  // 생산 정보
  planNo: string;
  workOrderNo: string;
  resultNo: string;
  handler: string;
  actualStartTime?: string;
  actualEndTime?: string;
  achievementRate: number;
  defectRate: number;

  // 투입된 원재료 목록 (다중 자재 연동)
  usedMaterials: {
    materialCode: string;
    materialName: string;
    rawMaterialLotNo: string;
    outboundNo: string;
    usedQuantity: number;
    unit: string;
    supplierName: string;
    inspectionStatus: string;
    manufactureDate: string;
    expirationDate: string;
  }[];

  // 품질 및 이상 발생 정보
  iqcResults: { materialCode: string; iqcNo: string; judgment: string }[];
  pqcResult?: { pqcNo: string; process: string; judgment: string };
  fqcResult?: { fqcNo: string; judgment: string };
  nonconformityNos: string[];
  correctiveActionNos: string[];

  // 역방향 추적 요약
  usedMaterialTypesCount: number;
  linkedRawLotCount: number;
  completedInspectionsCount: number;
  nonconformityCount: number;
  unresolvedCACount: number;
}

/** LOT 관계도 노드 */
export interface TraceNode {
  id: string;
  type: TraceNodeType;
  referenceNumber: string;
  label: string;
  status: TraceNodeStatus;
  occurredAt: string;
  handler?: string;
  details?: string;
  relatedIds: string[];
}

/** LOT 관계도 연결선 */
export interface TraceConnection {
  sourceId: string;
  targetId: string;
  relationType: string;
}

/** 리콜 영향 범위 분석 결과 */
export interface RecallImpactResult {
  targetLotNo: string;
  targetType: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT";
  targetName: string;

  affectedWorkOrders: {
    workOrderNo: string;
    productName: string;
    productionLine: string;
    workStatus: string;
  }[];

  affectedFGLots: {
    fgLotNo: string;
    productName: string;
    quantity: number;
    unit: string;
    qualityStatus: string;
    isReleaseAvailable: boolean;
  }[];

  affectedTotalProductionQuantity: number;
  passedLotCount: number;
  holdLotCount: number;
  failedLotCount: number;

  relatedNonconformities: string[];
  relatedCorrectiveActions: string[];
}

/** 추적 이력 로그 항목 */
export interface TraceHistoryItem {
  id: string;
  traceTimestamp: string;
  direction: TraceDirection;
  searchQuery: string;
  startNo: string;
  resultCount: number;
  relatedRawLotCount: number;
  relatedFGLotCount: number;
  hasQualityAnomaly: boolean;
  user: string;
}

/** 상단 6종 요약 카드 데이터 */
export interface TraceabilitySummary {
  totalRawLotCount: number;
  totalFGLotCount: number;
  traceableWorkOrderCount: number;
  qualityHoldLotCount: number;
  failedLotCount: number;
  inProgressCACount: number;
}
