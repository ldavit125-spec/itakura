import React, { useState, useMemo } from "react";
import type { MaterialInbound, InspectionStatus } from "@/types/materials";
import { INSPECTION_STATUS_OPTIONS } from "@/constants/material-labels";
import { InspectionStatusBadge, InboundStatusBadge } from "./MaterialStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// ============================================================
// 자재 입고 목록 테이블 컴포넌트
// ============================================================

interface MaterialInboundTableProps {
  inbounds: MaterialInbound[];
  onOpenCreate: () => void;
  onOpenEdit: (item: MaterialInbound) => void;
  onOpenDetail: (item: MaterialInbound) => void;
  onCancelInbound: (item: MaterialInbound) => void;
}

export default function MaterialInboundTable({
  inbounds,
  onOpenCreate,
  onOpenEdit,
  onOpenDetail,
  onCancelInbound,
}: MaterialInboundTableProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "ALL">("ALL");

  const filteredData = useMemo(() => {
    return inbounds.filter((item) => {
      // 자재코드 또는 자재명 검색
      const matchesSearch =
        !searchTerm ||
        item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inboundNo.toLowerCase().includes(searchTerm.toLowerCase());

      // 입고일 검색
      const matchesDate = !dateSearch || item.inboundDate.includes(dateSearch);

      // 검사 상태 필터
      const matchesStatus = statusFilter === "ALL" || item.inspectionStatus === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [inbounds, searchTerm, dateSearch, statusFilter]);

  return (
    <div className="p-4 sm:p-6">
      {/* 상단 컨트롤 영역 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* 입고일 검색 */}
          <div className="relative">
            <DateInput
              value={dateSearch}
              onChange={(e) => setDateSearch(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              title={t("materials.inbound.dateSearch")}
            />
            {dateSearch && (
              <button
                onClick={() => setDateSearch("")}
                className="ml-1 text-xs text-gray-400 hover:text-gray-600"
                title={t("materials.inbound.dateClear")}
              >
                ✕
              </button>
            )}
          </div>

          {/* 자재/LOT/입고번호 검색 */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder={t("materials.inbound.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
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

          {/* 검사 상태 필터 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InspectionStatus | "ALL")}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {INSPECTION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        {/* 입고 등록 버튼 */}
        <button
          onClick={onOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{t("materials.inbound.new")}</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1000px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              {["materials.inbound.number","materials.inbound.date","master.field.materialCode","master.field.materialName","materials.inbound.lot","master.field.supplierName","materials.inbound.quantity","common.unit","materials.expirationDate","materials.inbound.inspectionStatus","materials.inbound.status","common.work"].map((key) => <th key={key} className="px-4 py-3 font-semibold">{t(key)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("materials.inbound.empty")}
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isCancelled = item.inboundStatus === "CANCELLED";
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCancelled ? "bg-gray-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-gray-900">
                      {item.inboundNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.inboundDate}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{localizedName({ locale: language, ko: item.materialName, ja: item.materialNameJa })}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">
                      {item.lotNo}
                    </td>
                    <td className="px-4 py-3">{localizedName({ locale: language, ko: item.supplierName, ja: item.supplierNameJa })}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{localizedName({ locale: language, ko: item.unit })}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.expirationDate}</td>
                    <td className="px-4 py-3 text-center">
                      <InspectionStatusBadge status={item.inspectionStatus} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <InboundStatusBadge status={item.inboundStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          {t("action.detail")}
                        </button>
                        {!isCancelled && (
                          <>
                            <button
                              onClick={() => onOpenEdit(item)}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                              {t("action.edit")}
                            </button>
                            <button
                              onClick={() => onCancelInbound(item)}
                              className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                            >
                              {t("action.cancel")}
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
    </div>
  );
}
