"use client";

import { useState, useMemo } from "react";
import type { ProductionLine, StatusFilter } from "@/types/master-data";
import { LINE_PROCESS_LABELS } from "@/types/master-data";
import StatusBadge from "@/components/master-data/StatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 생산라인 관리 테이블
// ============================================================

const PAGE_SIZE = 10;

interface ProductionLineTableProps {
  items: ProductionLine[];
  onAdd: () => void;
  onEdit: (item: ProductionLine) => void;
  onToggleStatus: (id: string) => void;
}

export default function ProductionLineTable({
  items,
  onAdd,
  onEdit,
  onToggleStatus,
}: ProductionLineTableProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div>
      {/* 툴바 */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="line-search"
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t("master.search.line")}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            id="line-status-filter"
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value as StatusFilter)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{t("common.all")}</option><option value="ACTIVE">{t("status.active")}</option><option value="INACTIVE">{t("status.inactive")}</option>
          </select>
        </div>
        <button
          id="line-add-btn"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t("action.newRegister")}
        </button>
      </div>

      {/* 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {[["master.field.lineCode","text-left w-28"],["master.field.lineName","text-left"],["master.field.process","text-left"],["master.field.maxCapacity","text-right w-28"],["common.unit","text-left w-16"],["master.field.useStatus","text-center w-28 whitespace-nowrap"],["common.work","text-center w-44 whitespace-nowrap"]].map(([key, align]) => <th key={key} className={`${align} px-4 py-3 font-medium text-gray-600`}>{t(key)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  {t("empty.search")}
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{localizedName({ locale: language, ko: item.name, ja: item.nameJa })}</td>
                  <td className="px-4 py-3 text-gray-600">{LINE_PROCESS_LABELS[item.process] ? t(LINE_PROCESS_LABELS[item.process]) : localizedName({ locale: language, ko: item.process })}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {item.maxCapacity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{localizedName({ locale: language, ko: item.unit })}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        {t("action.edit")}
                      </button>
                      <button
                        onClick={() => onToggleStatus(item.id)}
                        className={`text-xs px-3 py-1.5 border rounded-md transition-colors whitespace-nowrap ${
                          item.status === "ACTIVE"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {t(item.status === "ACTIVE" ? "action.stopUsing" : "status.active")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">
          {t("common.total")} {filtered.length}{t("unit.item")}{filtered.length !== items.length && ` (${t("common.all")} ${items.length}${t("unit.item")})`}
        </p>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("action.previous")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-2.5 py-1 text-xs border rounded ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("action.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
