import React from "react";
import type { Nonconformity } from "@/types/quality";
import { NONCONFORMITY_TYPE_LABELS } from "@/constants/quality-labels";
import {
  InspectionCategoryBadge,
  SeverityLevelBadge,
  NonconformityStatusBadge,
} from "./QualityStatusBadge";

// ============================================================
// 부적합 상세 조회 및 상태 변경 지원 모달
// ============================================================

interface NonconformityDetailModalProps {
  isOpen: boolean;
  item?: Nonconformity;
  onClose: () => void;
  onUpdateStatus: (ncId: string, status: Nonconformity["ncStatus"]) => void;
  onRequestCA: (ncNo: string, handler: string) => void;
}

export default function NonconformityDetailModal({
  isOpen,
  item,
  onClose,
  onUpdateStatus,
  onRequestCA,
}: NonconformityDetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">부적합 내역 상세 보고서</h3>
            <p className="text-xs text-red-700 font-mono font-bold mt-0.5">{item.ncNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 요약 카드 */}
          <div className="grid grid-cols-3 gap-3 bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">검사 구분</p>
              <div className="mt-1">
                <InspectionCategoryBadge category={item.category} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">심각도</p>
              <div className="mt-1">
                <SeverityLevelBadge severity={item.severity} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">처리 상태</p>
              <div className="mt-1">
                <NonconformityStatusBadge status={item.ncStatus} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-gray-100 py-3 text-xs">
            <div>
              <span className="text-gray-500 font-medium">발생일:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.occurredDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">검사 번호:</span>
              <span className="ml-2 font-mono text-gray-900">{item.inspectionNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">대상명:</span>
              <span className="ml-2 font-bold text-gray-900">{item.targetName}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">LOT 번호:</span>
              <span className="ml-2 font-mono font-bold text-purple-700">{item.lotNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">부적합 유형:</span>
              <span className="ml-2 font-semibold text-red-700">
                {NONCONFORMITY_TYPE_LABELS[item.ncType]}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">부적합 수량:</span>
              <span className="ml-2 font-bold text-red-600">
                {item.defectQuantity.toLocaleString()} {item.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">담당자:</span>
              <span className="ml-2 text-gray-900 font-semibold">{item.handler}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">시정조치 번호:</span>
              <span className="ml-2 font-mono font-bold text-amber-700">
                {item.correctiveActionNo || "미발행"}
              </span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-800 mb-1">■ 상세 현상 및 내역</h5>
            <p className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-800 leading-relaxed">
              {item.details}
            </p>
          </div>

          {item.interimAction && (
            <div>
              <h5 className="text-xs font-bold text-gray-800 mb-1">■ 현장 임시조치</h5>
              <p className="p-3 bg-blue-50/50 rounded border border-blue-100 text-xs text-blue-900 leading-relaxed">
                {item.interimAction}
              </p>
            </div>
          )}

          {/* 상태 즉시 전환 컨트롤 */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">처리 상태 변경:</span>
            <div className="flex gap-1.5">
              {(["OPEN", "INVESTIGATING", "ACTION_REQUIRED", "ACTION_IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(item.id, st)}
                    className={`px-2 py-1 text-[11px] rounded font-semibold transition-all ${
                      item.ncStatus === st
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div>
              {!item.correctiveActionNo && (item.severity === "CRITICAL" || item.severity === "MAJOR") && (
                <button
                  onClick={() => {
                    onRequestCA(item.ncNo, item.handler);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm"
                >
                  시정조치(CAPA) 발행하기
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
