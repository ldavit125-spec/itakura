import React, { useState, useEffect } from "react";
import type { InspectionQueueItem } from "@/types/quality";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 검사 담당자 배정 모달 컴포넌트
// ============================================================

interface InspectionAssignmentModalProps {
  isOpen: boolean;
  item?: InspectionQueueItem;
  onClose: () => void;
  onAssign: (queueId: string, inspector: string) => void;
}

export default function InspectionAssignmentModal({
  isOpen,
  item,
  onClose,
  onAssign,
}: InspectionAssignmentModalProps) {
  const { getAssignableUsers } = useAdmin();
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const inspectors = getAssignableUsers(["QUALITY_MANAGER"]);
  const [inspectorName, setInspectorName] = useState<string>(inspectors[0]?.name ?? "");

  useEffect(() => {
    if (isOpen && item && item.inspector) {
      setInspectorName(item.inspector);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inspectorName.trim()) {
      onAssign(item.id, inspectorName.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-base font-bold text-gray-900">{tr("검사 담당자 배정", "検査担当者割当")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.requestNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs space-y-1">
            <div><strong>{tr("검사 구분:", "検査区分:")}</strong> {localizedName({ locale, ko: item.category })}</div>
            <div><strong>{tr("대상:", "対象:")}</strong> [{item.targetNo}] {localizedName({ locale, ko: item.targetName })}</div>
            <div><strong>{tr("LOT 번호:", "LOT番号:")}</strong> {item.lotNo}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {tr("담당 검사원 성명", "担当検査員氏名")} <span className="text-red-500">*</span>
            </label>
            <select
              value={localizedName({ locale, ko: inspectorName })}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {inspectors.map((user) => <option key={user.id} value={user.name}>{localizedName({ locale, ko: user.name })} ({localizedName({ locale, ko: user.department }) || tr("품질 담당", "品質担当")})</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {tr("취소", "キャンセル")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              {tr("배정 완료", "割当完了")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
