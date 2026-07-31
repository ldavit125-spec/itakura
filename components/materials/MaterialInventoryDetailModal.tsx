import React from "react";
import type { MaterialInventory } from "@/types/materials";
import { InventoryStatusBadge, InspectionStatusBadge } from "./MaterialStatusBadge";

// ============================================================
// 재고 상세 정보 모달 컴포넌트
// ============================================================

interface MaterialInventoryDetailModalProps {
  isOpen: boolean;
  item?: MaterialInventory;
  onClose: () => void;
}

export default function MaterialInventoryDetailModal({
  isOpen,
  item,
  onClose,
}: MaterialInventoryDetailModalProps) {
  if (!isOpen || !item) return null;

  const isLow = item.currentStock < item.safetyStock;
  const shortageAmount = isLow ? item.safetyStock - item.currentStock : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 my-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">재고 LOT 상세 정보</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{item.lotNo}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* 주요 수량 수치 강조 카드 */}
          <div className="grid grid-cols-3 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
            <div>
              <p className="text-xs font-semibold text-gray-500">현재 재고</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {item.currentStock.toLocaleString()} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700">사용 가능</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {item.availableStock.toLocaleString()} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-700">보류 재고</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {item.holdStock.toLocaleString()} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
              </p>
            </div>
          </div>

          {/* 안전재고 및 상태 판정 알림 */}
          {isLow && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>안전재고({item.safetyStock.toLocaleString()} {item.unit}) 대비 <strong>{shortageAmount.toLocaleString()} {item.unit}</strong> 부족합니다.</span>
              </div>
            </div>
          )}

          {/* 세부 항목 라벨 그리드 */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-b border-gray-100 py-3">
            <div>
              <span className="text-gray-500 font-medium">자재 코드:</span>
              <span className="ml-2 font-mono font-semibold text-gray-900">{item.materialCode}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">자재명:</span>
              <span className="ml-2 font-semibold text-gray-900">{item.materialName}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">보관 위치:</span>
              <span className="ml-2 text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-xs">{item.location}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">기본 거래처:</span>
              <span className="ml-2 text-gray-800">{item.supplierName}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">유통기한:</span>
              <span className="ml-2 font-mono font-medium text-gray-900">{item.expirationDate}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">안전 재고:</span>
              <span className="ml-2 text-gray-800">{item.safetyStock.toLocaleString()} {item.unit}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">검사 상태:</span>
              <span className="ml-2 inline-block">
                <InspectionStatusBadge status={item.inspectionStatus} />
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium">재고 상태:</span>
              <span className="ml-2 inline-block">
                <InventoryStatusBadge status={item.inventoryStatus} />
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
