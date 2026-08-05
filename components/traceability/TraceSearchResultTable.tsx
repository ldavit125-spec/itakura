import React from "react";
import { useRouter } from "next/navigation";
import type { TraceSearchResult } from "@/types/traceability";
import { TRACE_TARGET_TYPE_LABELS } from "@/constants/traceability-labels";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 통합 LOT 검색 결과 테이블 컴포넌트
// ============================================================

interface TraceSearchResultTableProps {
  results: TraceSearchResult[];
  onTriggerForward: (lotNo: string) => void;
  onTriggerBackward: (lotNo: string) => void;
  onOpenRecall: (lotNo: string, type: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT") => void;
}

export default function TraceSearchResultTable({
  results,
  onTriggerForward,
  onTriggerBackward,
  onOpenRecall,
}: TraceSearchResultTableProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const handleNavigateToModule = (item: TraceSearchResult) => {
    if (item.targetType === "RAW_MATERIAL_LOT") {
      router.push(`/materials?tab=inventory&lot=${encodeURIComponent(item.targetNo)}`);
    } else if (item.targetType === "FINISHED_GOODS_LOT") {
      router.push(`/quality?tab=finished&lot=${encodeURIComponent(item.targetNo)}`);
    } else if (item.targetType === "WORK_ORDER") {
      router.push(`/production?tab=work-order&workOrder=${encodeURIComponent(item.targetNo)}`);
    } else if (item.targetType === "PRODUCTION_RESULT") {
      router.push(`/production?tab=result`);
    } else if (item.targetType === "NONCONFORMITY") {
      router.push(`/quality?tab=nonconformity`);
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 my-4 shadow-sm">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-base font-bold text-gray-700">{isJa ? "検索結果がありません。" : "검색 결과가 없습니다."}</p>
        <p className="text-xs text-gray-500 mt-1">{isJa ? "LOT番号または作業指示番号をご確認ください。" : "LOT 번호 또는 작업지시 번호를 다시 확인해 주세요."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm my-4">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">{isJa ? `検索結果 (${results.length}件)` : `검색 결과 (${results.length}건)`}</span>
        <span className="text-gray-500">{isJa ? "目的の項目の追跡ボタンをクリックしてください。" : "원하는 항목의 추적 버튼을 클릭하세요."}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">{isJa ? "対象区分" : "대상 구분"}</th>
              <th className="px-4 py-3 font-semibold">{isJa ? "対象番号" : "대상 번호"}</th>
              <th className="px-4 py-3 font-semibold">{isJa ? "対象名" : "대상명"}</th>
              <th className="px-4 py-3 font-semibold">{isJa ? "LOT番号" : "LOT 번호"}</th>
              <th className="px-4 py-3 font-semibold text-center">{isJa ? "品質状態" : "품질 상태"}</th>
              <th className="px-4 py-3 font-semibold text-center">{isJa ? "追跡可能有無" : "추적 가능 여부"}</th>
              <th className="px-4 py-3 font-semibold text-center">{isJa ? "追跡 / リコール / 移動" : "추적 / 리콜 / 이동 작업"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((item) => {
              const isRaw = item.targetType === "RAW_MATERIAL_LOT";
              const isFG = item.targetType === "FINISHED_GOODS_LOT";
              const targetTypeObj = TRACE_TARGET_TYPE_LABELS[item.targetType];
              const targetTypeText = typeof targetTypeObj === "string" ? targetTypeObj : (isJa ? targetTypeObj.ja : targetTypeObj.ko);
              const displayName = localizedName({ locale, ko: item.targetName, ja: item.targetNameJa });

              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isRaw
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : isFG
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {targetTypeText}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.targetNo}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{displayName}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{item.lotNo}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        item.qualityStatus === "PASSED" || item.qualityStatus === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : item.qualityStatus === "HOLD"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : item.qualityStatus === "FAILED"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.qualityStatus === "PASSED" ? (isJa ? "合格" : "합격 (PASSED)") :
                       item.qualityStatus === "HOLD" ? (isJa ? "保留" : "보류 (HOLD)") :
                       item.qualityStatus === "FAILED" ? (isJa ? "不合格" : "불합격 (FAILED)") :
                       item.qualityStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {item.isTraceable ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        {isJa ? "追跡可能" : "추적 가능"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                        {isJa ? "追跡不可" : "추적 불가"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {isRaw && (
                        <button
                          onClick={() => onTriggerForward(item.lotNo)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 rounded hover:bg-purple-700 shadow-sm"
                        >
                          {isJa ? "順方向追跡 →" : "정방향 추적 →"}
                        </button>
                      )}
                      {isFG && (
                        <button
                          onClick={() => onTriggerBackward(item.lotNo)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-sm"
                        >
                          {isJa ? "← 逆方向追跡" : "← 역방향 추적"}
                        </button>
                      )}
                      {(isRaw || isFG) && (
                        <button
                          onClick={() => onOpenRecall(item.lotNo, item.targetType as "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT")}
                          className="px-2 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200"
                        >
                          {isJa ? "リコール分析" : "리콜 분석"}
                        </button>
                      )}
                      <button
                        onClick={() => handleNavigateToModule(item)}
                        className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {isJa ? "移動 ↗" : "이동 ↗"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
