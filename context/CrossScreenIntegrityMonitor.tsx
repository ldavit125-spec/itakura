"use client";

import { useEffect } from "react";
import { validateCrossScreenMetrics } from "@/lib/common-selectors";
import { useMasterData } from "./MasterDataContext";
import { useMaterials } from "./MaterialsContext";
import { useProduction } from "./ProductionContext";
import { useQuality } from "./QualityContext";

export default function CrossScreenIntegrityMonitor() {
  const { materials } = useMasterData();
  const { inventories, inbounds, outbounds } = useMaterials();
  const { plans, workOrders, results } = useProduction();
  const {
    queue,
    incoming,
    processList,
    finished,
    correctiveActions,
  } = useQuality();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    validateCrossScreenMetrics({
      plans,
      results,
      workOrders,
      queue,
      incoming,
      processList,
      finished,
      actions: correctiveActions,
      inventories,
      inbounds,
      outbounds,
      materials,
    });
  }, [
    plans,
    results,
    workOrders,
    queue,
    incoming,
    processList,
    finished,
    correctiveActions,
    inventories,
    inbounds,
    outbounds,
    materials,
  ]);

  return null;
}
