import React, { useState } from "react";
import type { WorkOrder } from "@/types/production";

interface ProductionPauseModalProps {
  item: WorkOrder;
  onClose: () => void;
  onSubmit: (workOrderId: string, reason: string) => void;
}

export default function ProductionPauseModal({
  item,
  onClose,
  onSubmit,
}: ProductionPauseModalProps) {
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setErrorMessage("일시정지 사유를 입력해주세요.");
      return;
    }
    onSubmit(item.id, trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">작업 일시정지</h3>
            <p className="mt-0.5 font-mono text-xs text-gray-500">{item.workOrderNo}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-gray-700">
            <p><strong>제품:</strong> {item.productName}</p>
            <p className="mt-1"><strong>생산라인:</strong> {item.productionLine}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              일시정지 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              rows={4}
              autoFocus
              placeholder="설비 점검, 자재 부족, 품질 확인 등 일시정지 사유를 입력하세요."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errorMessage && <p className="mt-1 text-xs font-medium text-red-600">{errorMessage}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">취소</button>
            <button type="submit" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">일시정지 적용</button>
          </div>
        </form>
      </div>
    </div>
  );
}
