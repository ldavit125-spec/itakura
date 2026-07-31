"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import type { ReportTab, ReportFilter, ReportPeriodType } from "@/types/reports";
import { calculateDateRange, validateDateRange } from "@/lib/report-date-utils";

// ============================================================
// 보고서 및 통계관리 Context 인터페이스
// ============================================================

interface ReportsContextType {
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;

  filter: ReportFilter;
  updateFilter: (partial: Partial<ReportFilter>) => void;
  resetFilters: () => void;
  dateError: string;

  isPdfHelpOpen: boolean;
  setIsPdfHelpOpen: (open: boolean) => void;

  triggerPrint: () => void;
}

const ReportsContext = createContext<ReportsContextType | null>(null);

const DEFAULT_FILTER: ReportFilter = {
  periodType: "THIS_MONTH",
  startDate: "2026-07-01",
  endDate: "2026-07-31",
  productCode: "ALL",
  productionLine: "ALL",
  materialCode: "ALL",
  supplierName: "ALL",
  handler: "ALL",
  status: "ALL",
  aggregationType: "DAILY",
};

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ReportTab>("dashboard");
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [dateError, setDateError] = useState<string>("");
  const [isPdfHelpOpen, setIsPdfHelpOpen] = useState(false);

  const updateFilter = (partial: Partial<ReportFilter>) => {
    setFilter((prev) => {
      let next = { ...prev, ...partial };

      // 기간 선택 변경 시 시작일/종료일 자동 계산
      if (partial.periodType && partial.periodType !== "CUSTOM") {
        const { startDate, endDate } = calculateDateRange(partial.periodType);
        next.startDate = startDate;
        next.endDate = endDate;
      }

      // 날짜 유효성 검증
      const validation = validateDateRange(next.startDate, next.endDate);
      if (!validation.isValid) {
        setDateError(validation.errorMessage || "올바르지 않은 기간입니다.");
      } else {
        setDateError("");
      }

      return next;
    });
  };

  const resetFilters = () => {
    setFilter(DEFAULT_FILTER);
    setDateError("");
  };

  const triggerPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        filter,
        updateFilter,
        resetFilters,
        dateError,
        isPdfHelpOpen,
        setIsPdfHelpOpen,
        triggerPrint,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}
