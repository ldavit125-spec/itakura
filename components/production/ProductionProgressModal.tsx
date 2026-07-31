import React, { useState, useEffect } from "react";
import type { WorkOrder } from "@/types/production";

// ============================================================
// 현재 생산량 모니터링 / 입력 모달 컴포넌트
// ============================================================

interface ProductionProgressModalProps {
  isOpen: boolean;
  item?: WorkOrder;
  onClose: () => void;
  onSubmit: (workOrderId: string, quantity: number) => void;
}

export default function ProductionProgressModal({
  isOpen,
  item,
  onClose,
  onSubmit,
}: ProductionProgressModalProps) {
  const [currentQty, setCurrentQty] = useState<number | "">(0);

  useEffect(() => {
    if (isOpen && item) {
      setCurrentQty(item.currentQuantity);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const progressRate = Math.min(
    100,
    Math.round((Number(currentQty) / item.orderedQuantity) * 100 * 10) / 10
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof currentQty === "number" && currentQty >= 0) {
      onSubmit(item.id, currentQty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-base font-bold text-gray-900">현재 생산 수량 입력</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.workOrderNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>제품: <strong>{item.productName}</strong></span>
              <span>생산라인: <strong>{item.productionLine}</strong></span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>지시 수량: <strong>{item.orderedQuantity.toLocaleString()} {item.unit}</strong></span>
              <span>예정 시간: <strong>{item.startTime} ~ {item.endTime}</strong></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              현재 누적 생산량 ({item.unit}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max={item.orderedQuantity * 1.2}
              value={currentQty}
              onChange={(e) => setCurrentQty(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 실시간 진행률 Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gray-600">예상 실시간 진행률</span>
              <span className="text-blue-600">{progressRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressRate}%` }}
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
              수량 업데이트
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
