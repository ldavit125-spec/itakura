import React, { useState, useMemo } from "react";
import type { MaterialTransaction, TransactionType } from "@/types/materials";
import { TRANSACTION_TYPE_OPTIONS } from "@/constants/material-labels";
import { TransactionTypeBadge } from "./MaterialStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// ============================================================
// 수불 이력 목록 및 상세 모달 통합 컴포넌트 (수정/삭제 불가 불변 로그)
// ============================================================

interface MaterialTransactionTableProps {
  transactions: MaterialTransaction[];
}

export default function MaterialTransactionTable({
  transactions,
}: MaterialTransactionTableProps) {
  const { t, language } = useLanguage();
  // 필터 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [lotSearch, setLotSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [handlerSearch, setHandlerSearch] = useState("");

  // 상세 모달 상태
  const [selectedTxn, setSelectedTxn] = useState<MaterialTransaction | null>(null);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 필터링된 이력 데이터
  const filteredData = useMemo(() => {
    return transactions.filter((item) => {
      // 기간 검색 (YYYY-MM-DD 비교)
      const txnDate = item.timestamp.split(" ")[0];
      if (startDate && txnDate < startDate) return false;
      if (endDate && txnDate > endDate) return false;

      // 자재 검색
      const matchesMaterial =
        !materialSearch ||
        item.materialName.toLowerCase().includes(materialSearch.toLowerCase()) ||
        (item.materialNameJa && item.materialNameJa.toLowerCase().includes(materialSearch.toLowerCase())) ||
        item.materialCode.toLowerCase().includes(materialSearch.toLowerCase());
      if (!matchesMaterial) return false;

      // LOT 검색
      const matchesLot =
        !lotSearch || item.lotNo.toLowerCase().includes(lotSearch.toLowerCase());
      if (!matchesLot) return false;

      // 처리 유형 필터
      const matchesType = typeFilter === "ALL" || item.transactionType === typeFilter;
      if (!matchesType) return false;

      // 담당자 검색
      const matchesHandler =
        !handlerSearch || item.handler.toLowerCase().includes(handlerSearch.toLowerCase());
      if (!matchesHandler) return false;

      return true;
    });
  }, [transactions, startDate, endDate, materialSearch, lotSearch, typeFilter, handlerSearch]);

  // 페이지네이션 슬라이스
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // 필터 초기화
  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setMaterialSearch("");
    setLotSearch("");
    setTypeFilter("ALL");
    setHandlerSearch("");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 및 필터 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* 시작일 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("period.select")} (From)</label>
          <DateInput
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* 종료일 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("period.select")} (To)</label>
          <DateInput
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* 자재 검색 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("master.search.material")}</label>
          <input
            type="text"
            placeholder={t("master.field.materialName")}
            value={materialSearch}
            onChange={(e) => {
              setMaterialSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LOT 검색 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("materials.transaction.searchLot")}</label>
          <input
            type="text"
            placeholder={t("materials.lotNumber")}
            value={lotSearch}
            onChange={(e) => {
              setLotSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        {/* 처리 유형 필터 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("materials.transaction.type")}</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TransactionType | "ALL");
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {TRANSACTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        {/* 담당자 검색 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t("materials.transaction.searchHandler")}</label>
          <input
            type="text"
            placeholder={t("master.field.manager")}
            value={handlerSearch}
            onChange={(e) => {
              setHandlerSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="mb-3 text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("materials.transaction.immutableNotice")}
        </span>
        <button type="button" onClick={handleResetFilters} className="text-xs text-blue-600 underline font-medium">
          {t("materials.inbound.dateClear")}
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("materials.transaction.time")}</th>
              <th className="px-4 py-3 font-semibold">{t("materials.transaction.number")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("materials.transaction.type")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.materialCode")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.materialName")}</th>
              <th className="px-4 py-3 font-semibold">{t("materials.lotNumber")}</th>
              <th className="px-4 py-3 font-semibold text-right text-green-700">{t("materials.inbound.quantity")}</th>
              <th className="px-4 py-3 font-semibold text-right text-blue-700">{t("materials.outbound.quantity")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("materials.transaction.balanceAfter")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.manager")}</th>
              <th className="px-4 py-3 font-semibold">{t("common.remarks")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("action.detail")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("materials.transaction.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-900 font-medium whitespace-nowrap">
                    {item.transactionNo}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <TransactionTypeBadge type={item.transactionType} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.materialCode}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{localizedName({ locale: language, ko: item.materialName, ja: item.materialNameJa })}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">
                    {item.lotNo}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {item.inboundQty > 0 ? `+${item.inboundQty.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-700">
                    {item.outboundQty > 0 ? `-${item.outboundQty.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {item.balanceAfter.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{localizedName({ locale: language, ko: item.handler })}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                    {item.remarks ? localizedName({ locale: language, ko: item.remarks }) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTxn(item)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
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

      {/* 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{t("materials.transaction.number")} {t("action.detail")}</h3>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.transaction.time")}:</span>
                <span className="font-mono text-gray-900">{selectedTxn.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.transaction.number")}:</span>
                <span className="font-mono font-bold text-gray-900">{selectedTxn.transactionNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.transaction.type")}:</span>
                <TransactionTypeBadge type={selectedTxn.transactionType} />
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("master.field.materialName")}:</span>
                <span className="font-semibold text-gray-900">{localizedName({ locale: language, ko: selectedTxn.materialName, ja: selectedTxn.materialNameJa })} ({selectedTxn.materialCode})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.lotNumber")}:</span>
                <span className="font-mono text-blue-600">{selectedTxn.lotNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.inbound.quantity")}:</span>
                <span className="font-semibold text-green-700">+{selectedTxn.inboundQty.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.outbound.quantity")}:</span>
                <span className="font-semibold text-blue-700">-{selectedTxn.outboundQty.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("materials.transaction.balanceAfter")}:</span>
                <span className="font-bold text-gray-900">{selectedTxn.balanceAfter.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{t("master.field.manager")}:</span>
                <span className="text-gray-800">{localizedName({ locale: language, ko: selectedTxn.handler })}</span>
              </div>
              {selectedTxn.remarks && (
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">{t("common.remarks")}:</span>
                  <p className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs text-gray-700">{localizedName({ locale: language, ko: selectedTxn.remarks })}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("action.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
