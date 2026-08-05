import type { ReportFilter, ReportPeriodType } from "@/types/reports";
import { getReportPeriodOptions } from "@/constants/report-labels";
import { useMasterData } from "@/context/MasterDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 상단 공통 기간 및 조건 필터 영역 컴포넌트
// ============================================================

interface ReportFilterBarProps {
  filter: ReportFilter;
  onChange: (partial: Partial<ReportFilter>) => void;
  onReset: () => void;
  dateError: string;
}

export default function ReportFilterBar({
  filter,
  onChange,
  onReset,
  dateError,
}: ReportFilterBarProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";
  const { products, materials, productionLines } = useMasterData();
  const isCustom = filter.periodType === "CUSTOM";
  const periodOptions = getReportPeriodOptions(locale);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3 mb-6 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-bold text-sm text-gray-800">
            {isJa ? "レポート照会期間および詳細フィルター条件" : "보고서 조회 기간 및 세부 필터 조건"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onReset}
            className="px-3 py-1.5 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
          >
            {isJa ? "フィルターリセット" : "필터 조건 초기화"}
          </button>
        </div>
      </div>

      {dateError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold flex items-center gap-1.5">
          <span>⚠️ {dateError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* 1. 기간 선택 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "照会期間選択" : "조회 기간 선택"}</label>
          <select
            value={filter.periodType}
            onChange={(e) => onChange({ periodType: e.target.value as ReportPeriodType })}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. 시작일 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "開始日" : "시작일"}</label>
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => onChange({ startDate: e.target.value, periodType: "CUSTOM" })}
            disabled={!isCustom}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        {/* 3. 종료일 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "終了日" : "종료일"}</label>
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => onChange({ endDate: e.target.value, periodType: "CUSTOM" })}
            disabled={!isCustom}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        {/* 4. 제품 필터 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "製品選択" : "제품 선택"}</label>
          <select
            value={filter.productCode}
            onChange={(e) => onChange({ productCode: e.target.value })}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{isJa ? "製品 全体" : "제품 전체"}</option>
            {products.map((p) => (
              <option key={p.code} value={p.code}>
                [{p.code}] {localizedName({ locale, ko: p.name, ja: p.nameJa })}
              </option>
            ))}
          </select>
        </div>

        {/* 5. 생산라인 필터 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "生産ライン選択" : "생산라인 선택"}</label>
          <select
            value={filter.productionLine}
            onChange={(e) => onChange({ productionLine: e.target.value })}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{isJa ? "生産ライン 全体" : "생산라인 전체"}</option>
            {productionLines.map((l) => (
              <option key={l.code} value={l.name}>
                {localizedName({ locale, ko: l.name, ja: l.nameJa })}
              </option>
            ))}
          </select>
        </div>

        {/* 6. 자재 필터 */}
        <div>
          <label className="block font-semibold text-gray-700 mb-1">{isJa ? "資材選択" : "자재 선택"}</label>
          <select
            value={filter.materialCode}
            onChange={(e) => onChange({ materialCode: e.target.value })}
            className="w-full px-2.5 py-2 border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">{isJa ? "資材 全体" : "자재 전체"}</option>
            {materials.map((m) => (
              <option key={m.code} value={m.code}>
                [{m.code}] {localizedName({ locale, ko: m.name, ja: m.nameJa })}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
