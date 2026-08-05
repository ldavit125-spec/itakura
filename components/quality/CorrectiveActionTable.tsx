import React, { useState, useMemo } from "react";
import type { CorrectiveAction, CorrectiveActionStatus, DepartmentCode } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";
import {
  CorrectiveActionStatusBadge,
  VerificationStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 시정조치 (CAPA) 목록 테이블 컴포넌트 (다국어 지원)
// ============================================================

interface CorrectiveActionTableProps {
  correctiveActions: CorrectiveAction[];
  onOpenDetail: (item: CorrectiveAction) => void;
  onCloseCA: (caId: string) => void;
  onCreate?: () => void;
}

const CA_STATUS_OPTIONS: { value: CorrectiveActionStatus | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "quality.caStatus.all" },
  { value: "REQUESTED", labelKey: "quality.caStatus.requested" },
  { value: "ANALYZING", labelKey: "quality.caStatus.analyzing" },
  { value: "PLANNED", labelKey: "quality.caStatus.planned" },
  { value: "IN_PROGRESS", labelKey: "quality.caStatus.inProgress" },
  { value: "COMPLETED", labelKey: "quality.caStatus.completed" },
  { value: "VERIFIED", labelKey: "quality.caStatus.verified" },
  { value: "CLOSED", labelKey: "quality.caStatus.closed" },
];

const DEPT_LABEL_KEYS: Record<DepartmentCode, string> = {
  MATERIALS: "quality.dept.materials",
  PRODUCTION: "quality.dept.production",
  QUALITY: "quality.dept.quality",
  FACILITY: "quality.dept.facility",
  HYGIENE: "quality.dept.hygiene",
};

export default function CorrectiveActionTable({
  correctiveActions,
  onOpenDetail,
  onCloseCA,
  onCreate,
}: CorrectiveActionTableProps) {
  const { t, locale } = useLanguage();
  const [dateSearch, setDateSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CorrectiveActionStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return correctiveActions.filter((item) => {
      if (dateSearch && !item.requestDate.includes(dateSearch)) return false;
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
  }, [correctiveActions, dateSearch, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const resetFilters = () => {
    setDateSearch("");
    setSearchTerm("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* 2행: 날짜 + 검색창 + 필터 + 초기화 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 요청일 */}
          <div className="min-w-[140px]">
            <DateInput
              value={dateSearch}
              onChange={(e) => {
                setDateSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 검색창 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder={t("quality.search.ca")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as CorrectiveActionStatus | "ALL");
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {CA_STATUS_OPTIONS.map((opt) => (
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

        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium whitespace-nowrap">
          {t("quality.incompleteCA")}: <strong className="text-amber-600 ml-1">{correctiveActions.filter(c => c.caStatus !== "CLOSED").length}{t("quality.summary.unit")}</strong>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("quality.col.caNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.ncNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.requestDate")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.targetDept")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.handler")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.problemSummary")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.caStatus")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.dueDate")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.verificationStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  {t("quality.empty.ca")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const isClosed = item.caStatus === "CLOSED";
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isClosed ? "bg-gray-50 opacity-60" : ""}`}>
                    <td className="px-4 py-3 font-mono font-bold text-amber-700 bg-amber-50/50 my-1 inline-block rounded">{item.caNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.ncNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.requestDate}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {t(DEPT_LABEL_KEYS[item.targetDepartment])}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{localizedName({ locale, ko: item.handler })}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{localizedName({ locale, ko: item.problemSummary })}</td>
                    <td className="px-4 py-3 text-center">
                      <CorrectiveActionStatusBadge status={item.caStatus} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-700 whitespace-nowrap">{item.dueDate}</td>
                    <td className="px-4 py-3 text-center">
                      <VerificationStatusBadge status={item.verificationStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          {t("quality.btn.actionDetail")}
                        </button>
                        {!isClosed && item.verificationStatus === "EFFECTIVE" && (
                          <button
                            onClick={() => onCloseCA(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 shadow-sm"
                          >
                            {t("quality.btn.close")}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
          <span>
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / {t("quality.total")} {filteredData.length}{t("quality.summary.unit")}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {t("action.previous")}
            </button>
            <span className="px-3 py-1 font-semibold">{currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              {t("action.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
