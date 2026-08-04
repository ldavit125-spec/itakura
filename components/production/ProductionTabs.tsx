"use client";

import React from "react";
import type { ProductionTab } from "@/types/production";
import { PRODUCTION_TABS } from "@/constants/production-labels";
import { useLanguage } from "@/context/LanguageContext";

const PRODUCTION_TAB_KEYS: Record<ProductionTab, string> = {
  plan: "production.tab.plan",
  "work-order": "production.tab.workOrder",
  progress: "production.tab.progress",
  result: "production.tab.result",
  "fg-lot": "production.tab.fgLot",
};

interface ProductionTabsProps {
  activeTab: ProductionTab;
  onChange: (tab: ProductionTab) => void;
  inProgressCount?: number;
}

export default function ProductionTabs({
  activeTab,
  onChange,
  inProgressCount = 0,
}: ProductionTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
      <nav role="tablist" aria-label={t("production.tabs.aria")} className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
        {PRODUCTION_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const showBadge = tab === "progress" && inProgressCount > 0;

          return (
            <button
              key={tab}
              id={`production-tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`production-tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{t(PRODUCTION_TAB_KEYS[tab])}</span>
              {showBadge && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? "bg-amber-100 text-amber-800"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {inProgressCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
