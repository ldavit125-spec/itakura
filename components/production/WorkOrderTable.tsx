import React, { useState, useMemo } from "react";
import type { WorkOrder, WorkStatus } from "@/types/production";
import { useMasterData } from "@/context/MasterDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import {
  WorkStatusBadge,
  MaterialIssueStatusBadge,
} from "./ProductionStatusBadge";

// ============================================================
// 작업지시 목록 테이블 컴포넌트
// ============================================================

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onOpenDetail: (item: WorkOrder) => void;
  onAssignHandler: (item: WorkOrder) => void;
  onMarkReady: (id: string) => void;
  onCancelWorkOrder: (id: string) => void;
  onNavigateToMaterials: (workOrderNo: string) => void;
}

export default function WorkOrderTable({
  workOrders,
  onOpenDetail,
  onAssignHandler,
  onMarkReady,
  onCancelWorkOrder,
  onNavigateToMaterials,
}: WorkOrderTableProps) {
  const { productionLines } = useMasterData();
  const { t, language } = useLanguage();
  const [woSearch, setWoSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<WorkStatus | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return workOrders.filter((item) => {
      const localizedProd = localizedName({ locale: language, ko: item.productName, ja: item.productNameJa });
      if (
        woSearch &&
        !item.workOrderNo.toLowerCase().includes(woSearch.toLowerCase()) &&
        !localizedProd.toLowerCase().includes(woSearch.toLowerCase()) &&
        !item.planNo.toLowerCase().includes(woSearch.toLowerCase())
      ) {
        return false;
      }

      if (lineFilter !== "ALL" && item.productionLine !== lineFilter) return false;
      if (statusFilter !== "ALL" && item.workStatus !== statusFilter) return false;

      return true;
    });
  }, [workOrders, woSearch, lineFilter, statusFilter, language]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 컨트롤 바 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 작업지시 번호 및 제품 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={t("production.workOrder.searchPlaceholder")}
              value={woSearch}
              onChange={(e) => {
                setWoSearch(e.target.value);
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

          {/* 생산라인 필터 */}
          <select
            value={lineFilter}
            onChange={(e) => {
              setLineFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("production.plan.lineAll")}</option>
            {productionLines.map((line) => (
              <option key={line.id} value={line.name}>
                {localizedName({ locale: language, ko: line.name, ja: line.nameJa })}
              </option>
            ))}
          </select>

          {/* 작업 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as WorkStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("production.workOrder.statusAll")}</option>
            <option value="WAITING">{t("production.status.work.waiting")}</option>
            <option value="READY">{t("production.status.work.ready")}</option>
            <option value="IN_PROGRESS">{t("production.status.work.inProgress")}</option>
            <option value="PAUSED">{t("production.status.work.paused")}</option>
            <option value="COMPLETED">{t("production.status.work.completed")}</option>
            <option value="CANCELLED">{t("production.status.work.cancelled")}</option>
          </select>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.workOrder.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.workOrder.instructedQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.manager")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.workOrder.issueStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.workOrder.status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                  {t("production.workOrder.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isWaiting = item.workStatus === "WAITING";
                const isCancelled = item.workStatus === "CANCELLED";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCancelled ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-gray-900">
                      {item.workOrderNo}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {item.planNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.plannedDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                      {item.orderedQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {item.startTime} ~ {item.endTime}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.handler ? (
                        localizedName({ locale: language, ko: item.handler })
                      ) : (
                        <span className="text-red-500 font-normal">미배정</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MaterialIssueStatusBadge status={item.materialIssueStatus} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <WorkStatusBadge status={item.workStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          {t("action.detail")}
                        </button>
                        {isWaiting && (
                          <button
                            onClick={() => onMarkReady(item.id)}
                            className="px-2 py-1 text-xs font-semibold text-white bg-cyan-600 rounded hover:bg-cyan-700 transition-colors"
                          >
                            준비 완료
                          </button>
                        )}
                        <button
                          onClick={() => onNavigateToMaterials(item.workOrderNo)}
                          className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          title="자재 출고 관리 화면으로 이동"
                        >
                          {t("production.workOrder.issueStatus")}
                        </button>
                        {!isCancelled && item.workStatus !== "COMPLETED" && (
                          <button
                            onClick={() => onCancelWorkOrder(item.id)}
                            className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            {t("action.cancel")}
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
