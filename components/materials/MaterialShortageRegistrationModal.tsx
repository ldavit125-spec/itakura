import React, { useMemo, useState } from "react";
import type { MaterialInventory } from "@/types/materials";
import type { Material } from "@/types/master-data";

interface MaterialShortageRegistrationModalProps {
  isOpen: boolean;
  materials: Material[];
  inventories: MaterialInventory[];
  onClose: () => void;
  onSubmit: (materialCode: string, requiredStock: number, remarks: string) => void;
}

export default function MaterialShortageRegistrationModal({
  isOpen,
  materials,
  inventories,
  onClose,
  onSubmit,
}: MaterialShortageRegistrationModalProps) {
  const activeMaterials = useMemo(
    () => materials.filter((material) => material.status === "ACTIVE"),
    [materials]
  );

  const [materialCode, setMaterialCode] = useState(activeMaterials[0]?.code ?? "");
  const [requiredStock, setRequiredStock] = useState<number | "">(
    activeMaterials[0]?.safetyStock ?? ""
  );
  const [remarks, setRemarks] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedMaterial = activeMaterials.find((material) => material.code === materialCode);
  const currentAvailableStock = inventories
    .filter(
      (inventory) =>
        inventory.materialCode === materialCode &&
        inventory.inspectionStatus === "PASSED" &&
        inventory.inventoryStatus !== "HOLD" &&
        inventory.inventoryStatus !== "EXPIRED"
    )
    .reduce((sum, inventory) => sum + inventory.availableStock, 0);
  const shortageQuantity =
    typeof requiredStock === "number" ? Math.max(0, requiredStock - currentAvailableStock) : 0;

  if (!isOpen) return null;

  const handleMaterialChange = (code: string) => {
    const material = activeMaterials.find((item) => item.code === code);
    setMaterialCode(code);
    setRequiredStock(material?.safetyStock ?? "");
    setErrorMessage("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMaterial) {
      setErrorMessage("부족 자재를 선택해 주세요.");
      return;
    }
    if (typeof requiredStock !== "number" || !Number.isFinite(requiredStock) || requiredStock <= 0) {
      setErrorMessage("필요 재고 기준은 0보다 커야 합니다.");
      return;
    }
    if (requiredStock <= currentAvailableStock) {
      setErrorMessage("필요 재고 기준은 현재 가용재고보다 커야 부족 자재로 등록됩니다.");
      return;
    }

    onSubmit(materialCode, requiredStock, remarks.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">부족 자재 등록</h3>
            <p className="mt-0.5 text-xs text-gray-500">자재별 필요 재고 기준을 등록합니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="shortage-material" className="mb-1.5 block text-sm font-semibold text-gray-700">
              부족 자재 <span className="text-red-500">*</span>
            </label>
            <select
              id="shortage-material"
              value={materialCode}
              onChange={(event) => handleMaterialChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {activeMaterials.map((material) => (
                <option key={material.id} value={material.code}>
                  [{material.code}] {material.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">현재 가용재고</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {currentAvailableStock.toLocaleString()} {selectedMaterial?.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">등록 후 부족 수량</p>
              <p className="mt-1 text-lg font-extrabold text-red-600">
                {shortageQuantity.toLocaleString()} {selectedMaterial?.unit}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="required-stock" className="mb-1.5 block text-sm font-semibold text-gray-700">
              필요 재고 기준 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="required-stock"
                type="number"
                min="0.001"
                step="0.001"
                value={requiredStock}
                onChange={(event) =>
                  setRequiredStock(event.target.value === "" ? "" : Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-right text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <span className="min-w-10 text-sm font-medium text-gray-600">{selectedMaterial?.unit}</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              현재 가용재고보다 큰 값을 입력하면 부족 현황에 즉시 반영됩니다.
            </p>
          </div>

          <div>
            <label htmlFor="shortage-remarks" className="mb-1.5 block text-sm font-semibold text-gray-700">
              등록 사유
            </label>
            <textarea
              id="shortage-remarks"
              rows={3}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="예: 다음 주 생산계획 대비 필요 재고 상향"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
              부족 자재 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
