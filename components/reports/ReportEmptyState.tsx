import React from "react";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 데이터 미존재 시 표시하는 안내 컴포넌트
// ============================================================

interface ReportEmptyStateProps {
  message?: string;
}

export default function ReportEmptyState({
  message,
}: ReportEmptyStateProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const defaultMessage = isJa
    ? "選択した条件に該当するデータがありません"
    : "선택한 조건에 해당하는 데이터가 없습니다";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm my-4">
      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-base font-bold text-gray-700">{message || defaultMessage}</p>
      <p className="text-xs text-gray-500 mt-1">
        {isJa ? "上部の照会期間およびフィルター条件を変更してみてください。" : "상단 조회 기간 및 필터 조건을 다시 변경해 보세요."}
      </p>
    </div>
  );
}
