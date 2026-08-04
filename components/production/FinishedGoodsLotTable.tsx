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
          생산 확정 완료된 완제품 LOT: <strong className="text-blue-600">{filteredData.length}건</strong>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.result.fgLot")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.result.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.workOrder.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.fgLot.manufactureDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productCode")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.result.totalQty")}</th>
              <th className="px-4 py-3 font-semibold text-right text-green-700">{t("production.result.goodQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.fgLot.expirationDate")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.result.qualityStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.fgLot.shipmentStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-gray-500">
                  {t("production.fgLot.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 bg-blue-50/50 my-1 inline-block rounded">
                    {item.fgLotNo}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.resultNo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.workOrderNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.productionDate}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{item.productCode}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {item.totalQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-green-600">
                    {item.goodQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold whitespace-nowrap text-amber-700">
                    {item.expirationDate}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <QualityStatusBadge status={item.qualityStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.isReleaseAvailable ? (
                      <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                        {localizedName({ locale: language, ko: "출고 가능", ja: "出荷可能" })}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full border border-gray-200">
                        {localizedName({ locale: language, ko: "출고 불가 (검사 대기)", ja: "出荷不可 (検査待機)" })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onOpenDetail(item)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
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
