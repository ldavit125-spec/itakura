import React from "react";
import type { MaterialShortageItem, MaterialSummary } from "@/types/materials";
import MaterialSummaryCards from "./MaterialSummaryCards";
import { InventoryStatusBadge } from "./MaterialStatusBadge";

interface MaterialShortageTableProps {
  shortageItems: MaterialShortageItem[];
  summary: MaterialSummary;
  onRequestPurchase: (materialCodes: string[]) => void;
  onReceiveMaterial: (materialCode: string) => void;
  onOpenCreate?: () => void;
  canManage: boolean;
}

export default function MaterialShortageTable({
  shortageItems,
  summary,
  onRequestPurchase,
  onReceiveMaterial,
  onOpenCreate,
  canManage,
}: MaterialShortageTableProps) {
  return (
    <div className="p-4 sm:p-6">
      <MaterialSummaryCards summary={summary} />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span>안전재고 미만 자재 목록</span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {shortageItems.length}건
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            작업 메뉴에서 발주 요청하고, 도착한 자재는 기존 입고 절차로 처리할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              부족자재등록
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm text-gray-700">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">자재 코드</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 text-right font-semibold">현재 재고</th>
              <th className="px-4 py-3 text-right font-semibold">안전 재고</th>
              <th className="px-4 py-3 text-right font-semibold text-red-600">부족 수량</th>
              <th className="px-4 py-3 font-semibold">단위</th>
              <th className="px-4 py-3 font-semibold">기본 거래처</th>
              <th className="px-4 py-3 text-center font-semibold">재고 상태</th>
              <th className="px-4 py-3 text-center font-semibold">발주 상태</th>
              <th className="px-4 py-3 text-center font-semibold">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shortageItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  현재 안전재고 미만인 부족 자재가 없습니다.
                </td>
              </tr>
            ) : (
              shortageItems.map((item) => {
                const isCritical = item.inventoryStatus === "CRITICAL";
                const isRequested = item.orderStatus === "REQUESTED";
                return (
                  <tr key={item.materialCode} className={isCritical ? "bg-red-50/40 hover:bg-red-50" : "bg-amber-50/20 hover:bg-gray-50"}>
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.materialName}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isCritical ? "text-red-600" : "text-amber-600"}`}>{item.currentStock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{item.safetyStock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-red-600">-{item.shortageQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3">{item.defaultSupplier}</td>
                    <td className="px-4 py-3 text-center"><InventoryStatusBadge status={item.inventoryStatus} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isRequested ? "border-blue-200 bg-blue-100 text-blue-700" : "border-red-200 bg-red-100 text-red-700"}`}>
                        {isRequested ? "입고 대기" : "발주 필요"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {canManage && (isRequested ? (
                        <button type="button" onClick={() => onReceiveMaterial(item.materialCode)} className="rounded border border-green-600 bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">입고 처리</button>
                      ) : (
                        <button type="button" onClick={() => onRequestPurchase([item.materialCode])} className="rounded border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">발주 요청</button>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
