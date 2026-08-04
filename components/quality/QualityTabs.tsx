import React from "react";
import type { QualityTab } from "@/types/quality";
import { QUALITY_TABS } from "@/constants/quality-labels";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 품질관리 6개 탭 네비게이션 컴포넌트 (다국어 지원)
// ============================================================

const QUALITY_TAB_KEYS: Record<QualityTab, string> = {
  inspection: "quality.tab.inspection",
  results: "quality.tab.results",
  defects: "quality.tab.defects",
  statistics: "quality.tab.statistics",
};

interface QualityTabsProps {
  activeTab: QualityTab;
  onChange: (tab: QualityTab) => void;
  queueCount?: number;
  unresolvedCACount?: number;
  defectCount?: number;
}

export default function QualityTabs({
  activeTab,
  onChange,
  queueCount = 0,
  unresolvedCACount = 0,
  defectCount = 0,
}: QualityTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
      <nav role="tablist" aria-label={t("quality.tab.inspection")} className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto">
        {QUALITY_TABS.map((tab) => {
          const isActive = activeTab === tab;

          let badgeCount = 0;
          let badgeColor = "bg-blue-500 text-white";

          if (tab === "inspection" && queueCount > 0) {
            badgeCount = queueCount;
            badgeColor = isActive ? "bg-blue-100 text-blue-700" : "bg-blue-600 text-white";
          } else if (tab === "defects" && defectCount > 0) {
            badgeCount = defectCount;
            badgeColor = isActive ? "bg-red-100 text-red-700" : "bg-red-500 text-white";
          }

          return (
            <button
              key={tab}
              id={`quality-tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`quality-tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-4 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{t(QUALITY_TAB_KEYS[tab])}</span>
              {badgeCount > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${badgeColor}`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
