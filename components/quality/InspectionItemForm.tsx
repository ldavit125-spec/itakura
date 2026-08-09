import React from "react";
import type { InspectionItemResult, ItemResultCode } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 검사 항목별 측정값 및 적합/부적합 판정 서식 컴포넌트
// ============================================================

interface InspectionItemFormProps {
  items: InspectionItemResult[];
  onChange: (updatedItems: InspectionItemResult[]) => void;
  readOnly?: boolean;
}

export default function InspectionItemForm({
  items,
  onChange,
  readOnly = false,
}: InspectionItemFormProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const handleItemChange = (index: number, field: keyof InspectionItemResult, value: string) => {
    if (readOnly) return;
    const updated = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  const handleResultChange = (index: number, result: ItemResultCode) => {
    if (readOnly) return;
    const updated = items.map((item, idx) => {
      if (idx === index) {
        return { ...item, result };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold text-gray-800">{tr("■ 개별 검사 항목 측정 및 적합성 결과", "■ 個別検査項目の測定および適合性結果")}</h5>
        {!readOnly && (
          <span className="text-[11px] text-gray-500 font-medium">
            {tr("* 부적합(FAIL) 항목이 1개 이상이면 합격 판정이 제한됩니다.", "* 不適合（FAIL）項目が1件以上ある場合、合格判定は制限されます。")}
          </span>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-xs text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 font-semibold">{tr("검사 항목명", "検査項目名")}</th>
              <th className="px-3 py-2 font-semibold">{tr("기준값 (Standard)", "基準値（Standard）")}</th>
              <th className="px-3 py-2 font-semibold">{tr("측정값 (Measured)", "測定値（Measured）")}</th>
              <th className="px-3 py-2 font-semibold text-center">{tr("결과 판정", "結果判定")}</th>
              <th className="px-3 py-2 font-semibold">{tr("비고 / 비고사항", "備考")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-semibold text-gray-900">
                  {localizedName({ locale, ko: item.itemName })}
                  {item.isMandatory && <span className="text-red-500 ml-1">*</span>}
                </td>
                <td className="px-3 py-2 text-gray-600 font-mono">{localizedName({ locale, ko: item.standardValue })}</td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="font-mono text-gray-900">{localizedName({ locale, ko: item.measuredValue }) || "-"}</span>
                  ) : (
                    <input
                      type="text"
                      value={localizedName({ locale, ko: item.measuredValue })}
                      onChange={(e) => handleItemChange(idx, "measuredValue", e.target.value)}
                      placeholder={tr("측정값 입력", "測定値を入力")}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  )}
                </td>
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  {readOnly ? (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.result === "PASS"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : item.result === "FAIL"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.result === "PASS" ? tr("적합 (PASS)", "適合（PASS）") : item.result === "FAIL" ? tr("부적합 (FAIL)", "不適合（FAIL）") : tr("해당 없음", "該当なし")}
                    </span>
                  ) : (
                    <select
                      value={item.result}
                      onChange={(e) => handleResultChange(idx, e.target.value as ItemResultCode)}
                      className={`px-2 py-1 text-xs font-bold rounded border focus:outline-none bg-white ${
                        item.result === "PASS"
                          ? "text-green-700 border-green-300"
                          : item.result === "FAIL"
                          ? "text-red-700 border-red-400 bg-red-50"
                          : "text-gray-600 border-gray-300"
                      }`}
                    >
                      <option value="PASS">{tr("적합 (PASS)", "適合（PASS）")}</option>
                      <option value="FAIL">{tr("부적합 (FAIL)", "不適合（FAIL）")}</option>
                      <option value="NOT_APPLICABLE">{tr("해당없음 (N/A)", "該当なし（N/A）")}</option>
                    </select>
                  )}
                </td>
                <td className="px-3 py-2">
                  {readOnly ? (
                    <span className="text-gray-500">{localizedName({ locale, ko: item.notes }) || "-"}</span>
                  ) : (
                    <input
                      type="text"
                      value={item.notes || ""}
                      onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                      placeholder={tr("메모...", "メモ...")}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
