import React, { useState } from "react";
import { getBackwardTraceByFinishedGoodsLot } from "@/lib/traceability-selectors";
import BackwardTraceResult from "./BackwardTraceResult";

// ============================================================
// 완제품 역방향 추적 패널 (검색 및 결과 연결)
// ============================================================

interface BackwardTracePanelProps {
  targetLotNo: string;
  onSearch: (lotNo: string) => void;
  onTriggerForward: (lotNo: string) => void;
  onOpenRecall: (lotNo: string, type: "FINISHED_GOODS_LOT") => void;
  onTriggerDiagram: (targetNo: string) => void;
}

export default function BackwardTracePanel({
  targetLotNo,
  onSearch,
  onTriggerForward,
  onOpenRecall,
  onTriggerDiagram,
}: BackwardTracePanelProps) {
  const [inputLot, setInputLot] = useState(targetLotNo);

  const traceData = getBackwardTraceByFinishedGoodsLot(targetLotNo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLot.trim()) {
      onSearch(inputLot.trim());
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 역방향 추적 전용 상단 검색 바 */}
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>완제품 LOT 역방향 추적: 완제품 ➔ 완제품검사 ➔ 생산 ➔ 원재료 LOT ➔ 공급업체</span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={inputLot}
            onChange={(e) => setInputLot(e.target.value)}
            placeholder="완제품 LOT 번호 입력..."
            className="px-3 py-2 text-xs border border-indigo-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm whitespace-nowrap"
          >
            역방향 추적 실행
          </button>
        </form>
      </div>

      {/* 추적 결과 패널 */}
      {traceData ? (
        <BackwardTraceResult
          data={traceData}
          onTriggerForward={onTriggerForward}
          onOpenRecall={onOpenRecall}
          onTriggerDiagram={onTriggerDiagram}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          입력하신 완제품 LOT [{targetLotNo}] 에 해당하는 역방향 추적 기록이 없습니다.
        </div>
      )}
    </div>
  );
}
