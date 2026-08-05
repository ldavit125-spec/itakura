"use client";

import { useMemo } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "@/components/ui/DashboardCard";
import DefectStatusBadge from "@/components/quality/DefectStatusBadge";
import { useProduction } from "@/context/ProductionContext";
import { useQuality } from "@/context/QualityContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useAdmin } from "@/context/AdminContext";
import { useShipments } from "@/context/ShipmentContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";
import { buildRealtimeMonitoring } from "@/lib/dashboard-monitoring";
import type { DashboardCardData } from "@/types";
import type { MonitoringLevel, ProductionLineRuntimeStatus } from "@/types/dashboard";

const LINE_STATUS: Record<ProductionLineRuntimeStatus, { label: string; style: string }> = {
  RUNNING: { label: "lineStatus.running", style: "bg-emerald-100 text-emerald-700" },
  WAITING: { label: "lineStatus.waiting", style: "bg-blue-100 text-blue-700" },
  INSPECTION: { label: "lineStatus.inspection", style: "bg-purple-100 text-purple-700" },
  STOPPED: { label: "lineStatus.stopped", style: "bg-red-100 text-red-700" },
  QUALITY_HOLD: { label: "lineStatus.qualityHold", style: "bg-orange-100 text-orange-700" },
};
const cardStatus = (level: MonitoringLevel): DashboardCardData["status"] => level;
const DEFECT_TYPE_KEYS: Record<string, string> = {
  FOREIGN_MATERIAL: "quality.defect.foreignMaterial",
  WEIGHT: "quality.defect.weight",
  PACKAGING: "quality.defect.packaging",
  APPEARANCE: "quality.defect.appearance",
  SEALING: "quality.defect.sealing",
  LABEL: "quality.defect.label",
  DAMAGE: "quality.defect.damage",
  OTHER: "quality.defect.other",
};

