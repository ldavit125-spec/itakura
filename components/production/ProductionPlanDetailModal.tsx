import React from "react";
import type { ProductionPlan } from "@/types/production";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import {
  PlanStatusBadge,
  PlanPriorityBadge,
  MaterialReadinessBadge,
} from "./ProductionStatusBadge";

// ============================================================
// 생산계획 상세 조회 모달 컴포넌트
// ============================================================

interface ProductionPlanDetailModalProps {
  isOpen: boolean;
  item?: ProductionPlan;
  onClose: () => void;
  onConfirmPlan?: (id: string) => void;
  onCreateWorkOrder?: (plan: ProductionPlan) => void;
}

export default function ProductionPlanDetailModal({
  isOpen,
  item,
  onClose,
  onConfirmPlan,
  onCreateWorkOrder,
}: ProductionPlanDetailModalProps) {
  const { t, language } = useLanguage();

  if (!isOpen || !item) return null;

  const isDraft = item.planStatus === "DRAFT";
  const isConfirmed = item.planStatus === "CONFIRMED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("production.plan.detailModalTitle")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.planNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 상태 배지 영역 */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <div>
              <p className="text-xs text-gray-500">{t("production.plan.priority")}</p>
              <div className="mt-1">
                <PlanPriorityBadge priority={item.priority} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("production.plan.status")}</p>
              <div className="mt-1">
                <PlanStatusBadge status={item.planStatus} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("production.plan.materialReadiness")}</p>
              <div className="mt-1">
                <MaterialReadinessBadge readiness={item.materialReadiness} />
              </div>
            </div>
          </div>

          {/* 항목별 텍스트 그리드 */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
            <div>
              <span className="text-gray-500 font-medium">{t("production.plan.date")}:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.plannedDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("master.tab.lines")}:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("master.field.productName")}:</span>
              <span className="ml-2 font-semibold text-gray-900">
                [{item.productCode}] {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.plan.quantity")}:</span>
              <span className="ml-2 font-bold text-blue-600">
                {item.plannedQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.plan.date")}:</span>
              <span className="ml-2 font-mono text-gray-900">
                {item.startTime} ~ {item.endTime}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("master.field.manager")}:</span>
              <span className="ml-2 text-gray-900">{localizedName({ locale: language, ko: item.manager })}</span>
            </div>
          </div>

          {item.remarks && (
            <div className="pt-1">
              <p className="font-medium text-gray-500">{t("common.remarks")}:</p>
              <p className="mt-1 text-gray-700 bg-gray-50 p-2.5 rounded-md text-xs">
                {localizedName({ locale: language, ko: item.remarks })}
              </p>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              {isDraft && onConfirmPlan && (
                <button
                  onClick={() => {
                    onConfirmPlan(item.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {t("action.confirm")}
                </button>
              )}
              {isConfirmed && onCreateWorkOrder && (
                <button
                  onClick={() => {
                    onCreateWorkOrder(item);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  {t("action.issueOrder")}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t("action.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
