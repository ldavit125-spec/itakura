import React, { useState, useEffect } from "react";
import type { Nonconformity, InspectionCategory, NonconformityType, SeverityLevel } from "@/types/quality";
import { NONCONFORMITY_TYPE_OPTIONS, SEVERITY_LEVEL_OPTIONS } from "@/constants/quality-labels";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 부적합 내역 수동 등록 모달 컴포넌트
// ============================================================

interface NonconformityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Omit<Nonconformity, "id" | "ncNo" | "ncStatus">) => boolean;
}

export default function NonconformityModal({
  isOpen,
  onClose,
  onSubmit,
}: NonconformityModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const { getAssignableUsers } = useAdmin();
  const handlers = getAssignableUsers(["QUALITY_MANAGER", "MATERIAL_MANAGER"]);
  const [occurredDate, setOccurredDate] = useState("2026-07-31");
  const [category, setCategory] = useState<InspectionCategory>("INCOMING");
  const [inspectionNo, setInspectionNo] = useState("IQC-20260731-001");
  const [targetNo, setTargetNo] = useState("IN-20260731-001");
  const [targetName, setTargetName] = useState("강력분");
  const [lotNo, setLotNo] = useState("LOT-FLOUR-260731-A");
  const [ncType, setNcType] = useState<NonconformityType>("MATERIAL_DEFECT");
  const [defectQuantity, setDefectQuantity] = useState<number>(50);
  const [unit, setUnit] = useState("kg");
  const [severity, setSeverity] = useState<SeverityLevel>("MAJOR");
  const [handler, setHandler] = useState<string>(handlers[0]?.name ?? "");
  const [dueDate, setDueDate] = useState("2026-08-05");
  const [details, setDetails] = useState("");
  const [interimAction, setInterimAction] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDetails("");
      setInterimAction("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = onSubmit({
      occurredDate,
      category,
      inspectionNo,
      targetNo,
      targetName,
      lotNo,
      ncType,
      defectQuantity,
      unit,
      severity,
      handler,
      dueDate,
      details,
      interimAction,
    });

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("부적합 내역 신규 등록", "不適合履歴新規登録")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">Nonconformity Management</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("발생일자 *", "発生日 *")}</label>
              <input
                type="date"
                value={occurredDate}
                onChange={(e) => setOccurredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검사 구분 *", "検査区分 *")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InspectionCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold bg-white"
                required
              >
                <option value="INCOMING">{tr("원재료 입고검사", "原材料受入検査")}</option>
                <option value="PROCESS">{tr("공정검사", "工程検査")}</option>
                <option value="FINISHED_GOODS">{tr("완제품검사", "完成品検査")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검사 번호 *", "検査番号 *")}</label>
              <input
                type="text"
                list="nonconformity-handler-options"
                value={inspectionNo}
                onChange={(e) => setInspectionNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                required
              />
              <datalist id="nonconformity-handler-options">{handlers.map((user) => <option key={user.id} value={user.name} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("대상명 *", "対象名 *")}</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder={tr("예: 강력분 / 버터", "例: 強力粉／バター")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("LOT 번호 *", "LOT番号 *")}</label>
              <input
                type="text"
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-purple-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("부적합 수량 *", "不適合数量 *")}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={defectQuantity}
                  onChange={(e) => setDefectQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-right text-red-600"
                  required
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-xs text-center"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("부적합 유형", "不適合種別")} <span className="text-red-500">*</span>
              </label>
              <select
                value={ncType}
                onChange={(e) => setNcType(e.target.value as NonconformityType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                required
              >
                {NONCONFORMITY_TYPE_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("심각도 구분", "重大度区分")} <span className="text-red-500">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-extrabold bg-white text-red-700"
                required
              >
                {SEVERITY_LEVEL_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                  <option key={o.value} value={o.value}>
                    {localizedName({ locale, ko: o.label })} {tr("(치명/중대 시 시정조치 CAPA 자동발행)", "（致命的／重大の場合、是正措置CAPAを自動発行）")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("담당자 *", "担当者 *")}</label>
              <input
                type="text"
                value={handler}
                onChange={(e) => setHandler(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("부적합 발생 상세 내용 *", "不適合発生詳細内容 *")}</label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={tr("발생 원인 및 부적합 현상을 상세히 기술하세요...", "発生原因および不適合現象を詳しく記載してください...")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("임시조치 (봉인/격리/반품 등)", "暫定措置（封印／隔離／返品など）")}</label>
            <textarea
              rows={2}
              value={interimAction}
              onChange={(e) => setInterimAction(e.target.value)}
              placeholder={tr("현장 응급 임시조치 내용을 기술하세요...", "現場での緊急暫定措置内容を記載してください...")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm"
            >
              {tr("부적합 등록 완료", "不適合登録完了")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
