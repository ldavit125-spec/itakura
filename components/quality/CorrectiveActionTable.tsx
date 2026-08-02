import React, { useState, useMemo } from "react";
import type { CorrectiveAction, CorrectiveActionStatus } from "@/types/quality";
import {
  CORRECTIVE_ACTION_STATUS_OPTIONS,
  DEPARTMENT_CODE_LABELS,
} from "@/constants/quality-labels";
import {
  CorrectiveActionStatusBadge,
  VerificationStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 시정조치 (CAPA) 목록 테이블 컴포넌트
// ============================================================

interface CorrectiveActionTableProps {
  correctiveActions: CorrectiveAction[];
  onOpenDetail: (item: CorrectiveAction) => void;
  onCloseCA: (caId: string) => void;
  onCreate?: () => void;
}

export default function CorrectiveActionTable({
  correctiveActions,
  onOpenDetail,
  onCloseCA,
  onCreate,
}: CorrectiveActionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CorrectiveActionStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return correctiveActions.filter((item) => {
      if (
        searchTerm &&
        !item.caNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.ncNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.problemSummary.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.handler.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "ALL" && item.caStatus !== statusFilter) return false;
      return true;
    });
  }, [correctiveActions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="시정조치번호, 부적합번호, 문제요약, 담당자 검색..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as CorrectiveActionStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CORRECTIVE_ACTION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          {onCreate && <button onClick={onCreate} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700">시정조치 등록</button>}
          미완료 CAPA: <strong className="text-amber-600">{correctiveActions.filter(c => c.caStatus !== "CLOSED").length}건</strong>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">시정조치 번호</th>
              <th className="px-4 py-3 font-semibold">부적합 번호</th>
              <th className="px-4 py-3 font-semibold">요청일</th>
              <th className="px-4 py-3 font-semibold">대상 부서</th>
              <th className="px-4 py-3 font-semibold">담당자</th>
              <th className="px-4 py-3 font-semibold">문제 요약</th>
              <th className="px-4 py-3 font-semibold text-center">조치 상태</th>
              <th className="px-4 py-3 font-semibold">완료 예정일</th>
              <th className="px-4 py-3 font-semibold text-center">검증 상태</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  등록된 시정조치(CAPA) 항목이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isClosed = item.caStatus === "CLOSED";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isClosed ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-amber-700 bg-amber-50/50 my-1 inline-block rounded">
                      {item.caNo}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.ncNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.requestDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {DEPARTMENT_CODE_LABELS[item.targetDepartment]}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{item.handler}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                      {item.problemSummary}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CorrectiveActionStatusBadge status={item.caStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-700 whitespace-nowrap">
                      {item.dueDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <VerificationStatusBadge status={item.verificationStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          조치 / 상세
                        </button>
                        {!isClosed && item.verificationStatus === "EFFECTIVE" && (
                          <button
                            onClick={() => onCloseCA(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 shadow-sm"
                          >
                            종결 (CLOSED)
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
