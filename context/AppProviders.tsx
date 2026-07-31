"use client";

import React from "react";
import { MasterDataProvider } from "./MasterDataContext";
import { MaterialsProvider } from "./MaterialsContext";
import { ProductionProvider } from "./ProductionContext";
import { QualityProvider } from "./QualityContext";
import { ShipmentProvider } from "./ShipmentContext";
import { TraceabilityProvider } from "./TraceabilityContext";
import { ReportsProvider } from "./ReportsContext";
import CrossScreenIntegrityMonitor from "./CrossScreenIntegrityMonitor";

// ============================================================
// 최상위 계층 공유 Provider 래퍼 (Single Source of Truth)
// ============================================================

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MasterDataProvider>
      <MaterialsProvider>
        <ProductionProvider>
          <QualityProvider>
            <ShipmentProvider>
              <TraceabilityProvider>
                <ReportsProvider>
                  <CrossScreenIntegrityMonitor />
                  {children}
                </ReportsProvider>
              </TraceabilityProvider>
            </ShipmentProvider>
          </QualityProvider>
        </ProductionProvider>
      </MaterialsProvider>
    </MasterDataProvider>
  );
}
