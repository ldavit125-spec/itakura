import React from "react";
import type { ProcessInspection } from "@/types/quality";
import { PROCESS_CODE_LABELS } from "@/constants/quality-labels";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";
import InspectionItemForm from "./InspectionItemForm";
import InspectionStatusHistory from "./InspectionStatusHistory";

// ============================================================
// 공정검사 상세 정보 조회 모달
// ============================================================

interface ProcessInspectionDetailModalProps {
  isOpen: boolean;
  item?: ProcessInspection;
  onClose: () => void;
}

export default function ProcessInspectionDetailModal({
  isOpen,
  item,
  onClose,
}: ProcessInspectionDetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">공정검사 성적서 상세</h3>
            <p className="text-xs text-purple-700 font-mono font-bold mt-0.5">{item.pqcNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 요약 헤더 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">검사 공정</p>
              <p className="text-sm font-bold text-purple-700 mt-1">{PROCESS_CODE_LABELS[item.process]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">최종 판정</p>
              <div className="mt-1">
                <InspectionJudgmentBadge judgment={item.judgment} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">담당 검사원</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{item.inspector}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">검사일시</p>
              <p className="text-xs font-mono font-semibold text-gray-800 mt-1">{item.inspectionDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-gray-100 py-3 text-xs">
            <div>
              <span className="text-gray-500 font-medium">작업지시 번호:</span>
              <span className="ml-2 font-mono font-bold text-gray-900">{item.workOrderNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">생산일:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.productionDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">제품:</span>
              <span className="ml-2 font-bold text-gray-900">
                [{item.productCode}] {item.productName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">생산라인:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.productionLine}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">검사 시점:</span>
              <span className="ml-2 text-gray-900">{item.inspectionTiming}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">담당 작업자:</span>
              <span className="ml-2 text-gray-900">{item.worker}</span>
            </div>
          </div>

          {/* 항목별 검사 결과 */}
          <InspectionItemForm items={item.items} onChange={() => {}} readOnly={true} />

          {/* 소견 및 판정 사유 */}
          {item.judgmentReason && (
            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 text-xs">
              <span className="font-bold text-purple-900">■ 판정 소견 및 의견: </span>
              <span className="text-gray-800">{item.judgmentReason}</span>
            </div>
          )}

          {/* 이력 테이블 */}
          <InspectionStatusHistory history={item.statusHistory} />

          <div className="flex justify-end pt-2 border-t border-gray-200">
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
