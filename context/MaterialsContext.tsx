"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type {
  MaterialInbound,
  MaterialInventory,
  MaterialOutbound,
  MaterialPurchaseRequest,
  MaterialTransaction,
} from "@/types/materials";
import { fetchMaterialsSnapshot } from "@/lib/supabase/materials";

interface MaterialsContextType {
  inbounds: MaterialInbound[];
  inventories: MaterialInventory[];
  outbounds: MaterialOutbound[];
  transactions: MaterialTransaction[];
  purchaseRequests: MaterialPurchaseRequest[];
  setInbounds: React.Dispatch<React.SetStateAction<MaterialInbound[]>>;
  setInventories: React.Dispatch<React.SetStateAction<MaterialInventory[]>>;
  setOutbounds: React.Dispatch<React.SetStateAction<MaterialOutbound[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<MaterialTransaction[]>>;
  setPurchaseRequests: React.Dispatch<React.SetStateAction<MaterialPurchaseRequest[]>>;
  materialsLoading: boolean;
  materialsError: string | null;
  refreshMaterials: () => Promise<void>;

  // 백워드 호환 프로퍼티명
  inboundRecords: MaterialInbound[];
  inventoryLots: MaterialInventory[];
  outboundRecords: MaterialOutbound[];
  materialTransactions: MaterialTransaction[];
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [inbounds, setInbounds] = useState<MaterialInbound[]>([]);
  const [inventories, setInventories] = useState<MaterialInventory[]>([]);
  const [outbounds, setOutbounds] = useState<MaterialOutbound[]>([]);
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<MaterialPurchaseRequest[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const refreshMaterials = useCallback(async () => {
    await Promise.resolve();
    setMaterialsLoading(true);
    setMaterialsError(null);
    try {
      const snapshot = await fetchMaterialsSnapshot();
      setInbounds(snapshot.inbounds);
      setInventories(snapshot.inventories);
      setOutbounds(snapshot.outbounds);
      setTransactions(snapshot.transactions);
      setPurchaseRequests(snapshot.purchaseRequests);
    } catch (error) {
      setMaterialsError(error instanceof Error ? error.message : "자재 데이터를 불러오지 못했습니다.");
    } finally {
      setMaterialsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refreshMaterials(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshMaterials]);

  return (
    <MaterialsContext.Provider
      value={{
        inbounds,
        inventories,
        outbounds,
        transactions,
        purchaseRequests,
        setInbounds,
        setInventories,
        setOutbounds,
        setTransactions,
        setPurchaseRequests,
        materialsLoading,
        materialsError,
        refreshMaterials,

        inboundRecords: inbounds,
        inventoryLots: inventories,
        outboundRecords: outbounds,
        materialTransactions: transactions,
      }}
    >
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (!context) {
    throw new Error("useMaterials must be used within a MaterialsProvider");
  }
  return context;
}
