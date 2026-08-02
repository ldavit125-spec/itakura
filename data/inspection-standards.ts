import type { InspectionStandard } from "@/types/quality";

// ============================================================
// 품질관리 — 원재료 및 공정검사 항목 Mock 데이터
// (주: materialCode 기준 관리)
// ============================================================

export const RAW_MATERIAL_INSPECTION_STANDARDS: Record<string, InspectionStandard> = {
  "MAT-001": {
    targetCode: "MAT-001",
    targetName: "강력분",
    items: [
      { itemName: "외관", standardValue: "이상 없음 (백색 미분)", isMandatory: true },
      { itemName: "포장 상태", standardValue: "파손/오염 없음", isMandatory: true },
      { itemName: "수분 함량", standardValue: "15.0% 이하", isMandatory: true, unit: "%" },
      { itemName: "이물 여부", standardValue: "이물/곤충 없음", isMandatory: true },
      { itemName: "유통기한", standardValue: "잔여 6개월 이상", isMandatory: true },
    ],
  },
  "MAT-002": {
    targetCode: "MAT-002",
    targetName: "설탕",
    items: [
      { itemName: "외관", standardValue: "백색 결정 상태", isMandatory: true },
      { itemName: "포장 상태", standardValue: "밀봉 훼손 파손 없음", isMandatory: true },
      { itemName: "수분 함량", standardValue: "0.1% 이하", isMandatory: true, unit: "%" },
      { itemName: "이물 여부", standardValue: "이물 없음", isMandatory: true },
      { itemName: "유통기한", standardValue: "잔여 1년 이상", isMandatory: true },
    ],
  },
  "MAT-003": {
    targetCode: "MAT-003",
    targetName: "버터",
    items: [
      { itemName: "입고 온도", standardValue: "10.0℃ 이하", isMandatory: true, unit: "℃" },
      { itemName: "외관", standardValue: "변색/이상 없음", isMandatory: true },
      { itemName: "냄새", standardValue: "이취 없음", isMandatory: true },
      { itemName: "포장 상태", standardValue: "파손 및 누유 없음", isMandatory: true },
      { itemName: "유통기한", standardValue: "잔여 3개월 이상", isMandatory: true },
    ],
  },
  "MAT-004": {
    targetCode: "MAT-004",
    targetName: "계란",
    items: [
      { itemName: "입고 온도", standardValue: "10.0℃ 이하", isMandatory: true, unit: "℃" },
      { itemName: "외관", standardValue: "난각 파손/오염 없음", isMandatory: true },
      { itemName: "냄새", standardValue: "부패취/이취 없음", isMandatory: true },
      { itemName: "유통기한", standardValue: "기준 충족 (20일 이상)", isMandatory: true },
    ],
  },
  "MAT-005": {
    targetCode: "MAT-005",
    targetName: "팥앙금",
    items: [
      { itemName: "입고 온도", standardValue: "10.0℃ 이하", isMandatory: true, unit: "℃" },
      { itemName: "외관", standardValue: "이상 없음", isMandatory: true },
      { itemName: "포장 상태", standardValue: "밀봉 팩 파손 없음", isMandatory: true },
      { itemName: "이물 여부", standardValue: "이물 없음", isMandatory: true },
      { itemName: "유통기한", standardValue: "잔여 4개월 이상", isMandatory: true },
    ],
  },
};

