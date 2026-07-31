"use client";

import React from "react";
import DashboardCard from "@/components/ui/DashboardCard";
import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";
import { useQuality } from "@/context/QualityContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useMasterData } from "@/context/MasterDataContext";
import type { DashboardCardData } from "@/types";
import { getDashboardMetrics } from "@/lib/common-selectors";

// ============================================================
// 대시보드 KPI 카드 섹션 (실시간 공통 State 연동)
// ============================================================

export default function DashboardKpiCards() {
  const { plans, results } = useProduction();
  const { canAccessProductionLine } = useAdmin();
  const { queue } = useQuality();
  const { inventoryLots } = useMaterials();
  const { materials } = useMasterData();

  const kpiData = getDashboardMetrics(
    plans.filter((item) => canAccessProductionLine(item.productionLine)),
    results.filter((item) => canAccessProductionLine(item.productionLine)),
    queue,
    inventoryLots,
    materials
  );

  return (
    <section aria-label="오늘의 생산 현황">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        오늘의 생산 현황
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiData.map((card: DashboardCardData) => (
          <DashboardCard key={card.id} data={card} />
        ))}
      </div>
    </section>
  );
}
