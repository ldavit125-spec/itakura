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
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// Tab 4: 품질분석 보고서 컴포넌트
// ============================================================

interface QualityAnalysisReportProps {
  filter: ReportFilter;
}

const PIE_COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

export default function QualityAnalysisReport({ filter }: QualityAnalysisReportProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const { incoming, processList, finished, nonconformities, correctiveActions } = useQuality();

  const data = aggregateQualityReport(filter, {
    incoming,
    processList,
    finished,
    nonconformities,
    correctiveActions,
  });

  if (data.summary.totalInspectionCount === 0) {
    return <ReportEmptyState message={isJa ? "選択した期間内に進行された品質検査データがありません。" : "선택한 기간 내 진행된 품질검사 데이터가 없습니다."} />;
  }

  const handleExportCsv = () => {
    const headers = isJa
      ? ["検査区分", "全検査件数", "合格件数", "条件付き合格件数", "保留件数", "不合格件数", "合格率(%)"]
      : ["검사구분", "전체검사건수", "합격건수", "조건부합격건수", "보류건수", "불합격건수", "합격률(%)"];

    const rows = data.categoryInspectionTable.map((c) => [
      localizedName({ locale, ko: c.categoryLabel }),
      c.totalCount,
      c.passedCount,
      c.conditionalPassCount,
      c.holdCount,
      c.failedCount,
      `${c.passRate}%`,
    ]);

    exportTableToCsv(headers, rows, isJa ? "品質分析レポート" : "품질분석보고서");
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 내보내기 버튼 바 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="text-xs text-gray-500 font-semibold">
          💡 {isJa ? "合格率(%)計算は完了処理された検査件のみを分母として精密計算します。" : "합격률(%) 계산은 완료 처리된 검사 건만을 분모로 정밀 계산합니다."}
        </div>
        <button
          onClick={handleExportCsv}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
        >
          📊 {isJa ? "CSVエクスポート" : "CSV 내보내기"}
        </button>
      </div>

      {/* 2. 요약 KPI 카드 8종 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">{isJa ? "全検査件数" : "전체 검사 건수"}</p>
          <p className="text-lg font-extrabold text-gray-900 mt-1">{data.summary.totalInspectionCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">{isJa ? "検査完了件数" : "검사 완료 건수"}</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{data.summary.completedInspectionCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">{isJa ? "合格件数" : "합격 건수"}</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{data.summary.passedCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20 text-center">
          <p className="text-[11px] text-blue-800 font-bold">{isJa ? "条件付き合格" : "조건부 합격"}</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{data.summary.conditionalPassCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20 text-center">
          <p className="text-[11px] text-amber-800 font-bold">{isJa ? "保留件数" : "보류 건수"}</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">{data.summary.holdCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20 text-center">
          <p className="text-[11px] text-rose-800 font-bold">{isJa ? "不合格件数" : "불합격 건수"}</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{data.summary.failedCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">{isJa ? "全体合格率" : "전체 합격률"}</p>
          <p className="text-lg font-extrabold text-emerald-700 mt-1">{data.summary.totalPassRate}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20 text-center">
          <p className="text-[11px] text-purple-800 font-bold">{isJa ? "未完了CAPA" : "미완료 CAPA"}</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.unresolvedCACount}{isJa ? "件" : "건"}</p>
        </div>
      </div>

      {/* 3. Recharts 품질 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 1: 기간별 품질 합격률 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "期間別総合品質合格率推移 (%)" : "기간별 종합 품질 합격률 추이 (%)"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.qualityPassRateTrendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(val: any) => [`${val}%`, isJa ? "合格率" : "합격률"]} />
                <Legend />
                <Line type="monotone" dataKey="passRate" name={isJa ? "合格率 (%)" : "합격률 (%)"} stroke="#10B981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 부적합 심각도 비율 (도넛) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "不適合深刻度比率" : "부적합 심각도 비율"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.ncSeverityChartData.map((d) => ({
                  ...d,
                  name: localizedName({ locale, ko: d.name }),
                }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.ncSeverityChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "件" : "건"}`, isJa ? "件数" : "건수"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 2: 검사 구분별 판정 현황 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "検査区分別判定状況 (件)" : "검사 구분별 판정 현황 (건)"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inspectionCategoryChartData.map((d) => ({
                ...d,
                category: localizedName({ locale, ko: d.category }),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "件" : "건"}`, ""]} />
                <Legend />
                <Bar dataKey="passed" name={isJa ? "合格" : "합격"} fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hold" name={isJa ? "保留" : "보류"} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name={isJa ? "不合格" : "불합격"} fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 부적합 유형별 발생 건수 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "不適合タイプ別発生件数" : "부적합 유형별 발생 건수"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ncTypeChartData.map((d) => ({
                ...d,
                name: localizedName({ locale, ko: d.name }),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "件" : "건"}`, isJa ? "発生件数" : "발생 건수"]} />
                <Legend />
                <Bar dataKey="count" name={isJa ? "発生件数" : "발생 건수"} fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 6: 시정조치 현황 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "是正措置(CAPA)進行状態" : "시정조치(CAPA) 진행 상태"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.caStatusChartData.map((d) => ({
                ...d,
                name: localizedName({ locale, ko: d.name }),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "件" : "건"}`, isJa ? "件数" : "건수"]} />
                <Legend />
                <Bar dataKey="count" name={isJa ? "CAPA件数" : "CAPA 건수"} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 검사 유형별 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ {isJa ? "検査区分別総合実績および合格率" : "검사 구분별 종합 실적 및 합격률"}</h4>
          <span className="text-gray-500">{isJa ? "IQC / PQC / FQC 統計" : "IQC / PQC / FQC 통계"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[850px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{isJa ? "検査区分" : "검사 구분"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "全検査" : "전체 검사"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "合格件数" : "합격 건수"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "条件付き合格" : "조건부 합격"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "保留件数" : "보류 건수"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "不合格件数" : "불합격 건수"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "合格率 (%)" : "합격률 (%)"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "移動" : "이동"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {data.categoryInspectionTable.map((c, idx) => {
                const displayCategoryLabel = localizedName({ locale, ko: c.categoryLabel });

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{displayCategoryLabel}</td>
                    <td className="px-4 py-3 text-right font-medium">{c.totalCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{c.passedCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{c.conditionalPassCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">{c.holdCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600">{c.failedCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-emerald-700">{c.passRate}%</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/quality`)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        {isJa ? "品質モジュール ↗" : "품질 모듈 ↗"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 부적합 및 시정조치 집계 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ {isJa ? "不適合タイプ別発生および解決平均処理期間" : "부적합 유형별 발생 및 해결 평균 처리기간"}</h4>
          <span className="text-gray-500">{isJa ? "解決完了件の処理日数集計" : "해결 완료 건에 대한 처리 일수 집계"}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[950px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{isJa ? "不適合タイプ" : "부적합 유형"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "総発生件数" : "총 발생 건수"}</th>
                <th className="px-4 py-3 font-semibold text-right text-red-700">{isJa ? "致命 (Critical)" : "치명 (Critical)"}</th>
                <th className="px-4 py-3 font-semibold text-right text-amber-700">{isJa ? "重大 (Major)" : "중대 (Major)"}</th>
                <th className="px-4 py-3 font-semibold text-right text-blue-700">{isJa ? "軽微 (Minor)" : "경미 (Minor)"}</th>
                <th className="px-4 py-3 font-semibold text-right text-green-700">{isJa ? "解決完了" : "해결 완료"}</th>
                <th className="px-4 py-3 font-semibold text-right text-purple-700">{isJa ? "未解決" : "미해결"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "平均処理期間" : "평균 처리기간"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-sans">
              {data.nonconformityTable.map((nc) => {
                const displayNcTypeLabel = localizedName({ locale, ko: nc.ncTypeLabel });

                return (
                  <tr key={nc.ncType} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{displayNcTypeLabel}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-gray-900">{nc.totalCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{nc.criticalCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">{nc.majorCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{nc.minorCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{nc.resolvedCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-right font-bold text-purple-600">{nc.unresolvedCount}{isJa ? "件" : "건"}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-800">
                      {nc.averageResolutionDays > 0 ? `${nc.averageResolutionDays}${isJa ? "日" : "일"}` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
