import type { AdminPermission, AdminRole, AdminUser, AuditLog } from "@/types/admin";

export const EMPLOYEE_NAMES = {
  executive: "이임원",
  administrator: "사토 켄지",
  materialManager: "다나카 유키",
  productionManager: "스즈키 다이치",
  qualityManager: "다카하시 미사키",
  worker: "야마모토 렌",
  integratedManager: "이토 아오이",
  productionPlanner: "나카무라 쇼타",
  productionPlanner2: "고바야시 하루토",
  productionPlanner3: "가토 소타",
  productionPlanner4: "사이토 료",
  worker2: "와타나베 유이",
  worker3: "야마구치 타쿠미",
  doughWorker: "마츠모토 카이",
  ovenWorker: "이노우에 소라",
  packagingWorker: "하야시 유토",
  outboundWorker: "오가와 하루",
} as const;

export const INITIAL_ADMIN_PERMISSIONS: AdminPermission[] = [
  ["DASHBOARD_VIEW", "DASHBOARD", "대시보드 조회", "통합 대시보드를 조회합니다."],
  ["MASTER_DATA_VIEW", "MASTER_DATA", "기준정보 조회", "기준정보를 조회합니다."],
  ["MATERIALS_VIEW", "MATERIALS", "자재 조회", "자재 현황을 조회합니다."],
  ["MATERIALS_CREATE", "MATERIALS", "자재 등록", "입고·출고를 등록합니다."],
  ["MATERIALS_UPDATE", "MATERIALS", "자재 수정", "자재 업무 데이터를 수정합니다."],
  ["MATERIALS_CANCEL", "MATERIALS", "자재 취소", "입고·출고를 취소합니다."],
  ["PRODUCTION_VIEW", "PRODUCTION", "생산 조회", "생산 데이터를 조회합니다."],
  ["PRODUCTION_CREATE", "PRODUCTION", "생산 등록", "생산계획과 실적을 등록합니다."],
  ["PRODUCTION_UPDATE", "PRODUCTION", "생산 수정", "생산계획과 작업지시를 수정합니다."],
  ["PRODUCTION_APPROVE", "PRODUCTION", "생산 확정", "계획과 실적을 확정합니다."],
  ["PRODUCTION_EXECUTE", "PRODUCTION", "생산 실행", "작업 시작·중지·완료를 처리합니다."],
  ["SHIPMENTS_VIEW", "SHIPMENTS", "출하 조회", "출하 현황과 이력을 조회합니다."],
  ["SHIPMENTS_CREATE", "SHIPMENTS", "출하 등록", "출하 예정 정보를 등록합니다."],
  ["SHIPMENTS_UPDATE", "SHIPMENTS", "출하 수정", "출하 정보와 준비 상태를 변경합니다."],
  ["SHIPMENTS_COMPLETE", "SHIPMENTS", "출하 완료", "재고를 검증하고 출하를 완료합니다."],
  ["QUALITY_VIEW", "QUALITY", "품질 조회", "품질 데이터를 조회합니다."],
  ["QUALITY_CREATE", "QUALITY", "품질 등록", "검사와 부적합을 등록합니다."],
  ["QUALITY_UPDATE", "QUALITY", "품질 수정", "검사와 시정조치를 수정합니다."],
  ["QUALITY_APPROVE", "QUALITY", "품질 판정", "검사 결과를 판정·승인합니다."],
  ["TRACEABILITY_VIEW", "TRACEABILITY", "LOT 추적 조회", "원재료·완제품 LOT을 추적합니다."],
  ["REPORTS_VIEW", "REPORTS", "보고서 조회", "통합 보고서를 조회합니다."],
  ["REPORTS_EXPORT", "REPORTS", "보고서 내보내기", "보고서를 파일로 내보냅니다."],
  ["ADMIN_VIEW", "ADMIN", "관리자 화면 조회", "관리자 화면에 접근합니다."],
  ["USERS_MANAGE", "ADMIN", "사용자 관리", "사용자 역할과 상태를 관리합니다."],
  ["ROLES_MANAGE", "ADMIN", "역할 관리", "역할 정보를 관리합니다."],
  ["PERMISSIONS_MANAGE", "ADMIN", "권한 관리", "역할별 권한을 관리합니다."],
  ["AUDIT_VIEW", "ADMIN", "감사 로그 조회", "관리자 변경 이력을 조회합니다."],
].map(([code, module, name, description]) => ({ code, module, name, description })) as AdminPermission[];

const ALL = INITIAL_ADMIN_PERMISSIONS.map((permission) => permission.code);

