import React from "react";
import type { MaterialRequirement } from "@/types/production";
import { MaterialIssueStatusBadge } from "./ProductionStatusBadge";

// ============================================================
// 작업지시용 BOM 기반 자재 소요량 현황 표 컴포넌트
// ============================================================

interface MaterialRequirementTableProps {
  requirements: MaterialRequirement[];
  workOrderNo: string;
  onNavigateToMaterials?: () => void;
}

export default function MaterialRequirementTable({
  requirements,
  workOrderNo,
  onNavigateToMaterials,
}: MaterialRequirementTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>BOM 기준 자재 예상 소요량 및 출고 현황</span>
          <span className="text-xs font-normal text-gray-500">(1,000개 당 레시피 산출)</span>
        </h4>

        {/* 자재 출고 화면으로 이동 버튼 */}
        <button
          onClick={onNavigateToMaterials}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>자재 출고 화면으로 이동</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-xs text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 font-semibold">자재 코드</th>
              <th className="px-3 py-2 font-semibold">자재명</th>
              <th className="px-3 py-2 font-semibold text-right">예상 소요량</th>
              <th className="px-3 py-2 font-semibold text-right text-blue-700">실제 출고량</th>
              <th className="px-3 py-2 font-semibold text-right text-green-700">가용 재고</th>
              <th className="px-3 py-2 font-semibold">단위</th>
              <th className="px-3 py-2 font-semibold text-center">출고 상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requirements.map((req) => (
              <tr key={req.materialCode} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-gray-600">{req.materialCode}</td>
                <td className="px-3 py-2 font-semibold text-gray-900">{req.materialName}</td>
                <td className="px-3 py-2 text-right font-bold text-gray-900">
                  {req.requiredQuantity.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-bold text-blue-600">
                  {req.issuedQuantity.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-medium text-green-700">
                  {req.currentStock.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-gray-500">{req.unit}</td>
                <td className="px-3 py-2 text-center">
                  <MaterialIssueStatusBadge status={req.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
