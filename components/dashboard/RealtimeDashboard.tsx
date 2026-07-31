"use client";

import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";
import DefectStatusBadge from "@/components/quality/DefectStatusBadge";
import { DEFECT_TYPE_LABELS } from "@/components/quality/DefectHistoryTable";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useAdmin } from "@/context/AdminContext";
import { useShipments } from "@/context/ShipmentContext";
import { buildRealtimeMonitoring } from "@/lib/dashboard-monitoring";
import type { DashboardCardData } from "@/types";
import type { MonitoringLevel, ProductionLineRuntimeStatus } from "@/types/dashboard";

const LINE_STATUS: Record<ProductionLineRuntimeStatus, { label: string; style: string }> = {
  RUNNING: { label: "가동중", style: "bg-emerald-100 text-emerald-700" },
  WAITING: { label: "생산 대기", style: "bg-blue-100 text-blue-700" },
  INSPECTION: { label: "점검중", style: "bg-purple-100 text-purple-700" },
  STOPPED: { label: "중단", style: "bg-red-100 text-red-700" },
  QUALITY_HOLD: { label: "품질 보류", style: "bg-orange-100 text-orange-700" },
};
const cardStatus = (level: MonitoringLevel): DashboardCardData["status"] => level;

export default function RealtimeDashboard() {
  const { plans, workOrders, results, fgLots } = useProduction();
  const { defectHistory, queue } = useQuality();
  const { inventories } = useMaterials();
  const { materials, productionLines } = useMasterData();
  const { canAccessProductionLine } = useAdmin();
  const { kpi: shipmentKpi } = useShipments();
  const snapshot = useMemo(() => buildRealtimeMonitoring({
    plans: plans.filter((item) => canAccessProductionLine(item.productionLine)),
    workOrders: workOrders.filter((item) => canAccessProductionLine(item.productionLine)),
    results: results.filter((item) => canAccessProductionLine(item.productionLine)),
    fgLots: fgLots.filter((item) => canAccessProductionLine(item.productionLine)),
    defects: defectHistory, queue, inventories, materials,
    productionLines: productionLines.filter((line) => canAccessProductionLine(line.name)),
  }), [canAccessProductionLine, defectHistory, fgLots, inventories, materials, plans, productionLines, queue, results, workOrders]);
  const kpi = snapshot.kpi;
  const cards: DashboardCardData[] = [
    { id: "today-plan", title: "오늘 생산계획", value: kpi.planQuantity.toLocaleString(), unit: "개", description: `${snapshot.today} 계획 수량`, status: "NEUTRAL" },
    { id: "current-production", title: "현재 생산수량", value: kpi.productionQuantity.toLocaleString(), unit: "개", description: "오늘 등록된 생산실적 합계", status: cardStatus(kpi.achievementLevel) },
    { id: "good-quantity", title: "양품수량", value: kpi.goodQuantity.toLocaleString(), unit: "개", description: "현재 생산수량 - 오늘 불량수량", status: "GOOD" },
    { id: "defect-quantity", title: "불량수량", value: kpi.defectQuantity.toLocaleString(), unit: "개", description: "오늘 불량품 이력 등록 수량", status: cardStatus(kpi.defectLevel) },
    { id: "achievement", title: "생산 달성률", value: kpi.achievementRate.toFixed(1), unit: "%", description: "현재 생산수량 ÷ 오늘 생산계획", status: cardStatus(kpi.achievementLevel) },
    { id: "realtime-defect", title: "실시간 불량률", value: kpi.defectRate.toFixed(1), unit: "%", description: "불량수량 ÷ 현재 생산수량", status: cardStatus(kpi.defectLevel) },
    { id: "inspection-pending", title: "품질검사 대기", value: kpi.pendingInspectionCount, unit: "건", description: "완료·취소되지 않은 검사", status: kpi.pendingInspectionCount > 0 ? "WARNING" : "GOOD" },
    { id: "material-shortage", title: "재고 부족 자재", value: kpi.shortageMaterialCount, unit: "품목", description: "현재고가 안전재고 미만인 자재", status: kpi.shortageMaterialCount > 0 ? "DANGER" : "GOOD" },
  ];

  return <div className="space-y-6">
    <section>
      <div className="mb-3 flex items-end justify-between"><div><h2 className="text-sm font-bold text-gray-700">오늘의 실시간 생산·품질 KPI</h2><p className="mt-1 text-xs text-gray-500">{snapshot.today} · Context 변경 시 자동 갱신</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">● 실시간 연동</span></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <DashboardCard key={card.id} data={card} />)}</div>
    </section>

    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-700">오늘의 출하 KPI</h2>
          <p className="mt-1 text-xs text-gray-500">출하 완료 처리 시 재고와 함께 자동 갱신</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard data={{ id: "shipment-count", title: "오늘 출하건수", value: shipmentKpi.todayShipmentCount, unit: "건", description: "오늘 완료된 출하 건수", status: "NEUTRAL" }} />
        <DashboardCard data={{ id: "shipment-quantity", title: "오늘 출하수량", value: shipmentKpi.todayShipmentQuantity.toLocaleString(), unit: "개", description: "오늘 완료된 출하 수량", status: "GOOD" }} />
        <DashboardCard data={{ id: "shipment-rate", title: "출하 완료율", value: shipmentKpi.completionRate.toFixed(1), unit: "%", description: "오늘 출하 예정 대비 완료 건수", status: shipmentKpi.completionRate >= 80 ? "GOOD" : shipmentKpi.completionRate >= 50 ? "WARNING" : "DANGER" }} />
      </div>
    </section>

    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-gray-900">생산 진행 현황</h2>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="px-4 py-3">생산라인</th><th className="px-4 py-3">제품명</th><th className="px-4 py-3 text-right">계획수량</th><th className="px-4 py-3 text-right">생산수량</th><th className="px-4 py-3">달성률</th><th className="px-4 py-3">라인 상태</th></tr></thead><tbody className="divide-y divide-gray-100">{snapshot.lineProgress.map((line) => <tr key={line.lineName}><td className="px-4 py-3 font-bold">{line.lineName}</td><td className="px-4 py-3">{line.productName}</td><td className="px-4 py-3 text-right">{line.planQuantity.toLocaleString()}</td><td className="px-4 py-3 text-right font-bold text-blue-700">{line.productionQuantity.toLocaleString()}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, line.achievementRate)}%` }} /></div><span className="w-12 text-right text-xs font-bold">{line.achievementRate.toFixed(1)}%</span></div></td><td className="px-4 py-3"><LineBadge status={line.status} /></td></tr>)}</tbody></table></div>
    </section>

    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-900">시간대별 생산 및 불량 추이</h2><p className="mt-1 text-xs text-gray-500">08:00부터 현재 시간까지, 미등록 시간은 0으로 표시</p><div className="mt-4 h-80"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={snapshot.hourly}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" /><XAxis dataKey="hour" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => `${Number(value).toLocaleString()}개`} /><Legend /><Bar dataKey="productionQuantity" name="생산수량" fill="#2563eb" radius={[4, 4, 0, 0]} /><Line type="monotone" dataKey="defectQuantity" name="불량수량" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div></section>
      <section className="rounded-xl border border-red-100 bg-white p-5 shadow-sm"><h2 className="font-bold text-gray-900">실시간 불량 현황</h2><div className="mt-4 grid grid-cols-2 gap-3"><Mini label="오늘 총 불량수량" value={`${kpi.defectQuantity.toLocaleString()}개`} /><Mini label="실시간 불량률" value={`${kpi.defectRate.toFixed(1)}%`} /><Mini label="최다 불량 유형" value={snapshot.topDefectType ? DEFECT_TYPE_LABELS[snapshot.topDefectType as keyof typeof DEFECT_TYPE_LABELS] : "-"} /><Mini label="기준 초과 여부" value={kpi.defectLevel === "DANGER" ? "기준 초과" : "기준 이내"} danger={kpi.defectLevel === "DANGER"} /></div><h3 className="mt-5 text-sm font-bold text-gray-700">최근 발생 내역</h3><div className="mt-2 divide-y divide-gray-100">{snapshot.recentDefects.length ? snapshot.recentDefects.map((item) => <div key={item.id} className="py-3 text-xs"><div className="flex justify-between gap-3"><span className="font-mono text-gray-500">{item.createdAt.split(" ")[1]}</span><DefectStatusBadge status={item.status} /></div><p className="mt-1 font-semibold">{item.productName} · {DEFECT_TYPE_LABELS[item.defectType]} · <span className="text-red-600">{item.defectQuantity}개</span></p><p className="mt-1 truncate font-mono text-blue-600">{item.lotNumber}</p></div>) : <p className="py-8 text-center text-sm text-gray-400">오늘 등록된 불량이 없습니다.</p>}</div></section>
    </div>

    <section><h2 className="mb-3 font-bold text-gray-900">라인별 가동 상태</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{snapshot.lineProgress.map((line) => <div key={line.lineName} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><h3 className="font-bold">{line.lineName}</h3><LineBadge status={line.status} /></div><p className="mt-2 text-sm text-gray-600">{line.productName}</p><div className="mt-4 flex items-end justify-between"><p className="text-2xl font-extrabold text-blue-700">{line.productionQuantity.toLocaleString()}<span className="ml-1 text-xs font-normal text-gray-500">/ {line.planQuantity.toLocaleString()}개</span></p><p className="font-bold">{line.achievementRate.toFixed(1)}%</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-blue-600" style={{ width: `${Math.min(100, line.achievementRate)}%` }} /></div><p className="mt-3 text-right text-xs text-gray-400">최근 갱신 {line.updatedAt}</p></div>)}</div></section>
  </div>;
}

function LineBadge({ status }: { status: ProductionLineRuntimeStatus }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${LINE_STATUS[status].style}`}>{LINE_STATUS[status].label}</span>;
}
function Mini({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return <div className={`rounded-lg p-3 ${danger ? "bg-red-50" : "bg-gray-50"}`}><p className="text-xs text-gray-500">{label}</p><p className={`mt-1 text-lg font-extrabold ${danger ? "text-red-600" : "text-gray-900"}`}>{value}</p></div>;
}
