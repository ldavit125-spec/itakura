"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { MaterialInventory } from "@/types/materials";
import { InventoryStatusBadge, InspectionStatusBadge } from "./MaterialStatusBadge";
import { localizedName } from "@/lib/i18n/localized";

interface MaterialInventoryDetailModalProps {
  isOpen: boolean;
  item?: MaterialInventory;
  onClose: () => void;
}

export default function MaterialInventoryDetailModal({ isOpen, item, onClose }: MaterialInventoryDetailModalProps) {
  const { t, language } = useLanguage();
  if (!isOpen || !item) return null;

  const isLow = item.currentStock < item.safetyStock;
  const shortageAmount = isLow ? item.safetyStock - item.currentStock : 0;
  const materialName = localizedName({ locale: language, ko: item.materialName, ja: item.materialNameJa });
  const location = localizedName({ locale: language, ko: item.location });
  const supplierName = localizedName({ locale: language, ko: item.supplierName, ja: item.supplierNameJa });
  const unit = localizedName({ locale: language, ko: item.unit });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t("materials.modal.inventoryDetail")}</h3>
            <p className="mt-0.5 font-mono text-xs text-gray-500">{item.lotNo}</p>
          </div>
          <button onClick={onClose} aria-label={t("action.close")} className="rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4 p-6 text-sm">
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-center">
            {[["materials.inventory.current", item.currentStock, "text-gray-900"], ["materials.inventory.available", item.availableStock, "text-green-600"], ["materials.inventory.holdStock", item.holdStock, "text-purple-600"]].map(([key, value, color]) => (
              <div key={String(key)}><p className="text-xs font-semibold text-gray-500">{t(String(key))}</p><p className={`mt-1 text-xl font-bold ${color}`}>{Number(value).toLocaleString()} <span className="text-xs font-normal text-gray-500">{unit}</span></p></div>
            ))}
          </div>
          {isLow && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{t("materials.inventory.shortageWarning", { safety: item.safetyStock.toLocaleString(), shortage: shortageAmount.toLocaleString(), unit })}</div>}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-gray-100 py-3">
            <div><span className="font-medium text-gray-500">{t("master.field.materialCode")}</span><span className="ml-2 font-mono font-semibold text-gray-900">{item.materialCode}</span></div>
            <div><span className="font-medium text-gray-500">{t("master.field.materialName")}</span><span className="ml-2 font-semibold text-gray-900">{materialName}</span></div>
            <div><span className="font-medium text-gray-500">{t("materials.inventory.location")}</span><span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800">{location}</span></div>
            <div><span className="font-medium text-gray-500">{t("master.field.defaultSupplier")}</span><span className="ml-2 text-gray-800">{supplierName}</span></div>
            <div><span className="font-medium text-gray-500">{t("materials.expirationDate")}</span><span className="ml-2 font-mono font-medium text-gray-900">{item.expirationDate}</span></div>
            <div><span className="font-medium text-gray-500">{t("master.field.safetyStock")}</span><span className="ml-2 text-gray-800">{item.safetyStock.toLocaleString()} {unit}</span></div>
            <div><span className="font-medium text-gray-500">{t("materials.inbound.inspectionStatus")}</span><span className="ml-2 inline-block"><InspectionStatusBadge status={item.inspectionStatus} /></span></div>
            <div><span className="font-medium text-gray-500">{t("materials.inventory.status")}</span><span className="ml-2 inline-block"><InventoryStatusBadge status={item.inventoryStatus} /></span></div>
          </div>
          <div className="flex justify-end pt-2"><button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">{t("action.close")}</button></div>
        </div>
      </div>
    </div>
  );
}
