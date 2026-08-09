import React, { useState, useEffect } from "react";
import type { CorrectiveAction, AnalysisMethod, VerificationStatus } from "@/types/quality";
import { ANALYSIS_METHOD_LABELS, DEPARTMENT_CODE_LABELS } from "@/constants/quality-labels";
import { CorrectiveActionStatusBadge, VerificationStatusBadge } from "./QualityStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 시정조치 (CAPA) 원인분석, 조치계획, 효과검증 통합 모달
// ============================================================

interface CorrectiveActionDetailModalProps {
  isOpen: boolean;
  item?: CorrectiveAction;
  onClose: () => void;
  onUpdate: (caId: string, updated: Partial<CorrectiveAction>) => boolean;
  onVerify: (
    caId: string,
    verificationStatus: VerificationStatus,
    content: string,
    verifier: string
  ) => boolean;
  onCloseCA: (caId: string) => boolean;
}

export default function CorrectiveActionDetailModal({
  isOpen,
  item,
  onClose,
  onUpdate,
  onVerify,
  onCloseCA,
}: CorrectiveActionDetailModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>("FIVE_WHY");
  const [directCause, setDirectCause] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [preventiveMeasure, setPreventiveMeasure] = useState("");

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("EFFECTIVE");
  const [verificationContent, setVerificationContent] = useState("");
  const [verifier, setVerifier] = useState("김품질팀장");

  useEffect(() => {
    if (isOpen && item) {
      setAnalysisMethod(item.analysisMethod || "FIVE_WHY");
      setDirectCause(item.directCause || "");
      setRootCause(item.rootCause || "");
      setActionPlan(item.actionPlan || "");
      setPreventiveMeasure(item.preventiveMeasure || "");
      setVerificationStatus(item.verificationStatus || "EFFECTIVE");
      setVerificationContent(item.verificationContent || "");
      setVerifier(item.verifier || "김품질팀장");
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // 원인 분석 및 계획 저장
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item.id, {
      analysisMethod,
      directCause,
      rootCause,
      actionPlan,
      preventiveMeasure,
      caStatus: "PLANNED",
    });
  };

  // 조치 진행/완료 상태 변경
  const handleProgress = (newStatus: CorrectiveAction["caStatus"]) => {
    onUpdate(item.id, { caStatus: newStatus });
  };

  // 효과 검증 등록
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(item.id, verificationStatus, verificationContent, verifier);
  };

  // 최종 종결
  const handleCloseSubmit = () => {
    const success = onCloseCA(item.id);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("시정조치(CAPA) 조치 계획 및 효과검증", "是正措置（CAPA）計画および効果検証")}</h3>
            <p className="text-xs text-amber-800 font-mono font-bold mt-0.5">{item.caNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* 상단 요약 헤더 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("부적합 번호", "不適合番号")}</p>
              <p className="text-sm font-mono font-bold text-gray-900 mt-1">{item.ncNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("담당 부서", "担当部署")}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {localizedName({ locale, ko: DEPARTMENT_CODE_LABELS[item.targetDepartment] })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("조치 상태", "措置状態")}</p>
              <div className="mt-1">
                <CorrectiveActionStatusBadge status={item.caStatus} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{tr("효과 검증 상태", "効果検証状態")}</p>
              <div className="mt-1">
                <VerificationStatusBadge status={item.verificationStatus} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
            <span className="font-bold text-gray-800">{tr("■ 문제 요약: ", "■ 問題要約: ")}</span>
            <span className="text-gray-900 font-medium">{localizedName({ locale, ko: item.problemSummary })}</span>
          </div>

          {/* 1. 원인 분석 및 시정조치 계획 수립 */}
          <form onSubmit={handleSavePlan} className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-3">
            <h5 className="text-xs font-bold text-gray-800 flex items-center justify-between">
              <span>{tr("1. 원인 분석 (Root Cause Analysis) 및 조치 계획", "1. 原因分析（Root Cause Analysis）および措置計画")}</span>
              <span className="text-[11px] text-gray-500 font-normal">
                {tr("담당자:", "担当者:")} <strong>{localizedName({ locale, ko: item.handler })}</strong>
              </span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("원인 분석 방법", "原因分析方法")}</label>
                <select
                  value={analysisMethod}
                  onChange={(e) => setAnalysisMethod(e.target.value as AnalysisMethod)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white font-semibold"
                >
                  <option value="FIVE_WHY">{tr("5 Why 분석", "5 Why分析")}</option>
                  <option value="FISHBONE">{tr("특성요인도 (Fishbone Diagram)", "特性要因図（Fishbone Diagram）")}</option>
                  <option value="CHECKLIST">{tr("체크리스트 평가", "チェックリスト評価")}</option>
                  <option value="INTERVIEW">{tr("작업자 인터뷰", "作業者インタビュー")}</option>
                  <option value="DATA_ANALYSIS">{tr("데이터 분석", "データ分析")}</option>
                  <option value="OTHER">{tr("기타 분석", "その他の分析")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("직접 원인 (Direct Cause)", "直接原因（Direct Cause）")}</label>
                <input
                  type="text"
                  value={localizedName({ locale, ko: directCause })}
                  onChange={(e) => setDirectCause(e.target.value)}
                  placeholder={tr("예: 온도센서 고장", "例: 温度センサー故障")}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("근본 원인 (Root Cause)", "根本原因（Root Cause）")}</label>
              <textarea
                rows={2}
                value={localizedName({ locale, ko: rootCause })}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder={tr("5-Why 등을 통해 도출된 근본 원인을 작성하세요...", "5-Whyなどで導出した根本原因を記載してください...")}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("시정조치 계획 (Action Plan)", "是正措置計画（Action Plan）")}</label>
                <textarea
                  rows={2}
                  value={localizedName({ locale, ko: actionPlan })}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder={tr("개선 및 즉각적 조치 내용을 작성하세요...", "改善および即時措置内容を記載してください...")}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("재발 방지 대책 (Preventive Measure)", "再発防止対策（Preventive Measure）")}</label>
                <textarea
                  rows={2}
                  value={localizedName({ locale, ko: preventiveMeasure })}
                  onChange={(e) => setPreventiveMeasure(e.target.value)}
                  placeholder={tr("시스템적 재발 방지 대책을 작성하세요...", "体系的な再発防止対策を記載してください...")}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                {tr("원인분석 및 계획 저장", "原因分析および計画を保存")}
              </button>
              <button
                type="button"
                onClick={() => handleProgress("IN_PROGRESS")}
                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded hover:bg-purple-200"
              >
                {tr("조치 진행 중(IN_PROGRESS)으로 변경", "措置進行中（IN_PROGRESS）へ変更")}
              </button>
              <button
                type="button"
                onClick={() => handleProgress("COMPLETED")}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-100 rounded hover:bg-teal-200"
              >
                {tr("조치 완료(COMPLETED) 상태 변경", "措置完了（COMPLETED）へ変更")}
              </button>
            </div>
          </form>

          {/* 2. 효과 검증 (Verification) */}
          <form onSubmit={handleVerifySubmit} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
            <h5 className="text-xs font-bold text-blue-900">{tr("2. 효과 검증 (Effectiveness Verification)", "2. 効果検証（Effectiveness Verification）")}</h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검증 결과 판정 *", "検証結果判定 *")}</label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                  className={`w-full px-3 py-1.5 border rounded text-xs font-extrabold bg-white ${
                    verificationStatus === "EFFECTIVE"
                      ? "text-green-700 border-green-400"
                      : "text-red-700 border-red-400"
                  }`}
                  required
                >
                  <option value="EFFECTIVE">{tr("EFFECTIVE (효과 있음 - 종결 승인 가능)", "EFFECTIVE（効果あり - 終結承認可能）")}</option>
                  <option value="INEFFECTIVE">{tr("INEFFECTIVE (효과 없음 - 조치 재진행 필요)", "INEFFECTIVE（効果なし - 措置再実施必要）")}</option>
                  <option value="RECHECK_REQUIRED">{tr("RECHECK_REQUIRED (재검증 필요)", "RECHECK_REQUIRED（再検証必要）")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검증자", "検証者")}</label>
                <input
                  type="text"
                  value={localizedName({ locale, ko: verifier })}
                  onChange={(e) => setVerifier(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs font-bold"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 shadow-sm"
                >
                  {tr("효과 검증 등록", "効果検証登録")}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검증 내용 및 데이터 증빙 소견", "検証内容およびデータ根拠所見")}</label>
              <input
                type="text"
                value={localizedName({ locale, ko: verificationContent })}
                onChange={(e) => setVerificationContent(e.target.value)}
                placeholder={tr("개선 조치 후 모니터링 데이터 및 효과 검증 소견을 입력하세요...", "改善措置後のモニタリングデータおよび効果検証所見を入力してください...")}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </form>

          {/* 최종 종결 처리 */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <div>
              {item.verificationStatus === "EFFECTIVE" ? (
                <button
                  type="button"
                  onClick={handleCloseSubmit}
                  className="px-4 py-2 text-sm font-bold text-white bg-green-700 rounded-lg hover:bg-green-800 shadow-md"
                >
                  {tr("✓ 시정조치 최종 종결 (CLOSED)", "✓ 是正措置最終終結（CLOSED）")}
                </button>
              ) : (
                <p className="text-xs text-red-600 font-semibold">
                  {tr("⚠️ 효과 검증 결과가 [EFFECTIVE(효과 있음)]인 경우에만 최종 종결(CLOSED)할 수 있습니다.", "⚠️ 効果検証結果が［EFFECTIVE（効果あり）］の場合のみ最終終結（CLOSED）できます。")}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {tr("닫기", "閉じる")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
