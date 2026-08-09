import React, { useState, useMemo } from "react";
import type { InspectionQueueItem, InspectionCategory, InspectionStatus, PriorityLevel } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import {
  InspectionCategoryBadge,
  InspectionStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 검사 대기열 목록 테이블 컴포넌트 (다국어 지원)
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
  const { t, locale } = useLanguage();

  const [targetSearch, setTargetSearch] = useState("");
  const [lotSearch, setLotSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<InspectionCategory | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const CATEGORY_OPTIONS: { value: InspectionCategory | "ALL"; labelKey: string }[] = [
    { value: "ALL", labelKey: "quality.category.all" },
    { value: "INCOMING", labelKey: "quality.category.incoming" },
    { value: "PROCESS", labelKey: "quality.category.process" },
    { value: "FINISHED_GOODS", labelKey: "quality.category.finishedGoods" },
  ];

  const STATUS_OPTIONS: { value: InspectionStatus | "ALL"; labelKey: string }[] = [
    { value: "ALL", labelKey: "quality.status.all" },
    { value: "REQUESTED", labelKey: "quality.status.requested" },
    { value: "ASSIGNED", labelKey: "quality.status.assigned" },
    { value: "IN_PROGRESS", labelKey: "quality.status.inProgress" },
    { value: "COMPLETED", labelKey: "quality.status.completed" },
    { value: "CANCELLED", labelKey: "quality.status.cancelled" },
  ];

  const PRIORITY_OPTIONS: { value: PriorityLevel | "ALL"; labelKey: string }[] = [
    { value: "ALL", labelKey: "quality.priority.all" },
    { value: "URGENT", labelKey: "quality.priority.urgent" },
    { value: "HIGH", labelKey: "quality.priority.high" },
    { value: "NORMAL", labelKey: "quality.priority.normal" },
    { value: "LOW", labelKey: "quality.priority.low" },
  ];

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

  const resetFilters = () => {
    setTargetSearch("");
    setLotSearch("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 2행: 검색창 + 필터 + 초기화 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 검사대상/요청번호 검색 */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <input
              type="text"
              placeholder={t("quality.search.queue")}
              value={targetSearch}
              onChange={(e) => {
                setTargetSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* LOT번호 검색 */}
          <div className="relative min-w-[150px]">
            <input
              type="text"
              placeholder={t("quality.search.lotNo")}
              value={lotSearch}
              onChange={(e) => {
                setLotSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" />
            </svg>
          </div>

          {/* 구분 필터 */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as InspectionCategory | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>

          {/* 진행상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as InspectionStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
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
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>

          {/* 초기화 버튼 */}
          <button
            onClick={resetFilters}
            className="px-2.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title={t("action.reset")}
          >
            {t("action.reset")}
          </button>
        </div>

        {/* 상단 검사 시작 버튼 */}
        <div>
          <button
            onClick={() => {
              const pendingItem = filteredData.find((item) => item.status === "REQUESTED" || item.status === "ASSIGNED");
              if (pendingItem) {
                onStartInspection(pendingItem.id);
              } else {
                const anyActive = filteredData.find((item) => item.status !== "COMPLETED" && item.status !== "CANCELLED");
                if (anyActive) onStartInspection(anyActive.id);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t("quality.btn.startInspection")}</span>
          </button>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("quality.col.requestNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.requestTime")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.category")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.targetNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.targetName")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.lotNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.lineOrSupplier")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.requester")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inspector")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.inspectionStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                  {t("quality.empty.queue")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isCompleted = item.status === "COMPLETED";
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${isCompleted ? "bg-gray-50 opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.requestNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{item.requestTime}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <InspectionCategoryBadge category={item.category} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 font-semibold">{item.targetNo}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{localizedName({ locale, ko: item.targetName })}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">{item.lotNo}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{localizedName({ locale, ko: item.lineOrSupplier })}</td>
                    <td className="px-4 py-3 text-gray-700">{localizedName({ locale, ko: item.requester })}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {item.inspector ? (
                        localizedName({ locale, ko: item.inspector })
                      ) : (
                        <span className="text-red-500 font-normal text-xs">{t("quality.unassigned")}</span>
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
                              {t("quality.btn.assignInspector")}
                            </button>
                            <button
                              onClick={() => onStartInspection(item.id)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                            >
                              {t("quality.btn.startInspection")}
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
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / {t("quality.total")} {filteredData.length}{t("quality.summary.unit")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("action.previous")}
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
