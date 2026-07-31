import React from "react";
import type { DefectDetail, DefectType } from "@/types/production";
import { DEFECT_TYPE_OPTIONS, DEFECT_TYPE_LABELS } from "@/constants/production-labels";

// ============================================================
// 생산 불량 세부 원인 수량 입력 폼 컴포넌트
// ============================================================

interface DefectDetailFormProps {
  defectQuantity: number;
  breakdown: DefectDetail[];
  onChange: (newBreakdown: DefectDetail[]) => void;
}

export default function DefectDetailForm({
  defectQuantity,
  breakdown,
  onChange,
}: DefectDetailFormProps) {
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

  return (
    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
          <span>생산 불량 세부 원인 분류</span>
          <span className="font-normal text-gray-500">
            (전체 불량 목표 수량: <strong>{defectQuantity.toLocaleString()}개</strong>)
          </span>
        </h4>
        <span
          className={`text-xs font-bold ${
            isMatch ? "text-green-700 font-bold" : "text-red-600 animate-pulse"
          }`}
        >
          원인 합계: {currentTotalDefects.toLocaleString()}개 {isMatch ? "✓ 일치" : "⚠️ 불일치"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DEFECT_TYPE_OPTIONS.map((opt) => {
          const item = breakdown.find((b) => b.type === opt.value);
          const qty = item ? item.quantity : 0;

          return (
            <div key={opt.value} className="bg-white p-2.5 rounded-lg border border-gray-200">
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                {DEFECT_TYPE_LABELS[opt.value]}
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
