import React, { useState, useMemo } from "react";
import type { WorkOrder } from "@/types/production";
import { WorkStatusBadge, MaterialIssueStatusBadge } from "./ProductionStatusBadge";

// ============================================================
// 생산 진행 현황 목록 테이블 컴포넌트
// ============================================================

interface ProductionProgressTableProps {
  workOrders: WorkOrder[];
  onStartWork: (id: string) => void;
  onPauseWork: (id: string) => void;
  onResumeWork: (id: string) => void;
  onOpenQuantityModal: (item: WorkOrder) => void;
  onCompleteRequest: (id: string) => void;
  onOpenDetail: (item: WorkOrder) => void;
}

export default function ProductionProgressTable({
  workOrders,
  onStartWork,
  onPauseWork,
  onResumeWork,
  onOpenQuantityModal,
  onCompleteRequest,
  onOpenDetail,
}: ProductionProgressTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 진행 탭에는 WAITING, READY, IN_PROGRESS, PAUSED 상태인 작업지시만 표시
  const activeProgressOrders = useMemo(() => {
    return workOrders.filter((w) =>
      ["WAITING", "READY", "IN_PROGRESS", "PAUSED"].includes(w.workStatus)
    );
  }, [workOrders]);

  const filteredData = useMemo(() => {
    return activeProgressOrders.filter((w) => {
      if (
        searchTerm &&
        !w.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !w.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !w.productionLine.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [activeProgressOrders, searchTerm]);

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="작업지시 번호, 제품명, 생산라인 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="text-xs text-gray-500 font-medium">
          현재 가동/대기 작업: <strong className="text-blue-600">{filteredData.length}건</strong>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">작업지시 번호</th>
              <th className="px-4 py-3 font-semibold">제품명</th>
              <th className="px-4 py-3 font-semibold">생산라인</th>
              <th className="px-4 py-3 font-semibold text-right">지시 수량</th>
              <th className="px-4 py-3 font-semibold">예정 시작</th>
              <th className="px-4 py-3 font-semibold">실제 시작</th>
              <th className="px-4 py-3 font-semibold text-right">현재 생산량</th>
              <th className="px-4 py-3 font-semibold w-40">진행률 (%)</th>
              <th className="px-4 py-3 font-semibold text-center">자재 출고</th>
              <th className="px-4 py-3 font-semibold text-center">작업 상태</th>
              <th className="px-4 py-3 font-semibold">담당자</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  현재 진행 중이거나 대기 중인 작업지시가 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const progressRate = Math.min(
                  100,
                  Math.round((item.currentQuantity / item.orderedQuantity) * 100 * 10) / 10
                );

                const isWaiting = item.workStatus === "WAITING";
                const isReady = item.workStatus === "READY";
                const isInProgress = item.workStatus === "IN_PROGRESS";
                const isPaused = item.workStatus === "PAUSED";

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {item.workOrderNo}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.productName}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.productionLine}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {item.orderedQuantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.startTime}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {item.actualStartTime || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-700">
                      {item.currentQuantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              progressRate >= 100
                                ? "bg-green-500"
                                : progressRate >= 50
                                ? "bg-blue-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${progressRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-700 min-w-[36px]">
                          {progressRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MaterialIssueStatusBadge status={item.materialIssueStatus} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <WorkStatusBadge status={item.workStatus} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.handler || "미배정"}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          상세
                        </button>
                        {(isWaiting || isReady) && (
                          <button
                            onClick={() => onStartWork(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                          >
                            작업 시작
                          </button>
                        )}
                        {isInProgress && (
                          <>
                            <button
                              onClick={() => onOpenQuantityModal(item)}
                              className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              실적 입력
                            </button>
                            <button
                              onClick={() => onPauseWork(item.id)}
                              className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                            >
                              일시정지
                            </button>
                            <button
                              onClick={() => onCompleteRequest(item.id)}
                              className="px-2 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              작업 완료
                            </button>
                          </>
                        )}
                        {isPaused && (
                          <button
                            onClick={() => onResumeWork(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700"
                          >
                            작업 재개
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
    </div>
  );
}