export const PROCESS_INSPECTION_STANDARDS: Record<string, InspectionStandard> = {
  MIXING: {
    targetCode: "MIXING",
    targetName: "배합 공정",
    items: [
      { itemName: "원재료 투입 순서", standardValue: "작업표준 준수", isMandatory: true },
      { itemName: "배합 비율", standardValue: "레시피 대비 ±0.5%", isMandatory: true },
      { itemName: "배합 시간", standardValue: "15분 ±2분", isMandatory: true, unit: "분" },
      { itemName: "작업장 청결", standardValue: "이상 없음", isMandatory: true },
    ],
  },
  DOUGH: {
    targetCode: "DOUGH",
    targetName: "반죽 공정",
    items: [
      { itemName: "반죽 온도", standardValue: "26.0℃ ±1.0℃", isMandatory: true, unit: "℃" },
      { itemName: "반죽 상태", standardValue: "글루텐 형성 적정", isMandatory: true },
      { itemName: "탄력성", standardValue: "양호", isMandatory: true },
    ],
  },
  FERMENTATION: {
    targetCode: "FERMENTATION",
    targetName: "발효 공정",
    items: [
      { itemName: "발효 실온", standardValue: "38.0℃ ±2.0℃", isMandatory: true, unit: "℃" },
      { itemName: "발효 습도", standardValue: "85% ±5%", isMandatory: true, unit: "%" },
      { itemName: "발효 시간", standardValue: "50분 ±5분", isMandatory: true, unit: "분" },
      { itemName: "발효 상태", standardValue: "2.5배 팽창 적정", isMandatory: true },
    ],
  },
  DIVIDING: {
    targetCode: "DIVIDING",
    targetName: "분할 공정",
    items: [
      { itemName: "분할 중량", standardValue: "기준 중량 오차 범위 내", isMandatory: true, unit: "g" },
      { itemName: "중량 편차", standardValue: "±2.0g 이내", isMandatory: true, unit: "g" },
      { itemName: "형태 균일성", standardValue: "균일", isMandatory: true },
    ],
  },
  SHAPING: {
    targetCode: "SHAPING",
    targetName: "성형 공정",
    items: [
      { itemName: "제품 형태", standardValue: "정형 모양 준수", isMandatory: true },
      { itemName: "크기 규격", standardValue: "표준 틀 적합", isMandatory: true },
      { itemName: "표면 상태", standardValue: "상처/매끄러움 양호", isMandatory: true },
    ],
  },
  BAKING: {
    targetCode: "BAKING",
    targetName: "소성 공정",
    items: [
      { itemName: "오븐 온도", standardValue: "210.0℃ ±5.0℃", isMandatory: true, unit: "℃" },
      { itemName: "소성 시간", standardValue: "25분 ±2분", isMandatory: true, unit: "분" },
      { itemName: "굽기 색상", standardValue: "황금갈색 적정", isMandatory: true },
      { itemName: "중심 온도", standardValue: "95.0℃ 이상", isMandatory: true, unit: "℃" },
    ],
  },
  COOLING: {
    targetCode: "COOLING",
    targetName: "냉각 공정",
    items: [
      { itemName: "냉각 시간", standardValue: "40분 이상", isMandatory: true, unit: "분" },
      { itemName: "제품 중심 온도", standardValue: "28.0℃ 이하", isMandatory: true, unit: "℃" },
      { itemName: "결로 발생 여부", standardValue: "결로 없음", isMandatory: true },
    ],
  },
  PACKAGING: {
    targetCode: "PACKAGING",
    targetName: "포장 공정",
    items: [
      { itemName: "포장 재질 상태", standardValue: "파손/구김 없음", isMandatory: true },
      { itemName: "라벨 표시", standardValue: "선명 및 정확", isMandatory: true },
      { itemName: "유통기한 인쇄", standardValue: "누락 없음", isMandatory: true },
      { itemName: "밀봉 상태", standardValue: "완전 씰링", isMandatory: true },
    ],
  },
};

export const FINISHED_GOODS_STANDARD_ITEMS = [
  { itemName: "외관 및 굽기 색상", standardValue: "균일한 황금갈색", isMandatory: true },
  { itemName: "제품 형태 및 부피", standardValue: "변형 없음", isMandatory: true },
  { itemName: "평균 중량", standardValue: "허용 오차범위 내", isMandatory: true, unit: "g" },
  { itemName: "풍미 및 향", standardValue: "고유 고소한 풍미", isMandatory: true },
  { itemName: "식감", standardValue: "부드럽고 쫄깃함", isMandatory: true },
  { itemName: "이물 혼입 여부", standardValue: "이물 일체 없음", isMandatory: true },
  { itemName: "포장 및 씰링", standardValue: "완전 밀봉", isMandatory: true },
  { itemName: "제품명 및 유통기한 인쇄", standardValue: "선명/정확", isMandatory: true },
  { itemName: "LOT 및 알레르기 표시", standardValue: "표준 표기 준수", isMandatory: true },
];
