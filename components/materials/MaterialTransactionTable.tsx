import React, { useState, useMemo } from "react";
import type { MaterialTransaction, TransactionType } from "@/types/materials";
import { TRANSACTION_TYPE_OPTIONS } from "@/constants/material-labels";
import { TransactionTypeBadge } from "./MaterialStatusBadge";

// ============================================================
// 수불 이력 목록 및 상세 모달 통합 컴포넌트 (수정/삭제 불가 불변 로그)
// ============================================================

interface MaterialTransactionTableProps {
  transactions: MaterialTransaction[];
}

export default function MaterialTransactionTable({
  transactions,
}: MaterialTransactionTableProps) {
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
      if (
        materialSearch &&
        !item.materialName.toLowerCase().includes(materialSearch.toLowerCase()) &&
        !item.materialCode.toLowerCase().includes(materialSearch.toLowerCase())
      ) {
        return false;
      }

      // LOT 검색
      if (lotSearch && !item.lotNo.toLowerCase().includes(lotSearch.toLowerCase())) {
        return false;
      }

      // 처리 유형 필터
      if (typeFilter !== "ALL" && item.transactionType !== typeFilter) {
        return false;
      }

      // 담당자 검색
      if (
        handlerSearch &&
        !item.handler.toLowerCase().includes(handlerSearch.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, startDate, endDate, materialSearch, lotSearch, typeFilter, handlerSearch]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 검색 및 필터 파트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {/* 시작일 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">시작일</label>
          <input
            type="date"
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
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">종료일</label>
          <input
            type="date"
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
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">자재 검색</label>
          <input
            type="text"
            placeholder="자재명 / 자재코드"
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
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">LOT 검색</label>
          <input
            type="text"
            placeholder="LOT 번호"
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
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">처리 유형</label>
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
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 담당자 검색 */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1">담당자 검색</label>
          <input
            type="text"
            placeholder="담당자 이름"
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
          수불 이력은 위변조 방지를 위한 불변 로그이며 수정 및 삭제가 불가합니다.
        </span>
        <span className="font-semibold text-gray-700">총 {filteredData.length}건 검색됨</span>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">처리일시</th>
              <th className="px-4 py-3 font-semibold">이력 번호</th>
              <th className="px-4 py-3 font-semibold text-center">처리 유형</th>
              <th className="px-4 py-3 font-semibold">자재 코드</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 font-semibold">LOT 번호</th>
              <th className="px-4 py-3 font-semibold text-right text-green-700">입고 수량</th>
              <th className="px-4 py-3 font-semibold text-right text-blue-700">출고 수량</th>
              <th className="px-4 py-3 font-semibold text-right">처리 후 재고</th>
              <th className="px-4 py-3 font-semibold">담당자</th>
              <th className="px-4 py-3 font-semibold">비고</th>
              <th className="px-4 py-3 font-semibold text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  수불 이력이 존재하지 않습니다.
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
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.materialName}</td>
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
                  <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{item.handler}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                    {item.remarks || "-"}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedTxn(item)}
                      className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      상세
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
            <span>
              {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / 총 {filteredData.length}건
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <span className="px-3 py-1 text-xs font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 수불 이력 상세 조회 모달 */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">수불 이력 상세 정보</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedTxn.transactionNo}</p>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">처리일시</p>
                  <p className="font-mono font-semibold text-gray-900">{selectedTxn.timestamp}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">처리 유형</p>
                  <div className="mt-1">
                    <TransactionTypeBadge type={selectedTxn.transactionType} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <span className="text-gray-500 font-medium">자재:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    [{selectedTxn.materialCode}] {selectedTxn.materialName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">자재 LOT:</span>
                  <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                    {selectedTxn.lotNo}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">입고 수량:</span>
                  <span className="ml-2 font-bold text-green-700">
                    {selectedTxn.inboundQty > 0 ? `+${selectedTxn.inboundQty.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">출고 수량:</span>
                  <span className="ml-2 font-bold text-blue-700">
                    {selectedTxn.outboundQty > 0 ? `-${selectedTxn.outboundQty.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">처리 후 재고:</span>
                  <span className="ml-2 font-bold text-gray-900">{selectedTxn.balanceAfter.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">담당자:</span>
                  <span className="ml-2 text-gray-900">{selectedTxn.handler}</span>
                </div>
              </div>

              {selectedTxn.remarks && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-medium text-gray-500">비고:</p>
                  <p className="mt-1 text-gray-700 bg-gray-50 p-2.5 rounded-md text-xs">
                    {selectedTxn.remarks}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
