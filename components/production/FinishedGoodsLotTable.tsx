import React, { useState, useMemo } from "react";
import type { FinishedGoodsLot } from "@/types/production";
import { QualityStatusBadge } from "./ProductionStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 완제품 LOT 목록 테이블 컴포넌트
// ============================================================

interface FinishedGoodsLotTableProps {
  fgLots: FinishedGoodsLot[];
  onOpenDetail: (item: FinishedGoodsLot) => void;
}

export default function FinishedGoodsLotTable({
  fgLots,
  onOpenDetail,
}: FinishedGoodsLotTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { t, language } = useLanguage();

  const filteredData = useMemo(() => {
    return fgLots.filter((item) => {
      const localizedProd = localizedName({ locale: language, ko: item.productName, ja: item.productNameJa });
      if (
        searchTerm &&
        !item.fgLotNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !localizedProd.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.resultNo.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [fgLots, searchTerm, language]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 검색 컨트롤 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t("production.fgLot.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-gray-500">
          {t("production.fgLot.countLabel")}{" "}
          <strong className="text-blue-600">
            {filteredData.length}{t("unit.case")}
          </strong>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.fgLot.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.workOrder.number")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.result.goodQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.date")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.fgLot.shipmentStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  {t("production.fgLot.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">
                    {item.fgLotNo}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {item.workOrderNo}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-blue-700">
                    {item.goodQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {item.productionDate}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {item.isReleaseAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        {localizedName({ locale: language, ko: "출하 가능", ja: "出荷可能" })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        {localizedName({ locale: language, ko: "출하 불가 (검사 대기)", ja: "出荷不可 (検査待ち)" })}
                      </span>
                    )}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / {t("quality.total")} {filteredData.length}{t("unit.case")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("action.prev")}
            </button>
            <span className="px-3 py-1 font-semibold">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("action.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
