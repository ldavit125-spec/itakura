import React from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import type { ReportFilter } from "@/types/reports";
import { aggregateMaterialReport } from "@/lib/material-report";
import { exportTableToCsv } from "@/lib/report-csv";
import { EXPIRATION_STATUS_LABELS, EXPIRATION_STATUS_STYLES } from "@/constants/report-labels";
import ReportEmptyState from "./ReportEmptyState";

import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";

// ============================================================
// Tab 3: 자재·재고 보고서 컴포넌트
// ============================================================

interface MaterialInventoryReportProps {
  filter: ReportFilter;
}

const PIE_COLORS = ["#10B981", "#F59E0B", "#F97316", "#3B82F6", "#EF4444"];

export default function MaterialInventoryReport({ filter }: MaterialInventoryReportProps) {
  const router = useRouter();
  const { inbounds, inventories, outbounds } = useMaterials();
  const { materials } = useMasterData();

  const data = aggregateMaterialReport(filter, { inbounds, inventories, outbounds, materials });

  if (data.materialAggTable.length === 0) {
    return <ReportEmptyState message="선택한 조건에 해당하는 자재 재고 데이터가 없습니다." />;
  }

  const handleExportCsv = () => {
    const headers = [
      "자재코드",
      "자재명",
      "입고수량",
      "출고수량",
      "현재재고",
      "사용가능재고",
      "보류재고",
      "안전재고",
      "부족수량",
      "단위",
      "재고상태",
      "기본거래처",
    ];

    const rows = data.materialAggTable.map((m) => [
      m.materialCode,
      m.materialName,
      m.totalInboundQty,
      m.totalOutboundQty,
      m.currentStock,
      m.availableStock,
      m.holdStock,
      m.safetyStock,
      m.shortageQty,
      m.unit,
      m.inventoryStatus,
      m.defaultSupplier,
    ]);

    exportTableToCsv(headers, rows, "자재재고보고서");
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 내보내기 버튼 바 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="text-xs text-gray-500 font-semibold">
          💡 자재 단위별(kg, 판 등) 상이한 수치는 각각 독립 단위로 표출됩니다.
        </div>
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          📊 CSV 내보내기
        </button>
      </div>

      {/* 2. 요약 KPI 카드 8종 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">총 입고 수량</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{data.summary.totalInboundQuantity.toLocaleString()}건/kg</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">총 출고 수량</p>
          <p className="text-lg font-extrabold text-purple-600 mt-1">{data.summary.totalOutboundQuantity.toLocaleString()}건/kg</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">현재 재고 자재</p>
          <p className="text-lg font-extrabold text-gray-900 mt-1">{data.summary.currentStockMaterialCount}종</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20 text-center">
          <p className="text-[11px] text-amber-800 font-bold">안전재고 미달</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">{data.summary.shortageMaterialCount}종</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-sm bg-red-50/20 text-center">
          <p className="text-[11px] text-red-800 font-bold">긴급 부족 자재</p>
          <p className="text-lg font-extrabold text-red-600 mt-1">{data.summary.criticalShortageCount}종</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-orange-200 shadow-sm bg-orange-50/20 text-center">
          <p className="text-[11px] text-orange-800 font-bold">유통기한 임박 LOT</p>
          <p className="text-lg font-extrabold text-orange-700 mt-1">{data.summary.expiringSoonLotCount}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20 text-center">
          <p className="text-[11px] text-purple-800 font-bold">사용 보류 LOT</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.holdLotCount}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20 text-center">
          <p className="text-[11px] text-rose-800 font-bold">유통기한 만료</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{data.summary.expiredLotCount}개</p>
        </div>
      </div>

      {/* 3. Recharts 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 차트 1: 기간별 입고/출고 추이 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 기간별 자재 입고·출고 추이</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.inOutTrendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}`, "수량"]} />
                <Legend />
                <Line type="monotone" dataKey="inboundQty" name="입고 수량" stroke="#2563EB" strokeWidth={2.5} />
                <Line type="monotone" dataKey="outboundQty" name="출고 수량" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 2: 자재별 현재 재고 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 원재료별 현재 재고 현황</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockByMaterialChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any, _, item: any) => [`${Number(val || 0).toLocaleString()} ${item?.payload?.unit || ""}`, "현재재고"]} />
                <Legend />
                <Bar dataKey="stock" name="현재재고" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 안전재고 대비 현재재고 (Double Bar) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 안전재고 대비 현재 재고 비교</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockVsSafetyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}`, ""]} />
                <Legend />
                <Bar dataKey="stock" name="현재 재고" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="safetyStock" name="안전 재고" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 재고 상태 비율 (도넛) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 재고 상태 비율</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.inventoryStatusRatioChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {data.inventoryStatusRatioChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}개`, "LOT 건수"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 자재별 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ 자재별 통합 재고 및 부족 현황</h4>
          <span className="text-gray-500">총 {data.materialAggTable.length}개 자재 집계</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[950px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">자재 코드</th>
                <th className="px-4 py-3 font-semibold">자재명</th>
                <th className="px-4 py-3 font-semibold text-right">총 입고량</th>
                <th className="px-4 py-3 font-semibold text-right">총 출고량</th>
                <th className="px-4 py-3 font-semibold text-right">현재 재고</th>
                <th className="px-4 py-3 font-semibold text-right">사용 가능</th>
                <th className="px-4 py-3 font-semibold text-right">안전 재고</th>
                <th className="px-4 py-3 font-semibold text-right">부족 수량</th>
                <th className="px-4 py-3 font-semibold text-center">재고 상태</th>
                <th className="px-4 py-3 font-semibold">기본 거래처</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {data.materialAggTable.map((m) => (
                <tr key={m.materialCode} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{m.materialCode}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{m.materialName}</td>
                  <td className="px-4 py-3 text-right font-medium">{m.totalInboundQty.toLocaleString()} {m.unit}</td>
                  <td className="px-4 py-3 text-right font-medium">{m.totalOutboundQty.toLocaleString()} {m.unit}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-blue-600">{m.currentStock.toLocaleString()} {m.unit}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{m.availableStock.toLocaleString()} {m.unit}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">{m.safetyStock.toLocaleString()} {m.unit}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">
                    {m.shortageQty > 0 ? `${m.shortageQty.toLocaleString()} ${m.unit}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold border ${
                        m.currentStock < m.safetyStock
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-green-100 text-green-800 border-green-200"
                      }`}
                    >
                      {m.currentStock < m.safetyStock ? "부족" : "정상"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.defaultSupplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. LOT별 재고 상세 테이블 (유통기한 남은일수 포함) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ LOT별 재고 현황 및 유통기한 남은 일수</h4>
          <span className="text-gray-500">총 {data.lotInventoryTable.length}개 LOT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[1050px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold">자재 코드 / 자재명</th>
                <th className="px-3 py-2 font-semibold">원재료 LOT 번호</th>
                <th className="px-3 py-2 font-semibold text-right">입고 수량</th>
                <th className="px-3 py-2 font-semibold text-right">현재 재고</th>
                <th className="px-3 py-2 font-semibold">제조일</th>
                <th className="px-3 py-2 font-semibold">유통기한</th>
                <th className="px-3 py-2 font-semibold text-center">남은 유효일</th>
                <th className="px-3 py-2 font-semibold text-center">검사 상태</th>
                <th className="px-3 py-2 font-semibold text-center">유통기한 상태</th>
                <th className="px-3 py-2 font-semibold text-center">이동</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {data.lotInventoryTable.map((lot) => (
                <tr key={lot.lotNo} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-sans font-semibold text-gray-900">
                    [{lot.materialCode}] {lot.materialName}
                  </td>
                  <td className="px-3 py-2 font-bold text-purple-700">{lot.lotNo}</td>
                  <td className="px-3 py-2 text-right font-sans">{lot.inboundQty.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-extrabold text-blue-600 font-sans">
                    {lot.currentStock.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{lot.manufactureDate}</td>
                  <td className="px-3 py-2 font-bold text-amber-700">{lot.expirationDate}</td>
                  <td className="px-3 py-2 text-center font-bold font-sans">
                    {lot.remainingDays > 0 ? (
                      <span className="text-blue-700">{lot.remainingDays}일 남음</span>
                    ) : (
                      <span className="text-red-600">만료됨</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                      {lot.inspectionStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${EXPIRATION_STATUS_STYLES[lot.expirationStatus]}`}>
                      {EXPIRATION_STATUS_LABELS[lot.expirationStatus]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-sans whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/materials?tab=inventory&lot=${encodeURIComponent(lot.lotNo)}`)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                    >
                      자재 모듈 ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
