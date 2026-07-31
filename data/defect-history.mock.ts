import type { DefectHistory } from "@/types/quality";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";

// 생산실적 RESULT-20260730-001 / 완제품 LOT FG-PRD001-20260730-001의
// defectBreakdown(반죽 30 + 소성 20)과 동일한 초기 불량 이력입니다.
export const INITIAL_DEFECT_HISTORY: DefectHistory[] = [
  {
    id: "def-1",
    defectNo: "DEF-20260731-001",
    lotNumber: "FG-PRD001-20260730-001",
    productId: "PRD-001",
    productName: "식빵",
    productionDate: "2026-07-30",
    inspectionDate: "2026-07-31",
    inspector: EMPLOYEE_NAMES.qualityManager,
    defectType: "OTHER",
    defectQuantity: 30,
    defectRate: 0.75,
    cause: "반죽 공정 불량",
    correctiveAction: "반죽 공정 조건 확인 및 불량품 선별",
    status: "CAUSE_ANALYZED",
    assignee: EMPLOYEE_NAMES.productionManager,
    createdAt: "2026-07-31 09:20",
    updatedAt: "2026-07-31 11:10",
  },
  {
    id: "def-2",
    defectNo: "DEF-20260731-002",
    lotNumber: "FG-PRD001-20260730-001",
    productId: "PRD-001",
    productName: "식빵",
    productionDate: "2026-07-30",
    inspectionDate: "2026-07-31",
    inspector: EMPLOYEE_NAMES.qualityManager,
    defectType: "APPEARANCE",
    defectQuantity: 20,
    defectRate: 0.5,
    cause: "소성 공정 불량",
    correctiveAction: "소성 온도 조건 확인 및 외관 불량품 선별",
    status: "REWORK",
    assignee: EMPLOYEE_NAMES.productionManager,
    createdAt: "2026-07-31 10:05",
    updatedAt: "2026-07-31 10:50",
  },
];
