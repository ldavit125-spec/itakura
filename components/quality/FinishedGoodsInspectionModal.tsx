import React, { useState, useEffect } from "react";
import type { FinishedGoodsInspection, InspectionJudgment, InspectionItemResult } from "@/types/quality";
import { useProduction } from "@/context/ProductionContext";
import { FINISHED_GOODS_STANDARD_ITEMS } from "@/data/inspection-standards";
import { PRODUCT_WEIGHT_STANDARDS, isWeightWithinAllowedRange } from "@/constants/quality-rules";
import InspectionItemForm from "./InspectionItemForm";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 완제품 품질검사 수행 / 등록 모달 컴포넌트
// ============================================================

interface FinishedGoodsInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: Omit<FinishedGoodsInspection, "id" | "fqcNo" | "status" | "statusHistory">
  ) => boolean;
}

export default function FinishedGoodsInspectionModal({
  isOpen,
  onClose,
  onSubmit,
}: FinishedGoodsInspectionModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const { fgLots } = useProduction();
  const { getAssignableUsers } = useAdmin();
  const inspectors = getAssignableUsers(["QUALITY_MANAGER"]);

  const [selectedFgLotNo, setSelectedFgLotNo] = useState("");
  const [resultNo, setResultNo] = useState("");
  const [workOrderNo, setWorkOrderNo] = useState("");
  const [productionDate, setProductionDate] = useState("2026-07-31");
  const [productCode, setProductCode] = useState("PRD-001");
  const [productName, setProductName] = useState("식빵");
  const [productionLine, setProductionLine] = useState("1호 라인");
  const [totalQuantity, setTotalQuantity] = useState<number>(4000);
  const [unit, setUnit] = useState("개");

  const [sampleQuantity, setSampleQuantity] = useState<number>(20);
  const [defectiveSampleQuantity, setDefectiveSampleQuantity] = useState<number>(0);
  const [avgWeight, setAvgWeight] = useState<number>(450);
  const [minWeight, setMinWeight] = useState<number>(442);
  const [maxWeight, setMaxWeight] = useState<number>(458);

  const [inspector, setInspector] = useState<string>(inspectors[0]?.name ?? "");
  const [inspectionDate, setInspectionDate] = useState("2026-07-31 14:00");
  const [judgment, setJudgment] = useState<InspectionJudgment>("PASSED");
  const [judgmentReason, setJudgmentReason] = useState("");
  const [recheckRequired, setRecheckRequired] = useState(false);
  const [items, setItems] = useState<InspectionItemResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // 완제품 LOT 선택 시 정보 및 기본 중량 기준 자동 로드
  const handleFgLotSelect = (fgLotNo: string) => {
    setSelectedFgLotNo(fgLotNo);
    const fg = fgLots.find((f) => f.fgLotNo === fgLotNo);
    if (fg) {
      setResultNo(fg.resultNo);
      setWorkOrderNo(fg.workOrderNo);
      setProductionDate(fg.productionDate);
      setProductCode(fg.productCode);
      setProductName(fg.productName);
      setProductionLine(fg.productionLine);
      setTotalQuantity(fg.totalQuantity);
      setUnit(fg.unit);

      // 제품별 기본 중량 세팅
      const std = PRODUCT_WEIGHT_STANDARDS[fg.productCode];
      if (std) {
        setAvgWeight(std.baseWeight);
        setMinWeight(std.minAllowed + 2);
        setMaxWeight(std.maxAllowed - 2);
      }
    }
  };

  // 중량 변경 시 중량 검사 항목 자동 판정
  const handleWeightChange = (newAvg: number) => {
    setAvgWeight(newAvg);
    const isOk = isWeightWithinAllowedRange(productCode, newAvg);
    setItems((prev) =>
      prev.map((it) =>
        it.itemName.includes("중량")
          ? {
              ...it,
              measuredValue: `${newAvg}g`,
              result: isOk ? "PASS" : "FAIL",
            }
          : it
      )
    );
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      if (fgLots.length > 0) {
        handleFgLotSelect(fgLots[0].fgLotNo);
      }
      setItems(
        FINISHED_GOODS_STANDARD_ITEMS.map((it) => ({
          itemName: it.itemName,
          standardValue: it.standardValue,
          measuredValue: it.standardValue.includes("황금갈색") ? "양호" : "",
          unit: it.unit,
          isMandatory: it.isMandatory,
          result: "PASS",
        }))
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedFgLotNo) {
      setErrorMessage(tr("완제품 LOT를 선택해주세요.", "完成品LOTを選択してください。"));
      return;
    }

    if (defectiveSampleQuantity > sampleQuantity) {
      setErrorMessage(
        tr(`부적합 샘플 수량(${defectiveSampleQuantity}개)이 전체 샘플 수량(${sampleQuantity}개)을 초과할 수 없습니다.`, `不適合サンプル数量（${defectiveSampleQuantity}個）は全サンプル数量（${sampleQuantity}個）を超えることはできません。`)
      );
      return;
    }

    const success = onSubmit({
      fgLotNo: selectedFgLotNo,
      resultNo,
      workOrderNo,
      productionDate,
      productCode,
      productName,
      productionLine,
      totalQuantity,
      unit,
      sampleQuantity,
      defectiveSampleQuantity,
      avgWeight,
      minWeight,
      maxWeight,
      inspector,
      inspectionDate,
      judgment,
      judgmentReason,
      isReleaseAvailable: judgment === "PASSED" || judgment === "CONDITIONAL_PASS",
      recheckRequired,
      items,
    });

    if (success) onClose();
  };

  const stdWeight = PRODUCT_WEIGHT_STANDARDS[productCode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("완제품 품질검사 수행 및 판정", "完成品品質検査実施および判定")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">FQC (Finished Goods Quality Control)</p>
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
          {/* 기본 대상 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("완제품 LOT 선택", "完成品LOT選択")} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFgLotNo}
                onChange={(e) => handleFgLotSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {fgLots.map((f) => (
                  <option key={f.id} value={f.fgLotNo}>
                      [{f.fgLotNo}] {localizedName({ locale, ko: f.productName, ja: f.productNameJa })} ({f.totalQuantity.toLocaleString()}{tr("개", "個")})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("작업지시 번호", "作業指示番号")}</label>
              <input
                type="text"
                list="finished-inspector-options"
                value={workOrderNo}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-100"
              />
              <datalist id="finished-inspector-options">{inspectors.map((user) => <option key={user.id} value={user.name} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("생산 라인", "生産ライン")}</label>
              <input
                type="text"
                value={localizedName({ locale, ko: productionLine })}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-gray-100 font-semibold"
              />
            </div>
          </div>

          {/* 샘플링 및 수치 검사 (중량 자동 평가) */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-indigo-900">
              <span>{tr("■ 샘플링 및 수치 검사 (제품별 중량 표준 연동)", "■ サンプリングおよび数値検査（製品別重量基準連動）")}</span>
              {stdWeight && (
                <span className="font-normal text-indigo-700">
                {tr("기준:", "基準:")} <strong>{stdWeight.baseWeight}g</strong> ({tr("허용범위:", "許容範囲:")} {stdWeight.minAllowed}g ~ {stdWeight.maxAllowed}g)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
              <label className="block text-gray-700 font-medium mb-1">{tr("샘플 수량 (개)", "サンプル数量（個）")}</label>
                <input
                  type="number"
                  min="1"
                  value={sampleQuantity}
                  onChange={(e) => setSampleQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded font-bold"
                  required
                />
              </div>

              <div>
              <label className="block text-red-700 font-bold mb-1">{tr("부적합 샘플 (개)", "不適合サンプル（個）")}</label>
                <input
                  type="number"
                  min="0"
                  max={sampleQuantity}
                  value={defectiveSampleQuantity}
                  onChange={(e) => setDefectiveSampleQuantity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-red-300 rounded font-bold text-red-600"
                  required
                />
              </div>

              <div>
              <label className="block text-indigo-900 font-bold mb-1">{tr("평균 중량 (g) *", "平均重量（g）*")}</label>
                <input
                  type="number"
                  value={avgWeight}
                  onChange={(e) => handleWeightChange(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-indigo-400 rounded font-extrabold text-indigo-700"
                  required
                />
              </div>

              <div>
              <label className="block text-gray-700 font-medium mb-1">{tr("최소 중량 (g)", "最小重量（g）")}</label>
                <input
                  type="number"
                  value={minWeight}
                  onChange={(e) => setMinWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded font-mono"
                />
              </div>

              <div>
              <label className="block text-gray-700 font-medium mb-1">{tr("최대 중량 (g)", "最大重量（g）")}</label>
                <input
                  type="number"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded font-mono"
                />
              </div>
            </div>
          </div>

          {/* 개별 검사 항목 입력 테이블 */}
          <InspectionItemForm items={items} onChange={setItems} />

          {/* 최종 판정 및 소견 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">{tr("담당 검사원 *", "担当検査員 *")}</label>
              <input
                type="text"
                value={localizedName({ locale, ko: inspector })}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold"
                required
              />
            </div>

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
                <option value="PASSED">{tr("합격 (PASSED - 출고 가능 연동)", "合格（PASSED - 出荷可能連動）")}</option>
                <option value="CONDITIONAL_PASS">{tr("조건부 합격 (CONDITIONAL_PASS)", "条件付き合格（CONDITIONAL_PASS）")}</option>
                <option value="HOLD">{tr("보류 (HOLD - 출고 불가)", "保留（HOLD - 出荷不可）")}</option>
                <option value="FAILED">{tr("불합격 (FAILED - 출고 불가)", "不合格（FAILED - 出荷不可）")}</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recheckRequired}
                  onChange={(e) => setRecheckRequired(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>{tr("재검사 필요 여부 체크", "再検査要否を確認")}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {tr("판정 사유 및 출하 승인 소견", "判定理由および出荷承認所見")}
              {(judgment === "HOLD" || judgment === "FAILED" || judgment === "CONDITIONAL_PASS") && (
                <span className="text-red-500 ml-1">{tr("(필수 입력)", "（入力必須）")}</span>
              )}
            </label>
            <textarea
              rows={2}
              value={judgmentReason}
              onChange={(e) => setJudgmentReason(e.target.value)}
              placeholder={tr("완제품 관능 및 출하 판정 사유를 상세히 작성하세요...", "完成品の官能評価および出荷判定理由を詳しく記載してください...")}
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
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
            >
              {tr("완제품 검사 완료", "完成品検査完了")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
