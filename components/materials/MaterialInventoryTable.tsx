import React, { useState, useMemo } from "react";
import type { MaterialInventory, InventoryStatus } from "@/types/materials";
import { INVENTORY_STATUS_OPTIONS, STORAGE_LOCATIONS } from "@/constants/material-labels";
import { InventoryStatusBadge } from "./MaterialStatusBadge";

// ============================================================
// 재고 현황 목록 테이블 컴포넌트
// ============================================================

interface MaterialInventoryTableProps {
  inventories: MaterialInventory[];
  onOpenDetail: (item: MaterialInventory) => void;
}

export default function MaterialInventoryTable({
  inventories,
  onOpenDetail,
}: MaterialInventoryTableProps) {
  const [materialSearch, setMaterialSearch] = useState("");
  const [lotSearch, setLotSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "ALL">("ALL");
  const [locationFilter, setLocationFilter] = useState<string>("ALL");
  const [isExpiringFilter, setIsExpiringFilter] = useState(false);

  const filteredData = useMemo(() => {
    const todayStr = "2026-07-31"; // 기준일
    const thirtyDaysLater = new Date(Date.parse("2026-07-31") + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    return inventories.filter((item) => {
      // 자재명 / 자재코드 검색
      const matchesMaterial =
        !materialSearch ||
        item.materialName.toLowerCase().includes(materialSearch.toLowerCase()) ||
        item.materialCode.toLowerCase().includes(materialSearch.toLowerCase());

      // LOT 검색
      const matchesLot =
        !lotSearch || item.lotNo.toLowerCase().includes(lotSearch.toLowerCase());

      // 재고 상태 필터
      const matchesStatus = statusFilter === "ALL" || item.inventoryStatus === statusFilter;

      // 보관 위치 필터
      const matchesLocation = locationFilter === "ALL" || item.location === locationFilter;

      // 유통기한 임박 필터 (30일 이내 또는 만료)
      const matchesExpiring =
        !isExpiringFilter || (item.expirationDate <= thirtyDaysLater);

      return matchesMaterial && matchesLot && matchesStatus && matchesLocation && matchesExpiring;
    });
  }, [inventories, materialSearch, lotSearch, statusFilter, locationFilter, isExpiringFilter]);

  return (
    <div className="p-4 sm:p-6">
      {/* 검색 및 필터 컨트롤 bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {/* 자재 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="자재명 / 자재코드 검색..."
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* LOT 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="LOT 번호 검색..."
            value={lotSearch}
            onChange={(e) => setLotSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <svg
            className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" />
          </svg>
        </div>

        {/* 재고 상태 필터 */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InventoryStatus | "ALL")}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {INVENTORY_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 보관 위치 필터 */}
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">보관 위치 전체</option>
          {STORAGE_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* 유통기한 임박 토글 버튼 */}
        <button
          onClick={() => setIsExpiringFilter(!isExpiringFilter)}
          className={`px-3 py-2 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
            isExpiringFilter
              ? "bg-orange-600 text-white border-orange-600 shadow-sm"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>유통기한 임박 (30일)</span>
        </button>
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm text-left text-gray-700 min-w-[1050px]">
          <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-semibold">자재 코드</th>
              <th className="px-4 py-3 font-semibold">자재명</th>
              <th className="px-4 py-3 font-semibold">LOT 번호</th>
              <th className="px-4 py-3 font-semibold text-right">현재 재고</th>
              <th className="px-4 py-3 font-semibold text-right">사용 가능</th>
              <th className="px-4 py-3 font-semibold text-right text-purple-700">보류 재고</th>
              <th className="px-4 py-3 font-semibold">단위</th>
              <th className="px-4 py-3 font-semibold text-right">안전 재고</th>
              <th className="px-4 py-3 font-semibold">보관 위치</th>
              <th className="px-4 py-3 font-semibold">유통기한</th>
              <th className="px-4 py-3 font-semibold text-center">재고 상태</th>
              <th className="px-4 py-3 font-semibold text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                  조건에 일치하는 재고 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isLow = item.currentStock < item.safetyStock;
                const isCritical = item.currentStock < item.safetyStock * 0.5;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCritical
                        ? "bg-red-50/50"
                        : isLow
                        ? "bg-amber-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.materialName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block my-1">
                      {item.lotNo}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-gray-900"
                      }`}
                    >
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      {item.availableStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-700">
                      {item.holdStock > 0 ? item.holdStock.toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {item.safetyStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{item.expirationDate}</td>
                    <td className="px-4 py-3 text-center">
                      <InventoryStatusBadge status={item.inventoryStatus} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onOpenDetail(item)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        상세
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
