import React, { useState } from "react";
import type { TraceNode } from "@/types/traceability";
import { getTraceNodesAndConnections } from "@/lib/traceability-selectors";
import TraceNodeCard from "./TraceNodeCard";
import TraceNodeDetailPanel from "./TraceNodeDetailPanel";

// ============================================================
// Tab 4: LOT 관계도 (Node Diagram) 시각적 캔버스 컴포넌트
// ============================================================

interface LotRelationDiagramProps {
  diagramTargetNo: string;
  onTriggerForward: (lotNo: string) => void;
  onTriggerBackward: (lotNo: string) => void;
}

export default function LotRelationDiagram({
  diagramTargetNo,
  onTriggerForward,
  onTriggerBackward,
}: LotRelationDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);

  const { nodes, connections } = getTraceNodesAndConnections(diagramTargetNo);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-purple-900 font-bold">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>선택 대상 [{diagramTargetNo}] 의 전과정 LOT 시각적 관계도</span>
        </div>
        <span className="text-gray-500 font-medium">노드를 클릭하면 우측 상세 정보 패널이 나타납니다.</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* 노드 다이어그램 수평 스크롤 캔버스 */}
        <div className="flex-1 overflow-x-auto bg-gray-50/80 rounded-xl border border-gray-200 p-6 min-h-[420px] shadow-inner">
          <div className="flex items-center gap-6 min-w-[900px] py-8">
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <TraceNodeCard
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onClick={(n) => setSelectedNode(n)}
                />

                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center justify-center text-gray-400 font-bold px-1">
                    <span className="text-[10px] text-gray-500 mb-1 font-mono">
                      {connections[index]?.relationType || "이동"}
                    </span>
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300"></div>
                      <svg className="w-4 h-4 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 선택 노드 상세 패널 */}
        <TraceNodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onTriggerForward={onTriggerForward}
          onTriggerBackward={onTriggerBackward}
        />
      </div>
    </div>
  );
}
