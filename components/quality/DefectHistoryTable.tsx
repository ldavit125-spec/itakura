"use client";

import { useMemo, useState } from "react";
import type { DefectHistory, DefectProcessingStatus, DefectType } from "@/types/quality";
import DefectStatusBadge from "./DefectStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// 불량 유형 코드 → 번역 키
const DEFECT_TYPE_KEYS: Record<DefectType, string> = {
  FOREIGN_MATERIAL: "quality.defectType.foreignMaterial",
  WEIGHT: "quality.defectType.weight",
  PACKAGING: "quality.defectType.packaging",
  APPEARANCE: "quality.defectType.appearance",
  SEALING: "quality.defectType.sealing",
  LABEL: "quality.defectType.label",
  DAMAGE: "quality.defectType.damage",
  OTHER: "quality.defectType.other",
};

// 불량 처리 상태 코드 → 번역 키 (select 옵션용)
const DEFECT_STATUS_KEYS: Record<DefectProcessingStatus, string> = {
  INVESTIGATING: "quality.defectStatus.investigating",
  CAUSE_ANALYZED: "quality.defectStatus.causeAnalyzed",
  REWORK: "quality.defectStatus.rework",
  DISCARDED: "quality.defectStatus.discarded",
  SHIPMENT_HOLD: "quality.defectStatus.shipmentHold",
  COMPLETED: "quality.defectStatus.completed",
};

export const DEFECT_STATUS_CODE_LIST = Object.keys(DEFECT_STATUS_KEYS) as DefectProcessingStatus[];
export const DEFECT_TYPE_CODE_LIST = Object.keys(DEFECT_TYPE_KEYS) as DefectType[];

export default function DefectHistoryTable({
  items,
  onOpen,
  onCreate,
}: {
  items: DefectHistory[];
  onOpen: (item: DefectHistory) => void;
  onCreate?: () => void;
}) {
  const { t, locale } = useLanguage();
  const [date, setDate] = useState("");
  const [lot, setLot] = useState("");
  const [product, setProduct] = useState("");
  const [inspector, setInspector] = useState("");
  const [type, setType] = useState<DefectType | "ALL">("ALL");
  const [status, setStatus] = useState<DefectProcessingStatus | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (!date || item.inspectionDate === date) &&
          (!lot || item.lotNumber.toLowerCase().includes(lot.toLowerCase())) &&
          (!product || item.productName.toLowerCase().includes(product.toLowerCase())) &&
          (!inspector || item.inspector.toLowerCase().includes(inspector.toLowerCase())) &&
          (type === "ALL" || item.defectType === type) &&
          (status === "ALL" || item.status === status)
      ),
    [date, inspector, items, lot, product, status, type]
  );

  const resetFilters = () => {
    setDate("");
    setLot("");
    setProduct("");
    setInspector("");
    setType("ALL");
    setStatus("ALL");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* 2행: 날짜 + 검색창 + 필터 + 초기화 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 검사일 */}
          <div className="min-w-[140px]">
            <DateInput
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* LOT번호 검색 */}
          <input
            value={lot}
            onChange={(e) => setLot(e.target.value)}
            placeholder={t("quality.search.lotNo")}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
          />

          {/* 제품명 */}
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder={t("quality.col.productName")}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
          />

          {/* 검사담당자 */}
          <input
            value={inspector}
            onChange={(e) => setInspector(e.target.value)}
            placeholder={t("quality.col.inspectorName")}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[110px]"
          />

          {/* 불량타입 필터 */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DefectType | "ALL")}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("quality.defectType.all")}</option>
            {DEFECT_TYPE_CODE_LIST.map((code) => (
              <option key={code} value={code}>
                {t(DEFECT_TYPE_KEYS[code])}
              </option>
            ))}
          </select>

          {/* 처리상태 필터 */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DefectProcessingStatus | "ALL")}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("quality.defectStatus.all")}</option>
            {DEFECT_STATUS_CODE_LIST.map((code) => (
              <option key={code} value={code}>
                {t(DEFECT_STATUS_KEYS[code])}
              </option>
            ))}
          </select>

          {/* 초기화 버튼 */}
          <button
            onClick={resetFilters}
            className="px-2.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title={t("action.reset")}
          >
            {t("action.reset")}
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {t("quality.total")} {filtered.length}{t("quality.summary.unit")} · {t("quality.clickForDetail")}
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[1450px] text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3">{t("quality.col.defectNo")}</th>
              <th className="px-4 py-3">{t("quality.col.lotNo")}</th>
              <th className="px-4 py-3">{t("quality.col.productName")}</th>
              <th className="px-4 py-3">{t("quality.col.productionDate")}</th>
              <th className="px-4 py-3">{t("quality.col.inspectionDate")}</th>
              <th className="px-4 py-3">{t("quality.col.inspectorName")}</th>
              <th className="px-4 py-3">{t("quality.col.defectType")}</th>
              <th className="px-4 py-3 text-right">{t("quality.col.defectQty")}</th>
              <th className="px-4 py-3 text-right">{t("quality.col.defectRate")}</th>
              <th className="px-4 py-3 text-center">{t("quality.col.defectStatus")}</th>
              <th className="px-4 py-3">{t("quality.col.handler")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                  {t("quality.empty.defect")}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onOpen(item)}
                  className="cursor-pointer hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.defectNo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 underline">{item.lotNumber}</td>
                  <td className="px-4 py-3 font-semibold">{localizedName({ locale, ko: item.productName })}</td>
                  <td className="px-4 py-3">{item.productionDate}</td>
                  <td className="px-4 py-3">{item.inspectionDate}</td>
                  <td className="px-4 py-3">{localizedName({ locale, ko: item.inspector })}</td>
                  <td className="px-4 py-3">{t(DEFECT_TYPE_KEYS[item.defectType])}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    {item.defectQuantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">{item.defectRate.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-center">
                    <DefectStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">{localizedName({ locale, ko: item.assignee })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
