import React, { useState } from "react";
import type { WorkOrder } from "@/types/production";
import { calculateMaterialRequirements } from "@/lib/production-calculations";
import { WorkStatusBadge, MaterialIssueStatusBadge } from "./ProductionStatusBadge";
import MaterialRequirementTable from "./MaterialRequirementTable";
import { useMasterData } from "@/context/MasterDataContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 작업지시 상세 정보 및 작업지시서 서식 모달 컴포넌트
// ============================================================

interface WorkOrderDetailModalProps {
  isOpen: boolean;
  item?: WorkOrder;
  onClose: () => void;
  onAssignHandler: (workOrderId: string, handler: string) => void;
  onMarkReady: (workOrderId: string) => void;
  onNavigateToMaterials: (workOrderNo: string) => void;
}

export default function WorkOrderDetailModal({
  isOpen,
  item,
  onClose,
  onAssignHandler,
  onMarkReady,
  onNavigateToMaterials,
}: WorkOrderDetailModalProps) {
  const [editingHandler, setEditingHandler] = useState("");
  const [isPrintView, setIsPrintView] = useState(false);
  const { materials } = useMasterData();
  const { outbounds, inventories } = useMaterials();
  const { t, language } = useLanguage();

  if (!isOpen || !item) return null;

  const requirements = calculateMaterialRequirements(
    item.productCode,
    item.orderedQuantity,
    item.workOrderNo,
    { materials, outbounds, inventories }
  );

  const handleSaveHandler = () => {
    if (editingHandler.trim()) {
      onAssignHandler(item.id, editingHandler.trim());
      setEditingHandler("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>{localizedName({ locale: language, ko: "작업지시서 상세 정보", ja: "作業指示書詳細" })}</span>
              <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {item.workOrderNo}
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{localizedName({ locale: language, ko: "연동 생산계획", ja: "連携生産計画" })}: {item.planNo}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* 인쇄 서식 보기 토글 */}
            <button
              onClick={() => setIsPrintView(!isPrintView)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                isPrintView
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {isPrintView ? localizedName({ locale: language, ko: "일반 뷰", ja: "通常表示" }) : localizedName({ locale: language, ko: "🖨️ 지시서 서식", ja: "🖨️ 指示書様式" })}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 인쇄 전용 서식 뷰 */}
        {isPrintView ? (
          <div className="p-6 bg-white text-gray-900 border border-gray-300 m-4 rounded shadow-inner space-y-6">
            <div className="text-center border-b-2 border-gray-800 pb-4">
              <h2 className="text-2xl font-black tracking-widest uppercase">{localizedName({ locale: language, ko: "작 업 지 시 서", ja: "作 業 指 示 書" })}</h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">{localizedName({ locale: language, ko: "발행번호", ja: "発行番号" })}: {item.workOrderNo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border p-2">
                <span className="font-bold">{t("production.plan.date")}:</span> {item.plannedDate}
              </div>
              <div className="border p-2">
                <span className="font-bold">{t("master.tab.lines")}:</span> {localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}
              </div>
              <div className="border p-2">
                <span className="font-bold">{t("master.field.productName")}:</span> [{item.productCode}] {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
              </div>
              <div className="border p-2">
                <span className="font-bold">{t("production.workOrder.instructedQty")}:</span> {item.orderedQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
              </div>
              <div className="border p-2">
                <span className="font-bold">{localizedName({ locale: language, ko: "작업 예정시간", ja: "作業予定時間" })}:</span> {item.startTime} ~ {item.endTime}
              </div>
              <div className="border p-2">
                <span className="font-bold">{t("master.field.manager")}:</span> {localizedName({ locale: language, ko: item.handler }) || "미배정"}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold mb-2">{localizedName({ locale: language, ko: "■ 자재 투입 소요량", ja: "■ 資材投入必要量" })}</h5>
              <table className="w-full text-[11px] border border-collapse border-gray-400">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400">
                    <th className="border border-gray-400 p-1">{localizedName({ locale: language, ko: "자재코드", ja: "資材コード" })}</th>
                    <th className="border border-gray-400 p-1">{t("master.field.materialName")}</th>
                    <th className="border border-gray-400 p-1 text-right">{localizedName({ locale: language, ko: "예상 소요량", ja: "予定必要量" })}</th>
                    <th className="border border-gray-400 p-1 text-right">{localizedName({ locale: language, ko: "실제 출고량", ja: "実出庫量" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((r) => (
                    <tr key={r.materialCode}>
                      <td className="border border-gray-400 p-1 font-mono">{r.materialCode}</td>
                      <td className="border border-gray-400 p-1">{localizedName({ locale: language, ko: r.materialName, ja: r.materialNameJa })}</td>
                      <td className="border border-gray-400 p-1 text-right font-bold">
                        {r.requiredQuantity.toLocaleString()} {localizedName({ locale: language, ko: r.unit })}
                      </td>
                      <td className="border border-gray-400 p-1 text-right">
                        {r.issuedQuantity.toLocaleString()} {localizedName({ locale: language, ko: r.unit })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-gray-900 rounded"
              >
                {localizedName({ locale: language, ko: "인쇄하기", ja: "印刷" })}
              </button>
            </div>
          </div>
        ) : (
          /* 일반 화면 뷰 */
          <div className="p-6 space-y-6 text-sm">
            {/* 상태 알림 카드 */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-xs text-gray-500 font-medium">{t("production.workOrder.issueStatus")}</span>
                <div className="mt-1">
                  <MaterialIssueStatusBadge status={item.materialIssueStatus} />
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium">{t("production.workOrder.status")}</span>
                <div className="mt-1">
                  <WorkStatusBadge status={item.workStatus} />
                </div>
              </div>
            </div>

            {/* 기본 정보 라벨 그리드 */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
              <div>
                <span className="text-gray-500 font-medium">{t("production.plan.date")}:</span>
                <span className="ml-2 font-semibold text-gray-900">{item.plannedDate}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.tab.lines")}:</span>
                <span className="ml-2 font-semibold text-gray-900">{localizedName({ locale: language, ko: item.productionLine, ja: item.lineNameJa })}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.field.productName")}:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  [{item.productCode}] {localizedName({ locale: language, ko: item.productName, ja: item.productNameJa })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("production.workOrder.instructedQty")}:</span>
                <span className="ml-2 font-extrabold text-blue-600">
                  {item.orderedQuantity.toLocaleString()} {localizedName({ locale: language, ko: item.unit })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{localizedName({ locale: language, ko: "예정 시간", ja: "予定時間" })}:</span>
                <span className="ml-2 font-mono text-gray-900">
                  {item.startTime} ~ {item.endTime}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">{t("master.field.manager")}:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {localizedName({ locale: language, ko: item.handler }) || "미배정"}
                </span>
              </div>
            </div>

            {item.pauseReason && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                <p className="text-xs font-semibold text-purple-700">{t("production.progress.pauseReason")}</p>
                <p className="mt-1 text-sm text-gray-900">{localizedName({ locale: language, ko: item.pauseReason })}</p>
                {item.pausedAt && <p className="mt-1 text-xs text-gray-500">{localizedName({ locale: language, ko: "정지 시각", ja: "停止時刻" })}: {item.pausedAt}</p>}
              </div>
            )}

            {/* 담당자 배정 입력 */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                {localizedName({ locale: language, ko: "담당자 배정 / 변경", ja: "担当者の割当 / 変更" })}:
              </label>
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder={localizedName({ locale: language, ko: "담당자 이름 입력...", ja: "担当者名を入力..." })}
                  value={editingHandler}
                  onChange={(e) => setEditingHandler(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSaveHandler}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 whitespace-nowrap"
                >
                  {t("action.save")}
                </button>
              </div>
            </div>

            {/* 자재 소요량 표 */}
            <MaterialRequirementTable
              requirements={requirements}
              workOrderNo={item.workOrderNo}
              onNavigateToMaterials={() => {
                onClose();
                onNavigateToMaterials(item.workOrderNo);
              }}
            />

            {/* 모달 푸터 */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                {item.workStatus === "WAITING" && (
                  <button
                    onClick={() => {
                      onMarkReady(item.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
                  >
                    {localizedName({ locale: language, ko: "작업 준비 완료 처리", ja: "作業準備完了にする" })}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {t("action.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
