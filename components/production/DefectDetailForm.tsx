import React from "react";
import type { DefectDetail, DefectType } from "@/types/production";
import { DEFECT_TYPE_OPTIONS } from "@/constants/production-labels";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 생산 불량 세부 원인 수량 입력 폼 컴포넌트
// ============================================================

interface DefectDetailFormProps {
  defectQuantity: number;
  breakdown: DefectDetail[];
  onChange: (newBreakdown: DefectDetail[]) => void;
}

const DEFECT_JA_LABELS: Record<DefectType, string> = {
  DOUGH_DEFECT: "生地不良",
  BAKING_DEFECT: "焼成不良",
  SHAPE_DEFECT: "成形不良",
  WEIGHT_DEFECT: "重量不良",
  PACKAGING_DEFECT: "包装不良",
  OTHER: "その他",
};

const DEFECT_KO_LABELS: Record<DefectType, string> = {
  DOUGH_DEFECT: "반죽 불량",
  BAKING_DEFECT: "소성 불량",
  SHAPE_DEFECT: "성형 불량",
  WEIGHT_DEFECT: "중량 불량",
  PACKAGING_DEFECT: "포장 불량",
  OTHER: "기타",
};

export default function DefectDetailForm({
  defectQuantity,
  breakdown,
  onChange,
}: DefectDetailFormProps) {
  const { language } = useLanguage();
  const currentTotalDefects = breakdown.reduce((sum, item) => sum + item.quantity, 0);
  const isMatch = currentTotalDefects === defectQuantity;

  const handleQtyChange = (type: DefectType, qty: number) => {
    const existing = breakdown.find((b) => b.type === type);
    let updated: DefectDetail[];
    if (existing) {
      updated = breakdown.map((b) => (b.type === type ? { ...b, quantity: qty } : b));
    } else {
      updated = [...breakdown, { type, quantity: qty }];
    }
    onChange(updated);
  };

  const itemUnit = localizedName({ locale: language, ko: "개", ja: "個" });

  return (
    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
          <span>{localizedName({ locale: language, ko: "생산 불량 세부 원인 분류", ja: "生産不良詳細原因分類" })}</span>
          <span className="font-normal text-gray-500">
            ({localizedName({ locale: language, ko: "전체 불량 목표 수량: ", ja: "全体不良目標数量: " })}<strong>{defectQuantity.toLocaleString()}{itemUnit}</strong>)
          </span>
        </h4>
        <span
          className={`text-xs font-bold ${
            isMatch ? "text-green-700 font-bold" : "text-red-600 animate-pulse"
          }`}
        >
          {localizedName({ locale: language, ko: "원인 합계: ", ja: "原因合計: " })}{currentTotalDefects.toLocaleString()}{itemUnit} {isMatch ? localizedName({ locale: language, ko: "✓ 일치", ja: "✓ 一致" }) : localizedName({ locale: language, ko: "⚠️ 불일치", ja: "⚠️ 不一致" })}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DEFECT_TYPE_OPTIONS.map((opt) => {
          const item = breakdown.find((b) => b.type === opt.value);
          const qty = item ? item.quantity : 0;

          return (
            <div key={opt.value} className="bg-white p-2.5 rounded-lg border border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {localizedName({ locale: language, ko: DEFECT_KO_LABELS[opt.value], ja: DEFECT_JA_LABELS[opt.value] })}
              </label>
              <input
                type="number"
                min="0"
                value={qty}
                onChange={(e) => handleQtyChange(opt.value, Number(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-right font-semibold"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
