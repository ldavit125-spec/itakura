import React from "react";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 보고서 내보내기 버튼 그룹 (CSV 다운로드 / 인쇄 / PDF 저장 안내)
// ============================================================

interface ReportExportButtonsProps {
  onExportCsv: () => void;
  onPrint: () => void;
  onOpenPdfHelp: () => void;
}

export default function ReportExportButtons({
  onExportCsv,
  onPrint,
  onOpenPdfHelp,
}: ReportExportButtonsProps) {
  const { hasPermission } = useAdmin();
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  if (!hasPermission("REPORTS_EXPORT")) return null;

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        onClick={onExportCsv}
        className="px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{isJa ? "CSVダウンロード" : "CSV 다운로드"}</span>
      </button>

      <button
        onClick={onPrint}
        className="px-3 py-2 text-xs font-bold text-gray-800 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span>{isJa ? "印刷" : "인쇄"}</span>
      </button>

      <button
        onClick={onOpenPdfHelp}
        className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
      >
        <span>{isJa ? "PDF保存ガイド" : "PDF 저장 안내"}</span>
      </button>
    </div>
  );
}
