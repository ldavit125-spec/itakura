import React, { useState, useEffect } from "react";
import type { ProductionResult, WorkOrder, DefectDetail } from "@/types/production";
import DefectDetailForm from "./DefectDetailForm";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// ============================================================
// 생산실적 등록 / 상세 모달 컴포넌트
// ============================================================

interface ProductionResultModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: ProductionResult;
  workOrders: WorkOrder[];
  onClose: () => void;
  onSubmit: (
    formData: Omit<
      ProductionResult,
      "id" | "resultNo" | "achievementRate" | "defectRate" | "workingHours" | "resultStatus"
    >
  ) => boolean;
}

export default function ProductionResultModal({
  isOpen,
  mode,
  item,
  workOrders,
  onClose,
  onSubmit,
}: ProductionResultModalProps) {
  const { getAssignableUsers } = useAdmin();
  const { t, language } = useLanguage();
  const handlers = getAssignableUsers(["WORKER", "PRODUCTION_MANAGER"]);
  const [selectedWorkOrderNo, setSelectedWorkOrderNo] = useState("");
  const [productionDate, setProductionDate] = useState("2026-07-31");
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [productionLine, setProductionLine] = useState("");
  const [orderedQuantity, setOrderedQuantity] = useState<number>(3000);
  const [totalQuantity, setTotalQuantity] = useState<number | "">(3000);
  const [goodQuantity, setGoodQuantity] = useState<number | "">(2950);
  const [defectQuantity, setDefectQuantity] = useState<number | "">(30);
  const [reworkQuantity, setReworkQuantity] = useState<number | "">(20);
  const [actualStartTime, setActualStartTime] = useState("2026-07-31 08:00");
  const [actualEndTime, setActualEndTime] = useState("2026-07-31 12:00");
  const [handler, setHandler] = useState<string>(handlers[0]?.name ?? "");
  const [remarks, setRemarks] = useState("");
  const [defectBreakdown, setDefectBreakdown] = useState<DefectDetail[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleWorkOrderSelect = (woNo: string) => {
    setSelectedWorkOrderNo(woNo);
    const wo = workOrders.find((w) => w.workOrderNo === woNo);
    if (wo) {
      setProductionDate(wo.plannedDate);
      setProductCode(wo.productCode);
      setProductName(wo.productName);
      setProductionLine(wo.productionLine);
      setOrderedQuantity(wo.orderedQuantity);
      setTotalQuantity(wo.orderedQuantity);
      setGoodQuantity(Math.floor(wo.orderedQuantity * 0.98));
      setDefectQuantity(Math.floor(wo.orderedQuantity * 0.015));
      setReworkQuantity(wo.orderedQuantity - Math.floor(wo.orderedQuantity * 0.98) - Math.floor(wo.orderedQuantity * 0.015));
      setHandler(wo.handler || handlers[0]?.name || "");
      if (wo.actualStartTime) {
        setActualStartTime(wo.actualStartTime);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");

    if (mode === "create") {
      const activeWo = workOrders.find((w) => w.workStatus === "IN_PROGRESS" || w.workStatus === "COMPLETED");
      if (activeWo) {
        handleWorkOrderSelect(activeWo.workOrderNo);
      }
    } else if (item) {
      setSelectedWorkOrderNo(item.workOrderNo);
      setProductionDate(item.productionDate);
      setProductCode(item.productCode);
      setProductName(item.productName);
      setProductionLine(item.productionLine);
      setOrderedQuantity(item.orderedQuantity);
      setTotalQuantity(item.totalQuantity);
      setGoodQuantity(item.goodQuantity);
      setDefectQuantity(item.defectQuantity);
      setReworkQuantity(item.reworkQuantity);
      setActualStartTime(item.actualStartTime);
      setActualEndTime(item.actualEndTime);
      setHandler(item.handler);
      setRemarks(item.remarks || "");
      setDefectBreakdown(item.defectBreakdown || []);
    }
  }, [isOpen, mode, item, workOrders]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedWorkOrderNo) {
      setErrorMessage("작업지시를 선택하세요.");
      return;
    }

    if (
      typeof totalQuantity !== "number" ||
      typeof goodQuantity !== "number" ||
      typeof defectQuantity !== "number" ||
      typeof reworkQuantity !== "number"
    ) {
      setErrorMessage("수량을 올바르게 입력하세요.");
      return;
    }

    if (totalQuantity <= 0) {
      setErrorMessage("총 생산량은 1 이상이어야 합니다.");
      return;
    }

    if (goodQuantity + defectQuantity + reworkQuantity !== totalQuantity) {
      setErrorMessage("양품 수량 + 불량 수량 + 재작업 수량 합계가 총 생산량과 일치해야 합니다.");
      return;
    }

    if (defectQuantity > 0 && defectBreakdown.length > 0) {
      const breakdownSum = defectBreakdown.reduce((sum, b) => sum + b.quantity, 0);
      if (breakdownSum !== defectQuantity) {
        setErrorMessage(`불량 세부 원인 수량 합계(${breakdownSum}개)가 총 불량 수량(${defectQuantity}개)과 일치하지 않습니다.`);
        return;
      }
    }

    const payload = {
      workOrderNo: selectedWorkOrderNo,
      productionDate,
      productCode,
      productName,
      productionLine,
      orderedQuantity,
      totalQuantity,
      goodQuantity,
      defectQuantity,
      reworkQuantity,
      actualStartTime,
      actualEndTime,
      handler,
      remarks: remarks.trim() || undefined,
      defectBreakdown,
    };

    const success = onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  const isDetail = mode === "detail";
  const title = isDetail ? t("production.plan.detailModalTitle") : t("production.result.new");
  const itemUnit = localizedName({ locale: language, ko: "개", ja: "個" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {isDetail && item && (
              <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{item.resultNo}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {isDetail && item ? (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
              <div>
                <p className="text-xs text-gray-500">{t("production.plan.achievementRate")}</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{item.achievementRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("production.result.defectRate")}</p>
                <p className="text-xl font-bold text-red-600 mt-1">{item.defectRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">총 작업시간</p>
                <p className="text-base font-bold text-gray-800 mt-1">{item.workingHours}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
              <div>
                <span className="text-gray-500 font-medium">{t("production.workOrder.number")}:</span>
                <span className="ml-2 font-mono font-bold text-gray-900">{item.workOrderNo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.fgLot.manufactureDate")}:</span>
                <span className="ml-2 font-semibold text-gray-900">{item.productionDate}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.field.productName")}:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  [{item.productCode}] {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.tab.lines")}:</span>
                <span className="ml-2 font-semibold text-gray-900">{localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.workOrder.instructedQty")}:</span>
                <span className="ml-2 text-gray-900 font-semibold">{item.orderedQuantity.toLocaleString()} {itemUnit}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.result.totalQty")}:</span>
                <span className="ml-2 font-extrabold text-blue-600">{item.totalQuantity.toLocaleString()} {itemUnit}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.result.goodQty")}:</span>
                <span className="ml-2 font-bold text-green-600">{item.goodQuantity.toLocaleString()} {itemUnit}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.result.defectQty")}:</span>
                <span className="ml-2 font-bold text-red-600">{item.defectQuantity.toLocaleString()} {itemUnit}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.result.reworkQty")}:</span>
                <span className="ml-2 font-bold text-amber-600">{item.reworkQuantity.toLocaleString()} {itemUnit}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.field.manager")}:</span>
                <span className="ml-2 text-gray-900">{localizedName({ locale: language, ko: item.handler })}</span>
              </div>
            </div>

            {item.defectBreakdown && item.defectBreakdown.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-gray-700 mb-2">■ 불량 세부 원인 내역</h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {item.defectBreakdown.map((b) => (
                    <div key={b.type} className="bg-red-50 p-2 rounded border border-red-100 flex justify-between">
                      <span className="text-red-800">{b.type}</span>
                      <strong className="text-red-900">{b.quantity}{itemUnit}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                {t("action.close")}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  작업지시 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWorkOrderNo}
                  onChange={(e) => handleWorkOrderSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  required
                >
                  <option value="">-- 작업지시 선택 --</option>
                  {workOrders.map((w) => (
                    <option key={w.id} value={w.workOrderNo}>
                      [{w.workOrderNo}] {localizedName({ locale: language, ko: w.productName, ja: w.productNameJa })} ({w.orderedQuantity.toLocaleString()}{itemUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t("production.fgLot.manufactureDate")}</label>
                <DateInput
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t("production.result.totalQty")} *</label>
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-blue-300 rounded text-sm font-extrabold text-blue-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-green-700 mb-1">{t("production.result.goodQty")} *</label>
                <input
                  type="number"
                  min="0"
                  value={goodQuantity}
                  onChange={(e) => setGoodQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-green-300 rounded text-sm font-bold text-green-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">{t("production.result.defectQty")} *</label>
                <input
                  type="number"
                  min="0"
                  value={defectQuantity}
                  onChange={(e) => setDefectQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-red-300 rounded text-sm font-bold text-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1">{t("production.result.reworkQty")} *</label>
                <input
                  type="number"
                  min="0"
                  value={reworkQuantity}
                  onChange={(e) => setReworkQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded text-sm font-bold text-amber-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            {Number(defectQuantity) > 0 && (
              <DefectDetailForm
                defectQuantity={Number(defectQuantity)}
                breakdown={defectBreakdown}
                onChange={setDefectBreakdown}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t("production.result.actualStartTime")}</label>
                <input
                  type="text"
                  list="production-result-handler-options"
                  value={actualStartTime}
                  onChange={(e) => setActualStartTime(e.target.value)}
                  placeholder="예: 2026-07-31 08:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  required
                />
                <datalist id="production-result-handler-options">{handlers.map((user) => <option key={user.id} value={user.name} />)}</datalist>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t("production.result.actualEndTime")}</label>
                <input
                  type="text"
                  value={actualEndTime}
                  onChange={(e) => setActualEndTime(e.target.value)}
                  placeholder="예: 2026-07-31 12:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t("master.field.manager")}</label>
                <input
                  type="text"
                  value={localizedName({ locale: language, ko: handler })}
                  onChange={(e) => setHandler(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

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
        )}
      </div>
    </div>
  );
}
