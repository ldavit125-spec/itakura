import React, { useState, useEffect } from "react";
import type { ProductionResult, WorkOrder, DefectDetail } from "@/types/production";
import DefectDetailForm from "./DefectDetailForm";
import { useAdmin } from "@/context/AdminContext";

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

  // 작업지시 선택 시 필드 자동 반영
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
      setErrorMessage("작업지시를 선택해주세요.");
      return;
    }

    const tQty = Number(totalQuantity);
    const gQty = Number(goodQuantity);
    const dQty = Number(defectQuantity);
    const rQty = Number(reworkQuantity);

    if (tQty <= 0) {
      setErrorMessage("총 생산량은 0보다 커야 합니다.");
      return;
    }

    if (gQty + dQty + rQty !== tQty) {
      setErrorMessage(
        `양품(${gQty}) + 불량(${dQty}) + 재작업(${rQty})의 합계(${gQty + dQty + rQty})가 총 생산량(${tQty})과 정확히 일치해야 합니다.`
      );
      return;
    }

    const sumDefects = defectBreakdown.reduce((sum, item) => sum + item.quantity, 0);
    if (dQty > 0 && sumDefects !== dQty) {
      setErrorMessage(`불량 세부 원인 수량 합계(${sumDefects})가 전체 불량 수량(${dQty})과 일치해야 합니다.`);
      return;
    }

    const success = onSubmit({
      workOrderNo: selectedWorkOrderNo,
      productionDate,
      productCode,
      productName,
      productionLine,
      orderedQuantity,
      totalQuantity: tQty,
      goodQuantity: gQty,
      defectQuantity: dQty,
      reworkQuantity: rQty,
      actualStartTime,
      actualEndTime,
      handler,
      defectBreakdown,
      remarks,
    });

    if (success) onClose();
  };

  const isDetail = mode === "detail";
  const title = mode === "create" ? "생산실적 등록" : "생산실적 상세 정보";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {item && <p className="text-xs text-gray-500 font-mono mt-0.5">{item.resultNo}</p>}
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
                <p className="text-xs text-gray-500">달성률</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{item.achievementRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">불량률</p>
                <p className="text-xl font-bold text-red-600 mt-1">{item.defectRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">총 작업시간</p>
                <p className="text-base font-bold text-gray-800 mt-1">{item.workingHours}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
              <div>
                <span className="text-gray-500 font-medium">작업지시 번호:</span>
                <span className="ml-2 font-mono font-bold text-gray-900">{item.workOrderNo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">생산일:</span>
                <span className="ml-2 font-semibold text-gray-900">{item.productionDate}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">제품:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  [{item.productCode}] {item.productName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">생산라인:</span>
                <span className="ml-2 font-semibold text-gray-900">{item.productionLine}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">지시 수량:</span>
                <span className="ml-2 text-gray-900 font-semibold">{item.orderedQuantity.toLocaleString()} 개</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">총 생산량:</span>
                <span className="ml-2 font-extrabold text-blue-600">{item.totalQuantity.toLocaleString()} 개</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">양품 수량:</span>
                <span className="ml-2 font-bold text-green-600">{item.goodQuantity.toLocaleString()} 개</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">불량 수량:</span>
                <span className="ml-2 font-bold text-red-600">{item.defectQuantity.toLocaleString()} 개</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">재작업 수량:</span>
                <span className="ml-2 font-bold text-amber-600">{item.reworkQuantity.toLocaleString()} 개</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">담당자:</span>
                <span className="ml-2 text-gray-900">{item.handler}</span>
              </div>
            </div>

            {item.defectBreakdown && item.defectBreakdown.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-gray-700 mb-2">■ 불량 세부 원인 내역</h5>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {item.defectBreakdown.map((b) => (
                    <div key={b.type} className="bg-red-50 p-2 rounded border border-red-100 flex justify-between">
                      <span className="text-red-800">{b.type}</span>
                      <strong className="text-red-900">{b.quantity}개</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                닫기
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
                      [{w.workOrderNo}] {w.productName} ({w.orderedQuantity.toLocaleString()}개)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">생산일</label>
                <input
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">총 생산량 *</label>
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
                <label className="block text-xs font-bold text-green-700 mb-1">양품 수량 *</label>
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
                <label className="block text-xs font-bold text-red-700 mb-1">불량 수량 *</label>
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
                <label className="block text-xs font-bold text-amber-700 mb-1">재작업 수량 *</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">실제 시작시간</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">실제 종료시간</label>
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">담당자</label>
                <input
                  type="text"
                  value={handler}
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
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                실적 저장 (임시저장)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
