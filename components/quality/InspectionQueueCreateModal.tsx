import React, { useState, useEffect } from "react";
import type { InspectionCategory, PriorityLevel, InspectionQueueItem } from "@/types/quality";
import { useLanguage } from "@/context/LanguageContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 신규 검사 요청 등록 모달 컴포넌트
// ============================================================

interface InspectionQueueCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<InspectionQueueItem, "id" | "requestNo" | "requestTime" | "status">) => boolean;
}

export default function InspectionQueueCreateModal({
  isOpen,
  onClose,
  onSubmit,
}: InspectionQueueCreateModalProps) {
  const { t, locale } = useLanguage();
  const { currentUser } = useAdmin();

  // Context 데이터 안전하게 가져오기 (선택 가능 목록용)
  let inventories: any[] = [];
  try {
    const matContext = useMaterials();
    if (matContext && matContext.inventories) {
      inventories = matContext.inventories;
    }
  } catch (e) {
    inventories = [];
  }

  let workOrders: any[] = [];
  let fgLots: any[] = [];
  try {
    const prodContext = useProduction();
    if (prodContext) {
      workOrders = prodContext.workOrders || [];
      fgLots = prodContext.fgLots || [];
    }
  } catch (e) {
    workOrders = [];
    fgLots = [];
  }

  // 폼 상태
  const [category, setCategory] = useState<InspectionCategory>("INCOMING");
  const [selectedTargetKey, setSelectedTargetKey] = useState<string>("");
  
  // 직접입력 또는 바인딩용 필드
  const [targetNo, setTargetNo] = useState("");
  const [targetName, setTargetName] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [lineOrSupplier, setLineOrSupplier] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("NORMAL");
  const [notes, setNotes] = useState("");

  // 기본 옵션 (Context 데이터가 부족할 경우 대비)
  const DEFAULT_INCOMING_TARGETS = [
    { targetNo: "MAT-001", targetName: "강력분 (밀가루)", lotNo: "INB-20260801-001", lineOrSupplier: "(주)대한제분" },
    { targetNo: "MAT-002", targetName: "천일염 (소금)", lotNo: "INB-20260802-002", lineOrSupplier: "(주)한주소금" },
    { targetNo: "MAT-003", targetName: "무가염 버터", lotNo: "INB-20260803-003", lineOrSupplier: "서울우유협동조합" },
    { targetNo: "MAT-004", targetName: "건조 이스트", lotNo: "INB-20260804-004", lineOrSupplier: "사프 코리아" },
  ];

  const DEFAULT_PROCESS_TARGETS = [
    { targetNo: "WO-20260801-001", targetName: "우유식빵 400g", lotNo: "LOT-20260801-001", lineOrSupplier: "1라인 (식빵)" },
    { targetNo: "WO-20260801-002", targetName: "통밀식빵 450g", lotNo: "LOT-20260801-002", lineOrSupplier: "1라인 (식빵)" },
    { targetNo: "WO-20260802-001", targetName: "단팥빵 100g", lotNo: "LOT-20260802-001", lineOrSupplier: "2라인 (과자빵)" },
    { targetNo: "WO-20260802-002", targetName: "소보로빵 90g", lotNo: "LOT-20260802-002", lineOrSupplier: "2라인 (과자빵)" },
  ];

  const DEFAULT_FINISHED_TARGETS = [
    { targetNo: "PRD-001", targetName: "우유식빵 400g", lotNo: "FG-20260801-001", lineOrSupplier: "1라인 (식빵)" },
    { targetNo: "PRD-002", targetName: "통밀식빵 450g", lotNo: "FG-20260801-002", lineOrSupplier: "1라인 (식빵)" },
    { targetNo: "PRD-003", targetName: "단팥빵 100g", lotNo: "FG-20260802-001", lineOrSupplier: "2라인 (과자빵)" },
    { targetNo: "PRD-004", targetName: "소보로빵 90g", lotNo: "FG-20260802-002", lineOrSupplier: "2라인 (과자빵)" },
  ];

  // 모달 오픈 시 초기화
  useEffect(() => {
    if (isOpen) {
      setCategory("INCOMING");
      setRequester(currentUser?.name || "이임원");
      setPriority("NORMAL");
      setNotes("");
      setSelectedTargetKey("");
      setTargetNo("");
      setTargetName("");
      setLotNo("");
      setLineOrSupplier("");
    }
  }, [isOpen, currentUser]);

  // 카테고리 변경 시 선택 옵션 리셋
  useEffect(() => {
    setSelectedTargetKey("");
    setTargetNo("");
    setTargetName("");
    setLotNo("");
    setLineOrSupplier("");
  }, [category]);

  if (!isOpen) return null;

  // 카테고리별 대상 옵션 구성
  const getTargetOptions = () => {
    if (category === "INCOMING") {
      if (inventories.length > 0) {
        return inventories.map((inv, idx) => ({
          key: `inv-${idx}-${inv.lotNo || idx}`,
          targetNo: inv.materialCode || `MAT-${idx + 1}`,
          targetName: localizedName({ locale, ko: inv.materialName || "자재" }),
          lotNo: inv.lotNo || `INB-LOT-${idx + 1}`,
          lineOrSupplier: localizedName({ locale, ko: inv.supplierName || inv.supplier || "공급사" }),
        }));
      }
      return DEFAULT_INCOMING_TARGETS.map((t, idx) => ({ ...t, key: `def-inc-${idx}` }));
    }

    if (category === "PROCESS") {
      if (workOrders.length > 0) {
        return workOrders.map((wo, idx) => ({
          key: `wo-${idx}-${wo.workOrderNo || idx}`,
          targetNo: wo.workOrderNo || `WO-${idx + 1}`,
          targetName: localizedName({ locale, ko: wo.productName || "제품" }),
          lotNo: wo.lotNo || `LOT-${wo.workOrderNo || idx + 1}`,
          lineOrSupplier: localizedName({ locale, ko: wo.productionLine || "1라인" }),
        }));
      }
      return DEFAULT_PROCESS_TARGETS.map((t, idx) => ({ ...t, key: `def-proc-${idx}` }));
    }

    // FINISHED_GOODS
    if (fgLots.length > 0) {
      return fgLots.map((fg, idx) => ({
        key: `fg-${idx}-${fg.fgLotNo || idx}`,
        targetNo: fg.productCode || `PRD-${idx + 1}`,
        targetName: localizedName({ locale, ko: fg.productName || "완제품" }),
        lotNo: fg.fgLotNo || `FG-LOT-${idx + 1}`,
        lineOrSupplier: localizedName({ locale, ko: fg.productionLine || "1라인" }),
      }));
    }
    return DEFAULT_FINISHED_TARGETS.map((t, idx) => ({ ...t, key: `def-fg-${idx}` }));
  };

  const targetOptions = getTargetOptions();

  // 대상 선택 처리
  const handleSelectTarget = (key: string) => {
    setSelectedTargetKey(key);
    const selected = targetOptions.find((opt) => opt.key === key);
    if (selected) {
      setTargetNo(selected.targetNo);
      setTargetName(selected.targetName);
      setLotNo(selected.lotNo);
      setLineOrSupplier(selected.lineOrSupplier);
    } else {
      setTargetNo("");
      setTargetName("");
      setLotNo("");
      setLineOrSupplier("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetNo.trim() || !targetName.trim() || !lotNo.trim()) {
      alert("검사 대상 및 LOT 정보를 선택하거나 입력해주세요.");
      return;
    }

    if (!requester.trim()) {
      alert("요청자를 입력해주세요.");
      return;
    }

    const success = onSubmit({
      category,
      targetNo: targetNo.trim(),
      targetName: targetName.trim(),
      lotNo: lotNo.trim(),
      lineOrSupplier: lineOrSupplier.trim() || (category === "INCOMING" ? "원재료 공급사" : "생산라인"),
      requester: requester.trim(),
      priority,
      notes: notes.trim() || undefined,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            {t("quality.btn.newInspection")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. 검사 구분* */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t("quality.col.category")} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "INCOMING", label: t("quality.category.incoming") },
                { value: "PROCESS", label: t("quality.category.process") },
                { value: "FINISHED_GOODS", label: t("quality.category.finishedGoods") },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value as InspectionCategory)}
                  className={`py-2.5 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    category === opt.value
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 대상 / LOT 선택* */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {category === "INCOMING" && "원재료 / 입고 LOT 선택 *"}
              {category === "PROCESS" && "작업지시 / 생산 LOT 선택 *"}
              {category === "FINISHED_GOODS" && "완제품 / 완제품 LOT 선택 *"}
            </label>
            <select
              value={selectedTargetKey}
              onChange={(e) => handleSelectTarget(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
            >
              <option value="">-- 검사 대상을 선택하세요 --</option>
              {targetOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  [{opt.targetNo}] {opt.targetName} - LOT: {opt.lotNo} ({opt.lineOrSupplier})
                </option>
              ))}
            </select>
          </div>

          {/* 선택 결과 미리보기 & 직접 수정 필드 */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">대상 번호 / 코드</label>
              <input
                type="text"
                value={targetNo}
                onChange={(e) => setTargetNo(e.target.value)}
                placeholder="예: MAT-001 / WO-001"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">대상명</label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="예: 강력분 / 우유식빵"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">LOT 번호 *</label>
              <input
                type="text"
                value={lotNo}
                onChange={(e) => setLotNo(e.target.value)}
                placeholder="예: INB-20260801-001"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white font-mono text-xs text-blue-700 font-bold focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">라인 / 공급사</label>
              <input
                type="text"
                value={lineOrSupplier}
                onChange={(e) => setLineOrSupplier(e.target.value)}
                placeholder="예: 1라인 / (주)대한제분"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 3. 요청자* & 우선순위* */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                요청자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requester}
                onChange={(e) => setRequester(e.target.value)}
                placeholder="요청자 성명"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                우선순위 <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="URGENT">🔴 긴급 (URGENT)</option>
                <option value="HIGH">🟠 높음 (HIGH)</option>
                <option value="NORMAL">🔵 보통 (NORMAL)</option>
                <option value="LOW">⚪ 낮음 (LOW)</option>
              </select>
            </div>
          </div>

          {/* 4. 비고 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">비고 (특이사항)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="검사 요청 관련 메모나 특별 지시사항을 입력하세요."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 푸터 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t("action.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + {t("quality.btn.newInspection")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
