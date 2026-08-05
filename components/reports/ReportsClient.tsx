"use client";

import React from "react";
import { useReports } from "@/context/ReportsContext";
import { exportTableToCsv } from "@/lib/report-csv";
import { aggregateProductionReport } from "@/lib/production-report";
import { aggregateMaterialReport } from "@/lib/material-report";
import { aggregateQualityReport } from "@/lib/quality-report";
import { aggregateLotReport } from "@/lib/lot-report";

import ReportsTabs from "./ReportsTabs";
import ReportFilterBar from "./ReportFilterBar";
import ReportExportButtons from "./ReportExportButtons";
import PdfHelpModal from "./PdfHelpModal";

import IntegratedReportDashboard from "./IntegratedReportDashboard";
import ProductionReport from "./ProductionReport";
import MaterialInventoryReport from "./MaterialInventoryReport";
import QualityAnalysisReport from "./QualityAnalysisReport";
import LotTraceabilityReport from "./LotTraceabilityReport";

import { useProduction } from "@/context/ProductionContext";
import { useMaterials } from "@/context/MaterialsContext";
import { useQuality } from "@/context/QualityContext";
import { useMasterData } from "@/context/MasterDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 보고서 및 통계관리 클라이언트 메인 컨테이너
// ============================================================

export default function ReportsClient() {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const {
    activeTab,
    setActiveTab,
    filter,
    updateFilter,
    resetFilters,
    dateError,
    isPdfHelpOpen,
    setIsPdfHelpOpen,
    triggerPrint,
  } = useReports();

  const { plans, workOrders, results, fgLots } = useProduction();
  const { inbounds, inventories, outbounds } = useMaterials();
  const { incoming, processList, finished, nonconformities, correctiveActions } = useQuality();
  const { materials } = useMasterData();

  const handleExportCurrentTabCsv = () => {
    if (activeTab === "dashboard" || activeTab === "production") {
      const data = aggregateProductionReport(filter, { plans, workOrders, results });
      const headers = isJa
        ? ["生産日", "作業指示番号", "生産実績番号", "製品名", "生産ライン", "計画数量", "生産数量", "良品数量", "不良数量", "達成率(%)", "担当者"]
        : ["생산일", "작업지시번호", "생산실적번호", "제품명", "생산라인", "계획수량", "생산수량", "양품수량", "불량수량", "달성률(%)", "담당자"];
      const rows = data.detailedTable.map((r) => [r.productionDate, r.workOrderNo, r.resultNo, localizedName({ locale, ko: r.productName, ja: r.productNameJa }), localizedName({ locale, ko: r.productionLine, ja: r.lineNameJa }), r.plannedQuantity, r.productionQuantity, r.goodQuantity, r.defectQuantity, `${r.achievementRate}%`, r.handler]);
      exportTableToCsv(headers, rows, isJa ? "統合経営生産レポート" : "통합경영생산보고서");
    } else if (activeTab === "materials") {
      const data = aggregateMaterialReport(filter, { inbounds, inventories, outbounds, materials });
      const headers = isJa
        ? ["資材コード", "資材名", "入荷数量", "出庫数量", "現在庫", "安全在庫", "不足数量", "単位", "基本取引先"]
        : ["자재코드", "자재명", "입고수량", "출고수량", "현재재고", "안전재고", "부족수량", "단위", "기본거래처"];
      const rows = data.materialAggTable.map((m) => [m.materialCode, localizedName({ locale, ko: m.materialName, ja: m.materialNameJa }), m.totalInboundQty, m.totalOutboundQty, m.currentStock, m.safetyStock, m.shortageQty, localizedName({ locale, ko: m.unit }), localizedName({ locale, ko: m.defaultSupplier, ja: m.supplierNameJa })]);
      exportTableToCsv(headers, rows, isJa ? "資材在庫レポート" : "자재재고보고서");
    } else if (activeTab === "quality") {
      const data = aggregateQualityReport(filter, { incoming, processList, finished, nonconformities, correctiveActions });
      const headers = isJa
        ? ["検査区分", "全検査", "合格件数", "条件付き合格", "保留件数", "不合格件数", "合格率(%)"]
        : ["검사구분", "전체검사", "합격건수", "조건부합격", "보류건수", "불합격건수", "합격률(%)"];
      const rows = data.categoryInspectionTable.map((c) => [c.categoryLabel, c.totalCount, c.passedCount, c.conditionalPassCount, c.holdCount, c.failedCount, `${c.passRate}%`]);
      exportTableToCsv(headers, rows, isJa ? "品質分析レポート" : "품질분석보고서");
    } else if (activeTab === "lot") {
      const data = aggregateLotReport(filter, {
        inventories,
        inbounds,
        outbounds,
        fgLots,
        results,
        finishedInspections: finished,
        nonconformities,
        correctiveActions,
      });
      const headers = isJa
        ? ["完成品LOT番号", "製品名", "生産日", "作業指示番号", "生産実績番号", "完成品品質状態"]
        : ["완제품LOT번호", "제품명", "생산일", "작업지시번호", "생산실적번호", "완제품품질상태"];
      const rows = data.fgLotTraceTable.map((f) => [f.fgLotNo, localizedName({ locale, ko: f.productName, ja: f.productNameJa }), f.productionDate, f.workOrderNo, f.resultNo, f.qualityStatus]);
      exportTableToCsv(headers, rows, isJa ? "LOT追跡レポート" : "LOT추적보고서");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 타이틀 & 내보내기 버튼 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            {isJa ? "統計および総合分析レポート" : "통계 및 종합 분석 보고서"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isJa
              ? "資材、生産、品質、LOT追跡全過程のデータを期間別にリアルタイム集計します。"
              : "자재, 생산, 품질, LOT 추적 전 과정의 데이터를 기간별로 실시간 집계합니다."}
          </p>
        </div>

        <ReportExportButtons
          onExportCsv={handleExportCurrentTabCsv}
          onPrint={triggerPrint}
          onOpenPdfHelp={() => setIsPdfHelpOpen(true)}
        />
      </div>

      {/* 2. 공통 기간 및 조건 필터 바 */}
      <ReportFilterBar
        filter={filter}
        onChange={updateFilter}
        onReset={resetFilters}
        dateError={dateError}
      />

      {/* 3. 메인 탭 래퍼 카드 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="p-4 sm:p-6">
          {/* 탭 1: 통합 경영현황 */}
          {activeTab === "dashboard" && <IntegratedReportDashboard filter={filter} />}

          {/* 탭 2: 생산실적 보고서 */}
          {activeTab === "production" && <ProductionReport filter={filter} />}

          {/* 탭 3: 자재·재고 보고서 */}
          {activeTab === "materials" && <MaterialInventoryReport filter={filter} />}

          {/* 탭 4: 품질분석 보고서 */}
          {activeTab === "quality" && <QualityAnalysisReport filter={filter} />}

          {/* 탭 5: LOT 추적 보고서 */}
          {activeTab === "lot" && <LotTraceabilityReport filter={filter} />}
        </div>
      </div>

      {/* 4. PDF 저장 안내 모달 */}
      <PdfHelpModal
        isOpen={isPdfHelpOpen}
        onClose={() => setIsPdfHelpOpen(false)}
        onPrint={triggerPrint}
      />
    </div>
  );
}
