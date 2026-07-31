"use client";

import React, { createContext, useContext, useState } from "react";
import type { Product, Material, Supplier, ProductionLine } from "@/types/master-data";
import {
  INITIAL_PRODUCTS,
  INITIAL_MATERIALS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTION_LINES,
} from "@/data/master-data.mock";
import { EMPLOYEE_NAMES } from "@/data/admin.mock";

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
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setProductionLines: React.Dispatch<React.SetStateAction<ProductionLine[]>>;
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export function MasterDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>(INITIAL_PRODUCTION_LINES);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);

  return (
    <MasterDataContext.Provider
      value={{
        products,
        materials,
        suppliers,
        productionLines,
        workers,
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
