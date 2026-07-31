"use client";

import React, { useEffect } from "react";
import type { QualityToastState } from "@/types/quality";

// ============================================================
// 품질관리 알림 Toast 컴포넌트
// ============================================================

interface QualityToastProps {
  toast: QualityToastState;
  onClose: () => void;
}

export default function QualityToast({ toast, onClose }: QualityToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all ${
        isSuccess ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        {isSuccess ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        )}
      </svg>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100" aria-label="알림 닫기">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
