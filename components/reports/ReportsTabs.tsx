import React from "react";
import type { ReportTab } from "@/types/reports";
import { REPORT_TABS, REPORT_TAB_LABELS } from "@/constants/report-labels";

// ============================================================
// 보고서 5개 탭 네비게이션 컴포넌트
// ============================================================

interface ReportsTabsProps {
  activeTab: ReportTab;
  onChange: (tab: ReportTab) => void;
}

export default function ReportsTabs({ activeTab, onChange }: ReportsTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6 print:hidden">
      <nav role="tablist" aria-label="보고서 탭 목록" className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              id={`report-tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`report-tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{REPORT_TAB_LABELS[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
