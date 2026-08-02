import React, { useState, useEffect } from "react";
import type { MaterialInbound, InspectionStatus } from "@/types/materials";
import { useMasterData } from "@/context/MasterDataContext";
import { INSPECTION_STATUS_OPTIONS } from "@/constants/material-labels";
import { InspectionStatusBadge, InboundStatusBadge } from "./MaterialStatusBadge";

// ============================================================
// 자재 입고 등록 / 수정 / 상세 모달 컴포넌트
// ============================================================

interface MaterialInboundModalProps {
  isOpen: boolean;
  mode: "create" | "edit" | "detail";
  item?: MaterialInbound;
  onClose: () => void;
  onSubmit: (formData: Omit<MaterialInbound, "id" | "inboundNo" | "lotNo" | "inboundStatus">) => void;
  onUpdate?: (id: string, updated: Partial<MaterialInbound>) => void;
  initialValues?: Partial<MaterialInbound>;
}

export default function MaterialInboundModal({
  isOpen,
  mode,
  item,
  onClose,
  onSubmit,
  onUpdate,
  initialValues,
}: MaterialInboundModalProps) {
  const { materials, suppliers } = useMasterData();

  const [inboundDate, setInboundDate] = useState("2026-07-31");
  const [materialCode, setMaterialCode] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [quantity, setQuantity] = useState<number | "">(100);
  const [unit, setUnit] = useState("kg");
  const [manufactureDate, setManufactureDate] = useState("2026-07-31");
  const [expirationDate, setExpirationDate] = useState("2027-01-31");
  const [inspectionStatus, setInspectionStatus] = useState<InspectionStatus>("PASSED");
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 자재 선택 시 단위 및 기본 거래처 자동 채우기
  const handleMaterialChange = (code: string) => {
    setMaterialCode(code);
    const selectedMat = materials.find((m) => m.code === code);
    if (selectedMat) {
      setUnit(selectedMat.unit);
      if (selectedMat.defaultSupplier) {
        setSupplierName(selectedMat.defaultSupplier);
      }
    }
  };

  // 모달 열릴 때 초기값 세팅
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage("");

    if (mode === "create") {
      const firstMat = materials[0];
      const presetMaterial = materials.find((material) => material.code === initialValues?.materialCode);
      setInboundDate(initialValues?.inboundDate || "2026-07-31");
      setMaterialCode(presetMaterial?.code || firstMat?.code || "");
      setUnit(initialValues?.unit || presetMaterial?.unit || firstMat?.unit || "kg");
      setSupplierName(initialValues?.supplierName || presetMaterial?.defaultSupplier || firstMat?.defaultSupplier || suppliers[0]?.name || "");
      setQuantity(initialValues?.quantity || 100);
      setManufactureDate("2026-07-31");
      setExpirationDate("2027-01-31");
      setInspectionStatus("PASSED");
      setRemarks(initialValues?.remarks || "");
    } else if (item) {
      setInboundDate(item.inboundDate);
      setMaterialCode(item.materialCode);
      setSupplierName(item.supplierName);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setManufactureDate(item.manufactureDate);
      setExpirationDate(item.expirationDate);
      setInspectionStatus(item.inspectionStatus);
      setRemarks(item.remarks || "");
    }
  }, [isOpen, mode, item, materials, suppliers, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 검증 규칙
    if (!materialCode) {
      setErrorMessage("자재를 선택해주세요.");
      return;
    }
    if (!supplierName) {
      setErrorMessage("거래처를 선택해주세요.");
      return;
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      setErrorMessage("입고 수량은 0보다 커야 합니다.");
      return;
    }
    if (manufactureDate && expirationDate && expirationDate < manufactureDate) {
      setErrorMessage("유통기한은 제조일보다 이전 일자일 수 없습니다.");
      return;
    }

    const selectedMat = materials.find((m) => m.code === materialCode);
    const materialName = selectedMat ? selectedMat.name : materialCode;

    if (mode === "create") {
      onSubmit({
        inboundDate,
        materialCode,
        materialName,
        supplierName,
        quantity: Number(quantity),
        unit,
        manufactureDate,
        expirationDate,
        inspectionStatus,
        remarks,
      });
    } else if (mode === "edit" && item && onUpdate) {
      onUpdate(item.id, {
        inboundDate,
        materialCode,
        materialName,
        supplierName,
        quantity: Number(quantity),
        unit,
        manufactureDate,
        expirationDate,
        inspectionStatus,
        remarks,
      });
    }
  };

  const isDetail = mode === "detail";
  const title =
    mode === "create" ? "자재 입고 등록" : mode === "edit" ? "자재 입고 정보 수정" : "자재 입고 상세 조회";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 my-8">
        {/* 모달 헤더 */}
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

        {/* 에러 메시지 표시 */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 상세 모드 정보 뷰 */}
        {isDetail && item ? (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <p className="text-xs text-gray-500">입고 번호</p>
                <p className="font-mono font-bold text-gray-900">{item.inboundNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">자재 LOT</p>
                <p className="font-mono font-bold text-blue-600">{item.lotNo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">검사 상태</p>
                <div className="mt-1">
                  <InspectionStatusBadge status={item.inspectionStatus} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">입고 상태</p>
                <div className="mt-1">
                  <InboundStatusBadge status={item.inboundStatus} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-500">입고일:</span>
                <span className="ml-2 text-gray-900 font-semibold">{item.inboundDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">자재:</span>
                <span className="ml-2 text-gray-900 font-semibold">
                  [{item.materialCode}] {item.materialName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">거래처:</span>
                <span className="ml-2 text-gray-900">{item.supplierName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">입고 수량:</span>
                <span className="ml-2 text-gray-900 font-bold">
                  {item.quantity.toLocaleString()} {item.unit}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">제조일:</span>
                <span className="ml-2 text-gray-900">{item.manufactureDate}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500">유통기한:</span>
                <span className="ml-2 text-gray-900">{item.expirationDate}</span>
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
          /* 입력 폼 (create / edit) */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "edit" && item && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono text-blue-800 flex justify-between">
                <span>입고번호: {item.inboundNo}</span>
                <span>LOT: {item.lotNo}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 입고일 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  입고일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={inboundDate}
                  onChange={(e) => setInboundDate(e.target.value)}
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
                  <option value="">-- 자재 선택 --</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.code}>
                      [{mat.code}] {mat.name} ({mat.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* 거래처 선택 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  거래처 <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- 거래처 선택 --</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.name}>
                      {sup.name} [{sup.code}]
                    </option>
                  ))}
                </select>
              </div>

              {/* 입고 수량 및 단위 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    입고 수량 <span className="text-red-500">*</span>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">단위</label>
                  <input
                    type="text"
                    value={unit}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* 제조일 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">제조일</label>
                <input
                  type="date"
                  value={manufactureDate}
                  onChange={(e) => setManufactureDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 유통기한 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  유통기한 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 검사 상태 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  검사 상태 <span className="text-red-500">*</span>
                </label>
                <select
                  value={inspectionStatus}
                  onChange={(e) => setInspectionStatus(e.target.value as InspectionStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {INSPECTION_STATUS_OPTIONS.filter((o) => o.value !== "ALL").map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 비고 */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">비고</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="특이사항 또는 특이 입고 사유 입력..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 모달 푸터 */}
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
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === "create" ? "입고 저장" : "수정 완료"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