export default function RealtimeDashboard() {
  const { t, language } = useLanguage();
  const { plans, workOrders, results, fgLots } = useProduction();
  const { defectHistory, queue } = useQuality();
  const { inventories } = useMaterials();
  const { materials, products, productionLines } = useMasterData();
  const { canAccessProductionLine } = useAdmin();
  const { kpi: shipmentKpi } = useShipments();

  const snapshot = useMemo(
    () =>
      buildRealtimeMonitoring({
        plans: plans.filter((item) => canAccessProductionLine(item.productionLine)),
        workOrders: workOrders.filter((item) => canAccessProductionLine(item.productionLine)),
        results: results.filter((item) => canAccessProductionLine(item.productionLine)),
        fgLots: fgLots.filter((item) => canAccessProductionLine(item.productionLine)),
        defects: defectHistory,
        queue,
        inventories,
        materials,
        products,
        productionLines: productionLines.filter((line) => canAccessProductionLine(line.name)),
      }),
    [canAccessProductionLine, defectHistory, fgLots, inventories, materials, plans, products, productionLines, queue, results, workOrders]
  );

  const kpi = snapshot.kpi;
  const cards: DashboardCardData[] = [
    { id: "today-plan", title: "dashboard.todayPlan", value: kpi.planQuantity.toLocaleString(), unit: "unit.item", description: "dashboard.card.planDescription", status: "NEUTRAL" },
    { id: "current-production", title: "dashboard.currentProduction", value: kpi.productionQuantity.toLocaleString(), unit: "unit.item", description: "dashboard.card.productionDescription", status: cardStatus(kpi.achievementLevel) },
    { id: "good-quantity", title: "dashboard.goodQuantity", value: kpi.goodQuantity.toLocaleString(), unit: "unit.item", description: "dashboard.card.goodDescription", status: "GOOD" },
    { id: "defect-quantity", title: "dashboard.defectQuantity", value: kpi.defectQuantity.toLocaleString(), unit: "unit.item", description: "dashboard.card.defectDescription", status: cardStatus(kpi.defectLevel) },
    { id: "achievement", title: "dashboard.achievementRate", value: kpi.achievementRate.toFixed(1), unit: "%", description: "dashboard.card.achievementDescription", status: cardStatus(kpi.achievementLevel) },
    { id: "realtime-defect", title: "dashboard.realtimeDefectRate", value: kpi.defectRate.toFixed(1), unit: "%", description: "dashboard.card.defectRateDescription", status: cardStatus(kpi.defectLevel) },
    { id: "inspection-pending", title: "dashboard.inspectionPending", value: kpi.pendingInspectionCount, unit: "unit.case", description: "dashboard.card.inspectionDescription", status: kpi.pendingInspectionCount > 0 ? "WARNING" : "GOOD" },
    { id: "material-shortage", title: "dashboard.materialShortage", value: kpi.shortageMaterialCount, unit: "common.count.item", description: "dashboard.card.shortageDescription", status: kpi.shortageMaterialCount > 0 ? "DANGER" : "GOOD" },
  ];

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-700">{t("dashboard.todayRealtimeKpi")}</h2>
            <p className="mt-1 text-xs text-gray-500">{snapshot.today} · {t("dashboard.autoRefresh")}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{t("dashboard.realtimeConnected")}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <DashboardCard key={card.id} data={card} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-700">{t("dashboard.shipmentKpi")}</h2>
            <p className="mt-1 text-xs text-gray-500">{t("dashboard.shipmentAutoRefresh")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardCard data={{ id: "shipment-count", title: "dashboard.shipment.count", value: shipmentKpi.todayShipmentCount, unit: "unit.case", description: "dashboard.shipment.countDescription", status: "NEUTRAL" }} />
          <DashboardCard data={{ id: "shipment-quantity", title: "dashboard.shipment.quantity", value: shipmentKpi.todayShipmentQuantity.toLocaleString(), unit: "unit.item", description: "dashboard.shipment.quantityDescription", status: "GOOD" }} />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-gray-900">{t("dashboard.productionProgress")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                {["dashboard.table.line", "dashboard.table.product", "dashboard.table.plan", "dashboard.table.production", "dashboard.table.rate", "dashboard.table.status"].map((key) => (
                  <th key={key} className="px-4 py-3">{t(key)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {snapshot.lineProgress.map((line) => {
                const lineName = localizedName({ locale: language, ko: line.lineName, ja: line.lineNameJa });
                const productName = localizedName({ locale: language, ko: line.productName, ja: line.productNameJa });
                return (
                  <tr key={line.lineName}>
                    <td className="px-4 py-3 font-bold">{lineName}</td>
                    <td className="px-4 py-3">{productName}</td>
                    <td className="px-4 py-3 text-right">{line.planQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">{line.productionQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, line.achievementRate)}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs font-bold">{line.achievementRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><LineBadge status={line.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">{t("dashboard.hourlyTrend")}</h2>
          <p className="mt-1 text-xs text-gray-500">{t("dashboard.hourlyTrendDescription")}</p>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={snapshot.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}${t("unit.item")}`} />
                <Legend />
                <Bar dataKey="productionQuantity" name={t("dashboard.table.production")} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="defectQuantity" name={t("dashboard.defectQuantity")} stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">{t("dashboard.defectStatus")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Mini label="dashboard.defect.total" value={`${kpi.defectQuantity.toLocaleString()}${t("unit.item")}`} />
            <Mini label="dashboard.realtimeDefectRate" value={`${kpi.defectRate.toFixed(1)}%`} />
            <Mini label="dashboard.defect.topType" value={snapshot.topDefectType ? t(DEFECT_TYPE_KEYS[snapshot.topDefectType]) : "-"} />
            <Mini label="dashboard.defect.threshold" value={t(kpi.defectLevel === "DANGER" ? "dashboard.defect.over" : "dashboard.defect.within")} danger={kpi.defectLevel === "DANGER"} />
          </div>
          <h3 className="mt-5 text-sm font-bold text-gray-700">{t("dashboard.defect.recent")}</h3>
          <div className="mt-2 divide-y divide-gray-100">
            {snapshot.recentDefects.length ? (
              snapshot.recentDefects.map((item) => {
                const matchedProd = products.find((p) => p.name === item.productName || p.code === item.productId);
                const prodName = localizedName({ locale: language, ko: item.productName, ja: matchedProd?.nameJa });
                return (
                  <div key={item.id} className="py-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="font-mono text-gray-500">{item.createdAt.split(" ")[1]}</span>
                      <DefectStatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 font-semibold">
                      {prodName} · {t(DEFECT_TYPE_KEYS[item.defectType])} · <span className="text-red-600">{item.defectQuantity}{t("unit.item")}</span>
                    </p>
                    <p className="mt-1 truncate font-mono text-blue-600">{item.lotNumber}</p>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-gray-400">{t("dashboard.noDefectsToday")}</p>
            )}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-3 font-bold text-gray-900">{t("dashboard.lineStatus")}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.lineProgress.map((line) => {
            const lineName = localizedName({ locale: language, ko: line.lineName, ja: line.lineNameJa });
            const productName = localizedName({ locale: language, ko: line.productName, ja: line.productNameJa });
            return (
              <div key={line.lineName} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between">
                  <h3 className="font-bold">{lineName}</h3>
                  <LineBadge status={line.status} />
                </div>
                <p className="mt-2 text-sm text-gray-600">{productName}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-2xl font-extrabold text-blue-700">
                    {line.productionQuantity.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-gray-500">/ {line.planQuantity.toLocaleString()}{t("unit.item")}</span>
                  </p>
                  <p className="font-bold">{line.achievementRate.toFixed(1)}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, line.achievementRate)}%` }} />
                </div>
                <p className="mt-3 text-right text-xs text-gray-400">{t("dashboard.lastUpdated")} {line.updatedAt}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function LineBadge({ status }: { status: ProductionLineRuntimeStatus }) {
  const { t } = useLanguage();
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${LINE_STATUS[status].style}`}>{t(LINE_STATUS[status].label)}</span>;
}

function Mini({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className={`rounded-lg p-3 ${danger ? "bg-red-50" : "bg-gray-50"}`}>
      <p className="text-xs text-gray-500">{t(label)}</p>
      <p className={`mt-1 text-lg font-extrabold ${danger ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
