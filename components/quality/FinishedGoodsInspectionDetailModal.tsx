import React from "react";
import type { FinishedGoodsInspection } from "@/types/quality";
import { InspectionStatusBadge, InspectionJudgmentBadge } from "./QualityStatusBadge";
import InspectionItemForm from "./InspectionItemForm";
import InspectionStatusHistory from "./InspectionStatusHistory";

// ============================================================
// 완제품 품질검사 상세 성적서 조회 모달
// ============================================================

interface FinishedGoodsInspectionDetailModalProps {
  isOpen: boolean;
  item?: FinishedGoodsInspection;
  onClose: () => void;
}

export default function FinishedGoodsInspectionDetailModal({
  isOpen,
  item,
  onClose,
}: FinishedGoodsInspectionDetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">완제품 품질검사 성적서 상세</h3>
            <p className="text-xs text-indigo-700 font-mono font-bold mt-0.5">{item.fqcNo}</p>
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
              <p className="text-xs text-gray-500 font-medium">최종 판정</p>
              <div className="mt-1">
                <InspectionJudgmentBadge judgment={item.judgment} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">출고 가능 여부</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {item.isReleaseAvailable ? "출고 가능 (승인)" : "출고 불가 (보류/미달)"}
              </p>
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
              <span className="text-gray-500 font-medium">완제품 LOT:</span>
              <span className="ml-2 font-mono font-bold text-blue-600">{item.fgLotNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">작업지시 번호:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">{item.workOrderNo}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">제품:</span>
              <span className="ml-2 font-bold text-gray-900">
                [{item.productCode}] {item.productName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">생산 수량:</span>
              <span className="ml-2 font-bold text-gray-900">
                {item.totalQuantity.toLocaleString()} {item.unit}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">샘플 검사 수량:</span>
              <span className="ml-2 font-bold text-indigo-700">{item.sampleQuantity}개</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">부적합 샘플 수량:</span>
              <span className="ml-2 font-bold text-red-600">{item.defectiveSampleQuantity}개</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">평균 중량:</span>
              <span className="ml-2 font-mono font-bold text-indigo-700">{item.avgWeight}g</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">중량 범위 (최소~최대):</span>
              <span className="ml-2 font-mono text-gray-800">{item.minWeight}g ~ {item.maxWeight}g</span>
            </div>
          </div>

          {/* 개별 검사 항목 결과 */}
          <InspectionItemForm items={item.items} onChange={() => {}} readOnly={true} />

          {/* 소견 및 판정 사유 */}
          {item.judgmentReason && (
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-xs">
              <span className="font-bold text-indigo-900">■ 판정 소견 및 출하 승인 의견: </span>
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
