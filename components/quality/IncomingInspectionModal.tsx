import React, { useState, useEffect } from "react";
import type { IncomingInspection, InspectionItemResult, InspectionJudgment } from "@/types/quality";
import { RAW_MATERIAL_INSPECTION_STANDARDS } from "@/data/inspection-standards";
import { useMasterData } from "@/context/MasterDataContext";
import InspectionItemForm from "./InspectionItemForm";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 원재료 입고검사 수행 / 등록 모달 컴포넌트
// ============================================================

interface IncomingInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: Omit<IncomingInspection, "id" | "iqcNo" | "status" | "statusHistory">
  ) => boolean;
}

export default function IncomingInspectionModal({
  isOpen,
  onClose,
  onSubmit,
}: IncomingInspectionModalProps) {
  const { locale } = useLanguage();
  const tr = (ko: string, ja: string) => localizedName({ locale, ko, ja });
  const { materials } = useMasterData();
  const { getAssignableUsers } = useAdmin();
  const inspectors = getAssignableUsers(["QUALITY_MANAGER"]);
  const [selectedMaterialCode, setSelectedMaterialCode] = useState("MAT-001");
  const [inboundNo, setInboundNo] = useState("IN-20260731-001");
  const [inboundDate, setInboundDate] = useState("2026-07-31");
  const [lotNo, setLotNo] = useState("LOT-FLOUR-260731-B");
  const [supplierName, setSupplierName] = useState("사쿠라 제분");
  const [quantity, setQuantity] = useState<number>(1000);
  const [unit, setUnit] = useState("kg");
  const [manufactureDate, setManufactureDate] = useState("2026-07-31");
  const [expirationDate, setExpirationDate] = useState("2027-01-31");
  const [inspector, setInspector] = useState<string>(inspectors[0]?.name ?? "");
  const [inspectionDate, setInspectionDate] = useState("2026-07-31 10:00");
  const [judgment, setJudgment] = useState<InspectionJudgment>("PASSED");
  const [judgmentReason, setJudgmentReason] = useState("");
  const [attachmentFileName, setAttachmentFileName] = useState("");
  const [items, setItems] = useState<InspectionItemResult[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // 자재 선택 시 검사 기준 자동 로드
  const handleMaterialChange = (matCode: string) => {
    setSelectedMaterialCode(matCode);
    const mat = materials.find((material) => material.code === matCode);
    if (mat) {
      setSupplierName(mat.defaultSupplier);
      setUnit(mat.unit);
    }
    const std = RAW_MATERIAL_INSPECTION_STANDARDS[matCode];
    if (std) {
      setItems(
        std.items.map((it) => ({
          itemName: it.itemName,
          standardValue: it.standardValue,
          measuredValue: it.standardValue.includes("이상 없음") ? "이상 없음" : "",
          unit: it.unit,
          isMandatory: it.isMandatory,
          result: "PASS",
        }))
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleMaterialChange("MAT-001");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 첨부파일 선택 UI 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const mat = materials.find((material) => material.code === selectedMaterialCode);
    const materialName = mat ? mat.name : "강력분";

    const success = onSubmit({
      inboundNo,
      inboundDate,
      materialCode: selectedMaterialCode,
      materialName,
      lotNo,
      supplierName,
      quantity,
      unit,
      manufactureDate,
      expirationDate,
      inspector,
      inspectionDate,
      judgment,
      judgmentReason,
      items,
      attachmentFileName,
    });

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{tr("원재료 입고검사 수행 및 판정", "原材料受入検査実施および判定")}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">IQC (Incoming Quality Control)</p>
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
          {/* 기본 정보 설정 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {tr("원재료 선택", "原材料選択")} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMaterialCode}
                onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {materials.map((m) => (
                  <option key={m.code} value={m.code}>
                    [{m.code}] {m.name} ({m.defaultSupplier})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("입고 번호 *", "入庫番号 *")}</label>
              <input
                type="text"
                list="incoming-inspector-options"
                value={inboundNo}
                onChange={(e) => setInboundNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                required
              />
              <datalist id="incoming-inspector-options">{inspectors.map((user) => <option key={user.id} value={user.name} />)}</datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("자재 LOT 번호 *", "原材料LOT番号 *")}</label>
              <input
                type="text"
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono font-bold text-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("입고 수량 *", "入庫数量 *")}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold text-right"
                  required
                />
                <span className="self-center text-xs font-semibold text-gray-600">{unit}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("제조일자", "製造日")}</label>
              <input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("유통기한", "賞味期限")}</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white font-semibold text-amber-700"
                required
              />
            </div>
          </div>

          {/* 개별 검사 항목 입력 테이블 */}
          <InspectionItemForm items={items} onChange={setItems} />

          {/* 최종 판정 및 의견 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                {tr("담당 검사원", "担当検査員")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={inspector}
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
                <option value="PASSED">{tr("합격 (PASSED)", "合格（PASSED）")}</option>
                <option value="CONDITIONAL_PASS">{tr("조건부 합격 (CONDITIONAL_PASS)", "条件付き合格（CONDITIONAL_PASS）")}</option>
                <option value="HOLD">{tr("보류 (HOLD)", "保留（HOLD）")}</option>
                <option value="FAILED">{tr("불합격 (FAILED)", "不合格（FAILED）")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{tr("검사 성적서 첨부 (선택)", "検査成績書添付（任意）")}</label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 text-xs font-medium cursor-pointer">
                  {tr("파일 선택", "ファイル選択")}
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                  {attachmentFileName || tr("선택된 파일 없음", "選択されたファイルはありません")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {tr("판정 사유 및 종합 의견", "判定理由および総合意見")}
              {(judgment === "HOLD" || judgment === "FAILED" || judgment === "CONDITIONAL_PASS") && (
                <span className="text-red-500 ml-1">{tr("(해당 판정 시 필수 입력)", "（該当判定時は入力必須）")}</span>
              )}
            </label>
            <textarea
              rows={2}
              value={judgmentReason}
              onChange={(e) => setJudgmentReason(e.target.value)}
              placeholder={tr("검사 소견 및 수입검증 판정 사유를 입력하세요...", "検査所見および受入検証の判定理由を入力してください...")}
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
              {tr("검사 판정 완료", "検査判定完了")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
