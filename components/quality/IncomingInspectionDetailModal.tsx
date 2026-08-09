import React from "react";
import type { IncomingInspection } from "@/types/quality";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";
import InspectionItemForm from "./InspectionItemForm";
import InspectionStatusHistory from "./InspectionStatusHistory";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 원재료 입고검사 상세 정보 조회 모달 (이력 포함)
// ============================================================

interface IncomingInspectionDetailModalProps {
  isOpen: boolean;
  item?: IncomingInspection;
  onClose: () => void;
}

export default function IncomingInspectionDetailModal({
  isOpen,
  item,
  onClose,
}: IncomingInspectionDetailModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("원재료 입고검사 성적서 상세", "原材料受入検査成績書詳細")}</h3>
            <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{item.iqcNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 주요 헤더 정보 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("검사 상태", "検査状態")}</p>
              <div className="mt-1">
                <InspectionStatusBadge status={item.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("최종 판정", "最終判定")}</p>
              <div className="mt-1">
                <InspectionJudgmentBadge judgment={item.judgment} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("담당 검사원", "担当検査員")}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{item.inspector}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("검사일시", "検査日時")}</p>
              <p className="text-xs font-mono font-semibold text-gray-800 mt-1">{item.inspectionDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-gray-100 py-3 text-xs">
            <div>
              <span className="text-gray-500 font-medium">{tr("입고 번호:", "入庫番号:")}</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">{item.inboundNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("입고일:", "入庫日:")}</span>
              <span className="ml-2 font-semibold text-gray-900">{item.inboundDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("자재:", "原材料:")}</span>
              <span className="ml-2 font-bold text-gray-900">
                [{item.materialCode}] {item.materialName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("자재 LOT:", "原材料LOT:")}</span>
              <span className="ml-2 font-mono font-bold text-purple-700">{item.lotNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("거래처:", "取引先:")}</span>
              <span className="ml-2 text-gray-900">{item.supplierName}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("입고 수량:", "入庫数量:")}</span>
              <span className="ml-2 font-bold text-gray-900">
                {item.quantity.toLocaleString()} {item.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("제조일:", "製造日:")}</span>
              <span className="ml-2 font-mono text-gray-800">{item.manufactureDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">{tr("유통기한:", "賞味期限:")}</span>
              <span className="ml-2 font-mono font-bold text-amber-700">{item.expirationDate}</span>
            </div>
          </div>

          {/* 항목별 검사 결과 */}
          <InspectionItemForm items={item.items} onChange={() => {}} readOnly={true} />

          {/* 종합의견 / 판정사유 */}
          {item.judgmentReason && (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs">
              <span className="font-bold text-blue-900">{tr("■ 판정 사유 및 의견: ", "■ 判定理由および意見: ")}</span>
              <span className="text-gray-800">{item.judgmentReason}</span>
            </div>
          )}

          {/* 첨부파일 UI */}
          {item.attachmentFileName && (
            <div className="flex items-center gap-2 text-xs bg-gray-50 p-2.5 rounded border border-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="font-semibold text-gray-700">{tr("첨부 파일:", "添付ファイル:")}</span>
              <span className="text-blue-600 font-mono underline">{item.attachmentFileName}</span>
            </div>
          )}

          {/* 이력 테이블 */}
          <InspectionStatusHistory history={item.statusHistory} />

          <div className="flex justify-end pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {tr("닫기", "閉じる")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
