import React from "react";
import { useRouter } from "next/navigation";
import type { TraceSearchResult } from "@/types/traceability";
import { TRACE_TARGET_TYPE_LABELS } from "@/constants/traceability-labels";

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
        <p className="text-base font-bold text-gray-700">검색 결과가 없습니다.</p>
        <p className="text-xs text-gray-500 mt-1">LOT 번호 또는 작업지시 번호를 다시 확인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm my-4">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
        <span className="font-bold text-gray-700">검색 결과 ({results.length}건)</span>
        <span className="text-gray-500">원하는 항목의 추적 버튼을 클릭하세요.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">대상 구분</th>
              <th className="px-4 py-3 font-semibold">대상 번호</th>
              <th className="px-4 py-3 font-semibold">대상명</th>
              <th className="px-4 py-3 font-semibold">LOT 번호</th>
              <th className="px-4 py-3 font-semibold text-center">품질 상태</th>
              <th className="px-4 py-3 font-semibold text-center">추적 가능 여부</th>
              <th className="px-4 py-3 font-semibold text-center">추적 / 리콜 / 이동 작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((item) => {
              const isRaw = item.targetType === "RAW_MATERIAL_LOT";
              const isFG = item.targetType === "FINISHED_GOODS_LOT";

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
                      {TRACE_TARGET_TYPE_LABELS[item.targetType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{item.targetNo}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.targetName}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{item.lotNo}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        item.qualityStatus === "PASSED" || item.qualityStatus === "COMPLETED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : item.qualityStatus === "HOLD"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }`}
                    >
                      {item.qualityStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-bold text-teal-700 bg-teal-50 rounded border border-teal-200">
                      ✓ 추적 가능
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {isRaw && (
                        <button
                          onClick={() => onTriggerForward(item.lotNo)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 shadow-sm"
                        >
                          정방향 추적 →
                        </button>
                      )}
                      {isFG && (
                        <button
                          onClick={() => onTriggerBackward(item.lotNo)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700 shadow-sm"
                        >
                          ← 역방향 추적
                        </button>
                      )}
                      {(isRaw || isFG) && (
                        <button
                          onClick={() => onOpenRecall(item.lotNo, isRaw ? "RAW_MATERIAL_LOT" : "FINISHED_GOODS_LOT")}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 shadow-sm"
                        >
                          리콜 영향 분석
                        </button>
                      )}
                      <button
                        onClick={() => handleNavigateToModule(item)}
                        className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        title="해당 업무 모듈 화면으로 이동"
                      >
                        화면 이동 ↗
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
