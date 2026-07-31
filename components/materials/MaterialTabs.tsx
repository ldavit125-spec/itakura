import React from "react";
import type { MaterialTab } from "@/types/materials";
import { MATERIAL_TABS, MATERIAL_TAB_LABELS } from "@/constants/material-labels";

// ============================================================
// 자재관리 탭 네비게이션
// ============================================================

interface MaterialTabsProps {
  activeTab: MaterialTab;
  onChange: (tab: MaterialTab) => void;
  shortageCount?: number;
}

export default function MaterialTabs({
  activeTab,
  onChange,
  shortageCount = 0,
}: MaterialTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
      <nav role="tablist" aria-label="자재관리 탭 목록" className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
        {MATERIAL_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const showBadge = tab === "shortage" && shortageCount > 0;

          return (
            <button
              key={tab}
              id={`material-tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`material-tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{MATERIAL_TAB_LABELS[tab]}</span>
              {showBadge && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? "bg-red-100 text-red-600"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {shortageCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
