"use client";

import { useEffect } from "react";
import type { ToastState } from "@/types/master-data";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// Toast 알림 컴포넌트 — 3초 후 자동 닫힘
// ============================================================

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
        isSuccess ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        aria-hidden="true"
      >
        {isSuccess ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        )}
      </svg>
      <span>{t(toast.message)}</span>
      <button
        onClick={onClose}
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label={t("toast.close")}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
