import React, { useState, useMemo } from "react";
import type { WorkOrder } from "@/types/production";
import { WorkStatusBadge, MaterialIssueStatusBadge } from "./ProductionStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 생산 진행 현황 목록 테이블 컴포넌트
// ============================================================

interface ProductionProgressTableProps {
  workOrders: WorkOrder[];
  onStartWork: (id: string) => void;
  onPauseWork: (item: WorkOrder) => void;
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
  const { t, language } = useLanguage();

  const activeProgressOrders = useMemo(() => {
    return workOrders.filter((w) =>
      ["WAITING", "READY", "IN_PROGRESS", "PAUSED"].includes(w.workStatus)
    );
  }, [workOrders]);

  const filteredData = useMemo(() => {
    return activeProgressOrders.filter((w) => {
      const localizedProd = localizedName({ locale: language, ko: w.productName, ja: w.productNameJa });
      const localizedLine = localizedName({ locale: language, ko: w.productionLine, ja: w.lineNameJa });
      if (
        searchTerm &&
        !w.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !localizedProd.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !localizedLine.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [activeProgressOrders, searchTerm, language]);

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t("production.workOrder.searchPlaceholder")}
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
          {t("production.progress.activeCount")}{" "}
          <strong className="text-blue-600">
            {filteredData.length}{t("unit.case")}
          </strong>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("production.workOrder.number")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.productName")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.tab.lines")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.workOrder.instructedQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.progress.plannedStart")}</th>
              <th className="px-4 py-3 font-semibold">{t("production.progress.actualStart")}</th>
              <th className="px-4 py-3 font-semibold text-right">{t("production.progress.currentQty")}</th>
              <th className="px-4 py-3 font-semibold w-40">{t("production.plan.achievementRate")} (%)</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.workOrder.issueStatus")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.workOrder.status")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.manager")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("production.plan.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  {t("production.progress.empty")}
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
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {item.orderedQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.startTime}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">
                      {item.actualStartTime || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-700">
                      {item.currentQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
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
                      {localizedName({ locale: language, ko: item.handler }) || "미배정"}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenDetail(item)}
                          className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {t("action.detail")}
                        </button>
                        {(isWaiting || isReady) && (
                          <button
                            onClick={() => onStartWork(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                          >
                            {t("production.workOrder.start")}
                          </button>
                        )}
                        {isInProgress && (
                          <>
                            <button
                              onClick={() => onOpenQuantityModal(item)}
                              className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              {t("production.progress.reportResult")}
                            </button>
                            <button
                              onClick={() => onPauseWork(item)}
                              className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                            >
                              {t("production.progress.pause")}
                            </button>
                            <button
                              onClick={() => onCompleteRequest(item.id)}
                              className="px-2 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              {t("production.workOrder.complete")}
                            </button>
                          </>
                        )}
                        {isPaused && (
                          <button
                            onClick={() => onResumeWork(item.id)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 rounded hover:bg-amber-700"
                          >
                            {t("production.progress.resume")}
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
