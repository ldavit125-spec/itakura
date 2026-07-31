import React from "react";
import type { TraceTab } from "@/types/traceability";
import { TRACE_TABS, TRACE_TAB_LABELS } from "@/constants/traceability-labels";

// ============================================================
// LOT 추적 5개 탭 네비게이션 컴포넌트
// ============================================================

interface TraceabilityTabsProps {
  activeTab: TraceTab;
  onChange: (tab: TraceTab) => void;
}

export default function TraceabilityTabs({ activeTab, onChange }: TraceabilityTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
      <nav role="tablist" aria-label="LOT 추적 탭 목록" className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
        {TRACE_TABS.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              id={`trace-tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`trace-tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{TRACE_TAB_LABELS[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
