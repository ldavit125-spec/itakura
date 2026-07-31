"use client";

import React, { createContext, useContext, useState } from "react";
import type {
  MaterialInbound,
  MaterialInventory,
  MaterialOutbound,
  MaterialTransaction,
} from "@/types/materials";
import {
  INITIAL_MATERIAL_INBOUNDS,
  INITIAL_MATERIAL_INVENTORIES,
  INITIAL_MATERIAL_OUTBOUNDS,
  INITIAL_MATERIAL_TRANSACTIONS,
} from "@/data/materials.mock";

interface MaterialsContextType {
  inbounds: MaterialInbound[];
  inventories: MaterialInventory[];
  outbounds: MaterialOutbound[];
  transactions: MaterialTransaction[];
  setInbounds: React.Dispatch<React.SetStateAction<MaterialInbound[]>>;
  setInventories: React.Dispatch<React.SetStateAction<MaterialInventory[]>>;
  setOutbounds: React.Dispatch<React.SetStateAction<MaterialOutbound[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<MaterialTransaction[]>>;

  // 백워드 호환 프로퍼티명
  inboundRecords: MaterialInbound[];
  inventoryLots: MaterialInventory[];
  outboundRecords: MaterialOutbound[];
  materialTransactions: MaterialTransaction[];
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [inbounds, setInbounds] = useState<MaterialInbound[]>(INITIAL_MATERIAL_INBOUNDS);
  const [inventories, setInventories] = useState<MaterialInventory[]>(INITIAL_MATERIAL_INVENTORIES);
  const [outbounds, setOutbounds] = useState<MaterialOutbound[]>(INITIAL_MATERIAL_OUTBOUNDS);
  const [transactions, setTransactions] = useState<MaterialTransaction[]>(INITIAL_MATERIAL_TRANSACTIONS);

  return (
    <MaterialsContext.Provider
      value={{
        inbounds,
        inventories,
        outbounds,
        transactions,
        setInbounds,
        setInventories,
        setOutbounds,
        setTransactions,

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
