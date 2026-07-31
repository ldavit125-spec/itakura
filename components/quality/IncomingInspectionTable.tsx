import React, { useState, useMemo } from "react";
import type { IncomingInspection } from "@/types/quality";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";

// ============================================================
// 원재료 입고검사 목록 테이블 컴포넌트
// ============================================================

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return inspections.filter((item) => {
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
  }, [inspections, searchTerm]);

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
            placeholder="검사번호, 입고번호, 자재명, LOT, 거래처 검색..."
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
          <span>원재료 입고검사 등록</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">검사 번호</th>
              <th className="px-4 py-3 font-semibold">입고 번호</th>
              <th className="px-4 py-3 font-semibold">입고일</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 font-semibold">자재 LOT</th>
              <th className="px-4 py-3 font-semibold">거래처</th>
              <th className="px-4 py-3 font-semibold text-right">입고 수량</th>
              <th className="px-4 py-3 font-semibold">유통기한</th>
              <th className="px-4 py-3 font-semibold">담당 검사원</th>
              <th className="px-4 py-3 font-semibold text-center">검사 상태</th>
              <th className="px-4 py-3 font-semibold text-center">최종 판정</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  등록된 원재료 입고검사 기록이 없습니다.
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
                    [{item.materialCode}] {item.materialName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-700">{item.lotNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.supplierName}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-900">
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-amber-700 whitespace-nowrap">
                    {item.expirationDate}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{item.inspector}</td>
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
                      상세
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
              이전
            </button>
            <span className="px-3 py-1 font-semibold">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
