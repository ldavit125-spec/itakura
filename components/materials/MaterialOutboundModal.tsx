import React, { useState, useEffect, useMemo } from "react";
import type { MaterialOutbound, MaterialInventory } from "@/types/materials";
import { useMasterData } from "@/context/MasterDataContext";
import { OutboundStatusBadge } from "./MaterialStatusBadge";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import DateInput from "@/components/ui/DateInput";

// ============================================================
// 자재 출고 등록 / 상세 모달 컴포넌트
// ============================================================

interface MaterialOutboundModalProps {
  isOpen: boolean;
  mode: "create" | "detail";
  item?: MaterialOutbound;
  inventories: MaterialInventory[];
  onClose: () => void;
  onSubmit: (formData: Omit<MaterialOutbound, "id" | "outboundNo" | "outboundStatus">) => void;
}

export default function MaterialOutboundModal({
  isOpen,
  mode,
  item,
  inventories,
  onClose,
  onSubmit,
}: MaterialOutboundModalProps) {
  const { t, language } = useLanguage();
  const { materials, productionLines } = useMasterData();
  const { getAssignableUsers } = useAdmin();
  const handlers = getAssignableUsers(["MATERIAL_MANAGER", "WORKER"]);

  const [outboundDate, setOutboundDate] = useState("2026-07-31");
  const [materialCode, setMaterialCode] = useState("");
  const [selectedLotNo, setSelectedLotNo] = useState("");
  const [quantity, setQuantity] = useState<number | "">(10);
  const [unit, setUnit] = useState("kg");
  const [productionLine, setProductionLine] = useState("");
  const [workOrderNo, setWorkOrderNo] = useState("WO-20260731-01");
  const [handler, setHandler] = useState<string>(handlers[0]?.name ?? "");
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. 선택 가능한 검사 합격(PASSED) 및 재고 보유 LOT 목록 추출
  const availableLotsForMaterial = useMemo(() => {
    if (!materialCode) return [];
    return inventories.filter(
      (inv) =>
        inv.materialCode === materialCode &&
        inv.inspectionStatus === "PASSED" &&
        inv.availableStock > 0 &&
        inv.inventoryStatus !== "HOLD"
    );
  }, [materialCode, inventories]);

  // 2. FEFO(First-Expired, First-Out) 기반 유통기한 제일 빠른 LOT 추천
  const fefoRecommendedLot = useMemo(() => {
    if (availableLotsForMaterial.length === 0) return null;
    const sorted = [...availableLotsForMaterial].sort((a, b) =>
      a.expirationDate.localeCompare(b.expirationDate)
    );
    return sorted[0];
  }, [availableLotsForMaterial]);

  // 자재 선택 변경 시 FEFO 추천 LOT 자동 세팅
  const handleMaterialChange = (code: string) => {
    setMaterialCode(code);
    const selectedMat = materials.find((m) => m.code === code);
    if (selectedMat) {
      setUnit(selectedMat.unit);
    }
  };

  // availableLotsForMaterial 변경 시 FEFO 추천 LOT 선택
  useEffect(() => {
    if (fefoRecommendedLot) {
      setSelectedLotNo(fefoRecommendedLot.lotNo);
    } else {
      setSelectedLotNo("");
    }
  }, [fefoRecommendedLot]);

  // 모달 오픈 시 초기값 설정
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");

    if (mode === "create") {
      const firstMat = materials[0];
      const firstLine = productionLines[0];
      setOutboundDate("2026-07-31");
      setMaterialCode(firstMat ? firstMat.code : "");
      setUnit(firstMat ? firstMat.unit : "kg");
      setProductionLine(firstLine ? firstLine.name : "");
      setWorkOrderNo("WO-20260731-01");
      setQuantity(10);
      setHandler(handlers[0]?.name ?? "");
      setRemarks("");
    } else if (item) {
      setOutboundDate(item.outboundDate);
      setMaterialCode(item.materialCode);
      setSelectedLotNo(item.lotNo);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setProductionLine(item.productionLine);
      setWorkOrderNo(item.workOrderNo);
      setHandler(item.handler);
      setRemarks(item.remarks || "");
    }
  }, [isOpen, mode, item, materials, productionLines]);

  if (!isOpen) return null;

  // 현재 선택된 LOT의 상세 객체
  const activeSelectedLot = inventories.find(
    (inv) => inv.materialCode === materialCode && inv.lotNo === selectedLotNo
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!materialCode) {
      setErrorMessage("출고할 자재를 선택해주세요.");
      return;
    }

    if (!selectedLotNo || !activeSelectedLot) {
      setErrorMessage("출고할 자재 LOT를 선택해주세요.");
      return;
    }

    // 합격 여부 재검증
    if (activeSelectedLot.inspectionStatus !== "PASSED") {
      setErrorMessage("검사 합격(PASSED) 상태의 LOT만 출고 등록할 수 있습니다.");
      return;
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      setErrorMessage("출고 수량은 0보다 커야 합니다.");
      return;
    }

    // 재고 초과 출고 검증
    if (quantity > activeSelectedLot.availableStock) {
      setErrorMessage(
        `출고 수량(${quantity.toLocaleString()}${unit})이 해당 LOT의 현재 사용 가능 재고(${activeSelectedLot.availableStock.toLocaleString()}${unit})를 초과합니다.`
      );
      return;
    }

    if (!productionLine) {
      setErrorMessage("사용할 생산라인을 선택해주세요.");
      return;
    }

    if (!workOrderNo.trim()) {
      setErrorMessage("작업지시 번호를 입력해주세요.");
      return;
    }

    if (!handler.trim()) {
      setErrorMessage("담당자를 입력해주세요.");
      return;
    }

    const selectedMat = materials.find((m) => m.code === materialCode);
    const materialName = selectedMat ? selectedMat.name : materialCode;

    onSubmit({
      outboundDate,
      materialCode,
      materialName,
      lotNo: selectedLotNo,
      quantity: Number(quantity),
      unit,
      productionLine,
      workOrderNo: workOrderNo.trim(),
      handler: handler.trim(),
      remarks,
    });
  };

  const isDetail = mode === "detail";
  const title = mode === "create" ? "생산용 자재 출고 등록" : "자재 출고 상세 정보";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 에러 메시지 알림 */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 상세 뷰 모드 */}
        {isDetail && item ? (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500">출고 번호</p>
                <p className="font-mono font-bold text-gray-900">{item.outboundNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">출고 상태</p>
                <div className="mt-1">
                  <OutboundStatusBadge status={item.outboundStatus} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-500">출고일:</span>
                <span className="ml-2 text-gray-900 font-semibold">{item.outboundDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">자재:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  [{item.materialCode}] {item.materialName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">자재 LOT:</span>
                <span className="ml-2 font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                  {item.lotNo}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">출고 수량:</span>
                <span className="ml-2 text-gray-900 font-bold">
                  {item.quantity.toLocaleString()} {item.unit}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">생산라인:</span>
                <span className="ml-2 text-gray-900 font-semibold">{item.productionLine}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">작업지시 번호:</span>
                <span className="ml-2 font-mono text-gray-800">{item.workOrderNo}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">담당자:</span>
                <span className="ml-2 text-gray-900">{item.handler}</span>
              </div>
            </div>

            {item.remarks && (
              <div className="pt-2 border-t border-gray-100">
                <p className="font-medium text-gray-500">비고:</p>
                <p className="mt-1 text-gray-700 bg-gray-50 p-2.5 rounded-md">{item.remarks}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          /* 출고 등록 입력 폼 */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 출고일 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  출고일 <span className="text-red-500">*</span>
                </label>
                <DateInput
                  value={outboundDate}
                  onChange={(e) => setOutboundDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 자재 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  자재 <span className="text-red-500">*</span>
                </label>
                <select
                  value={materialCode}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">{t("materials.modal.selectMaterial")}</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.code}>
                      [{mat.code}] {localizedName({ locale: language, ko: mat.name, ja: mat.nameJa })} ({localizedName({ locale: language, ko: mat.unit })})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FEFO 추천 알림 배너 */}
            {materialCode && fefoRecommendedLot && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">
                    FEFO 추천
                  </span>
                  <span>
                    유통기한이 가장 가까운 <strong>{fefoRecommendedLot.lotNo}</strong> (만료: {fefoRecommendedLot.expirationDate}) 이 기본 선택되었습니다.
                  </span>
                </div>
              </div>
            )}

            {materialCode && availableLotsForMaterial.length === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                ⚠️ 출고 가능한 검사 합격(PASSED) 재고 LOT가 없습니다. (보류 또는 불합격 LOT는 출고 불가)
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 자재 LOT 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  자재 LOT (검사 합격 LOT만 표시) <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedLotNo}
                  onChange={(e) => setSelectedLotNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                  required
                  disabled={availableLotsForMaterial.length === 0}
                >
                  {availableLotsForMaterial.length === 0 ? (
                    <option value="">출고 가능 LOT 없음</option>
                  ) : (
                    availableLotsForMaterial.map((lot) => {
                      const isFefo = fefoRecommendedLot?.lotNo === lot.lotNo;
                      return (
                        <option key={lot.id} value={lot.lotNo}>
                          {lot.lotNo} [가용: {lot.availableStock} {localizedName({ locale: language, ko: lot.unit })}] (유통기한: {lot.expirationDate})
                          {isFefo ? " ★ FEFO 추천" : ""}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* 출고 수량 & 가용 재고 표시 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t("materials.outbound.quantity")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="수량 입력"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{t("common.unit")}</label>
                  <input
                    type="text"
                    value={localizedName({ locale: language, ko: unit })}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 현재 선택 LOT 정보 안내 */}
            {activeSelectedLot && (
              <div className="text-xs text-gray-500 flex items-center justify-between px-1">
                <span>{t("materials.inventory.location")}: <strong>{localizedName({ locale: language, ko: activeSelectedLot.location })}</strong></span>
                <span>현재 가용 재고: <strong className="text-green-600">{activeSelectedLot.availableStock.toLocaleString()} {localizedName({ locale: language, ko: unit })}</strong></span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 생산라인 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("materials.outbound.line")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={productionLine}
                  onChange={(e) => setProductionLine(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">{t("materials.modal.selectLine")}</option>
                  {productionLines.map((line) => (
                    <option key={line.id} value={line.name}>
                      {localizedName({ locale: language, ko: line.name, ja: line.nameJa })} ({localizedName({ locale: language, ko: line.process })})
                    </option>
                  ))}
                </select>
              </div>

              {/* 작업지시 번호 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  작업지시 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="material-outbound-handler-options"
                  value={workOrderNo}
                  onChange={(e) => setWorkOrderNo(e.target.value)}
                  placeholder="예: WO-20260731-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <datalist id="material-outbound-handler-options">{handlers.map((user) => <option key={user.id} value={user.name} />)}</datalist>
              </div>

              {/* 담당자 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  담당자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={handler}
                  onChange={(e) => setHandler(e.target.value)}
                  placeholder="담당자 이름"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* 비고 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">비고</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="출고 사유 또는 메모..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 푸터 버튼 */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={availableLotsForMaterial.length === 0}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                출고 처리 완료
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
