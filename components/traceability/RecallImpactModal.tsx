import React from "react";
import type { RecallImpactResult } from "@/types/traceability";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

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
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  if (!isOpen || !result) return null;

  const displayTargetName = localizedName({ locale, ko: result.targetName, ja: result.targetNameJa });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-red-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-800 to-rose-900 text-white">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-extrabold">
                {isJa ? "リコール影響範囲精密分析レポート" : "리콜 영향 범위 정밀 분석 보고서"}
              </h3>
              <p className="text-xs text-red-200 font-mono">Target: {result.targetLotNo} ({displayTargetName})</p>
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
              <p className="text-[10px] font-bold text-red-700">{isJa ? "影響作業指示" : "영향 작업지시"}</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.affectedWorkOrders.length}{isJa ? "件" : "건"}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-[10px] font-bold text-red-700">{isJa ? "影響完成品LOT" : "영향 완제품 LOT"}</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.affectedFGLots.length}{isJa ? "件" : "개"}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              <p className="text-[10px] font-bold text-red-700">{isJa ? "影響総生産量" : "영향 총 생산량"}</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">
                {result.affectedTotalProductionQuantity.toLocaleString()}{isJa ? "個" : "개"}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
              <p className="text-[10px] font-bold text-green-700">{isJa ? "出荷可能LOT" : "출고 가능 LOT"}</p>
              <p className="text-lg font-extrabold text-green-800 mt-0.5">{result.passedLotCount}{isJa ? "件" : "개"}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
              <p className="text-[10px] font-bold text-amber-800">{isJa ? "品質保留LOT" : "품질 보류 LOT"}</p>
              <p className="text-lg font-extrabold text-amber-900 mt-0.5">{result.holdLotCount}{isJa ? "件" : "개"}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg border border-red-300 text-center">
              <p className="text-[10px] font-bold text-red-800">{isJa ? "不合格LOT" : "불합격 LOT"}</p>
              <p className="text-lg font-extrabold text-red-900 mt-0.5">{result.failedLotCount}{isJa ? "件" : "개"}</p>
            </div>
          </div>

          {/* 1. 영향 받는 완제품 LOT 상세 목록 */}
          <div>
            <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <span>{isJa ? "■ 影響範囲に含まれる完成品LOTおよび出荷可能状態" : "■ 영향 범위에 포함된 완제품 LOT 및 출고 가능 상태"}</span>
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
              <table className="w-full text-xs text-left text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 font-semibold">{isJa ? "完成品LOT番号" : "완제품 LOT 번호"}</th>
                    <th className="px-3 py-2 font-semibold">{isJa ? "製品名" : "제품명"}</th>
                    <th className="px-3 py-2 font-semibold text-right">{isJa ? "生産数量" : "생산 수량"}</th>
                    <th className="px-3 py-2 font-semibold text-center">{isJa ? "品質状態" : "품질 상태"}</th>
                    <th className="px-3 py-2 font-semibold text-center">{isJa ? "出荷統制有無" : "출고 통제 여부"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                  {result.affectedFGLots.map((fg) => {
                    const displayFgProductName = localizedName({ locale, ko: fg.productName, ja: fg.productNameJa });

                    return (
                      <tr key={fg.fgLotNo} className="hover:bg-red-50/40">
                        <td className="px-3 py-2 font-bold text-blue-600">{fg.fgLotNo}</td>
                        <td className="px-3 py-2 font-sans font-semibold text-gray-900">{displayFgProductName}</td>
                        <td className="px-3 py-2 text-right font-extrabold text-gray-900">
                          {fg.quantity.toLocaleString()} {localizedName({ locale, ko: fg.unit })}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fg.qualityStatus === "PASSED"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {fg.qualityStatus === "PASSED" ? (isJa ? "合格" : "합격 (PASSED)") :
                             fg.qualityStatus === "HOLD" ? (isJa ? "保留" : "보류 (HOLD)") :
                             fg.qualityStatus === "FAILED" ? (isJa ? "不合格" : "불합격 (FAILED)") :
                             fg.qualityStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {fg.isReleaseAvailable ? (
                            <span className="text-green-700 font-sans font-semibold">{isJa ? "出荷承認状態" : "출고 승인 상태"}</span>
                          ) : (
                            <span className="text-red-600 font-sans font-bold bg-red-100 px-2 py-0.5 rounded">
                              {isJa ? "出荷遮断 (回収対象)" : "출고 차단 (회수 대상)"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 연관 부적합 및 시정조치 번호 */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-200">
            <div>
              <span className="font-semibold text-gray-700">{isJa ? "関連不適合番号:" : "연관된 부적합 번호:"}</span>
              <p className="font-mono text-red-600 font-bold mt-1">
                {result.relatedNonconformities.length > 0
                  ? result.relatedNonconformities.join(", ")
                  : (isJa ? "なし" : "없음")}
              </p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">{isJa ? "関連是正措置(CAPA)番号:" : "연관된 시정조치(CAPA) 번호:"}</span>
              <p className="font-mono text-amber-700 font-bold mt-1">
                {result.relatedCorrectiveActions.length > 0
                  ? result.relatedCorrectiveActions.join(", ")
                  : (isJa ? "なし" : "없음")}
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            ℹ️ {isJa ? "本機能は原材料または完成品異常発生時、生産/出荷影響範囲を事前把握する分析レポートです。" : "본 기능은 원재료 또는 완제품 이상 발생 시 생산/출하 영향 범위를 사전 파악하는 분석 리포트입니다."}
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {isJa ? "閉じる" : "확인 닫기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
