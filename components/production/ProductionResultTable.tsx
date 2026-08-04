import React, { useState, useMemo } from "react";
import type { ProductionResult } from "@/types/production";
import { ResultStatusBadge } from "./ProductionStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 생산실적 목록 테이블 컴포넌트
// ============================================================

interface ProductionResultTableProps {
  results: ProductionResult[];
  onOpenCreate: () => void;
  onOpenDetail: (item: ProductionResult) => void;
  onConfirmResult: (id: string) => void;
}

export default function ProductionResultTable({
  results,
  onOpenCreate,
  onOpenDetail,
  onConfirmResult,
}: ProductionResultTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { t, language } = useLanguage();

  const filteredData = useMemo(() => {
    return results.filter((r) => {
      const localizedProd = localizedName({ locale: language, ko: r.productName, ja: r.productNameJa });
      if (
        searchTerm &&
        !r.resultNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !localizedProd.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [results, searchTerm, language]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t("production.result.searchPlaceholder")}
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

        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t("production.result.new")}</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.result.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.workOrder.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.fgLot.manufactureDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.workOrder.instructedQty")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.result.totalQty")}</th>
              <th className="px-4 py-3 font-semibold text-right text-green-700">{t("production.result.goodQty")}</th>
              <th className="px-4 py-3 font-semibold text-right text-red-600">{t("production.result.defectQty")}</th>
              <th className="px-4 py-3 font-semibold text-right text-amber-700">{t("production.result.reworkQty")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.plan.achievementRate")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.result.defectRate")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.manager")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-12 text-center text-gray-500">
                  {t("production.result.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isConfirmed = item.resultStatus === "CONFIRMED";

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.resultNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.workOrderNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.productionDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                      {item.orderedQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                      {item.totalQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {item.goodQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      {item.defectQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-700">
                      {item.reworkQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-indigo-600">
                      {item.achievementRate}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-500">
                      {item.defectRate}%
                    </td>
                    <td className="px-4 py-3 text-gray-800">{localizedName({ locale: language, ko: item.handler })}</td>
                    <td className="px-4 py-3 text-center">
                      <ResultStatusBadge status={item.resultStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {t("action.detail")}
                        </button>
                        {!isConfirmed && (
                          <button
                            onClick={() => onConfirmResult(item.id)}
                            className="px-2 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 shadow-sm"
                            title="실적 확정 시 완제품 LOT가 자동 생성됩니다."
                          >
                            {t("action.confirm")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / 총 {filteredData.length}건
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
