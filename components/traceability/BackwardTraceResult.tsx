import React from "react";
import type { BackwardTraceData } from "@/types/traceability";
import { useLanguage } from "@/context/LanguageContext";
import { localizedName } from "@/lib/i18n/localized";

// ============================================================
// 완제품 역방향 추적 결과 상세 뷰 컴포넌트
// ============================================================

interface BackwardTraceResultProps {
  data: BackwardTraceData;
  onTriggerForward: (lotNo: string) => void;
  onOpenRecall: (lotNo: string, type: "FINISHED_GOODS_LOT") => void;
}

export default function BackwardTraceResult({
  data,
  onTriggerForward,
  onOpenRecall,
}: BackwardTraceResultProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const displayProductName = localizedName({ locale, ko: data.productName, ja: data.productNameJa });
  const displayLineName = localizedName({ locale, ko: data.productionLine, ja: data.lineNameJa });

  return (
    <div className="space-y-6">
      {/* 1. 상단 완제품 기본 헤더 카드 */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
              {isJa ? "完成品逆方向追跡 (Backward Traceability)" : "완제품 역방향 추적 (Backward Traceability)"}
            </span>
            <h3 className="text-xl font-extrabold mt-1 font-mono">{data.fgLotNo}</h3>
            <p className="text-sm text-indigo-200 mt-0.5">
              [{data.productCode}] <strong>{displayProductName}</strong> ({displayLineName})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRecall(data.fgLotNo, "FINISHED_GOODS_LOT")}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{isJa ? "🚨 リコール影響範囲確認" : "🚨 리콜 영향 범위 확인"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-indigo-300">{isJa ? "生産日 / 担当者:" : "생산일 / 담당자:"}</span>
            <p className="font-mono font-bold text-white mt-0.5">
              {data.productionDate} ({localizedName({ locale, ko: data.handler })})
            </p>
          </div>
          <div>
            <span className="text-indigo-300">{isJa ? "総生産量 / 良品数量:" : "총 생산량 / 양품 수량:"}</span>
            <p className="font-bold text-white mt-0.5">
              {data.totalQuantity.toLocaleString()} {localizedName({ locale, ko: data.unit })} /{" "}
              <strong className="text-green-400">{data.goodQuantity.toLocaleString()} {localizedName({ locale, ko: data.unit })}</strong>
            </p>
          </div>
          <div>
            <span className="text-indigo-300">{isJa ? "賞味期限:" : "유통기한:"}</span>
            <p className="font-mono font-bold text-amber-300 mt-0.5">{data.expirationDate}</p>
          </div>
          <div>
            <span className="text-indigo-300">{isJa ? "品質状態 / 出荷可能:" : "품질 상태 / 출고 가능:"}</span>
            <p className="font-bold text-white mt-0.5">
              <span className="px-2 py-0.5 bg-green-500/40 border border-green-400 rounded text-green-200">
                {data.qualityStatus === "PASSED" ? (isJa ? "合格" : "합격") :
                 data.qualityStatus === "HOLD" ? (isJa ? "保留" : "보류") :
                 data.qualityStatus === "FAILED" ? (isJa ? "不合格" : "불합격") :
                 data.qualityStatus} ({data.isReleaseAvailable ? (isJa ? "出荷可能" : "출고 가능") : (isJa ? "出荷不可" : "출고 불가")})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. 역방향 추적 요약 KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "使用された原材料種類" : "사용된 원재료 종류"}</p>
          <p className="text-xl font-extrabold text-blue-600 mt-1">{data.usedMaterialTypesCount}{isJa ? "種" : "종"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "連携された原材料LOT" : "연결된 원재료 LOT"}</p>
          <p className="text-xl font-extrabold text-purple-600 mt-1">{data.linkedRawLotCount}{isJa ? "件" : "개"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-center">
          <p className="text-xs text-gray-500 font-semibold">{isJa ? "完了した検査件数" : "완료된 검사 건수"}</p>
          <p className="text-xl font-extrabold text-teal-600 mt-1">{data.completedInspectionsCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-sm text-center bg-red-50/20">
          <p className="text-xs text-red-700 font-semibold">{isJa ? "不適合発生件数" : "부적합 발생 건수"}</p>
          <p className="text-xl font-extrabold text-red-600 mt-1">{data.nonconformityCount}{isJa ? "件" : "건"}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm text-center bg-amber-50/20">
          <p className="text-xs text-amber-800 font-semibold">{isJa ? "未完了是正措置" : "미완료 시정조치"}</p>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{data.unresolvedCACount}{isJa ? "件" : "건"}</p>
        </div>
      </div>

      {/* 3. 사용 원재료 역추적 목록 (다중 원재료 LOT 연동) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs">
          <h4 className="font-bold text-gray-800">
            {isJa ? "■ 完成品逆方向投入原材料LOTおよび供給企業履歴" : "■ 완제품 역방향 투입 원재료 LOT 및 공급업체 내역"}
          </h4>
          <span className="text-gray-500">
            {isJa ? `計 ${data.usedMaterials.length} 個の原材料LOT投入確認` : `총 ${data.usedMaterials.length}개 원재료 LOT 투입 확인`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 min-w-[1100px]">
            <thead className="text-xs uppercase bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{isJa ? "資材コード / 資材名" : "자재 코드 / 자재명"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "投入原材料LOT番号" : "투입 원재료 LOT 번호"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "出庫番号" : "출고 번호"}</th>
                <th className="px-4 py-3 font-semibold text-right">{isJa ? "使用数量" : "사용 수량"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "取引先" : "거래처"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "原材料検査結果" : "원재료 검사결과"}</th>
                <th className="px-4 py-3 font-semibold">{isJa ? "製造日 / 賞味期限" : "제조일 / 유통기한"}</th>
                <th className="px-4 py-3 font-semibold text-center">{isJa ? "順方向追跡転換" : "정방향 추적 전환"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.usedMaterials.map((mat, idx) => {
                const displayMatName = localizedName({ locale, ko: mat.materialName, ja: mat.materialNameJa });
                const displaySupName = localizedName({ locale, ko: mat.supplierName, ja: mat.supplierNameJa });

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      [{mat.materialCode}] {displayMatName}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-purple-700">{mat.rawMaterialLotNo}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{mat.outboundNo}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-600">
                      {mat.usedQuantity.toLocaleString()} {localizedName({ locale, ko: mat.unit })}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{displaySupName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full border border-green-200">
                        {mat.inspectionStatus === "PASSED" ? (isJa ? "合格" : "합격") :
                         mat.inspectionStatus === "HOLD" ? (isJa ? "保留" : "보류") :
                         mat.inspectionStatus === "FAILED" ? (isJa ? "不合格" : "불합격") :
                         mat.inspectionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">
                      {mat.manufactureDate} ~ {mat.expirationDate}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => onTriggerForward(mat.rawMaterialLotNo)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 rounded hover:bg-purple-700 shadow-sm"
                      >
                        {isJa ? "この資材順方向追跡 →" : "이 자재 정방향 추적 →"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
