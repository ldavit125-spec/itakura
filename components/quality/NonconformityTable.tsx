import React, { useState, useMemo } from "react";
import type { Nonconformity, NonconformityType, SeverityLevel, NonconformityStatus } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import {
  InspectionCategoryBadge,
  SeverityLevelBadge,
  NonconformityStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 부적합 관리 목록 테이블 컴포넌트 (다국어 지원)
// ============================================================

interface NonconformityTableProps {
  nonconformities: Nonconformity[];
  onOpenCreate: () => void;
  onOpenDetail: (item: Nonconformity) => void;
  onUpdateStatus: (ncId: string, status: NonconformityStatus) => void;
  onRequestCA: (ncNo: string, handler: string) => void;
}

const NC_TYPE_OPTIONS: { value: NonconformityType | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "quality.ncType.all" },
  { value: "MATERIAL_DEFECT", labelKey: "quality.ncType.materialDefect" },
  { value: "PACKAGING_DAMAGE", labelKey: "quality.ncType.packagingDamage" },
  { value: "FOREIGN_MATERIAL", labelKey: "quality.ncType.foreignMaterial" },
  { value: "TEMPERATURE_DEVIATION", labelKey: "quality.ncType.temperatureDeviation" },
  { value: "WEIGHT_DEVIATION", labelKey: "quality.ncType.weightDeviation" },
  { value: "APPEARANCE_DEFECT", labelKey: "quality.ncType.appearanceDefect" },
  { value: "SHAPE_DEFECT", labelKey: "quality.ncType.shapeDefect" },
  { value: "BAKING_DEFECT", labelKey: "quality.ncType.bakingDefect" },
  { value: "LABELING_ERROR", labelKey: "quality.ncType.labelingError" },
  { value: "HYGIENE_ISSUE", labelKey: "quality.ncType.hygieneIssue" },
  { value: "PROCESS_DEVIATION", labelKey: "quality.ncType.processDeviation" },
  { value: "OTHER", labelKey: "quality.ncType.other" },
];

const NC_TYPE_LABEL_KEYS: Record<NonconformityType, string> = {
  MATERIAL_DEFECT: "quality.ncType.materialDefect",
  PACKAGING_DAMAGE: "quality.ncType.packagingDamage",
  FOREIGN_MATERIAL: "quality.ncType.foreignMaterial",
  TEMPERATURE_DEVIATION: "quality.ncType.temperatureDeviation",
  WEIGHT_DEVIATION: "quality.ncType.weightDeviation",
  APPEARANCE_DEFECT: "quality.ncType.appearanceDefect",
  SHAPE_DEFECT: "quality.ncType.shapeDefect",
  BAKING_DEFECT: "quality.ncType.bakingDefect",
  LABELING_ERROR: "quality.ncType.labelingError",
  HYGIENE_ISSUE: "quality.ncType.hygieneIssue",
  PROCESS_DEVIATION: "quality.ncType.processDeviation",
  OTHER: "quality.ncType.other",
};

const SEVERITY_OPTIONS: { value: SeverityLevel | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "quality.severity.all" },
  { value: "CRITICAL", labelKey: "quality.severity.critical" },
  { value: "MAJOR", labelKey: "quality.severity.major" },
  { value: "MINOR", labelKey: "quality.severity.minor" },
];

const NC_STATUS_OPTIONS: { value: NonconformityStatus | "ALL"; labelKey: string }[] = [
  { value: "ALL", labelKey: "quality.ncStatus.all" },
  { value: "OPEN", labelKey: "quality.ncStatus.open" },
  { value: "INVESTIGATING", labelKey: "quality.ncStatus.investigating" },
  { value: "ACTION_REQUIRED", labelKey: "quality.ncStatus.actionRequired" },
  { value: "ACTION_IN_PROGRESS", labelKey: "quality.ncStatus.actionInProgress" },
  { value: "RESOLVED", labelKey: "quality.ncStatus.resolved" },
  { value: "CLOSED", labelKey: "quality.ncStatus.closed" },
];

export default function NonconformityTable({
  nonconformities,
  onOpenCreate,
  onOpenDetail,
  onUpdateStatus,
  onRequestCA,
}: NonconformityTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<NonconformityType | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<NonconformityStatus | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    return nonconformities.filter((item) => {
      if (
        searchTerm &&
        !item.ncNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.targetName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.targetNo.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (typeFilter !== "ALL" && item.ncType !== typeFilter) return false;
      if (severityFilter !== "ALL" && item.severity !== severityFilter) return false;
      if (statusFilter !== "ALL" && item.ncStatus !== statusFilter) return false;
      return true;
    });
  }, [nonconformities, searchTerm, typeFilter, severityFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
        <div className="relative col-span-1 sm:col-span-2">
          <input
            type="text"
            placeholder={t("quality.search.nc")}
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

        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as NonconformityType | "ALL"); setCurrentPage(1); }} className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {NC_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
        </select>

        <select value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value as SeverityLevel | "ALL"); setCurrentPage(1); }} className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {SEVERITY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
        </select>

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as NonconformityStatus | "ALL"); setCurrentPage(1); }} className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {NC_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t("quality.btn.registerNc")}</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("quality.col.ncNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.occurredDate")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.category")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.inspectionNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.targetName")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.lotNo")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.ncType")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("quality.col.ncQty")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.severity")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.ncStatus")}</th>
              <th className="px-4 py-3 font-semibold">{t("quality.col.handler")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("quality.col.action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("quality.empty.nc")}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-red-700 bg-red-50/50 my-1 inline-block rounded">{item.ncNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.occurredDate}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <InspectionCategoryBadge category={item.category} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.inspectionNo}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.targetName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-purple-700">{item.lotNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {t(NC_TYPE_LABEL_KEYS[item.ncType])}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    {item.defectQuantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SeverityLevelBadge severity={item.severity} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <NonconformityStatusBadge status={item.ncStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.handler}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenDetail(item)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        {t("action.detail")}
                      </button>
                      {!item.correctiveActionNo && (item.severity === "CRITICAL" || item.severity === "MAJOR") && (
                        <button
                          onClick={() => onRequestCA(item.ncNo, item.handler)}
                          className="px-2 py-1 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700 shadow-sm"
                          title={t("quality.btn.requestCA")}
                        >
                          {t("quality.btn.requestCA")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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
