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
import { aggregateProductionReport } from "@/lib/production-report";
import { aggregateMaterialReport } from "@/lib/material-report";
import { aggregateQualityReport } from "@/lib/quality-report";
import ReportEmptyState from "./ReportEmptyState";

import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useQuality } from "@/context/QualityContext";
import { useMasterData } from "@/context/MasterDataContext";

// ============================================================
// Tab 1: 통합 경영현황 컴포넌트
// ============================================================

interface IntegratedReportDashboardProps {
  filter: ReportFilter;
}

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

export default function IntegratedReportDashboard({ filter }: IntegratedReportDashboardProps) {
  const router = useRouter();

  const { plans, workOrders, results } = useProduction();
  const { canAccessProductionLine } = useAdmin();
  const { inbounds, inventories, outbounds } = useMaterials();
  const { incoming, processList, finished, nonconformities, correctiveActions } = useQuality();
  const { materials } = useMasterData();

  const prodData = aggregateProductionReport(filter, {
    plans: plans.filter((item) => canAccessProductionLine(item.productionLine)),
    workOrders: workOrders.filter((item) => canAccessProductionLine(item.productionLine)),
    results: results.filter((item) => canAccessProductionLine(item.productionLine)),
  });
  const matData = aggregateMaterialReport(filter, { inbounds, inventories, outbounds, materials });
  const qualData = aggregateQualityReport(filter, { incoming, processList, finished, nonconformities, correctiveActions });

  const totalPlanQty = prodData.summary.totalPlannedQuantity;
  const totalActualProd = prodData.summary.totalProductionQuantity;
  const avgAchievement = prodData.summary.averageAchievementRate;
  const totalGood = prodData.summary.totalGoodQuantity;

  const totalDefect = prodData.summary.totalDefectQuantity;
  const avgDefectRate =
    totalActualProd > 0 ? Number(((totalDefect / totalActualProd) * 100).toFixed(1)) : 0;

  const qualityPassRate = qualData.summary.totalPassRate;
  const shortageCount = matData.summary.shortageMaterialCount;
  const qualityHoldOrFailedCount =
    matData.summary.holdLotCount + matData.summary.expiredLotCount + qualData.summary.failedCount;

  const hasData = totalPlanQty > 0 || totalActualProd > 0 || matData.materialAggTable.length > 0;

  if (!hasData) {
    return <ReportEmptyState />;
  }

  // 차트 3: 품질 판정 비율 도넛 데이터
  const pieData = [
    { name: "합격", value: qualData.summary.passedCount },
    { name: "조건부 합격", value: qualData.summary.conditionalPassCount },
    { name: "보류", value: qualData.summary.holdCount },
    { name: "불합격", value: qualData.summary.failedCount },
  ];

  // 알림 항목 생성
  const lowAchievementAlerts = prodData.detailedTable
    .filter((row) => row.achievementRate < 90)
    .map((row) => ({
      id: `achievement-${row.resultNo}`,
      title: "생산 달성률 90% 미만 작업",
      desc: `작업지시 [${row.workOrderNo}] 달성률 ${row.achievementRate.toFixed(1)}%`,
      link: "/production?tab=work-order",
      severity: "HIGH",
    }));
  const shortageAlerts = matData.materialAggTable
    .filter((material) => material.shortageQty > 0)
    .map((material) => ({
      id: `shortage-${material.materialCode}`,
      title: "안전재고 미달 자재 발생",
      desc: `[${material.materialCode}] ${material.materialName} (가용 ${material.availableStock}${material.unit} < 안전재고 ${material.safetyStock}${material.unit})`,
      link: "/materials?tab=shortage",
      severity: "HIGH",
    }));
  const qualityAlerts =
    qualData.summary.holdCount + qualData.summary.failedCount > 0
      ? [
          {
            id: "quality-hold-failed",
            title: "품질 보류/불합격 검사 발생",
            desc: `보류 ${qualData.summary.holdCount}건 / 불합격 ${qualData.summary.failedCount}건`,
            link: "/quality?tab=finished",
            severity: "MEDIUM",
          },
        ]
      : [];
  const alerts = [
    ...lowAchievementAlerts,
    ...shortageAlerts,
    ...qualityAlerts,
  ];

  return (
    <div className="space-y-6">
      {/* 1. 상단 경영 KPI 카드 8종 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500">총 생산계획</p>
          <p className="text-lg font-extrabold text-gray-900 mt-1">{totalPlanQty.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500">총 생산실적</p>
          <p className="text-lg font-extrabold text-blue-600 mt-1">{totalActualProd.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-sm bg-blue-50/20">
          <p className="text-[11px] font-bold text-blue-800">평균 생산 달성률</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">{avgAchievement.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500">총 양품 수량</p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">{totalGood.toLocaleString()}개</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-500">평균 불량률</p>
          <p className="text-lg font-extrabold text-rose-600 mt-1">{avgDefectRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <p className="text-[11px] font-bold text-emerald-800">품질검사 합격률</p>
          <p className="text-lg font-extrabold text-emerald-700 mt-1">{qualityPassRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm bg-amber-50/20">
          <p className="text-[11px] font-bold text-amber-800">재고 부족 자재</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">{shortageCount}종</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-sm bg-red-50/20">
          <p className="text-[11px] font-bold text-red-800">품질 보류·불합격</p>
          <p className="text-lg font-extrabold text-red-600 mt-1">{qualityHoldOrFailedCount}개</p>
        </div>
      </div>

      {/* 2. 4종 Recharts 차트 메인 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 차트 1: 생산계획 대비 실적 추이 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>■ 생산계획 대비 실적 추이</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prodData.trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${Number(val || 0).toLocaleString()}개`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="planQty" name="계획 수량" stroke="#9CA3AF" strokeWidth={2} />
                <Line type="monotone" dataKey="productionQty" name="생산 수량" stroke="#2563EB" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 2: 생산 달성률 추이 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>■ 기간별 생산 달성률 추이 (%)</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prodData.trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(val: any) => [`${val}%`, "달성률"]} />
                <Legend />
                <Line type="monotone" dataKey="achievementRate" name="달성률 (%)" stroke="#059669" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 3: 품질 판정 비율 (도넛 Pie) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>■ 품질 검사 판정 비율</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}건`, "건수"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 4: 재고 상태 현황 */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>■ 원재료 LOT 유통기한 및 재고 상태</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matData.inventoryStatusRatioChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}개`, "LOT 건수"]} />
                <Legend />
                <Bar dataKey="value" name="LOT 수" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. 하단 주요 알림 리스트 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-gray-800 flex items-center justify-between border-b border-gray-100 pb-2">
          <span>🚨 실시간 주요 이슈 및 경고 알림</span>
          <span className="text-xs font-normal text-gray-500">클릭 시 해당 업무 화면으로 이동합니다.</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => router.push(alt.link)}
              className="p-3 rounded-lg border border-red-200 bg-red-50/40 hover:bg-red-100/50 cursor-pointer transition-colors space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-red-900">{alt.title}</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-200 text-red-800 rounded">
                  {alt.severity}
                </span>
              </div>
              <p className="text-gray-700">{alt.desc}</p>
              <p className="text-blue-600 font-bold text-[11px] pt-1">업무 모듈로 이동 ↗</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
