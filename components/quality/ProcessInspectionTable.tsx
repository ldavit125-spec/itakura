import React, { useState, useMemo } from "react";
import type { ProcessInspection, ProcessCode } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";
import DateInput from "@/components/ui/DateInput";

interface ProcessInspectionTableProps {
  inspections: ProcessInspection[];
  onOpenCreate: () => void;
  onOpenDetail: (item: ProcessInspection) => void;
}

const PROCESS_OPTIONS: { value: ProcessCode | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "quality.process.all" },
  { value: "MIXING", labelKey: "quality.process.mixing" },
  { value: "DOUGH", labelKey: "quality.process.dough" },
  { value: "FERMENTATION", labelKey: "quality.process.fermentation" },
  { value: "DIVIDING", labelKey: "quality.process.dividing" },
  { value: "SHAPING", labelKey: "quality.process.shaping" },
  { value: "BAKING", labelKey: "quality.process.baking" },
  { value: "COOLING", labelKey: "quality.process.cooling" },
  { value: "PACKAGING", labelKey: "quality.process.packaging" },
];

const PROCESS_LABEL_KEYS: Record<ProcessCode, string> = {
  MIXING: "quality.process.mixing",
  DOUGH: "quality.process.dough",
  FERMENTATION: "quality.process.fermentation",
  DIVIDING: "quality.process.dividing",
  SHAPING: "quality.process.shaping",
  BAKING: "quality.process.baking",
  COOLING: "quality.process.cooling",
  PACKAGING: "quality.process.packaging",
};

export default function ProcessInspectionTable({
  inspections,
  onOpenCreate,
  onOpenDetail,
}: ProcessInspectionTableProps) {
  const { t, locale } = useLanguage();
  const [dateSearch, setDateSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [processFilter, setProcessFilter] = useState<ProcessCode | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return inspections.filter((item) => {
      if (dateSearch && !item.inspectionDate.includes(dateSearch)) return false;
      if (
        searchTerm &&
        !item.pqcNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.productionLine.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (processFilter !== "ALL" && item.process !== processFilter) return false;
      return true;
    });
  }, [inspections, dateSearch, searchTerm, processFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const resetFilters = () => {
    setDateSearch("");
    setSearchTerm("");
    setProcessFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 2행: 날짜 + 검색창 + 필터 + 초기화 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 검사일 */}
          <div className="min-w-[140px]">
            <DateInput
              value={dateSearch}
              onChange={(e) => {
                setDateSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 검색창 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder={t("quality.search.process")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 공정 필터 */}
          <select
            value={processFilter}
            onChange={(e) => {
              setProcessFilter(e.target.value as ProcessCode | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {PROCESS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
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

        {/* 우측 신규 공정검사 등록 버튼 */}
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t("quality.btn.registerProcess")}</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("quality.col.pqcNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.workOrderNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.productionDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.productionLine")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.process")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inspectionTiming")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.worker")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inspector")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.inspectionStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.judgment")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("quality.empty.process")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-purple-700 bg-purple-50/50 my-1 inline-block rounded">{item.pqcNo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.workOrderNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.productionDate}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{localizedName({ locale, ko: item.productName })}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{localizedName({ locale, ko: item.productionLine })}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-bold text-purple-800 bg-purple-100 rounded border border-purple-200">
                      {t(PROCESS_LABEL_KEYS[item.process])}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{localizedName({ locale, ko: item.inspectionTiming })}</td>
                  <td className="px-4 py-3 text-gray-700">{localizedName({ locale, ko: item.worker })}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{localizedName({ locale, ko: item.inspector })}</td>
                  <td className="px-4 py-3 text-center">
                    <InspectionStatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <InspectionJudgmentBadge judgment={item.judgment} />
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onOpenDetail(item)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {t("action.detail")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / {t("quality.total")} {filteredData.length}{t("quality.summary.unit")}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {t("action.previous")}
            </button>
            <span className="px-3 py-1 font-semibold">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {t("action.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
