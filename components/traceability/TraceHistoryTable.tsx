import React, { useState, useMemo } from "react";
import type { TraceHistoryItem, TraceDirection } from "@/types/traceability";
import { TRACE_DIRECTION_LABELS } from "@/constants/traceability-labels";

// ============================================================
// Tab 5: 추적 수행 이력 로그 테이블 컴포넌트 (불변 로그)
// ============================================================

interface TraceHistoryTableProps {
  history: TraceHistoryItem[];
  onTriggerForward: (lotNo: string) => void;
  onTriggerBackward: (lotNo: string) => void;
}

export default function TraceHistoryTable({
  history,
  onTriggerForward,
  onTriggerBackward,
}: TraceHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [directionFilter, setDirectionFilter] = useState<TraceDirection | "ALL">("ALL");
  const [userFilter, setUserFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const users = useMemo(() => Array.from(new Set(history.map(item => item.user))), [history]);

  const filteredData = useMemo(() => {
    return history.filter((item) => {
      if (
        searchTerm &&
        !item.searchQuery.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.startNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.user.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (directionFilter !== "ALL" && item.direction !== directionFilter) return false;
      if (userFilter !== "ALL" && item.user !== userFilter) return false;
      return true;
    });
  }, [history, searchTerm, directionFilter, userFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="relative col-span-1 sm:col-span-1">
          <input
            type="text"
            placeholder="검색 대상, 시작 번호, 사용자 검색..."
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

        <select
          value={directionFilter}
          onChange={(e) => {
            setDirectionFilter(e.target.value as TraceDirection | "ALL");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">추적 유형 전체</option>
          <option value="FORWARD">정방향 추적</option>
          <option value="BACKWARD">역방향 추적</option>
          <option value="INTEGRATED_SEARCH">통합 검색</option>
          <option value="RELATION_VIEW">관계도 조회</option>
        </select>

        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">사용자 전체</option>
          {users.map(user => <option key={user} value={user}>{user}</option>)}
        </select>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1000px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">추적 일시</th>
              <th className="px-4 py-3 font-semibold text-center">추적 유형</th>
              <th className="px-4 py-3 font-semibold">검색 대상 / 시작 번호</th>
              <th className="px-4 py-3 font-semibold text-right">검색 결과 수</th>
              <th className="px-4 py-3 font-semibold text-center">품질 이상 여부</th>
              <th className="px-4 py-3 font-semibold">사용자</th>
              <th className="px-4 py-3 font-semibold text-center">재추적 실행</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  추적 수행 이력이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                    {item.traceTimestamp}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-bold text-blue-800 bg-blue-100 rounded border border-blue-200">
                      {TRACE_DIRECTION_LABELS[item.direction]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.searchQuery}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-900">
                    {item.resultCount}건
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.hasQualityAnomaly ? (
                      <span className="px-2 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-full border border-red-200">
                        품질 이상 발견
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
                        정상
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.user}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {item.direction === "FORWARD" ? (
                      <button
                        onClick={() => onTriggerForward(item.startNo)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 rounded hover:bg-purple-700 shadow-sm"
                      >
                        정방향 추적 →
                      </button>
                    ) : (
                      <button
                        onClick={() => onTriggerBackward(item.startNo)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-sm"
                      >
                        ← 역방향 추적
                      </button>
                    )}
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
