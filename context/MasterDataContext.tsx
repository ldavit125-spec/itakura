"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Product, Material, Supplier, ProductionLine } from "@/types/master-data";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";
import { fetchMasterData } from "@/lib/supabase/master-data";

export interface Worker {
  id: string;
  name: string;
  department: string;
  role: string;
}

export const INITIAL_WORKERS: Worker[] = [
  { id: "w-1", name: EMPLOYEE_NAMES.worker, department: "생산1팀", role: "작업자" },
  { id: "w-2", name: EMPLOYEE_NAMES.doughWorker, department: "생산1팀", role: "작업자" },
  { id: "w-3", name: EMPLOYEE_NAMES.ovenWorker, department: "생산2팀", role: "작업자" },
  { id: "w-4", name: EMPLOYEE_NAMES.packagingWorker, department: "생산3팀", role: "작업자" },
  { id: "w-5", name: EMPLOYEE_NAMES.qualityManager, department: "품질관리팀", role: "검사원" },
];

interface MasterDataContextType {
  products: Product[];
  materials: Material[];
  suppliers: Supplier[];
  productionLines: ProductionLine[];
  workers: Worker[];
  masterDataLoading: boolean;
  masterDataError: string | null;
  refreshMasterData: () => Promise<void>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setProductionLines: React.Dispatch<React.SetStateAction<ProductionLine[]>>;
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);

  const refreshMasterData = useCallback(async () => {
    await Promise.resolve();
    setMasterDataLoading(true);
    setMasterDataError(null);
    try {
      const snapshot = await fetchMasterData();
      setProducts(snapshot.products);
      setMaterials(snapshot.materials);
      setSuppliers(snapshot.suppliers);
      setProductionLines(snapshot.productionLines);
    } catch (error) {
      setMasterDataError(
        error instanceof Error ? error.message : "기준정보를 불러오지 못했습니다.",
      );
    } finally {
      setMasterDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshMasterData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshMasterData]);

  return (
    <MasterDataContext.Provider
      value={{
        products,
        materials,
        suppliers,
        productionLines,
        workers,
        masterDataLoading,
        masterDataError,
        refreshMasterData,
        setProducts,
        setMaterials,
        setSuppliers,
        setProductionLines,
        setWorkers,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (!context) {
    throw new Error("useMasterData must be used within a MasterDataProvider");
  }
  return context;
}
