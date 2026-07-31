import React from "react";
import { useRouter } from "next/navigation";
import type { TraceNode } from "@/types/traceability";
import { TRACE_NODE_TYPE_LABELS, TRACE_NODE_STATUS_LABELS } from "@/constants/traceability-labels";

// ============================================================
// 관계도 노드 클릭 시 우측 상세 정보 측면 패널 컴포넌트
// ============================================================

interface TraceNodeDetailPanelProps {
  node: TraceNode | null;
  onClose: () => void;
  onTriggerForward: (lotNo: string) => void;
  onTriggerBackward: (lotNo: string) => void;
}

export default function TraceNodeDetailPanel({
  node,
  onClose,
  onTriggerForward,
  onTriggerBackward,
}: TraceNodeDetailPanelProps) {
  const router = useRouter();

  if (!node) return null;

  const handleNavigate = () => {
    if (node.type === "RAW_MATERIAL_LOT" || node.type === "RAW_MATERIAL_INBOUND") {
      router.push(`/materials?tab=inventory&lot=${encodeURIComponent(node.referenceNumber)}`);
    } else if (node.type === "WORK_ORDER" || node.type === "PRODUCTION_RESULT") {
      router.push(`/production?tab=work-order&workOrder=${encodeURIComponent(node.referenceNumber)}`);
    } else if (node.type === "FINISHED_GOODS_LOT" || node.type === "FINISHED_GOODS_INSPECTION") {
      router.push(`/quality?tab=finished&lot=${encodeURIComponent(node.referenceNumber)}`);
    } else if (node.type === "NONCONFORMITY" || node.type === "CORRECTIVE_ACTION") {
      router.push(`/quality?tab=nonconformity`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5 space-y-4 text-xs w-full lg:w-80 flex-shrink-0">
      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            {TRACE_NODE_TYPE_LABELS[node.type]}
          </span>
          <h4 className="text-base font-mono font-bold text-gray-900 mt-1">{node.referenceNumber}</h4>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-gray-500 font-medium">명칭 / 내용:</span>
          <p className="font-bold text-gray-900 text-sm mt-0.5">{node.label}</p>
        </div>

        <div className="flex justify-between py-1 border-t border-b border-gray-100">
          <span className="text-gray-500 font-medium">현재 상태:</span>
          <span className="font-extrabold text-blue-600">
            {TRACE_NODE_STATUS_LABELS[node.status] || node.status}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 font-medium">처리 일시:</span>
          <span className="font-mono text-gray-800">{node.occurredAt}</span>
        </div>

        {node.handler && (
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">담당자 / 라인:</span>
            <span className="font-semibold text-gray-900">{node.handler}</span>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="pt-3 border-t border-gray-200 space-y-2">
        {node.type === "RAW_MATERIAL_LOT" && (
          <button
            onClick={() => onTriggerForward(node.referenceNumber)}
            className="w-full py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm"
          >
            이 자재 정방향 추적 →
          </button>
        )}

        {node.type === "FINISHED_GOODS_LOT" && (
          <button
            onClick={() => onTriggerBackward(node.referenceNumber)}
            className="w-full py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            ← 이 완제품 역방향 추적
          </button>
        )}

        <button
          onClick={handleNavigate}
          className="w-full py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
        >
          관련 업무 모듈로 이동 ↗
        </button>
      </div>
    </div>
  );
}
