import React from "react";
import type { MaterialShortageItem, MaterialSummary } from "@/types/materials";
import MaterialSummaryCards from "./MaterialSummaryCards";
import { InventoryStatusBadge } from "./MaterialStatusBadge";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

interface MaterialShortageTableProps {
  shortageItems: MaterialShortageItem[];
  summary: MaterialSummary;
  onRequestPurchase: (materialCodes: string[]) => void;
  onReceiveMaterial: (materialCode: string) => void;
  onOpenCreate?: () => void;
  canManage: boolean;
}

export default function MaterialShortageTable({
  shortageItems,
  summary,
  onRequestPurchase,
  onReceiveMaterial,
  onOpenCreate,
  canManage,
}: MaterialShortageTableProps) {
  const { t, language } = useLanguage();

  return (
    <div className="p-4 sm:p-6">
      <MaterialSummaryCards summary={summary} />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span>{t("materials.shortage.title")}</span>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {shortageItems.length}{t("unit.case")}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {t("materials.shortage.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("materials.shortage.registerButton")}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm text-gray-700">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("master.field.materialCode")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.materialName")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("materials.inventory.current")}</th>
              <th className="px-4 py-3 text-right font-semibold">{t("master.field.safetyStock")}</th>
              <th className="px-4 py-3 text-right font-semibold text-red-600">{t("materials.shortage.shortageQty")}</th>
              <th className="px-4 py-3 font-semibold">{t("common.unit")}</th>
              <th className="px-4 py-3 font-semibold">{t("master.field.defaultSupplier")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("materials.inventory.status")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("materials.shortage.orderStatus")}</th>
              <th className="px-4 py-3 text-center font-semibold">{t("common.work")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shortageItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                  {t("materials.shortage.empty")}
                </td>
              </tr>
            ) : (
              shortageItems.map((item) => {
                const isCritical = item.inventoryStatus === "CRITICAL";
                const isRequested = item.orderStatus === "REQUESTED";
                return (
                  <tr key={item.materialCode} className={isCritical ? "bg-red-50/40 hover:bg-red-50" : "bg-amber-50/20 hover:bg-gray-50"}>
                    <td className="px-4 py-3 font-mono text-gray-600">{item.materialCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{localizedName({ locale: language, ko: item.materialName, ja: item.materialNameJa })}</td>
                    <td className={`px-4 py-3 text-right font-bold ${isCritical ? "text-red-600" : "text-amber-600"}`}>{item.currentStock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">{item.safetyStock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-red-600">-{item.shortageQty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{localizedName({ locale: language, ko: item.unit })}</td>
                    <td className="px-4 py-3">{localizedName({ locale: language, ko: item.defaultSupplier, ja: item.defaultSupplierJa })}</td>
                    <td className="px-4 py-3 text-center"><InventoryStatusBadge status={item.inventoryStatus} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${isRequested ? "border-blue-200 bg-blue-100 text-blue-700" : "border-red-200 bg-red-100 text-red-700"}`}>
                        {isRequested ? t("materials.shortage.statusWaiting") : t("materials.shortage.statusRequired")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {canManage && (isRequested ? (
                        <button type="button" onClick={() => onReceiveMaterial(item.materialCode)} className="rounded border border-green-600 bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">{t("materials.shortage.processReceive")}</button>
                      ) : (
                        <button type="button" onClick={() => onRequestPurchase([item.materialCode])} className="rounded border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">{t("materials.shortage.requestPurchase")}</button>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
