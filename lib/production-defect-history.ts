import type { FinishedGoodsLot, ProductionResult, DefectType as ProductionDefectType } from "@/types/production";
import type { DefectHistory, DefectType } from "@/types/quality";

const DEFECT_TYPE_MAP: Record<ProductionDefectType, DefectType> = {
  DOUGH_DEFECT: "OTHER",
  BAKING_DEFECT: "APPEARANCE",
  SHAPE_DEFECT: "APPEARANCE",
  WEIGHT_DEFECT: "WEIGHT",
  PACKAGING_DEFECT: "PACKAGING",
  OTHER: "OTHER",
};

const DEFECT_CAUSE_MAP: Record<ProductionDefectType, string> = {
  DOUGH_DEFECT: "반죽 공정 불량",
  BAKING_DEFECT: "소성 공정 불량",
  SHAPE_DEFECT: "성형 공정 불량",
  WEIGHT_DEFECT: "중량 기준 불량",
  PACKAGING_DEFECT: "포장 공정 불량",
  OTHER: "기타 생산 불량",
};

function formatLocalDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function createDefectHistoryFromProductionResult(
  result: ProductionResult,
  lot: FinishedGoodsLot,
  sequenceStart: number,
  now = new Date()
): DefectHistory[] {
  if (result.defectQuantity <= 0) return [];

  const timestamp = formatLocalDateTime(now);
  const dateCode = timestamp.slice(0, 10).replace(/-/g, "");

  return result.defectBreakdown
    .filter((detail) => detail.quantity > 0)
    .map((detail, index) => ({
      id: `def-${result.id}-${index}`,
      defectNo: `DEF-${dateCode}-${String(sequenceStart + index).padStart(3, "0")}`,
      lotNumber: lot.fgLotNo,
      productId: result.productCode,
      productName: result.productName,
      productionDate: result.productionDate,
      inspectionDate: timestamp.slice(0, 10),
      inspector: result.handler,
      defectType: DEFECT_TYPE_MAP[detail.type],
      defectQuantity: detail.quantity,
      defectRate: result.totalQuantity > 0
        ? Math.round((detail.quantity / result.totalQuantity) * 10000) / 100
        : 0,
      cause: DEFECT_CAUSE_MAP[detail.type],
      correctiveAction: "원인 분석 및 조치 내용 등록 필요",
      status: "INVESTIGATING" as const,
      assignee: result.handler,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
}
