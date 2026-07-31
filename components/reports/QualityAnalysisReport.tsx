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
import { aggregateQualityReport } from "@/lib/quality-report";
import { exportTableToCsv } from "@/lib/report-csv";
import ReportEmptyState from "./ReportEmptyState";

import { useQuality } from "@/context/QualityContext";

// ============================================================
// Tab 4: 품질분석 보고서 컴포넌트
// ============================================================

interface QualityAnalysisReportProps {
  filter: ReportFilter;
}

const PIE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

export default function QualityAnalysisReport({ filter }: QualityAnalysisReportProps) {
  const router = useRouter();
  const { incoming, processList, finished, nonconformities, correctiveActions } = useQuality();

  const data = aggregateQualityReport(filter, {
    incoming,
    processList,
    finished,
    nonconformities,
    correctiveActions,
  });

  if (data.summary.totalInspectionCount === 0) {
    return <ReportEmptyState message="선택한 기간 내 진행된 품질검사 데이터가 없습니다." />;
  }

  const handleExportCsv = () => {
    const headers = [
      "검사구분",
      "전체검사건수",
      "합격건수",
      "조건부합격건수",
      "보류건수",
      "불합격건수",
      "합격률(%)",
    ];

    const rows = data.categoryInspectionTable.map((c) => [
      c.categoryLabel,
      c.totalCount,
      c.passedCount,
      c.conditionalPassCount,
      c.holdCount,
      c.failedCount,
      `${c.passRate}%`,
    ]);

    exportTableToCsv(headers, rows, "품질분석보고서");
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 내보내기 버튼 바 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="text-xs text-gray-500 font-semibold">
          💡 합격률(%) 계산은 완료 처리된 검사 건만을 분모로 정밀 계산합니다.
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
          <p className="text-[11px] text-gray-500 font-semibold">전체 검사 건수</p>
          <p className="text-lg font-extrabold text-gray-900 mt-1">{data.summary.totalInspectionCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">검사 완료 건수</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{data.summary.completedInspectionCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">합격 건수</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{data.summary.passedCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20 text-center">
          <p className="text-[11px] text-blue-800 font-bold">조건부 합격</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{data.summary.conditionalPassCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20 text-center">
          <p className="text-[11px] text-amber-800 font-bold">보류 건수</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">{data.summary.holdCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20 text-center">
          <p className="text-[11px] text-rose-800 font-bold">불합격 건수</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{data.summary.failedCount}건</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">전체 합격률</p>
          <p className="text-lg font-extrabold text-emerald-700 mt-1">{data.summary.totalPassRate}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20 text-center">
          <p className="text-[11px] text-purple-800 font-bold">미완료 CAPA</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.unresolvedCACount}건</p>
        </div>
      </div>

      {/* 3. Recharts 품질 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 1: 기간별 품질 합격률 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 기간별 종합 품질 합격률 추이 (%)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.qualityPassRateTrendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(val: any) => [`${val}%`, "합격률"]} />
                <Legend />
                <Line type="monotone" dataKey="passRate" name="합격률 (%)" stroke="#10B981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 부적합 심각도 비율 (도넛) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 부적합 심각도 비율</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.ncSeverityChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.ncSeverityChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}건`, "건수"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 2: 검사 구분별 판정 현황 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 검사 구분별 판정 현황 (건)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inspectionCategoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}건`, ""]} />
                <Legend />
                <Bar dataKey="passed" name="합격" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hold" name="보류" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="불합격" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 부적합 유형별 발생 건수 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 부적합 유형별 발생 건수</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ncTypeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}건`, "발생 건수"]} />
                <Legend />
                <Bar dataKey="count" name="발생 건수" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 6: 시정조치 현황 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ 시정조치(CAPA) 진행 상태</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.caStatusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}건`, "건수"]} />
                <Legend />
                <Bar dataKey="count" name="CAPA 건수" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 검사 유형별 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ 검사 구분별 종합 실적 및 합격률</h4>
          <span className="text-gray-500">IQC / PQC / FQC 통계</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[850px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">검사 구분</th>
                <th className="px-4 py-3 font-semibold text-right">전체 검사</th>
                <th className="px-4 py-3 font-semibold text-right">합격 건수</th>
                <th className="px-4 py-3 font-semibold text-right">조건부 합격</th>
                <th className="px-4 py-3 font-semibold text-right">보류 건수</th>
                <th className="px-4 py-3 font-semibold text-right">불합격 건수</th>
                <th className="px-4 py-3 font-semibold text-center">합격률 (%)</th>
                <th className="px-4 py-3 font-semibold text-center">이동</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {data.categoryInspectionTable.map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.categoryLabel}</td>
                  <td className="px-4 py-3 text-right font-medium">{c.totalCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{c.passedCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">{c.conditionalPassCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">{c.holdCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{c.failedCount}건</td>
                  <td className="px-4 py-3 text-center font-extrabold text-emerald-700">{c.passRate}%</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/quality`)}
                      className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      품질 모듈 ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 부적합 및 시정조치 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ 부적합 유형별 발생 및 해결 평균 처리기간</h4>
          <span className="text-gray-500">해결 완료 건에 대한 처리 일수 집계</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[950px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">부적합 유형</th>
                <th className="px-4 py-3 font-semibold text-right">총 발생 건수</th>
                <th className="px-4 py-3 font-semibold text-right text-red-700">치명 (Critical)</th>
                <th className="px-4 py-3 font-semibold text-right text-amber-700">중대 (Major)</th>
                <th className="px-4 py-3 font-semibold text-right text-blue-700">경미 (Minor)</th>
                <th className="px-4 py-3 font-semibold text-right text-green-700">해결 완료</th>
                <th className="px-4 py-3 font-semibold text-right text-purple-700">미해결</th>
                <th className="px-4 py-3 font-semibold text-center">평균 처리기간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans">
              {data.nonconformityTable.map((nc) => (
                <tr key={nc.ncType} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{nc.ncTypeLabel}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-gray-900">{nc.totalCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{nc.criticalCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">{nc.majorCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">{nc.minorCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{nc.resolvedCount}건</td>
                  <td className="px-4 py-3 text-right font-bold text-purple-600">{nc.unresolvedCount}건</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">
                    {nc.averageResolutionDays > 0 ? `${nc.averageResolutionDays}일` : "-"}
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
