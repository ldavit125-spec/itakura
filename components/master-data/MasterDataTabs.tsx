import type { MasterDataTab } from "@/types/master-data";
import { MASTER_DATA_TABS, MASTER_DATA_TAB_LABELS } from "@/types/master-data";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 기준정보 관리 탭 네비게이션
// ============================================================

interface MasterDataTabsProps {
  activeTab: MasterDataTab;
  onChange: (tab: MasterDataTab) => void;
}

export default function MasterDataTabs({
  activeTab,
  onChange,
}: MasterDataTabsProps) {
  const { t } = useLanguage();
  return (
    <div className="border-b border-gray-200 px-6">
      <nav role="tablist" aria-label={t("master.tabs.aria")} className="-mb-px flex">
        {MASTER_DATA_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab}`}
              onClick={() => onChange(tab)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t(MASTER_DATA_TAB_LABELS[tab])}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
