import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import type { ProcessInspection, ProcessCode, InspectionJudgment, InspectionItemResult } from "@/types/quality";
import { useProduction } from "@/context/ProductionContext";
import { PROCESS_INSPECTION_STANDARDS } from "@/data/inspection-standards";
import { PROCESS_CODE_OPTIONS } from "@/constants/quality-labels";
import InspectionItemForm from "./InspectionItemForm";
import { useAdmin } from "@/context/AdminContext";

// ============================================================
// 공정검사 등록 / 판정 모달 컴포넌트
// ============================================================

interface ProcessInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: Omit<ProcessInspection, "id" | "pqcNo" | "status" | "statusHistory">
  ) => boolean;
}

export default function ProcessInspectionModal({
  isOpen,
  onClose,
  onSubmit,
}: ProcessInspectionModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const { workOrders } = useProduction();
  const { getAssignableUsers } = useAdmin();
  const workers = getAssignableUsers(["WORKER", "PRODUCTION_MANAGER"]);
  const inspectors = getAssignableUsers(["QUALITY_MANAGER"]);

  const [selectedWorkOrderNo, setSelectedWorkOrderNo] = useState("");
  const [productionDate, setProductionDate] = useState("2026-07-31");
  const [productCode, setProductCode] = useState("PRD-001");
  const [productName, setProductName] = useState("식빵");
  const [productionLine, setProductionLine] = useState("1호 라인");
  const [process, setProcess] = useState<ProcessCode>("BAKING");
  const [inspectionTiming, setInspectionTiming] = useState("소성 중반 샘플링");
  const [worker, setWorker] = useState<string>(workers[0]?.name ?? "");
  const [inspector, setInspector] = useState<string>(inspectors[0]?.name ?? "");
  const [inspectionDate, setInspectionDate] = useState("2026-07-31 11:00");
  const [judgment, setJudgment] = useState<InspectionJudgment>("PASSED");
  const [judgmentReason, setJudgmentReason] = useState("");
  const [items, setItems] = useState<InspectionItemResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // 작업지시 선택 시 제품 및 라인 자동 채우기
  const handleWorkOrderSelect = (woNo: string) => {
    setSelectedWorkOrderNo(woNo);
    const wo = workOrders.find((w) => w.workOrderNo === woNo);
    if (wo) {
      setProductionDate(wo.plannedDate);
      setProductCode(wo.productCode);
      setProductName(wo.productName);
      setProductionLine(wo.productionLine);
      setWorker(wo.handler || workers[0]?.name || "");
    }
  };

  // 공정 선택 시 검사 기준 자동 로드
  const handleProcessChange = (proc: ProcessCode) => {
    setProcess(proc);
    const std = PROCESS_INSPECTION_STANDARDS[proc];
    if (std) {
      setItems(
        std.items.map((it) => ({
          itemName: it.itemName,
          standardValue: it.standardValue,
          measuredValue: it.standardValue.includes("적정") || it.standardValue.includes("양호") ? "적정" : "",
          unit: it.unit,
          isMandatory: it.isMandatory,
          result: "PASS",
        }))
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      const inProgressWO = workOrders.find((w) => w.workStatus === "IN_PROGRESS" || w.workStatus === "PAUSED");
      if (inProgressWO) {
        handleWorkOrderSelect(inProgressWO.workOrderNo);
      } else if (workOrders.length > 0) {
        handleWorkOrderSelect(workOrders[0].workOrderNo);
      }
      handleProcessChange("BAKING");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedWorkOrderNo) {
      setErrorMessage(tr("작업지시를 선택해주세요.", "作業指示を選択してください。"));
      return;
    }

    const success = onSubmit({
      workOrderNo: selectedWorkOrderNo,
      productionDate,
      productCode,
      productName,
      productionLine,
      process,
      inspectionTiming,
      worker,
      inspector,
      inspectionDate,
      judgment,
      judgmentReason,
      items,
    });

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("생산 공정검사 등록 및 판정", "生産工程検査登録および判定")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">PQC (Process Quality Control)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* 기본 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("작업지시 선택", "作業指示選択")} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorkOrderNo}
                onChange={(e) => handleWorkOrderSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {workOrders.map((w) => (
                  <option key={w.id} value={w.workOrderNo}>
                    [{w.workOrderNo}] {w.productName} ({w.productionLine})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("검사 공정", "検査工程")} <span className="text-red-500">*</span>
              </label>
              <select
                value={process}
                onChange={(e) => handleProcessChange(e.target.value as ProcessCode)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                required
              >
                {PROCESS_CODE_OPTIONS.filter((o) => o.value !== "ALL").map((o) => (
                  <option key={o.value} value={o.value}>
                    {localizedName({ locale, ko: o.label })} {tr("공정", "工程")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검사 시점", "検査時点")}</label>
              <input
                type="text"
                list="process-worker-options"
                value={inspectionTiming}
                onChange={(e) => setInspectionTiming(e.target.value)}
                placeholder={tr("예: 소성 중반 210℃ 구간", "例: 焼成中盤210℃区間")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                required
              />
              <datalist id="process-worker-options">{workers.map((user) => <option key={user.id} value={user.name} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("담당 작업자", "担当作業者")}</label>
              <input
                type="text"
                list="process-inspector-options"
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                required
              />
              <datalist id="process-inspector-options">{inspectors.map((user) => <option key={user.id} value={user.name} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("담당 검사원 *", "担当検査員 *")}</label>
              <input
                type="text"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("생산일자", "生産日")}</label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                required
              />
            </div>
          </div>

          {/* 공정 항목 입력 테이블 */}
          <InspectionItemForm items={items} onChange={setItems} />

          {/* 최종 판정 및 소견 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                {tr("최종 판정", "最終判定")} <span className="text-red-500">*</span>
              </label>
              <select
                value={judgment}
                onChange={(e) => setJudgment(e.target.value as InspectionJudgment)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-extrabold focus:outline-none bg-white ${
                  judgment === "PASSED"
                    ? "text-green-700 border-green-400"
                    : judgment === "HOLD"
                    ? "text-amber-800 border-amber-400 bg-amber-50"
                    : judgment === "FAILED"
                    ? "text-red-700 border-red-400 bg-red-50"
                    : "text-teal-800 border-teal-400"
                }`}
                required
              >
                <option value="PASSED">{tr("합격 (PASSED)", "合格（PASSED）")}</option>
                <option value="CONDITIONAL_PASS">{tr("조건부 합격 (CONDITIONAL_PASS)", "条件付き合格（CONDITIONAL_PASS）")}</option>
                <option value="HOLD">{tr("생산 보류 (HOLD - 작업지시 일시정지 연동)", "生産保留（HOLD - 作業指示一時停止連動）")}</option>
                <option value="FAILED">{tr("불합격 (FAILED - 작업지시 일시정지 연동)", "不合格（FAILED - 作業指示一時停止連動）")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("판정 사유 및 조치 사항", "判定理由および措置事項")}
                {(judgment === "HOLD" || judgment === "FAILED" || judgment === "CONDITIONAL_PASS") && (
                  <span className="text-red-500 ml-1">{tr("(필수 입력)", "（入力必須）")}</span>
                )}
              </label>
              <input
                type="text"
                value={judgmentReason}
                onChange={(e) => setJudgmentReason(e.target.value)}
                placeholder={tr("판정 소견 및 공정 조치 사유를 입력하세요...", "判定所見および工程措置理由を入力してください...")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
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
              {tr("공정검사 완료", "工程検査完了")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
