import React from "react";
import type { FinishedGoodsLot } from "@/types/production";
import { QualityStatusBadge } from "./ProductionStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 완제품 LOT 상세 모달 컴포넌트
// ============================================================

interface FinishedGoodsLotDetailModalProps {
  isOpen: boolean;
  item?: FinishedGoodsLot;
  onClose: () => void;
}

export default function FinishedGoodsLotDetailModal({
  isOpen,
  item,
  onClose,
}: FinishedGoodsLotDetailModalProps) {
  const { t, language } = useLanguage();

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{localizedName({ locale: language, ko: "완제품 LOT 상세 정보", ja: "完成品LOT詳細情報" })}</h3>
            <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{item.fgLotNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
            <div>
              <p className="text-xs font-semibold text-gray-500">{t("production.result.totalQty")}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {item.totalQuantity.toLocaleString()} <span className="text-xs font-normal text-gray-500">{localizedName({ locale: language, ko: item.unit })}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700">{t("production.result.goodQty")}</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {item.goodQuantity.toLocaleString()} <span className="text-xs font-normal text-gray-500">{localizedName({ locale: language, ko: item.unit })}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
            <div>
              <span className="text-gray-500 font-medium">{t("production.result.number")}:</span>
              <span className="ml-2 font-mono text-gray-900 font-semibold">{item.resultNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.workOrder.number")}:</span>
              <span className="ml-2 font-mono text-gray-900">{item.workOrderNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.fgLot.manufactureDate")}:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.productionDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.fgLot.expirationDate")}:</span>
              <span className="ml-2 font-mono font-bold text-amber-700">{item.expirationDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("master.field.productName")}:</span>
              <span className="ml-2 font-semibold text-gray-900">
                [{item.productCode}] {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("master.tab.lines")}:</span>
              <span className="ml-2 text-gray-900 font-medium">{localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.result.qualityStatus")}:</span>
              <span className="ml-2 inline-block">
                <QualityStatusBadge status={item.qualityStatus} />
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{t("production.fgLot.shipmentStatus")}:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {item.isReleaseAvailable ? localizedName({ locale: language, ko: "출고 가능", ja: "出荷可能" }) : localizedName({ locale: language, ko: "출고 불가 (검사 대기)", ja: "出荷不可 (検査待機)" })}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            ℹ️ {localizedName({ locale: language, ko: "품질 상태는 향후 품질관리 모듈의 검사 결과와 자동 연동되어 관리됩니다.", ja: "品質状態は品質管理モジュールの検査結果と自動連携して管理されます。" })}
          </div>

          <div className="flex justify-end pt-2">
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
