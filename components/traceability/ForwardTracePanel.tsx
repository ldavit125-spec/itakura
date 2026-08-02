import React, { useState } from "react";
import { getForwardTraceByRawMaterialLot } from "@/lib/traceability-selectors";
import ForwardTraceResult from "./ForwardTraceResult";
import { useMaterials } from "@/context/MaterialsContext";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";

// ============================================================
// 원재료 정방향 추적 패널 (검색 및 결과 연결)
// ============================================================

interface ForwardTracePanelProps {
  targetLotNo: string;
  onSearch: (lotNo: string) => void;
  onOpenRecall: (lotNo: string, type: "RAW_MATERIAL_LOT") => void;
}

export default function ForwardTracePanel({
  targetLotNo,
  onSearch,
  onOpenRecall,
}: ForwardTracePanelProps) {
  const [inputLot, setInputLot] = useState(targetLotNo);
  const {inventories,inbounds,outbounds}=useMaterials(); const {workOrders,results,fgLots}=useProduction(); const {incoming,processList,finished,nonconformities,correctiveActions}=useQuality();
  const traceData = getForwardTraceByRawMaterialLot(targetLotNo,{inventories,inbounds,outbounds,workOrders,results,fgLots,incoming,processList,finished,nonconformities,correctiveActions});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLot.trim()) {
      onSearch(inputLot.trim());
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* 정방향 추적 전용 상단 검색 바 */}
      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>원재료 LOT 정방향 추적: 원재료 입고 ➔ 생산 ➔ 완제품 ➔ 품질 검증</span>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={inputLot}
            onChange={(e) => setInputLot(e.target.value)}
            placeholder="원재료 LOT 번호 입력..."
            className="px-3 py-2 text-xs border border-purple-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm whitespace-nowrap"
          >
            정방향 추적 실행
          </button>
        </form>
      </div>

      {/* 추적 결과 패널 */}
      {traceData ? (
        <ForwardTraceResult
          data={traceData}
          onOpenRecall={onOpenRecall}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          입력하신 원재료 LOT [{targetLotNo}] 에 해당하는 정방향 추적 기록이 없습니다.
        </div>
      )}
    </div>
  );
}