export const INITIAL_ADMIN_ROLES: AdminRole[] = [
  { id: "role-admin", code: "ADMIN", name: "시스템 관리자", description: "전체 시스템과 관리자 기능을 관리합니다.", permissionCodes: ALL, isSystem: true },
  { id: "role-material", code: "MATERIAL_MANAGER", name: "자재 관리자", description: "자재 입출고와 재고를 관리합니다.", permissionCodes: ["DASHBOARD_VIEW", "MASTER_DATA_VIEW", "MATERIALS_VIEW", "MATERIALS_CREATE", "MATERIALS_UPDATE", "MATERIALS_CANCEL", "TRACEABILITY_VIEW", "REPORTS_VIEW", "REPORTS_EXPORT"], isSystem: true },
  { id: "role-production", code: "PRODUCTION_MANAGER", name: "생산 관리자", description: "허용 생산라인의 계획·작업·실적과 출하를 관리합니다.", permissionCodes: ["DASHBOARD_VIEW", "MASTER_DATA_VIEW", "MATERIALS_VIEW", "PRODUCTION_VIEW", "PRODUCTION_CREATE", "PRODUCTION_UPDATE", "PRODUCTION_APPROVE", "PRODUCTION_EXECUTE", "SHIPMENTS_VIEW", "SHIPMENTS_CREATE", "SHIPMENTS_UPDATE", "SHIPMENTS_COMPLETE", "QUALITY_VIEW", "TRACEABILITY_VIEW", "REPORTS_VIEW", "REPORTS_EXPORT"], isSystem: true },
  { id: "role-quality", code: "QUALITY_MANAGER", name: "품질 관리자", description: "품질 검사와 판정을 관리합니다.", permissionCodes: ["DASHBOARD_VIEW", "MASTER_DATA_VIEW", "MATERIALS_VIEW", "PRODUCTION_VIEW", "QUALITY_VIEW", "QUALITY_CREATE", "QUALITY_UPDATE", "QUALITY_APPROVE", "TRACEABILITY_VIEW", "REPORTS_VIEW", "REPORTS_EXPORT"], isSystem: true },
  { id: "role-worker", code: "WORKER", name: "현장 작업자", description: "허용 생산라인의 작업을 수행하고 출하를 조회합니다.", permissionCodes: ["DASHBOARD_VIEW", "PRODUCTION_VIEW", "PRODUCTION_EXECUTE", "SHIPMENTS_VIEW", "QUALITY_VIEW", "TRACEABILITY_VIEW"], isSystem: true },
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: "user-admin", employeeNo: "A001", name: EMPLOYEE_NAMES.executive, email: "admin@itakura.demo", department: "시스템운영", status: "ACTIVE", roleIds: ["role-admin"], productionLines: ["ALL"] },
  { id: "user-material", employeeNo: "M101", name: EMPLOYEE_NAMES.materialManager, email: "material@itakura.demo", department: "자재관리", status: "ACTIVE", roleIds: ["role-material"], productionLines: ["ALL"] },
  { id: "user-production", employeeNo: "P201", name: EMPLOYEE_NAMES.productionManager, email: "production@itakura.demo", department: "생산관리", status: "ACTIVE", roleIds: ["role-production"], productionLines: ["1호 라인", "2호 라인"] },
  { id: "user-quality", employeeNo: "Q301", name: EMPLOYEE_NAMES.qualityManager, email: "quality@itakura.demo", department: "품질관리", status: "ACTIVE", roleIds: ["role-quality"], productionLines: ["ALL"] },
  { id: "user-worker", employeeNo: "W401", name: EMPLOYEE_NAMES.worker, email: "worker@itakura.demo", department: "생산1팀", status: "ACTIVE", roleIds: ["role-worker"], productionLines: ["1호 라인"] },
  { id: "user-multi", employeeNo: "C501", name: EMPLOYEE_NAMES.integratedManager, email: "combined@itakura.demo", department: "품질·자재지원", status: "ACTIVE", roleIds: ["role-material", "role-quality"], productionLines: ["2호 라인"] },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: "audit-shipment-initial", occurredAt: "2026-07-31 11:30:00", actorUserId: "user-production", actorName: EMPLOYEE_NAMES.productionManager, action: "SHIPMENT_COMPLETED", targetType: "SHIPMENT", targetId: "shipment-1", description: "SHP-20260731-001 출하를 완료하고 LOT 재고 800개를 차감했습니다." },
  { id: "audit-initial", occurredAt: "2026-07-31 09:00:00", actorUserId: "user-admin", actorName: EMPLOYEE_NAMES.executive, action: "RBAC_INITIALIZED", targetType: "SESSION", targetId: "rbac", description: "데모 RBAC 초기 구성을 불러왔습니다." },
];
