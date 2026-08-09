import React, { useState, useEffect } from "react";
import type { ProductionPlan, PlanPriority } from "@/types/production";
import { useMasterData } from "@/context/MasterDataContext";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// ============================================================
// 생산계획 등록 / 수정 모달 컴포넌트
// ============================================================

interface ProductionPlanModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: ProductionPlan;
  onClose: () => void;
  onSubmit: (formData: Omit<ProductionPlan, "id" | "planNo" | "planStatus" | "materialReadiness">) => boolean;
  onUpdate?: (id: string, updated: Partial<ProductionPlan>) => boolean;
}

export default function ProductionPlanModal({
  isOpen,
  mode,
  item,
  onClose,
  onSubmit,
  onUpdate,
}: ProductionPlanModalProps) {
  const { products, productionLines } = useMasterData();
  const { getAssignableUsers } = useAdmin();
  const { t, language } = useLanguage();
  const managers = getAssignableUsers(["PRODUCTION_MANAGER"]);

  const [plannedDate, setPlannedDate] = useState("2026-07-31");
  const [productCode, setProductCode] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [plannedQuantity, setPlannedQuantity] = useState<number | "">(3000);
  const [unit, setUnit] = useState("개");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [priority, setPriority] = useState<PlanPriority>("NORMAL");
  const [manager, setManager] = useState<string>(managers[0]?.name ?? "");
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleProductChange = (code: string) => {
    setProductCode(code);
    const selectedProd = products.find((p) => p.code === code);
    if (selectedProd) {
      setUnit(selectedProd.unit);
      if (selectedProd.defaultLine) {
        setProductionLine(selectedProd.defaultLine);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");

    if (mode === "create") {
      const firstProd = products[0];
      setPlannedDate("2026-07-31");
      setProductCode(firstProd ? firstProd.code : "");
      setUnit(firstProd ? firstProd.unit : "개");
      setProductionLine(firstProd?.defaultLine || productionLines[0]?.name || "");
      setPlannedQuantity(3000);
      setStartTime("08:00");
      setEndTime("12:00");
      setPriority("NORMAL");
      setManager(managers[0]?.name ?? "");
      setRemarks("");
    } else if (item) {
      setPlannedDate(item.plannedDate);
      setProductCode(item.productCode);
      setProductionLine(item.productionLine);
      setPlannedQuantity(item.plannedQuantity);
      setUnit(item.unit);
      setStartTime(item.startTime);
      setEndTime(item.endTime);
      setPriority(item.priority);
      setManager(item.manager);
      setRemarks(item.remarks || "");
    }
  }, [isOpen, mode, item]);

  if (!isOpen) return null;

  const selectedLineObj = productionLines.find((l) => l.name === productionLine);
  const isExceedingCapacity =
    selectedLineObj && typeof plannedQuantity === "number"
      ? plannedQuantity > selectedLineObj.maxCapacity
      : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!productCode) {
      setErrorMessage(localizedName({ locale: language, ko: "제품을 선택하세요.", ja: "製品を選択してください。" }));
      return;
    }
    if (!productionLine) {
      setErrorMessage(localizedName({ locale: language, ko: "생산라인을 선택하세요.", ja: "生産ラインを選択してください。" }));
      return;
    }
    if (!plannedQuantity || Number(plannedQuantity) <= 0) {
      setErrorMessage(localizedName({ locale: language, ko: "계획 수량은 1 이상이어야 합니다.", ja: "計画数量は1以上で入力してください。" }));
      return;
    }

    const selectedProd = products.find((p) => p.code === productCode);
    const productName = selectedProd ? selectedProd.name : productCode;

    const payload = {
      plannedDate,
      productCode,
      productName,
      productionLine,
      plannedQuantity: Number(plannedQuantity),
      unit,
      startTime,
      endTime,
      priority,
      manager,
      remarks: remarks.trim() || undefined,
    };

    let success = false;
    if (mode === "create") {
      success = onSubmit(payload);
    } else if (mode === "edit" && item && onUpdate) {
      success = onUpdate(item.id, payload);
    }

    if (success) {
      onClose();
    }
  };

  const title =
    mode === "create"
      ? t("production.plan.createModalTitle")
      : mode === "edit"
      ? t("production.plan.editModalTitle")
      : t("production.plan.detailModalTitle");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 에러 메시지 알림 */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 생산 예정일 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("production.plan.date")} <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 제품 선택 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("master.field.productName")} <span className="text-red-500">*</span>
              </label>
              <select
                value={productCode}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- {t("master.field.productName")} --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.code}>
                    [{p.code}] {localizedName({ locale: language, ko: p.name, ja: p.nameJa })}
                  </option>
                ))}
              </select>
            </div>

            {/* 생산라인 선택 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("master.tab.lines")} <span className="text-red-500">*</span>
              </label>
              <select
                value={productionLine}
                onChange={(e) => setProductionLine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- {t("master.tab.lines")} --</option>
                {productionLines.map((line) => (
                  <option key={line.id} value={line.name}>
                    {localizedName({ locale: language, ko: line.name, ja: line.nameJa })}
                  </option>
                ))}
              </select>
            </div>

            {/* 계획 수량 및 단위 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("production.plan.quantity")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={plannedQuantity}
                  onChange={(e) => setPlannedQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t("master.field.unit")}</label>
                <input
                  type="text"
                  value={localizedName({ locale: language, ko: unit })}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* 라인 최대 용량 초과 경고 표시 */}
          {isExceedingCapacity && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                {localizedName({
                  locale: language,
                  ko: `⚠️ 계획 수량(${Number(plannedQuantity).toLocaleString()}${localizedName({ locale: language, ko: unit })})이 선택한 ${productionLine}의 최대 용량(${selectedLineObj?.maxCapacity.toLocaleString()}${localizedName({ locale: language, ko: unit })})을 초과합니다.`,
                  ja: `⚠️ 計画数量（${Number(plannedQuantity).toLocaleString()}${localizedName({ locale: language, ko: unit })}）が、選択した${localizedName({ locale: language, ko: productionLine, ja: selectedLineObj?.nameJa })}の最大容量（${selectedLineObj?.maxCapacity.toLocaleString()}${localizedName({ locale: language, ko: unit })}）を超えています。`,
                })}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 계획 시작시간 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("production.plan.startTime")} <span className="text-red-500">*</span>
              </label>
              <input
                type={language === "ja" ? "text" : "time"}
                lang={language === "ja" ? "ja-JP" : "ko-KR"}
                inputMode={language === "ja" ? "numeric" : undefined}
                pattern={language === "ja" ? "([01][0-9]|2[0-3]):[0-5][0-9]" : undefined}
                placeholder={language === "ja" ? "08:00" : undefined}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 계획 종료시간 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("production.plan.endTime")} <span className="text-red-500">*</span>
              </label>
              <input
                type={language === "ja" ? "text" : "time"}
                lang={language === "ja" ? "ja-JP" : "ko-KR"}
                inputMode={language === "ja" ? "numeric" : undefined}
                pattern={language === "ja" ? "([01][0-9]|2[0-3]):[0-5][0-9]" : undefined}
                placeholder={language === "ja" ? "12:00" : undefined}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("production.plan.priority")} <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PlanPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="URGENT">{t("production.priority.urgent")}</option>
                <option value="HIGH">{t("production.priority.high")}</option>
                <option value="NORMAL">{t("production.priority.normal")}</option>
                <option value="LOW">{t("production.priority.low")}</option>
              </select>
            </div>
          </div>

          {/* 담당자 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t("master.field.manager")}</label>
            <input
              type="text"
              value={localizedName({ locale: language, ko: manager })}
              onChange={(e) => setManager(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{t("common.remarks")}</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {t("action.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
