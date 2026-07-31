import React, { useState, useMemo } from "react";
import type { MaterialOutbound } from "@/types/materials";
import { useMasterData } from "@/context/MasterDataContext";
import { OutboundStatusBadge } from "./MaterialStatusBadge";

// ============================================================
// 자재 출고 목록 테이블 컴포넌트
// ============================================================

interface MaterialOutboundTableProps {
  outbounds: MaterialOutbound[];
  onOpenCreate: () => void;
  onOpenDetail: (item: MaterialOutbound) => void;
  onCancelOutbound: (item: MaterialOutbound) => void;
}

export default function MaterialOutboundTable({
  outbounds,
  onOpenCreate,
  onOpenDetail,
  onCancelOutbound,
}: MaterialOutboundTableProps) {
  const { productionLines } = useMasterData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [workOrderSearch, setWorkOrderSearch] = useState("");

  const filteredData = useMemo(() => {
    return outbounds.filter((item) => {
      // 검색어 (자재명, 자재코드, LOT번호, 출고번호)
      const matchesSearch =
        !searchTerm ||
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.outboundNo.toLowerCase().includes(searchTerm.toLowerCase());

      // 출고일 검색
      const matchesDate = !dateSearch || item.outboundDate.includes(dateSearch);

      // 생산라인 필터
      const matchesLine = lineFilter === "ALL" || item.productionLine === lineFilter;

      // 작업지시 번호 검색
      const matchesWorkOrder =
        !workOrderSearch ||
        (item.workOrderNo && item.workOrderNo.toLowerCase().includes(workOrderSearch.toLowerCase()));

      return matchesSearch && matchesDate && matchesLine && matchesWorkOrder;
    });
  }, [outbounds, searchTerm, dateSearch, lineFilter, workOrderSearch]);

  return (
    <div className="space-y-4">
      {/* 바 및 필터 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* 검색창 */}
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              placeholder="자재명, 코드, LOT번호, 출고번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* 출고일 검색 */}
          <div className="relative">
            <input
              type="date"
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 작업지시 번호 검색 */}
          <div className="relative min-w-[150px]">
            <input
              type="text"
              placeholder="작업지시 번호..."
              value={workOrderSearch}
              onChange={(e) => setWorkOrderSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* 생산라인 필터 */}
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">생산라인 전체</option>
            {productionLines.map((line) => (
              <option key={line.id} value={line.name}>
                {line.name}
              </option>
            ))}
          </select>
        </div>

        {/* 출고 등록 버튼 */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>생산 자재 출고 등록</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">출고 번호</th>
              <th className="px-4 py-3 font-semibold">출고일</th>
              <th className="px-4 py-3 font-semibold">자재 코드</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 font-semibold">LOT 번호</th>
              <th className="px-4 py-3 font-semibold text-right">출고 수량</th>
              <th className="px-4 py-3 font-semibold">단위</th>
              <th className="px-4 py-3 font-semibold">사용 생산라인</th>
              <th className="px-4 py-3 font-semibold">작업지시 번호</th>
              <th className="px-4 py-3 font-semibold">담당자</th>
              <th className="px-4 py-3 font-semibold text-center">출고 상태</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  출고 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isCancelled = item.outboundStatus === "CANCELLED";
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCancelled ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">
                      {item.outboundNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.outboundDate}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.materialName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">
                      {item.lotNo}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.productionLine}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded inline-block">
                      {item.workOrderNo}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.handler}</td>
                    <td className="px-4 py-3 text-center">
                      <OutboundStatusBadge status={item.outboundStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          상세
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => onCancelOutbound(item)}
                            className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            출고 취소
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
