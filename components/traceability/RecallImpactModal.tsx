import React from "react";
import type { RecallImpactResult } from "@/types/traceability";

// ============================================================
// 리콜 영향 범위 분석 결과 모달 컴포넌트
// ============================================================

interface RecallImpactModalProps {
  isOpen: boolean;
  result?: RecallImpactResult;
  onClose: () => void;
}

export default function RecallImpactModal({
  isOpen,
  result,
  onClose,
}: RecallImpactModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-red-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-800 to-rose-900 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-extrabold">리콜 영향 범위 정밀 분석 보고서</h3>
              <p className="text-xs text-red-200 font-mono">Target: {result.targetLotNo} ({result.targetName})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white p-1">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* 상단 6종 리콜 영향 KPI 요약 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-[10px] font-bold text-red-700">영향 작업지시</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.affectedWorkOrders.length}건</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-[10px] font-bold text-red-700">영향 완제품 LOT</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.affectedFGLots.length}개</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-[10px] font-bold text-red-700">영향 총 생산량</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">
                {result.affectedTotalProductionQuantity.toLocaleString()}개
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <p className="text-[10px] font-bold text-green-700">출고 가능 LOT</p>
              <p className="text-lg font-extrabold text-green-800 mt-0.5">{result.passedLotCount}개</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
              <p className="text-[10px] font-bold text-amber-800">품질 보류 LOT</p>
              <p className="text-lg font-extrabold text-amber-900 mt-0.5">{result.holdLotCount}개</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg border border-red-300 text-center">
              <p className="text-[10px] font-bold text-red-800">불합격 LOT</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.failedLotCount}개</p>
            </div>
          </div>

          {/* 1. 영향 받는 완제품 LOT 상세 목록 */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <span>■ 영향 범위에 포함된 완제품 LOT 및 출고 가능 상태</span>
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 font-semibold">완제품 LOT 번호</th>
                    <th className="px-3 py-2 font-semibold">제품명</th>
                    <th className="px-3 py-2 font-semibold text-right">생산 수량</th>
                    <th className="px-3 py-2 font-semibold text-center">품질 상태</th>
                    <th className="px-3 py-2 font-semibold text-center">출고 통제 여부</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                  {result.affectedFGLots.map((fg) => (
                    <tr key={fg.fgLotNo} className="hover:bg-red-50/40">
                      <td className="px-3 py-2 font-bold text-blue-600">{fg.fgLotNo}</td>
                      <td className="px-3 py-2 font-sans font-semibold text-gray-900">{fg.productName}</td>
                      <td className="px-3 py-2 text-right font-extrabold text-gray-900">
                        {fg.quantity.toLocaleString()} {fg.unit}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fg.qualityStatus === "PASSED"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {fg.qualityStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {fg.isReleaseAvailable ? (
                          <span className="text-green-700 font-sans font-semibold">출고 승인 상태</span>
                        ) : (
                          <span className="text-red-600 font-sans font-bold bg-red-100 px-2 py-0.5 rounded">
                            출고 차단 (회수 대상)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 연관 부적합 및 시정조치 번호 */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-200">
            <div>
              <span className="font-semibold text-gray-700">연관된 부적합 번호:</span>
              <p className="font-mono text-red-600 font-bold mt-1">
                {result.relatedNonconformities.length > 0
                  ? result.relatedNonconformities.join(", ")
                  : "없음"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">연관된 시정조치(CAPA) 번호:</span>
              <p className="font-mono text-amber-700 font-bold mt-1">
                {result.relatedCorrectiveActions.length > 0
                  ? result.relatedCorrectiveActions.join(", ")
                  : "없음"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            ℹ️ 본 기능은 원재료 또는 완제품 이상 발생 시 생산/출하 영향 범위를 사전 파악하는 분석 리포트입니다.
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              확인 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
