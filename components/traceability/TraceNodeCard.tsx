import React from "react";
import type { TraceNode } from "@/types/traceability";
import { TRACE_NODE_TYPE_LABELS, NODE_TYPE_STYLES, NODE_STATUS_STYLES } from "@/constants/traceability-labels";

// ============================================================
// LOT 관계도 내 개별 노드 카드리프 컴포넌트
// ============================================================

interface TraceNodeCardProps {
  node: TraceNode;
  isSelected: boolean;
  onClick: (node: TraceNode) => void;
}

export default function TraceNodeCard({ node, isSelected, onClick }: TraceNodeCardProps) {
  const typeStyle = NODE_TYPE_STYLES[node.type] || "bg-gray-100 text-gray-800 border-gray-300";
  const statusStyle = NODE_STATUS_STYLES[node.status] || "border-gray-200 bg-white";

  return (
    <div
      onClick={() => onClick(node)}
      className={`relative cursor-pointer transition-all duration-200 p-3.5 rounded-xl border-2 shadow-sm min-w-[200px] max-w-[220px] bg-white ${statusStyle} ${
        isSelected ? "ring-4 ring-blue-500/50 shadow-md scale-105" : "hover:shadow-md hover:scale-[1.02]"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeStyle}`}>
          {TRACE_NODE_TYPE_LABELS[node.type]}
        </span>
        <span className="text-[10px] font-mono text-gray-500 font-semibold">{node.occurredAt.split(" ")[0]}</span>
      </div>

      <h4 className="text-xs font-mono font-bold text-gray-900 truncate" title={node.referenceNumber}>
        {node.referenceNumber}
      </h4>
      <p className="text-[11px] font-semibold text-gray-700 truncate mt-0.5" title={node.label}>
        {node.label}
      </p>

      {node.handler && (
        <p className="text-[10px] text-gray-500 mt-2 flex justify-between items-center border-t border-gray-100 pt-1.5">
          <span>담당: {node.handler}</span>
          <span className="text-blue-600 font-bold text-[10px]">상세보기 ➔</span>
        </p>
      )}
    </div>
  );
}
