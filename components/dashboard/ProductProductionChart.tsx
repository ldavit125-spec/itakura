"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useProduction } from "@/context/ProductionContext";
import { useAdmin } from "@/context/AdminContext";
import { useMasterData } from "@/context/MasterDataContext";
import { aggregateProductionByProduct } from "@/lib/common-selectors";
import { PRODUCT_CODE_LABELS, type ProductCode } from "@/types/dashboard";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 제품별 생산량 Bar Chart (실시간 Context 연동)
// ============================================================

/** 제품별 막대 색상 */
const BAR_COLORS = ["#2563eb", "#0ea5e9", "#06b6d4", "#6366f1", "#8b5cf6"] as const;

/** 커스텀 Tooltip */
interface TooltipPayloadItem {
  value: number;
  payload: { label: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function ProductTooltip({ active, payload }: CustomTooltipProps) {
  const { t } = useLanguage();
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{item.payload.label}</p>
      <p className="text-gray-600">
        {t("dashboard.productionQuantity")}:{" "}
        <span className="font-medium text-gray-900">
          {item.value.toLocaleString()}{t("unit.item")}
        </span>
      </p>
    </div>
  );
}

/** Y축 눈금 포맷 */
function yAxisTickFormatter(value: number | string | readonly (string | number)[]): string {
  if (typeof value !== "number") return String(value);
  return value.toLocaleString("ko-KR");
}

export default function ProductProductionChart() {
  const { t, language } = useLanguage();
  const { results } = useProduction();
  const { canAccessProductionLine } = useAdmin();
  const { products } = useMasterData();

  const productDataList = aggregateProductionByProduct(
    results.filter((item) => canAccessProductionLine(item.productionLine)),
    products
  );

  const chartData = productDataList.map((d: { productCode: string; productName: string; quantity: number }) => {
    const matchedProd = products.find((p) => p.code === d.productCode || p.name === d.productName);
    return {
      productCode: d.productCode,
      label: localizedName({ locale: language, ko: d.productName, ja: matchedProd?.nameJa }),
      quantity: d.quantity,
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      {/* 헤더 */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-800">{t("dashboard.productProduction")}</h3><p className="text-xs text-gray-500 mt-0.5 font-medium">{t("dashboard.productProductionDescription")}</p>
      </div>

      {/* 차트 */}
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">
          {t("empty.chart")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={yAxisTickFormatter}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<ProductTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
              {chartData.map((entry: { productCode: string; label: string; quantity: number }, index: number) => (
                <Cell
                  key={entry.productCode}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
