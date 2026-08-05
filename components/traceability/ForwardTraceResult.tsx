import React from "react";
import { useRouter } from "next/navigation";
import type { ForwardTraceData } from "@/types/traceability";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 원재료 정방향 추적 결과 상세 뷰 컴포넌트
// ============================================================

interface ForwardTraceResultProps {
  data: ForwardTraceData;
  onOpenRecall: (lotNo: string, type: "RAW_MATERIAL_LOT") => void;
}

export default function ForwardTraceResult({
  data,
  onOpenRecall,
}: ForwardTraceResultProps) {
  const router = useRouter();
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const displayMaterialName = localizedName({ locale, ko: data.materialName, ja: data.materialNameJa });
  const displaySupplierName = localizedName({ locale, ko: data.supplierName, ja: data.supplierNameJa });

  return (
    <div className="space-y-6">
      {/* 1. 상단 기본 원재료 헤더 카드 */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/40 text-purple-200 border border-purple-400/30">
              {isJa ? "原材料順方向追跡 (Forward Traceability)" : "원재료 정방향 추적 (Forward Traceability)"}
            </span>
            <h3 className="text-xl font-extrabold mt-1 font-mono">{data.rawMaterialLotNo}</h3>
            <p className="text-sm text-purple-200 mt-0.5">
              [{data.materialCode}] <strong>{displayMaterialName}</strong> ({displaySupplierName})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRecall(data.rawMaterialLotNo, "RAW_MATERIAL_LOT")}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{isJa ? "🚨 リコール影響範囲確認" : "🚨 리콜 영향 범위 확인"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-purple-300">{isJa ? "入荷番号 / 入荷日:" : "입고 번호 / 입고일:"}</span>
            <p className="font-mono font-bold text-white mt-0.5">
              {data.inboundNo} ({data.inboundDate})
            </p>
          </div>
          <div>
            <span className="text-purple-300">{isJa ? "入荷数量 / 現在庫:" : "입고 수량 / 현재 재고:"}</span>
            <p className="font-bold text-white mt-0.5">
              {data.inboundQuantity.toLocaleString()} {localizedName({ locale, ko: data.unit })} /{" "}
              <strong className="text-green-400">{data.currentStock.toLocaleString()} {localizedName({ locale, ko: data.unit })}</strong>
            </p>
          </div>
          <div>
            <span className="text-purple-300">{isJa ? "賞味期限:" : "유통기한:"}</span>
            <p className="font-mono font-bold text-amber-300 mt-0.5">{data.expirationDate}</p>
          </div>
          <div>
            <span className="text-purple-300">{isJa ? "原材料検査状態:" : "원재료 검사 상태:"}</span>
            <p className="font-bold text-white mt-0.5">
              <span className="px-2 py-0.5 bg-green-500/40 border border-green-400 rounded text-green-200">
                {data.inspectionStatus === "PASSED" ? (isJa ? "合格" : "합격") :
                 data.inspectionStatus === "HOLD" ? (isJa ? "保留" : "보류") :
                 data.inspectionStatus === "FAILED" ? (isJa ? "不合格" : "불합격") :
                 data.inspectionStatus}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. 정방향 추적 요약 KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "使用された作業指示" : "사용된 작업지시"}</p>
          <p className="text-xl font-extrabold text-blue-600 mt-1">{data.usedWorkOrdersCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "連携された生産実績" : "연결된 생산실적"}</p>
          <p className="text-xl font-extrabold text-teal-600 mt-1">{data.linkedResultsCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "生成された完成品LOT" : "생성된 완제품 LOT"}</p>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">{data.generatedFGLotsCount}{isJa ? "件" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-green-200 shadow-sm text-center bg-green-50/20">
          <p className="text-xs text-green-700 font-semibold">{isJa ? "品質合格完成品" : "품질 합격 완제품"}</p>
          <p className="text-xl font-extrabold text-green-600 mt-1">{data.passedFGLotsCount}{isJa ? "件" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-sm text-center bg-red-50/20">
          <p className="text-xs text-red-700 font-semibold">{isJa ? "品質保留・不合格完成品" : "품질 보류·불합격 완제품"}</p>
          <p className="text-xl font-extrabold text-red-600 mt-1">{data.holdOrFailedFGLotsCount}{isJa ? "件" : "개"}</p>
        </div>
      </div>

      {/* 3. 자재 사용 및 생산 출고 이력 테이블 (다중 작업지시 연동) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">
            {isJa ? "■ 原材料LOT順方向投入および完成品生産連携履歴" : "■ 원재료 LOT 정방향 투입 및 완제품 생산 연결 내역"}
          </h4>
          <span className="text-gray-500">
            {isJa ? `計 ${data.usageList.length} 件の作業指示に分割使用` : `총 ${data.usageList.length}건의 작업지시에 분할 사용됨`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{isJa ? "出庫番号 / 出庫日" : "출고 번호 / 출고일"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "出庫数量" : "출고 수량"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "作業指示番号" : "작업지시 번호"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "生産ライン" : "생산라인"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "生産製品" : "생산 제품"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "作業状態" : "작업 상태"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "生産実績番号" : "생산실적 번호"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "完成品LOT番号" : "완제품 LOT 번호"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "完成品品質状態" : "완제품 품질상태"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "移動作業" : "이동 작업"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.usageList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                    {isJa ? "該当原材料LOTの生産投入出庫履歴がありません。" : "해당 원재료 LOT의 생산 투입 출고 이력이 없습니다."}
                  </td>
                </tr>
              ) : (
                data.usageList.map((item, idx) => {
                  const displayProductName = localizedName({ locale, ko: item.productName, ja: item.productNameJa });
                  const displayLineName = localizedName({ locale, ko: item.productionLine, ja: item.lineNameJa });

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-900">{item.outboundNo}</span>
                        <span className="text-xs text-gray-500 block font-mono">{item.outboundDate}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                        {item.outboundQuantity.toLocaleString()} {localizedName({ locale, ko: data.unit })}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-700">{item.workOrderNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{displayLineName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        [{item.productCode}] {displayProductName}
                      </td>
                      <td className="px-4 py-3 font-medium text-xs text-gray-700">
                        {item.workStatus === "COMPLETED" ? (isJa ? "完了" : "완료") :
                         item.workStatus === "IN_PROGRESS" ? (isJa ? "進行中" : "진행 중") :
                         item.workStatus === "WAITING" ? (isJa ? "待機" : "대기") :
                         item.workStatus}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.resultNo || "-"}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">
                        {item.fgLotNo || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.fgQualityStatus === "PASSED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-300"
                          }`}
                        >
                          {item.fgQualityStatus === "PASSED" ? (isJa ? "合格" : "합격") :
                           item.fgQualityStatus === "HOLD" ? (isJa ? "保留" : "보류") :
                           item.fgQualityStatus === "FAILED" ? (isJa ? "不合格" : "불합격") :
                           (isJa ? "待機" : "대기")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              router.push(`/materials?tab=inventory&lot=${encodeURIComponent(data.rawMaterialLotNo)}`)
                            }
                            className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded hover:bg-purple-100"
                          >
                            {isJa ? "資材 ↗" : "자재 ↗"}
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/production?tab=work-order&workOrder=${encodeURIComponent(item.workOrderNo)}`)
                            }
                            className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                          >
                            {isJa ? "生産 ↗" : "생산 ↗"}
                          </button>
                          {item.fgLotNo && (
                            <button
                              onClick={() =>
                                router.push(`/quality?tab=finished&lot=${encodeURIComponent(item.fgLotNo!)}`)
                              }
                              className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded hover:bg-indigo-100"
                            >
                              {isJa ? "品質 ↗" : "품질 ↗"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
