import React, { useState, useEffect } from "react";
import type { ProductionPlan, PlanPriority } from "@/types/production";
import { useMasterData } from "@/context/MasterDataContext";
import { PLAN_PRIORITY_OPTIONS } from "@/constants/production-labels";
import { useAdmin } from "@/context/AdminContext";

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

  // 제품 선택 변경 시 기본 생산라인 및 단위 자동 반영
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

  // 선택된 생산라인의 최대 생산 용량 정보
  const selectedLineObj = productionLines.find((l) => l.name === productionLine);
  const isExceedingCapacity =
    selectedLineObj && typeof plannedQuantity === "number"
      ? plannedQuantity > selectedLineObj.maxCapacity
      : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!productCode) {
      setErrorMessage("제품을 선택하세요.");
      return;
    }
    if (!productionLine) {
      setErrorMessage("생산라인을 선택하세요.");
      return;
    }
    if (typeof plannedQuantity !== "number" || plannedQuantity <= 0) {
      setErrorMessage("계획 수량은 0보다 커야 합니다.");
      return;
    }
    if (endTime <= startTime) {
      setErrorMessage("계획 종료시간은 시작시간보다 늦어야 합니다.");
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
      remarks,
    };

    if (mode === "create") {
      const success = onSubmit(payload);
      if (success) onClose();
    } else if (mode === "edit" && item && onUpdate) {
      const success = onUpdate(item.id, payload);
      if (success) onClose();
    }
  };

  const title = mode === "create" ? "신규 생산계획 등록" : "생산계획 수정";

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
                생산 예정일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 제품 선택 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                제품 <span className="text-red-500">*</span>
              </label>
              <select
                value={productCode}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- 제품 선택 --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.code}>
                    [{p.code}] {p.name} (기본: {p.defaultLine})
                  </option>
                ))}
              </select>
            </div>

            {/* 생산라인 선택 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                생산라인 <span className="text-red-500">*</span>
              </label>
              <select
                value={productionLine}
                onChange={(e) => setProductionLine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">-- 생산라인 선택 --</option>
                {productionLines.map((line) => (
                  <option key={line.id} value={line.name}>
                    {line.name} (최대용량: {line.maxCapacity.toLocaleString()}{line.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* 계획 수량 및 단위 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  계획 수량 <span className="text-red-500">*</span>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">단위</label>
                <input
                  type="text"
                  value={unit}
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
                ⚠️ 계획 수량(<strong>{Number(plannedQuantity).toLocaleString()}{unit}</strong>)이 선택한 {productionLine}의 최대 용량(<strong>{selectedLineObj?.maxCapacity.toLocaleString()}{unit}</strong>)을 초과합니다.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 계획 시작시간 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                계획 시작시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 계획 종료시간 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                계획 종료시간 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              />
            </div>

            {/* 우선순위 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                우선순위 <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PlanPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {PLAN_PRIORITY_OPTIONS.filter((o) => o.value !== "ALL").map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 담당자 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">담당 생산관리자</label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="담당자 이름"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">비고</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="생산 지시사항 및 특이사항 입력..."
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
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {mode === "create" ? "생산계획 저장" : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
