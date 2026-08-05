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
import { aggregateLotReport } from "@/lib/lot-report";
import { exportTableToCsv } from "@/lib/report-csv";
import ReportEmptyState from "./ReportEmptyState";

import { useMaterials } from "@/context/MaterialsContext";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// Tab 5: LOT 추적 보고서 컴포넌트
// ============================================================

interface LotTraceabilityReportProps {
  filter: ReportFilter;
}

const PIE_COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export default function LotTraceabilityReport({ filter }: LotTraceabilityReportProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const { inventories, inbounds, outbounds } = useMaterials();
  const { fgLots, results } = useProduction();
  const { finished: finishedInspections, nonconformities, correctiveActions } = useQuality();

  const data = aggregateLotReport(filter, {
    inventories,
    inbounds,
    outbounds,
    fgLots,
    results,
    finishedInspections,
    nonconformities,
    correctiveActions,
  });

  if (data.fgLotTraceTable.length === 0 && data.rawLotImpactTable.length === 0) {
    return <ReportEmptyState message={isJa ? "選択した条件に該当するLOT追跡データがありません。" : "선택한 조건에 해당하는 LOT 추적 데이터가 없습니다."} />;
  }

  const handleExportCsv = () => {
    const headers = isJa
      ? ["完成品LOT番号", "製品名", "生産日", "作業指示番号", "生産実績番号", "投入原材料種類数", "連携原材料LOT数", "完成品品質状態", "不適合番号", "是正措置番号"]
      : [
          "완제품LOT번호",
          "제품명",
          "생산일",
          "작업지시번호",
          "생산실적번호",
          "투입원재료종류수",
          "연결원재료LOT수",
          "완제품품질상태",
          "부적합번호",
          "시정조치번호",
        ];

    const rows = data.fgLotTraceTable.map((f) => [
      f.fgLotNo,
      localizedName({ locale, ko: f.productName, ja: f.productNameJa }),
      f.productionDate,
      f.workOrderNo,
      f.resultNo,
      f.usedMaterialTypesCount,
      f.linkedRawLotCount,
      f.qualityStatus === "PASSED" ? (isJa ? "合格" : "합격") : (isJa ? "不合格" : "불합격"),
      f.ncNo || "-",
      f.caNo || "-",
    ]);

    exportTableToCsv(headers, rows, isJa ? "LOT追跡レポート" : "LOT추적보고서");
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 내보내기 버튼 바 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
        <div className="text-xs text-gray-500 font-semibold">
          💡 {isJa ? "각 완성품 및 원재료 LOT의 이력 추적 및 영향 범위 분석 현황입니다." : "각 완제품 및 원재료 LOT의 이력 추적 및 영향 범위 분석 현황입니다."}
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
          <p className="text-[11px] text-gray-500 font-semibold">{isJa ? "原材料LOT数" : "원재료 LOT 수"}</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.traceableRawLotCount}{isJa ? "個" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">{isJa ? "完成品LOT数" : "완제품 LOT 수"}</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{data.summary.traceableFGLotCount}{isJa ? "個" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-semibold">{isJa ? "連携作業指示" : "연결 작업지시"}</p>
          <p className="text-lg font-extrabold text-teal-600 mt-1">{data.summary.linkedWorkOrderCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20 text-center">
          <p className="text-[11px] text-emerald-800 font-bold">{isJa ? "正常LOT数" : "정상 LOT 수"}</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{data.summary.normalLotCount}{isJa ? "個" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20 text-center">
          <p className="text-[11px] text-amber-800 font-bold">{isJa ? "保留LOT数" : "보류 LOT 수"}</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">{data.summary.holdLotCount}{isJa ? "個" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm bg-rose-50/20 text-center">
          <p className="text-[11px] text-rose-800 font-bold">{isJa ? "不合格LOT数" : "불합격 LOT 수"}</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{data.summary.failedLotCount}{isJa ? "個" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-sm bg-purple-50/20 text-center">
          <p className="text-[11px] text-purple-800 font-bold">{isJa ? "不適合連携LOT" : "부적합 연결 LOT"}</p>
          <p className="text-lg font-extrabold text-purple-700 mt-1">{data.summary.ncLinkedLotCount}{isJa ? "개" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20 text-center">
          <p className="text-[11px] text-blue-800 font-bold">{isJa ? "進行中CAPA" : "진행 중 CAPA"}</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{data.summary.inProgressCALotCount}{isJa ? "件" : "건"}</p>
        </div>
      </div>

      {/* 3. Recharts 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 1: 기간별 완제품 LOT 생성 추이 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "期間別完成品LOT発行推移 (個)" : "기간별 완제품 LOT 발행 추이 (개)"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.fgLotTrendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "個" : "개"}`, isJa ? "LOT発行" : "LOT 발행"]} />
                <Legend />
                <Line type="monotone" dataKey="count" name={isJa ? "完成品LOT数" : "완제품 LOT 수"} stroke="#2563EB" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 완제품 품질 상태 비율 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "完成品LOT品質状態比率" : "완제품 LOT 품질 상태 비율"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.fgQualityRatioChartData.map((d) => ({
                  ...d,
                  name: localizedName({ locale, ko: d.name }),
                }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.fgQualityRatioChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "個" : "개"}`, isJa ? "LOT件数" : "LOT 건수"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 제품별 완제품 LOT 수 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "製品別完成品LOT数" : "제품별 완제품 LOT 수"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fgLotByProductChartData.map((d) => ({
                ...d,
                name: localizedName({ locale, ko: d.name }),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "個" : "개"}`, isJa ? "LOT数" : "LOT 수"]} />
                <Legend />
                <Bar dataKey="count" name={isJa ? "LOT数" : "LOT 수"} fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 5: 거래처별 원재료 LOT 수 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h4 className="text-sm font-bold text-gray-800 mb-4">■ {isJa ? "取引先別原材料入荷LOT数" : "거래처별 원재료 입고 LOT 수"}</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.rawLotBySupplierChartData.map((d) => ({
                ...d,
                name: localizedName({ locale, ko: d.name }),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}${isJa ? "個" : "개"}`, isJa ? "LOT数" : "LOT 수"]} />
                <Legend />
                <Bar dataKey="count" name={isJa ? "LOT数" : "LOT 수"} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 완제품 LOT 추적 상세 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ {isJa ? "完成品LOT履歴追跡および連携情報" : "완제품 LOT 이력 추적 및 연동 정보"}</h4>
          <span className="text-gray-500">{isJa ? `全 ${data.fgLotTraceTable.length}個 完成品LOT` : `총 ${data.fgLotTraceTable.length}개 완제품 LOT`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[1000px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold">{isJa ? "完成品LOT番号" : "완제품 LOT 번호"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "製品名" : "제품명"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "生産日" : "생산일"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "作業指示番号" : "작업지시 번호"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "投入原材料数" : "투입 원재료 수"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "品質状態" : "품질 상태"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "不適合 / CAPA 番号" : "부적합 / CAPA 번호"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "LOT追跡移動" : "LOT 추적 이동"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {data.fgLotTraceTable.map((fg) => {
                const displayProductName = localizedName({ locale, ko: fg.productName, ja: fg.productNameJa });

                return (
                  <tr key={fg.fgLotNo} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold text-blue-700">{fg.fgLotNo}</td>
                    <td className="px-3 py-2 font-sans font-semibold text-gray-900">{displayProductName}</td>
                    <td className="px-3 py-2 font-sans text-gray-600">{fg.productionDate}</td>
                    <td className="px-3 py-2 font-bold text-purple-700">{fg.workOrderNo}</td>
                    <td className="px-3 py-2 text-center font-sans font-bold text-gray-800">
                      {fg.usedMaterialTypesCount}{isJa ? "種" : "종"} ({fg.linkedRawLotCount}{isJa ? "個" : "개"} LOT)
                    </td>
                    <td className="px-3 py-2 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          fg.qualityStatus === "PASSED"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}
                      >
                        {fg.qualityStatus === "PASSED" ? (isJa ? "合格" : "합격") : (isJa ? "不合格" : "불합격")}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {fg.ncNo ? `${fg.ncNo} (${fg.caNo || (isJa ? "CAPA-未発行" : "CAPA-미발행")})` : "-"}
                    </td>
                    <td className="px-3 py-2 text-center font-sans whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/traceability?tab=backward&lot=${encodeURIComponent(fg.fgLotNo)}`)}
                        className="px-2 py-0.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100"
                      >
                        {isJa ? "逆方向追跡 ↗" : "역방향 추적 ↗"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 원재료 영향 범위 테이블 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">■ {isJa ? "原材料LOT順方向投入および完成品リコール影響数量" : "원재료 LOT 정방향 투입 및 완제품 리콜 영향 수량"}</h4>
          <span className="text-gray-500">{isJa ? `全 ${data.rawLotImpactTable.length}個 原材料LOT` : `총 ${data.rawLotImpactTable.length}개 원재료 LOT`}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700 min-w-[1000px]">
            <thead className="uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 font-semibold">{isJa ? "原材料LOT番号" : "원재료 LOT 번호"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "資材名" : "자재명"}</th>
                <th className="px-3 py-2 font-semibold">{isJa ? "取引先" : "거래처"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "使用指示数" : "사용 지시 수"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "連携完成品LOT" : "연결 완제품 LOT"}</th>
                <th className="px-3 py-2 font-semibold text-right">{isJa ? "影響生産量" : "영향 생산량"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "品質状態別LOT" : "품질 상태별 LOT"}</th>
                <th className="px-3 py-2 font-semibold text-center">{isJa ? "順方向追跡移動" : "정방향 추적 이동"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-mono">
              {data.rawLotImpactTable.map((raw) => {
                const displayMatName = localizedName({ locale, ko: raw.materialName, ja: raw.materialNameJa });
                const displaySupName = localizedName({ locale, ko: raw.supplierName, ja: raw.supplierNameJa });

                return (
                  <tr key={raw.rawMaterialLotNo} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold text-purple-700">{raw.rawMaterialLotNo}</td>
                    <td className="px-3 py-2 font-sans font-semibold text-gray-900">
                      [{raw.materialCode}] {displayMatName}
                    </td>
                    <td className="px-3 py-2 font-sans text-gray-800">{displaySupName}</td>
                    <td className="px-3 py-2 text-center font-sans font-medium">{raw.usedWorkOrdersCount}{isJa ? "件" : "건"}</td>
                    <td className="px-3 py-2 text-center font-sans font-bold text-blue-600">{raw.linkedFGLotsCount}{isJa ? "個" : "개"}</td>
                    <td className="px-3 py-2 text-right font-extrabold text-blue-700 font-sans">
                      {raw.affectedProductionQuantity.toLocaleString()}{isJa ? "個" : "개"}
                    </td>
                    <td className="px-3 py-2 text-center font-sans">
                      <span className="text-emerald-600 font-bold">{isJa ? "合格" : "합격"} {raw.passedLotCount}</span> /{" "}
                      <span className="text-amber-600 font-bold">{isJa ? "保留" : "보류"} {raw.holdLotCount}</span> /{" "}
                      <span className="text-rose-600 font-bold">{isJa ? "不合格" : "불합격"} {raw.failedLotCount}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-sans whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/traceability?tab=forward&lot=${encodeURIComponent(raw.rawMaterialLotNo)}`)}
                        className="px-2 py-0.5 text-[11px] font-bold text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                      >
                        {isJa ? "順方向追跡 ↗" : "정방향 추적 ↗"}
                      </button>
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
