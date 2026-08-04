import React, { useState, useMemo } from "react";
import type { ProductionPlan, PlanStatus, PlanPriority } from "@/types/production";
import { useMasterData } from "@/context/MasterDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";
import {
  PlanStatusBadge,
  PlanPriorityBadge,
  MaterialReadinessBadge,
} from "./ProductionStatusBadge";

// ============================================================
// 생산계획 목록 테이블 컴포넌트
// ============================================================

interface ProductionPlanTableProps {
  plans: ProductionPlan[];
  onOpenCreate: () => void;
  onOpenEdit: (item: ProductionPlan) => void;
  onOpenDetail: (item: ProductionPlan) => void;
  onConfirmPlan: (id: string) => void;
  onCancelPlan: (id: string) => void;
  onCreateWorkOrder: (plan: ProductionPlan) => void;
}

export default function ProductionPlanTable({
  plans,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onConfirmPlan,
  onCancelPlan,
  onCreateWorkOrder,
}: ProductionPlanTableProps) {
  const { productionLines } = useMasterData();
  const { t, language } = useLanguage();
  const [dateSearch, setDateSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [lineFilter, setLineFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PlanPriority | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return plans.filter((item) => {
      // 날짜 검색
      if (dateSearch && !item.plannedDate.includes(dateSearch)) return false;

      // 제품 검색
      const localizedProd = localizedName({ locale: language, ko: item.productName, ja: item.productNameJa });
      if (
        productSearch &&
        !localizedProd.toLowerCase().includes(productSearch.toLowerCase()) &&
        !item.productCode.toLowerCase().includes(productSearch.toLowerCase()) &&
        !item.planNo.toLowerCase().includes(productSearch.toLowerCase())
      ) {
        return false;
      }

      // 생산라인 필터
      if (lineFilter !== "ALL" && item.productionLine !== lineFilter) return false;

      // 상태 필터
      if (statusFilter !== "ALL" && item.planStatus !== statusFilter) return false;

      // 우선순위 필터
      if (priorityFilter !== "ALL" && item.priority !== priorityFilter) return false;

      return true;
    });
  }, [plans, dateSearch, productSearch, lineFilter, statusFilter, priorityFilter, language]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const resetFilters = () => {
    setDateSearch("");
    setProductSearch("");
    setLineFilter("ALL");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 필터 바 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 생산 예정일 */}
          <div className="min-w-[140px]">
            <DateInput
              value={dateSearch}
              onChange={(e) => {
                setDateSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title={t("production.plan.date")}
            />
          </div>

          {/* 제품/코드/계획번호 검색 */}
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder={t("production.plan.searchPlaceholder")}
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setCurrentPage(1);
              }}
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

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PlanStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("production.plan.statusAll")}</option>
            <option value="DRAFT">{t("production.status.plan.draft")}</option>
            <option value="CONFIRMED">{t("production.status.plan.confirmed")}</option>
            <option value="IN_PROGRESS">{t("production.status.plan.inProgress")}</option>
            <option value="COMPLETED">{t("production.status.plan.completed")}</option>
            <option value="CANCELLED">{t("production.status.plan.cancelled")}</option>
          </select>

          {/* 우선순위 필터 */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as PlanPriority | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("production.plan.priorityAll")}</option>
            <option value="URGENT">{t("production.priority.urgent")}</option>
            <option value="HIGH">{t("production.priority.high")}</option>
            <option value="NORMAL">{t("production.priority.normal")}</option>
            <option value="LOW">{t("production.priority.low")}</option>
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

        {/* 신규 생산계획 등록 버튼 */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t("production.plan.new")}</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.plan.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.date")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productCode")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.plan.quantity")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.unit")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.plan.date")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.priority")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.materialReadiness")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("master.field.manager")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("production.plan.empty")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isDraft = item.planStatus === "DRAFT";
                const isConfirmed = item.planStatus === "CONFIRMED";
                const isCancelled = item.planStatus === "CANCELLED";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCancelled ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                      {item.planNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.plannedDate}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{item.productCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                      {item.plannedQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {localizedName({ locale: language, ko: item.unit })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-700">
                      {item.startTime} ~ {item.endTime}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PlanPriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PlanStatusBadge status={item.planStatus} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <MaterialReadinessBadge readiness={item.materialReadiness} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          {t("action.detail")}
                        </button>
                        {isDraft && (
                          <>
                            <button
                              onClick={() => onOpenEdit(item)}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                              {t("action.edit")}
                            </button>
                            <button
                              onClick={() => onConfirmPlan(item.id)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                            >
                              {t("action.confirm")}
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button
                            onClick={() => onCreateWorkOrder(item)}
                            className="px-2 py-1 text-xs font-bold text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            {t("action.issueOrder")}
                          </button>
                        )}
                        {!isCancelled && item.planStatus !== "COMPLETED" && (
                          <button
                            onClick={() => onCancelPlan(item.id)}
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
