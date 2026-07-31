import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import type { ReportFilter } from "@/types/reports";
import { aggregateProductionReport } from "@/lib/production-report";
import { exportTableToCsv } from "@/lib/report-csv";
import ReportEmptyState from "./ReportEmptyState";

import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";

// ============================================================
// Tab 2: 생산실적 보고서 컴포넌트
// ============================================================

interface ProductionReportProps {
  filter: ReportFilter;
}

export default function ProductionReport({ filter }: ProductionReportProps) {
  const router = useRouter();
  const [aggType, setAggType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [sortBy, setSortBy] = useState<"achievement" | "defect">("achievement");

  const { plans, workOrders, results } = useProduction();
  const { canAccessProductionLine } = useAdmin();
  const data = aggregateProductionReport(
    { ...filter, aggregationType: aggType },
    {
      plans: plans.filter((item) => canAccessProductionLine(item.productionLine)),
      workOrders: workOrders.filter((item) => canAccessProductionLine(item.productionLine)),
      results: results.filter((item) => canAccessProductionLine(item.productionLine)),
    }
  );

  if (data.summary.totalPlannedQuantity === 0 && data.summary.totalProductionQuantity === 0) {
    return <ReportEmptyState message="선택한 기간 내 생성된 생산실적 데이터가 없습니다." />;
  }

  // 제품별 정렬
  const sortedProductTable = [...data.productAggTable].sort((a, b) => {
    return sortBy === "achievement"
      ? b.achievementRate - a.achievementRate
      : b.defectRate - a.defectRate;
  });

  const handleExportCsv = () => {
    const headers = [
      "생산일",
      "생산계획번호",
      "작업지시번호",
      "생산실적번호",
      "제품코드",
      "제품명",
      "생산라인",
      "계획수량",
      "생산수량",
      "양품수량",
      "불량수량",
      "달성률(%)",
      "불량률(%)",
      "담당자",
    ];

    const rows = data.detailedTable.map((r) => [
      r.productionDate,
      r.planNo,
      r.workOrderNo,
      r.resultNo,
      r.productCode,
      r.productName,
      r.productionLine,
      r.plannedQuantity,
      r.productionQuantity,
      r.goodQuantity,
      r.defectQuantity,
      `${r.achievementRate}%`,
      `${r.defectRate}%`,
      r.handler,
    ]);

    exportTableToCsv(headers, rows, "생산실적보고서");
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 컨트롤 바 (집계 단위 & 정렬 & CSV) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-700">집계 단위:</span>
          {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAggType(type)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                aggType === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "DAILY" ? "일별" : type === "WEEKLY" ? "주별" : "월별"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-700">제품 집계 정렬:</span>
          <button
            onClick={() => setSortBy("achievement")}
            className={`px-2.5 py-1 rounded border font-semibold ${
              sortBy === "achievement" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300"
            }`}
          >
            달성률 높은순
          </button>
          <button
            onClick={() => setSortBy("defect")}
            className={`px-2.5 py-1 rounded border font-semibold ${
              sortBy === "defect" ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-gray-300"
            }`}
          >
            불량률 높은순
          </button>

          <button
            onClick={handleExportCsv}
            className="ml-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
          >
            📊 CSV 내보내기
          </button>
        </div>
      </div>

      {/* 2. 요약 KPI 카드 8종 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">생산계획 건수</p>
          <p className="text-lg font-extrabold text-gray-900 mt-1">{data.summary.planCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">작업 완료 건수</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{data.summary.completedCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">총 계획 수량</p>
          <p className="text-lg font-extrabold text-gray-800 mt-1">{data.summary.totalPlannedQuantity.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">총 생산 수량</p>
          <p className="text-lg font-extrabold text-indigo-600 mt-1">{data.summary.totalProductionQuantity.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">총 양품 수량</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{data.summary.totalGoodQuantity.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20 text-center">
          <p className="text-[11px] text-rose-800 font-bold">총 불량 수량</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{data.summary.totalDefectQuantity.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20 text-center">
          <p className="text-[11px] text-blue-800 font-bold">평균 달성률</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{data.summary.averageAchievementRate}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20 text-center">
          <p className="text-[11px] text-purple-800 font-bold">평균 작업시간</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.averageWorkHours}시간</p>
        </div>
      </div>

      {/* 3. Recharts 생산 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 차트 1: 기간별 계획 대비 실적 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 기간별 생산계획 대비 실적 (개)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}개`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="planQty" name="계획" stroke="#9CA3AF" strokeWidth={2} />
                <Line type="monotone" dataKey="productionQty" name="생산" stroke="#2563EB" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 2: 제품별 생산량 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 주요 제품별 총 생산량 (개)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}개`, "생산량"]} />
                <Legend />
                <Bar dataKey="value" name="생산량" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 라인별 생산량 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 생산라인별 생산 수량 (개)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}개`, "생산량"]} />
                <Legend />
                <Bar dataKey="value" name="생산량" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 불량 유형별 발생 수량 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 불량 유형별 발생 수량 (개)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.defectTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}개`, "불량 수량"]} />
                <Legend />
                <Bar dataKey="count" name="불량 수량" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 제품별 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ 제품별 생산 및 달성·불량 집계 현황</h4>
          <span className="text-gray-500">총 {sortedProductTable.length}개 제품 집계</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[900px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">제품 코드</th>
                <th className="px-4 py-3 font-semibold">제품명</th>
                <th className="px-4 py-3 font-semibold text-right">계획 수량</th>
                <th className="px-4 py-3 font-semibold text-right">생산 수량</th>
                <th className="px-4 py-3 font-semibold text-right">양품 수량</th>
                <th className="px-4 py-3 font-semibold text-right">불량 수량</th>
                <th className="px-4 py-3 font-semibold text-center">달성률 (%)</th>
                <th className="px-4 py-3 font-semibold text-center">불량률 (%)</th>
                <th className="px-4 py-3 font-semibold text-center">생산 횟수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {sortedProductTable.map((p) => (
                <tr key={p.productCode} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{p.productCode}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.productName}</td>
                  <td className="px-4 py-3 text-right font-medium">{p.plannedQuantity.toLocaleString()}개</td>
                  <td className="px-4 py-3 text-right font-extrabold text-blue-600">{p.productionQuantity.toLocaleString()}개</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{p.goodQuantity.toLocaleString()}개</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{p.defectQuantity.toLocaleString()}개</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{p.achievementRate}%</td>
                  <td className="px-4 py-3 text-center font-bold text-rose-600">{p.defectRate}%</td>
                  <td className="px-4 py-3 text-center font-medium">{p.runCount}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 상세 생산실적 데이터 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ 상세 생산실적 전체 이력</h4>
          <span className="text-gray-500">총 {data.detailedTable.length}건 목록</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[1100px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold">생산일</th>
                <th className="px-3 py-2 font-semibold">작업지시 번호</th>
                <th className="px-3 py-2 font-semibold">생산실적 번호</th>
                <th className="px-3 py-2 font-semibold">제품명</th>
                <th className="px-3 py-2 font-semibold">생산라인</th>
                <th className="px-3 py-2 font-semibold text-right">계획 / 실적</th>
                <th className="px-3 py-2 font-semibold text-right">양품 / 불량</th>
                <th className="px-3 py-2 font-semibold text-center">달성률</th>
                <th className="px-3 py-2 font-semibold text-center">담당자</th>
                <th className="px-3 py-2 font-semibold text-center">이동</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {data.detailedTable.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-sans font-medium text-gray-900">{row.productionDate}</td>
                  <td className="px-3 py-2 font-bold text-purple-700">{row.workOrderNo}</td>
                  <td className="px-3 py-2 font-bold text-blue-700">{row.resultNo}</td>
                  <td className="px-3 py-2 font-sans font-semibold text-gray-900">{row.productName}</td>
                  <td className="px-3 py-2 font-sans text-gray-800">{row.productionLine}</td>
                  <td className="px-3 py-2 text-right font-extrabold text-blue-600 font-sans">
                    {row.plannedQuantity.toLocaleString()} / {row.productionQuantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-sans">
                    <span className="text-emerald-600 font-bold">{row.goodQuantity.toLocaleString()}</span> /{" "}
                    <span className="text-rose-600 font-bold">{row.defectQuantity.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-blue-700 font-sans">{row.achievementRate}%</td>
                  <td className="px-3 py-2 text-center font-sans font-medium">{row.handler}</td>
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/production?tab=result`)}
                      className="px-2 py-0.5 text-[11px] font-sans font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      생산 모듈 ↗
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
