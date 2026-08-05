# 🏠 집(다른 환경)에서 작업 재개 시 가이드 문서 (HANDOVER_GUIDE.md)

이 문서는 프로젝트(`itakura`)를 집이나 다른 컴퓨터 환경에서 이어서 작업할 때 **주의할 점**, **중요한 설정/규칙**, 그리고 **작업 시작 절차**를 정리한 가이드입니다.

---

## 📌 1. 깃허브(Git) 푸시 현황 및 브랜치 정보

- **현재 작업 브랜치**: `feature/japanese-ui`
- **최신 커밋**: `4831071` (`refactor: remove shipment completion rate KPI card and calculation from dashboard`)
- **원격 저장소**: `https://github.com/ldavit125-spec/itakura.git`

> ⚠️ **주의**: 최신 변경 사항은 모두 `feature/japanese-ui` 브랜치에 푸시되어 있습니다. 집에서 작업 시작 시 반드시 해당 브랜치를 체크아웃하거나 풀(pull) 받아주세요.

---

## 🚀 2. 집에서 작업 시작할 때 진행 순서

### Step 1: 최신 코드 내려받기
```bash
# 프로젝트 폴더 이동 후
git fetch origin
git checkout feature/japanese-ui
git pull origin feature/japanese-ui
```

### Step 2: 의존성 설치 (필요 시)
```bash
npm install
```

### Step 3: 개발 서버 실행
```bash
npm run dev
```
- 접속 주소: `http://localhost:3000` (또는 표시되는 포트)

---

## ⚠️ 3. 프로젝트 핵심 규칙 및 주의사항 (필독)

### 1) 🛑 `이임원` 관리자 계정 이름 한국어 유지 규칙
- **절대 주의**: 일본어 모드(`ja`)로 언어를 전환하더라도 관리자 이름인 **`이임원`**은 일본어(`李任元`)로 번역하지 않고 **한국어 원본 그대로 `이임원`으로 유지**해야 합니다.
- 해당 위치: 로그인 표시, 상단 헤더 유저 정보, 사용자 목록 테이블, 감사 로그(Audit Log) 등.

### 2) 📅 날짜 입력필드 (`DateInput`) 규칙
- 자재, 생산, 품질, 출하 관리의 모든 날짜 입력창은 공통 `DateInput` 컴포넌트([components/ui/DateInput.tsx](file:///d:/이임원/04_바이브코딩/itakura/components/ui/DateInput.tsx))를 사용하고 있습니다.
- **요구사항**:
  - `YYYY-MM-DD` 형식 키보드 직접 입력 지원 (숫자와 하이픈만 입력 가능).
  - 잘못된 날짜(예: `2026-02-31`) 입력 시 폼에 반영하지 않고 붉은색 테두리 에러 표시.
  - `Enter` 키 입력 또는 `Blur`(포커스 해제) 시 값 확정.
  - 📅 달력 선택 버튼 클릭 시 네이티브 날짜 피커 연동.

### 3) 📊 출하 완료율 KPI 카드 관련
- 출하는 완제품 직접 출하 방식으로 작동하므로 대시보드의 **'출하 완료율' KPI 카드는 삭제**된 상태입니다.
- 출하 관련 KPI는 `오늘 출하건수`와 `오늘 출하수량` 2개로 유지되며, `sm:grid-cols-2`로 반응형 균등 정렬되어 있습니다.

### 4) 🌐 다국어 (i18n) 표시 원칙
- UI 텍스트: `useLanguage()` 훅과 `t("key")` 활용.
- 데이터 항목(제품명, 자재명, 거래처명, 부서명, 역할명 등): `localizedName({ locale, ko: item.name, ja: item.nameJa })` 또는 [lib/i18n/localized.ts](file:///d:/이임원/04_바이브코딩/itakura/lib/i18n/localized.ts) 유틸리티 함수 사용.
- **자동 음역 가타카나 금지**: 한글 발음을 가타카나로 억제 변환하지 않고 정식 일본어 표현 사용 (`시스템운영` ➔ `システム運用`, `생산1팀` ➔ `生産1チーム` 등).

---

## 🔍 4. 작업 완료 후 검증 체크리스트

새로운 작업을 마치고 제출/푸시하기 전 다음 명령어를 실행하여 빌드가 정상 작동하는지 확인하세요.

```bash
# 1. 빌드 검증 (타입 에러 및 컴파일 확인)
npm run build

# 2. 깃 커밋 & 푸시
git add .
git commit -m "작업 내용 설명"
git push origin feature/japanese-ui
```

---

## 🛠️ 5. 주요 파일 경로 참고
- 공통 날짜 입력 컴포넌트: `components/ui/DateInput.tsx`
- 다국어 유틸리티 & 사전: `lib/i18n/localized.ts`, `lib/i18n/translations.ts`
- 메인 대시보드: `components/dashboard/RealtimeDashboard.tsx`
- 관리자 설정: `components/AdminClient.tsx`
