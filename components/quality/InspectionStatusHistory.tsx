import React from "react";
import type { InspectionStatusHistoryItem } from "@/types/quality";

// ============================================================
// 검사 상태 변경 이력 조회 전용 컴포넌트 (수정/삭제 불가 불변 로그)
// ============================================================

interface InspectionStatusHistoryProps {
  history: InspectionStatusHistoryItem[];
}

export default function InspectionStatusHistory({ history }: InspectionStatusHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
        상태 변경 이력이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h5 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>상태 변경 이력 로그 (수정/삭제 불가)</span>
      </h5>

      <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-xs text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 font-semibold">변경일시</th>
              <th className="px-3 py-2 font-semibold">이전 상태</th>
              <th className="px-3 py-2 font-semibold">변경 상태</th>
              <th className="px-3 py-2 font-semibold">변경자</th>
              <th className="px-3 py-2 font-semibold">변경 사유 / 메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-gray-600">{item.changeTime}</td>
                <td className="px-3 py-2 text-gray-500">{item.previousStatus}</td>
                <td className="px-3 py-2 font-bold text-blue-600">{item.newStatus}</td>
                <td className="px-3 py-2 font-sans font-medium text-gray-800">{item.changedBy}</td>
                <td className="px-3 py-2 font-sans text-gray-600">{item.reason || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
