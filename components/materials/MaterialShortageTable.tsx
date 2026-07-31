import React, { useMemo } from "react";
import type { MaterialShortageItem, MaterialSummary } from "@/types/materials";
import MaterialSummaryCards from "./MaterialSummaryCards";
import { InventoryStatusBadge } from "./MaterialStatusBadge";

// ============================================================
// 재고 부족 현황 전용 목록 컴포넌트 (안전재고 미만 자재만 노출)
// ============================================================

interface MaterialShortageTableProps {
  shortageItems: MaterialShortageItem[];
  summary: MaterialSummary;
}

export default function MaterialShortageTable({
  shortageItems,
  summary,
}: MaterialShortageTableProps) {
  return (
    <div className="p-4 sm:p-6">
      {/* 1. 상단 요약 카운트 카드 */}
      <MaterialSummaryCards summary={summary} />

      {/* 2. 테이블 제목 및 통합 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>안전재고 미만 자재 목록</span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
              {shortageItems.length}건
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            현재 보유 재고가 안전재고 기준치보다 적어 신규 수급이 필요한 자재 목록입니다.
          </p>
        </div>
      </div>

      {/* 3. 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[900px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">자재 코드</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 font-semibold text-right">현재 재고</th>
              <th className="px-4 py-3 font-semibold text-right">안전 재고</th>
              <th className="px-4 py-3 font-semibold text-right text-red-600">부족 수량</th>
              <th className="px-4 py-3 font-semibold">단위</th>
              <th className="px-4 py-3 font-semibold">기본 거래처</th>
              <th className="px-4 py-3 font-semibold text-center">재고 상태</th>
              <th className="px-4 py-3 font-semibold text-center">발주 필요 여부</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shortageItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  🎉 현재 안전재고 미만인 부족 자재가 없습니다.
                </td>
              </tr>
            ) : (
              shortageItems.map((item) => {
                const isCritical = item.inventoryStatus === "CRITICAL";

                return (
                  <tr
                    key={item.materialCode}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCritical ? "bg-red-50/40" : "bg-amber-50/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.materialName}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        isCritical ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-700">
                      {item.safetyStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-red-600">
                      -{item.shortageQty.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 text-gray-800">{item.defaultSupplier}</td>
                    <td className="px-4 py-3 text-center">
                      <InventoryStatusBadge status={item.inventoryStatus} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                        발주 필요
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        disabled
                        title="실제 발주 기능은 준비 중입니다."
                        className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded cursor-not-allowed"
                      >
                        발주 요청
                      </button>
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
