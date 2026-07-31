import React, { useState, useMemo } from "react";
import type { InspectionQueueItem, InspectionCategory, InspectionStatus, PriorityLevel } from "@/types/quality";
import {
  INSPECTION_CATEGORY_OPTIONS,
  INSPECTION_STATUS_OPTIONS,
  PRIORITY_LEVEL_OPTIONS,
} from "@/constants/quality-labels";
import {
  InspectionCategoryBadge,
  InspectionStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 검사 대기열 목록 테이블 컴포넌트
// ============================================================

interface InspectionQueueTableProps {
  queue: InspectionQueueItem[];
  onOpenAssign: (item: InspectionQueueItem) => void;
  onStartInspection: (id: string) => void;
}

export default function InspectionQueueTable({
  queue,
  onOpenAssign,
  onStartInspection,
}: InspectionQueueTableProps) {
  const [targetSearch, setTargetSearch] = useState("");
  const [lotSearch, setLotSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<InspectionCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return queue.filter((item) => {
      if (
        targetSearch &&
        !item.targetNo.toLowerCase().includes(targetSearch.toLowerCase()) &&
        !item.targetName.toLowerCase().includes(targetSearch.toLowerCase()) &&
        !item.requestNo.toLowerCase().includes(targetSearch.toLowerCase())
      ) {
        return false;
      }

      if (lotSearch && !item.lotNo.toLowerCase().includes(lotSearch.toLowerCase())) {
        return false;
      }

      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;

      return true;
    });
  }, [queue, targetSearch, lotSearch, categoryFilter, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 및 필터 컨트롤 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
        {/* 대상 번호 / 이름 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="대상번호, 대상명, 요청번호..."
            value={targetSearch}
            onChange={(e) => {
              setTargetSearch(e.target.value);
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

        {/* LOT 번호 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="LOT 번호 검색..."
            value={lotSearch}
            onChange={(e) => {
              setLotSearch(e.target.value);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" />
          </svg>
        </div>

        {/* 검사 구분 필터 */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as InspectionCategory | "ALL");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {INSPECTION_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 검사 상태 필터 */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as InspectionStatus | "ALL");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {INSPECTION_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 우선순위 필터 */}
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as PriorityLevel | "ALL");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {PRIORITY_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">요청 번호</th>
              <th className="px-4 py-3 font-semibold">요청일시</th>
              <th className="px-4 py-3 font-semibold text-center">검사 구분</th>
              <th className="px-4 py-3 font-semibold">대상 번호</th>
              <th className="px-4 py-3 font-semibold">대상명</th>
              <th className="px-4 py-3 font-semibold">LOT 번호</th>
              <th className="px-4 py-3 font-semibold">라인 / 거래처</th>
              <th className="px-4 py-3 font-semibold">요청자</th>
              <th className="px-4 py-3 font-semibold">담당 검사원</th>
              <th className="px-4 py-3 font-semibold text-center">검사 상태</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                  검사 대기열 항목이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isCompleted = item.status === "COMPLETED";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCompleted ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.requestNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {item.requestTime}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <InspectionCategoryBadge category={item.category} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 font-semibold">
                      {item.targetNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.targetName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">
                      {item.lotNo}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                      {item.lineOrSupplier}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.requester}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {item.inspector ? (
                        item.inspector
                      ) : (
                        <span className="text-red-500 font-normal text-xs">미배정</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <InspectionStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {!isCompleted && (
                          <>
                            <button
                              onClick={() => onOpenAssign(item)}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              담당 배정
                            </button>
                            <button
                              onClick={() => onStartInspection(item.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                            >
                              검사 시작
                            </button>
                          </>
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
