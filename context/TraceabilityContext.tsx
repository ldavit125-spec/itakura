"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from "react";
import type {
  TraceTab,
  TraceabilitySummary,
  TraceHistoryItem,
  RecallImpactResult,
} from "@/types/traceability";
import { calculateTraceabilitySummary } from "@/lib/traceability-calculations";
import { calculateRecallImpact } from "@/lib/recall-impact";
import { fetchTraceHistory, saveTraceHistory } from "@/lib/supabase/traceability";

// ============================================================
// LOT 통합 추적관리 Context 인터페이스
// ============================================================

interface TraceabilityContextType {
  activeTab: TraceTab;
  setActiveTab: (tab: TraceTab) => void;
  summary: TraceabilitySummary;

  forwardTargetLotNo: string;
  setForwardTargetLotNo: (lotNo: string) => void;

  backwardTargetLotNo: string;
  setBackwardTargetLotNo: (lotNo: string) => void;

  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  history: TraceHistoryItem[];
  traceLoading: boolean;
  traceError: string | null;
  addHistoryLog: (
    direction: TraceHistoryItem["direction"],
    searchQuery: string,
    startNo: string,
    resultCount: number,
    hasQualityAnomaly?: boolean
  ) => void;

  recallModal: {
    isOpen: boolean;
    result?: RecallImpactResult;
  };
  openRecallModal: (lotNo: string, type: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT") => void;
  closeRecallModal: () => void;

  triggerForwardTrace: (lotNo: string) => void;
  triggerBackwardTrace: (lotNo: string) => void;
}

import { useMaterials } from "./MaterialsContext";
import { useProduction } from "./ProductionContext";
import { useQuality } from "./QualityContext";
import { useAdmin } from "./AdminContext";

const TraceabilityContext = createContext<TraceabilityContextType | null>(null);

export function TraceabilityProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TraceTab>("search");

  const [forwardTargetLotNo, setForwardTargetLotNo] = useState("LOT-FLOUR-260730-A");
  const [backwardTargetLotNo, setBackwardTargetLotNo] = useState("FG-PRD001-20260730-001");

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "LOT-FLOUR-260730-A",
    "FG-PRD001-20260730-001",
    "WO-20260730-001",
    "IQC-20260715-001",
  ]);

  const [history, setHistory] = useState<TraceHistoryItem[]>([]);
  const [traceLoading, setTraceLoading] = useState(true);
  const [traceError, setTraceError] = useState<string|null>(null);

  const [recallModal, setRecallModal] = useState<{
    isOpen: boolean;
    result?: RecallImpactResult;
  }>({ isOpen: false });

  const { inventories, outbounds } = useMaterials();
  const { fgLots, workOrders } = useProduction();
  const { nonconformities, correctiveActions: actions } = useQuality();
  const { currentUser } = useAdmin();
  useEffect(()=>{const timer=setTimeout(()=>{void fetchTraceHistory().then(data=>{setHistory(data);setTraceError(null)}).catch(error=>setTraceError(error instanceof Error?error.message:"추적 이력을 불러오지 못했습니다.")).finally(()=>setTraceLoading(false));},0);return()=>clearTimeout(timer)},[]);

  const summary = useMemo(
    () => calculateTraceabilitySummary({ inventories, fgLots, workOrders, actions }),
    [inventories, fgLots, workOrders, actions]
  );

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      return [query.trim(), ...filtered].slice(0, 8);
    });
  }, []);

  const clearRecentSearches = () => setRecentSearches([]);

  const addHistoryLog = (
    direction: TraceHistoryItem["direction"],
    searchQuery: string,
    startNo: string,
    resultCount: number,
    hasQualityAnomaly: boolean = false
  ) => {
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newLog: TraceHistoryItem = {
      id: `th-${nowStr.replace(/[- :]/g,"")}-${history.length+1}`,
      traceTimestamp: nowStr,
      direction,
      searchQuery,
      startNo,
      resultCount,
      relatedRawLotCount: 1,
      relatedFGLotCount: 1,
      hasQualityAnomaly,
      user: currentUser.name,
    };
    setHistory((prev) => [newLog, ...prev]);
    void saveTraceHistory(newLog,currentUser.id).catch(error=>setTraceError(error instanceof Error?error.message:"추적 이력을 저장하지 못했습니다."));
  };

  const triggerForwardTrace = (lotNo: string) => {
    setForwardTargetLotNo(lotNo);
    setActiveTab("forward");
    addRecentSearch(lotNo);
    addHistoryLog("FORWARD", lotNo, lotNo, 2, false);
  };

  const triggerBackwardTrace = (lotNo: string) => {
    setBackwardTargetLotNo(lotNo);
    setActiveTab("backward");
    addRecentSearch(lotNo);
    addHistoryLog("BACKWARD", lotNo, lotNo, 4, false);
  };

  const openRecallModal = (lotNo: string, type: "RAW_MATERIAL_LOT" | "FINISHED_GOODS_LOT") => {
    const result = calculateRecallImpact(lotNo, type, {
      inventories,
      outbounds,
      workOrders,
      fgLots,
      nonconformities,
      correctiveActions: actions,
    });
    setRecallModal({ isOpen: true, result });
  };

  const closeRecallModal = () => setRecallModal({ isOpen: false });

  return (
    <TraceabilityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        summary,
        forwardTargetLotNo,
        setForwardTargetLotNo,
        backwardTargetLotNo,
        setBackwardTargetLotNo,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        history,
        traceLoading,
        traceError,
        addHistoryLog,
        recallModal,
        openRecallModal,
        closeRecallModal,
        triggerForwardTrace,
        triggerBackwardTrace,
      }}
    >
      {children}
    </TraceabilityContext.Provider>
  );
}

export function useTraceability() {
  const context = useContext(TraceabilityContext);
  if (!context) {
    throw new Error("useTraceability must be used within a TraceabilityProvider");
  }
  return context;
}
