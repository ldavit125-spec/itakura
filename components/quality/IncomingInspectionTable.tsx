import React, { useState, useMemo } from "react";
import type { IncomingInspection } from "@/types/quality";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

interface IncomingInspectionTableProps {
  inspections: IncomingInspection[];
  onOpenCreate: () => void;
  onOpenDetail: (item: IncomingInspection) => void;
}

export default function IncomingInspectionTable({
  inspections,
  onOpenCreate,
  onOpenDetail,
}: IncomingInspectionTableProps) {
  const { t, locale } = useLanguage();
  const [dateSearch, setDateSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return inspections.filter((item) => {
      if (dateSearch && !item.inspectionDate.includes(dateSearch)) return false;
      if (
        searchTerm &&
        !item.iqcNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.inboundNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [inspections, dateSearch, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const resetFilters = () => {
    setDateSearch("");
    setSearchTerm("");
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
              placeholder={t("quality.search.incoming")}
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

          {/* 초기화 버튼 */}
          <button
            onClick={resetFilters}
            className="px-2.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title={t("action.reset")}
          >
            {t("action.reset")}
          </button>
        </div>

        {/* 우측 신규 입고검사 등록 버튼 */}
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t("quality.btn.registerIncoming")}</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("quality.col.requestNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inboundNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inboundDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.materialName")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.materialLot")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.supplier")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("quality.col.inboundQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.expirationDate")}</th>
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
                  {t("quality.empty.incoming")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 bg-blue-50/50 my-1 inline-block rounded">
                    {item.iqcNo}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.inboundNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.inboundDate}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    [{item.materialCode}] {localizedName({ locale, ko: item.materialName })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-700">{item.lotNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{localizedName({ locale, ko: item.supplierName })}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-900">
                    {item.quantity.toLocaleString()} {localizedName({ locale, ko: item.unit })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-700 whitespace-nowrap">{item.expirationDate}</td>
                  <td className="px-4 py-3 text-gray-800">{localizedName({ locale, ko: item.inspector })}</td>
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
