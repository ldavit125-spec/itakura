# 🔄 ChatGPT → Antigravity 작업 이관 가이드

작성일: 2026-08-05
프로젝트: **ITakura MES/ERP 통합관리 시스템**
프로젝트 경로: `D:\이임원\04_바이브코딩\itakura`

> 이 문서는 ChatGPT에서 진행하던 ITakura 프로젝트 개발을 **Antigravity (Gemini/Claude 기반 IDE 에이전트)** 환경으로 이관하여 작업할 때 반드시 알아야 할 주의사항과 중요 포인트를 정리한 가이드입니다.

---

## 0. 2026-08-05 현재 인수인계 상태 (가장 먼저 읽기)

### 최신 상태 요약

- 현재 브랜치: `feature/japanese-ui`
- GitHub 원격 브랜치: `origin/feature/japanese-ui`
- 최신 푸시 커밋: `102fe97 fix: enable shipment number generation control`
- 직전 주요 커밋:
  - `eb289d0 fix: localize demo user names in header`
  - `51923fd fix: localize shipment date filter placeholder`
  - `c98ac87 fix: 출하계획 탭 제거 및 일본어 모드 한글 표시 수정`
  - `c6ec30c feat: complete quality and shipment localization`
- `npm.cmd exec -- tsc --noEmit`: 성공
- `npm.cmd run build`: 성공
- Vercel Production: `https://itakura.vercel.app`
- Vercel Production 재배포 및 기준정보 조회 정상 확인
- 최신 기능 커밋은 GitHub `origin/feature/japanese-ui`에 푸시 완료
- 이 문서를 갱신하기 직전 작업 트리는 깨끗했으며, 이번 문서 수정분만 새 변경으로 남음
- `102fe97` 이후 Vercel Production 재배포는 별도로 수행하지 않았으므로, Production 반영 여부는 배포 목록에서 확인할 것

### Vercel/Supabase 연결 복구 이력

Vercel 기준정보 화면에서 `TypeError: Failed to fetch`가 발생했습니다. 원인은 코드가 아니라 Vercel 환경변수 누락·불일치였습니다.

- 코드가 사용하는 변수:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- 변수가 없을 때 코드의 fallback:
  - `https://placeholder.supabase.co`
  - `placeholder-key`
- Production과 Preview에 두 환경변수를 로컬 `.env.local`의 현재 정상값으로 등록함
- Production을 재배포하고 `https://itakura.vercel.app/master-data`에서 제품 8행 조회 확인
- Vercel 콘솔 오류 0건 확인
- A001 / `admin1234` 로그인 후 `/admin` 이동 확인
- 기준정보 수정 모달 진입 확인. 데이터 보호를 위해 실제 저장·삭제는 수행하지 않음

> [!IMPORTANT]
> Vercel 환경변수는 이미 복구되었습니다. `.env.local` 값을 문서나 콘솔에 출력하지 말고, 환경변수를 삭제하거나 placeholder 값으로 다시 설정하지 마세요. 새 배포에서 연결 문제가 생기면 먼저 Vercel의 Production/Preview 적용 범위와 재배포 여부를 확인하세요.

### 헤더 데모 사용자 이름 표시 규칙

최신 커밋 `eb289d0`에서 헤더의 데모 사용자 선택기 표시를 수정했습니다.

- 한국어 모드: 모든 사용자 이름을 기존 한국어 원본으로 표시
- 일본어 모드: 기존 `localizedName()` 매핑을 사용해 일본어 사용자 이름 표시
- 예외: 시스템 관리자 `user-admin`의 이름 `이임원`은 일본어 모드에서도 **반드시 한국어 그대로 유지**
- 혼합 표기였던 `デ모ユーザー`를 `デモユーザー`로 수정
- 드롭다운의 `value`는 사용자 ID를 그대로 사용하므로 사용자 전환·권한 로직에는 영향 없음
- 헤더 우측 현재 사용자 이름과 아바타 문자에도 같은 표시 규칙 적용

관련 파일:

- `components/layout/Header.tsx`
- `lib/i18n/translations.ts`

> [!CAUTION]
> 사용자 표시 이름을 고치기 위해 `AdminUser.name`, 사용자 ID, 역할 ID, Auth, 세션 또는 감사 로그 원본 데이터를 변경하지 마세요. `이임원`을 일본어로 음역하거나 번역 사전에 넣지 마세요.

### 품질관리 불량품 이력 날짜 필터

품질관리 → 불량품 이력 탭의 날짜 필터가 브라우저 기본 한국어 형식 `연도-월-일`로 남아 있던 문제를 수정했습니다.

- 수정 파일: `components/quality/DefectHistoryTable.tsx`
- 기존 `<input type="date">`를 공통 `components/ui/DateInput.tsx`로 교체
- 한국어 모드: `연도-월-일`
- 일본어 모드: `年 - 月 - 日`
- 날짜 state, `inspectionDate` 비교 필터, 품질 데이터 조회 및 CRUD 로직은 변경하지 않음
- `npm.cmd exec -- tsc --noEmit` 및 `npm.cmd run build` 성공

> [!CAUTION]
> 날짜 문구를 수정하기 위해 검사일 데이터 형식이나 DB 컬럼을 변경하지 마세요. `DateInput`은 화면의 빈 날짜 안내만 현지화하며 실제 값은 기존 `YYYY-MM-DD` 형식을 유지합니다.

### 현재 요청 범위

현재 진행 중인 작업은 **출하관리 메뉴의 한국어/일본어 전환 보완**입니다. 다음 영역만 대상입니다.

- 출하등록, 출하대기, 출하완료, 출하이력 (`출하계획` 탭은 후속 커밋 `c98ac87`에서 제거됨)
- 출하관리의 검색, 필터, 표, 상세 모달, 상태 라벨, 성공·오류 메시지
- 제품명·거래처명은 기존 `nameJa`/`name_ja` 데이터가 있을 때 일본어로 표시
- 일본어명이 없으면 한국어 원본으로 표시

출하관리와 무관한 메뉴를 추가로 수정하지 마세요. 앞서 진행한 **품질관리 현지화 변경은 이미 커밋·푸시된 사용자 작업**이므로, 출하 작업 과정에서 품질 파일을 되돌리거나 덮어쓰면 안 됩니다.

### 이번 작업에서 이미 수정한 파일

- `components/shipment/ShipmentClient.tsx`
- `components/shipment/ShipmentStatusBadge.tsx`
- `context/ShipmentContext.tsx`
- `lib/shipment-selectors.ts`
- `types/shipment.ts`
- `lib/i18n/translations.ts` (품질관리 변경과 출하관리 변경이 함께 존재)

### 구현된 내용

- 출하관리 탭을 `출하등록 / 출하대기 / 출하완료 / 출하이력`으로 구성
- 모든 출하 UI 라벨을 `shipment.*` 번역 키로 연결
- 상태 코드 `PLANNED`, `READY`, `COMPLETED`, `CANCELLED`는 그대로 유지하고 화면 라벨만 번역
- 제품·거래처 표시 시 기존 일본어 데이터 사용, 일본어 값이 없으면 한국어 원본 유지
- 언어 전환 시 `ShipmentProvider`를 재마운트하거나 데이터를 재조회하지 않음
- PASSED LOT 출하 허용, FAILED/HOLD 및 검사 미완료 LOT 차단 로직 유지
- 출하 상세의 감사 로그 설명은 화면에서만 언어별로 표시
- 출하대기·출하완료·출하이력의 날짜 필터는 공통 `DateInput`을 사용
  - 한국어: `연도-월-일`
  - 일본어: `年 - 月 - 日`
- 출하등록의 `출하번호 자동 생성` 요소를 실제 활성 버튼으로 변경
  - 기존 `generateShipmentNumber()`를 재사용해 다음 출하번호 미리보기 표시
  - 클릭 시 생성된 번호를 한국어/일본어 메시지로 안내
  - 실제 등록 시 `ShipmentContext`가 사용하는 기존 번호 생성 로직과 CRUD는 변경하지 않음
- DB 쿼리, Supabase client, Auth, RLS, 재고/LOT 관계 로직은 변경하지 않음

### 실제 검증 결과

- `npm.cmd exec -- tsc --noEmit`: 성공
- `npm.cmd run build`: 성공 (Next.js 16.2.12, 14개 정적 페이지 생성)
- 한국어→일본어 전환을 5회 수행했고, 선택한 LOT와 입력 수량이 유지됨
- 실제 PASSED LOT로 출하계획 1건을 등록하고 출하 완료까지 확인함
- 생성된 테스트 출하: `SHP-20260805-003`
- 연결 LOT: `FG-PRD001-20260730-001`
- 테스트 수량: `7개`
- LOT 재고: `3,120개 → 3,113개`로 정상 차감 확인
- 상세 모달의 LOT 추적 링크: `/traceability?lot=FG-PRD001-20260730-001` 확인
- 출하 성공 메시지와 상태 라벨의 일본어 표시 확인

> [!IMPORTANT]
> 위 테스트 출하 데이터는 이미 Supabase에 저장되었습니다. 같은 테스트를 다시 실행해 중복 출하를 만들지 마세요. 테스트 행을 임의 삭제하거나 재고를 수동 복구하지 말고, 제거가 필요하면 사용자에게 먼저 확인하세요.

### 아직 확인하거나 정리할 항목

- 마지막 감사 로그 번역 수정 후 상세 모달의 문구를 필요 시 한 번 더 확인
- 새 변경 뒤에도 브라우저 콘솔 error 0건인지 확인
- `Failed to fetch`, `column does not exist`가 재발하지 않는지 확인
- FAILED/HOLD LOT은 출하 선택 목록에 노출되지 않는지 확인 (비즈니스 로직 자체는 유지됨)
- 제품·거래처의 `name_ja`가 현재 DB에 비어 있으면 일본어 모드에서도 한국어가 표시되는 것이 **요구된 fallback 동작**임
- 출하 상세의 담당자 `이임원`이 별도 화면에서 자동 음역되어 보이는지 확인할 수 있음. 수정이 필요하면 `user-admin` 예외 표시 규칙을 재사용하되 Auth/사용자 원본 데이터는 변경하지 말 것
- GitHub 푸시는 `102fe97`까지 완료됨
- Vercel Production의 Supabase 연결 복구 배포는 완료됐지만, 최신 UI 커밋의 Production 반영은 별도 확인 필요

### 현재 Git 작업 트리 주의

품질관리와 출하관리 현지화 변경은 이미 커밋·푸시되었습니다. 새 작업을 시작할 때는 반드시 `git status --short`로 이후에 추가된 로컬 변경이 있는지 확인하세요.

```text
components/quality/*.tsx          품질관리 현지화 변경
components/shipment/*.tsx         출하관리 현지화 변경
context/LanguageContext.tsx       기존 다국어 변경
context/ShipmentContext.tsx       출하 화면용 메시지 키 연결
lib/i18n/localized.ts             기존 명칭 표시 변경
lib/i18n/translations.ts          품질+출하 번역 사전 변경
lib/shipment-selectors.ts         출하 불가 사유 키 연결
types/shipment.ts                 출하 탭/결과 타입 변경
```

다음 명령으로 실제 변경을 먼저 확인하세요.

```powershell
git status --short
git diff -- components/shipment context/ShipmentContext.tsx lib/shipment-selectors.ts types/shipment.ts
git diff -- lib/i18n/translations.ts
```

> [!CAUTION]
> `git reset --hard`, `git checkout -- .`, 전체 파일 덮어쓰기, 기계적 일괄 치환을 하지 마세요. 특히 `translations.ts`는 품질관리와 출하관리 변경이 겹쳐 있어 파일 전체를 이전 버전으로 되돌리면 이미 완료한 작업이 사라집니다.

### Antigravity에 전달할 시작 메시지

```text
CHATGPT_TO_ANTIGRAVITY_GUIDE.md를 처음부터 끝까지 읽고 작업을 이어가세요.

현재 우선 작업은 사용자가 새로 지정하는 화면의 최소 범위 수정입니다.
가이드 0장의 최신 커밋, Vercel/Supabase 복구 상태와 이미 생성된 테스트 출하를 반드시 확인하세요.

헤더의 데모 사용자 이름은 일본어 모드에서 일본어로 표시하지만,
user-admin의 이름 이임원은 일본어 모드에서도 한국어 그대로 유지해야 합니다.

DB reset, seed 재실행, migration 수정·추가, DELETE/TRUNCATE/DROP,
Auth/RLS/권한/Supabase client 변경은 금지합니다.
Vercel 환경변수는 이미 정상화되었으므로 삭제·초기화하거나 값을 출력하지 마세요.
출하 가능 판정, 재고 차감, LOT 연결, CRUD 로직은 변경하지 마세요.

먼저 git status와 최근 커밋을 확인하고, 수정 대상 파일만 읽은 뒤
npm.cmd exec -- tsc --noEmit 및 npm.cmd run build를 실행하세요.
이미 생성된 SHP-20260805-003을 다시 만들거나 삭제하지 마세요.
```

---

## 📋 목차

1. [환경 차이 핵심 요약](#1-환경-차이-핵심-요약)
2. [이관 전 반드시 확인할 것](#2-이관-전-반드시-확인할-것)
3. [프로젝트 기술 사양](#3-프로젝트-기술-사양)
4. [아키텍처 패턴 — 반드시 숙지](#4-아키텍처-패턴--반드시-숙지)
5. [다국어(i18n) 시스템 — 현재 상태와 규칙](#5-다국어i18n-시스템--현재-상태와-규칙)
6. [데이터 저장 방식 — 매우 중요](#6-데이터-저장-방식--매우-중요)
7. [절대 하지 말아야 할 것](#7-절대-하지-말아야-할-것)
8. [Antigravity에서 작업할 때 주의사항](#8-antigravity에서-작업할-때-주의사항)
9. [ChatGPT 대화 내용 전달 방법](#9-chatgpt-대화-내용-전달-방법)
10. [작업 시작 체크리스트](#10-작업-시작-체크리스트)
11. [문제 발생 시 대응](#11-문제-발생-시-대응)
12. [관련 문서](#12-관련-문서)

---

## 1. 환경 차이 핵심 요약

| 항목 | ChatGPT | Antigravity |
|---|---|---|
| **코드 실행** | 대화창에서 코드 제안만 가능, 직접 실행 불가 | 파일 직접 편집, 터미널 명령 실행, 브라우저 확인 가능 |
| **파일 접근** | 프로젝트 파일 직접 읽기 불가 (복사-붙여넣기 필요) | 프로젝트 디렉토리 전체 접근 가능 |
| **컨텍스트 유지** | 대화 길어지면 앞부분 잘림, 세션 종료 시 맥락 사라짐 | 가이드 문서(`AGENTS.md`, `*.md`)로 영구 컨텍스트 유지 |
| **변경 적용** | 사용자가 직접 복사-붙여넣기 | 에이전트가 직접 파일 수정 (사용자 승인 후) |
| **검증** | 사용자가 수동 빌드/테스트 | 에이전트가 직접 `tsc`, `npm run build` 실행 가능 |

> [!IMPORTANT]
> **핵심 차이**: Antigravity는 코드를 **직접 수정**합니다. ChatGPT처럼 "이 코드를 복사해서 붙여넣으세요"가 아니라, 파일을 바로 편집합니다. 따라서 **작업 전 Git 상태 확인**과 **변경 범위 제한**이 더욱 중요합니다.

---

## 2. 이관 전 반드시 확인할 것

### ✅ ChatGPT에서 마지막으로 한 작업 정리

ChatGPT 대화에서 마지막으로 수정한 파일 목록과 변경 내용을 정리합니다:

```text
예시:
- components/quality/InspectionQueueTable.tsx → localizedName 적용
- lib/i18n/localized.ts → DEFAULT_JA_FALLBACKS에 직원 이름 추가
- components/quality/IncomingInspectionTable.tsx → 일본어 전환 시 한글 표시 수정
```

### ✅ 미완료 작업 목록

ChatGPT에서 진행 중이던 작업이 있다면 명확하게 기록합니다:

```text
예시:
- [ ] 품질검사 테이블에서 일본어 전환 시 일부 필드에 한글이 남아 있음
- [ ] 대시보드 KPI 카드 일본어 번역 누락
- [ ] 출하 관리 화면 일본어 미적용
```

### ✅ 현재 빌드 상태 확인

```powershell
npx tsc --noEmit
npm run build
```

> [!CAUTION]
> **빌드가 실패하는 상태로 이관하지 마세요.** ChatGPT에서 코드를 수정했지만 아직 붙여넣지 않은 코드가 있다면 먼저 적용하고 빌드를 확인합니다.

---

## 3. 프로젝트 기술 사양

| 항목 | 버전/구성 |
|---|---|
| Framework | Next.js **16.2.12** (App Router) |
| UI | React **19.2.4** |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`) |
| Chart | Recharts 3.10.1 |
| Backend | Supabase (제한적 사용) |
| Data | React Context + Mock Data 병행 |
| Auth | Context 기반 Mock RBAC (실 Auth 아님) |

> [!WARNING]
> **Next.js 16은 기존 Next.js와 다릅니다.** API, 파일 규칙, 라우팅이 다를 수 있습니다. 코드 작성 전 반드시 `node_modules/next/dist/docs/`의 로컬 문서를 확인하세요. ChatGPT가 Next.js 13~15 기반 코드를 제안했다면 호환성을 확인해야 합니다.

---

## 4. 아키텍처 패턴 — 반드시 숙지

### ① 디렉토리 구조

```text
itakura/
├── app/                      # Next.js App Router 페이지
│   └── (app)/                # 인증/AppShell 그룹 라우트
├── components/               # 도메인별 UI 컴포넌트
│   ├── dashboard/            # 대시보드 KPI, 차트
│   ├── layout/               # AppShell, Header, Sidebar
│   ├── master-data/          # 기준정보 (품목, 자재, 라인, 거래처)
│   ├── materials/            # 자재관리 (입고, 출고, 재고)
│   ├── production/           # 생산관리 (계획, 작업지시, 실적)
│   ├── quality/              # 품질관리 (검사, 부적합, 시정조치)
│   ├── reports/              # 보고서
│   ├── shipment/             # 출하관리
│   ├── traceability/         # LOT 추적
│   └── ui/                   # 공통 UI 컴포넌트
├── context/                  # React Context (도메인별 전역 상태)
├── data/                     # Mock 데이터
├── lib/                      # 유틸, 셀렉터, 비즈니스 로직
│   ├── i18n/                 # 다국어 (translations.ts, localized.ts)
│   ├── selectors/            # 화면 간 지표 정합성 셀렉터
│   └── supabase/             # Supabase 클라이언트
└── types/                    # TypeScript 타입 정의
```

### ② Context Provider 의존 순서 (변경 금지)

```text
AdminProvider (app/layout.tsx)
└─ LanguageProvider
   └─ MasterDataProvider
      └─ MaterialsProvider
         └─ ProductionProvider
            └─ QualityProvider
               └─ ShipmentProvider
                  └─ TraceabilityProvider
                     └─ ReportsProvider
```

> [!CAUTION]
> Provider 순서를 바꾸거나 페이지별로 중복 배치하면 **화면마다 서로 다른 상태**가 생깁니다. 절대 변경하지 마세요.

### ③ 공통 셀렉터 사용 원칙

- 대시보드 KPI, 통계 수치는 **`lib/selectors/`와 `lib/dashboard-monitoring.ts`의 공통 함수**를 사용합니다.
- 컴포넌트 내부에서 `.filter().reduce()` 등으로 집계를 직접 하지 않습니다.
- 같은 수치를 다른 화면에서 다시 계산하지 않습니다.

### ④ 업무 기준일

- 공통 업무 기준일: **`2026-07-31`** (Mock 기준)
- 날짜 유틸: `lib/selectors/business-date.ts`
- 특정 날짜를 JSX에 하드코딩하지 않습니다.

---

## 5. 다국어(i18n) 시스템 — 현재 상태와 규칙

> [!IMPORTANT]
> 이 프로젝트는 현재 **한국어(ko) + 일본어(ja) 2개 언어**를 지원합니다. 다국어 시스템 구조를 이해해야 합니다.

### 핵심 파일

| 파일 | 역할 |
|---|---|
| `context/LanguageContext.tsx` | 언어 상태 관리, `t()` 번역 함수, `locale` 제공 |
| `lib/i18n/translations.ts` | UI 문구 번역 사전 (ko/ja 키-값 쌍) |
| `lib/i18n/localized.ts` | 데이터 명칭 일본어 변환 (`localizedName()` 함수) |

### `localizedName()` 동작 원리

```typescript
localizedName({ locale, ko: "식빵" })
// locale === "ja" → "食パン" (DEFAULT_JA_FALLBACKS 사전에서 조회)
// locale === "ko" → "식빵" (한국어 그대로 반환)
```

1. `ja` 값이 명시적으로 있으면 → `ja` 반환
2. `ko` 값이 `DEFAULT_JA_FALLBACKS` 사전에 있으면 → 사전의 일본어 반환
3. 사전에 없으면 → 한글을 가타카나로 자동 음역 변환
4. `locale === "ko"`이면 → `ko` 그대로 반환

> [!CAUTION]
> 위 내용은 현재 공통 함수의 실제 동작 설명입니다. **출하관리의 제품명·거래처명에는 별도 요구사항이 적용됩니다.** 출하 화면은 명시적인 `nameJa` 값이 있을 때만 일본어를 사용하고, 없으면 한국어 원본으로 fallback해야 합니다. 출하 화면에서 임의 가타카나 자동 음역을 새로 추가하지 마세요.

### 일본어 전환 시 한글이 뜨는 문제 해결 방법

테이블 등에서 데이터 필드(제품명, 담당자명, 공급업체명 등)를 표시할 때:

```tsx
// ❌ 잘못된 예: 한글 데이터가 그대로 표시됨
<td>{item.productName}</td>

// ✅ 올바른 예: locale에 따라 자동 변환
<td>{localizedName({ locale, ko: item.productName })}</td>
```

**필요한 import:**
```tsx
import { localizedName } from "@/lib/i18n/localized";
```

**locale 가져오기:**
```tsx
const { locale } = useLanguage();
// 또는
const { language: locale } = useLanguage();
```

### 새 한글 명칭 추가 시

`lib/i18n/localized.ts`의 `DEFAULT_JA_FALLBACKS`에 한글→일본어 매핑을 추가합니다:

```typescript
const DEFAULT_JA_FALLBACKS: Record<string, string> = {
  // ... 기존 항목
  "새로운 한글 명칭": "対応する日本語",
};
```

---

## 6. 데이터 저장 방식 — 매우 중요

### Mock Data 기반 (새로고침 시 초기화)

| 구분 | 설명 |
|---|---|
| 초기 데이터 | `data/*.mock.ts` 또는 각 Context 내부 초기값 |
| 실행 중 상태 | React Context의 state (메모리) |
| 새로고침 | **모든 입력/수정 데이터가 초기화됨** |
| 서버 재시작 | 동일하게 초기화 |

### Supabase 연동 (부분적)

- 기준정보(제품, 자재, 공급업체, 라인)는 Supabase에서 읽어옴
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `.env.local`은 **절대 수정하거나 내용을 공개하지 않음**
- 일부 기준정보 테이블/프로젝트 환경에는 `name_ja`가 있을 수 있고, 없는 환경도 있으므로 현재 스키마와 기존 안전 조회 방식을 그대로 따름
- 존재하지 않는 `name_ja`를 쿼리에 새로 추가하거나 컬럼 생성을 가정하지 않음

> [!CAUTION]
> `db reset`, `DROP`, `TRUNCATE`, 전체 `DELETE`, 새 migration 생성, seed 재실행을 **절대 하지 마세요.**

---

## 7. 절대 하지 말아야 할 것

### 🚫 데이터/DB 관련
- `db reset`, `DROP`, `TRUNCATE`, 전체 `DELETE` 실행
- 기존 migration 수정 또는 새 migration 생성
- `seed.sql` 재실행
- DB에 `name_ja` 등 일본어 컬럼 추가
- `.env.local` 수정 또는 값 공개
- Supabase client 설정 변경

### 🚫 인증/권한 관련
- Auth, 관리자 로그인, ADMIN 역할, 권한, RLS 구조 변경
- 기존 CRUD 쿼리, 테이블명, 관계 ID 변경
- 관리자 사번(`A001`), 사용자 ID(`user-admin`), 역할 코드(`ADMIN`) 변경

### 🚫 아키텍처 관련
- Provider 순서 변경 또는 중복 배치
- 컴포넌트 내부에서 KPI 하드코딩
- 화면별 mock data 새로 생성
- 생산실적 불량수량과 불량 이력 동시 합산
- `node_modules` 또는 `.next`를 Git에 커밋

### 🚫 Git 관련
- `git reset --hard`, `git checkout -- .`, 강제 push
- 사용자 승인 없이 commit 또는 push
- `.env`, API 키, 비밀번호를 원격 저장소에 커밋

---

## 8. Antigravity에서 작업할 때 주의사항

### 📌 ChatGPT와 다른 점 — 작업 방식

1. **파일을 직접 수정합니다**
   - ChatGPT는 코드를 보여주고 사용자가 붙여넣었지만, Antigravity는 파일을 직접 편집합니다.
   - 수정 전에 항상 현재 파일 내용을 확인하세요.

2. **터미널 명령을 직접 실행합니다**
   - `npm run dev`, `npx tsc --noEmit`, `npm run build` 등을 에이전트가 직접 실행합니다.
   - 위험한 명령(DB 삭제 등)은 사용자 승인이 필요합니다.

3. **컨텍스트 관리가 다릅니다**
   - ChatGPT: 대화가 길어지면 앞부분이 잘려 맥락을 잃음
   - Antigravity: `AGENTS.md`, 가이드 문서, 프로젝트 파일을 직접 읽어 맥락 유지
   - **이 가이드 문서가 프로젝트 맥락의 핵심입니다**

### 📌 ChatGPT 코드를 Antigravity에 전달할 때

> [!WARNING]
> ChatGPT가 생성한 코드를 그대로 Antigravity에 "이 코드를 적용해줘"라고 전달하면 문제가 생길 수 있습니다.

**❌ 잘못된 방법:**
```
ChatGPT가 준 이 코드를 그대로 파일에 넣어줘:
[ChatGPT 생성 코드 전체 복사-붙여넣기]
```

**✅ 올바른 방법:**
```
InspectionQueueTable.tsx에서 targetName, lineOrSupplier, requester 필드에
일본어 전환 시 localizedName이 적용되도록 수정해줘
```

**이유:**
- ChatGPT는 프로젝트의 현재 파일 상태를 모르고 코드를 생성합니다.
- Antigravity는 실제 파일을 읽고 정확한 위치에 수정합니다.
- ChatGPT 코드가 현재 파일과 다르면 충돌이 발생합니다.

### 📌 Tailwind CSS v4 주의

- Tailwind CSS **v4**를 사용합니다 (v3과 다름).
- `@tailwindcss/postcss` 플러그인 기반.
- ChatGPT가 v3 문법의 설정을 제안하면 무시하세요.
- 기존 컴포넌트의 블루/그레이 톤 테마를 유지하세요.

### 📌 아이콘 처리

- 외부 아이콘 라이브러리(`lucide-react` 등) 추가 설치 금지.
- **Inline SVG** 방식 사용.
- 새 아이콘 필요 시 기존 컴포넌트의 SVG 포맷 참고.

---

## 9. ChatGPT 대화 내용 전달 방법

ChatGPT에서 Antigravity로 작업을 이관할 때 효과적으로 맥락을 전달하는 방법:

### 방법 1: 작업 요약 전달 (추천)

```
ChatGPT에서 다음 작업을 진행했습니다:

1. 품질관리 테이블(InspectionQueueTable, IncomingInspectionTable)에서
   일본어 전환 시 한글이 표시되는 문제를 수정했습니다.
   - localizedName() 함수로 데이터 필드를 감쌌습니다.

2. localized.ts에 직원 이름 일본어 매핑을 추가했습니다.

아직 남은 작업:
- DefectHistoryTable에도 동일한 수정이 필요합니다.
- 출하 관리 화면도 일본어 대응이 안 되어 있습니다.
```

### 방법 2: 변경 파일 목록 전달

```
다음 파일이 수정되었습니다:
- lib/i18n/localized.ts (44-66행 DEFAULT_JA_FALLBACKS 확장)
- components/quality/InspectionQueueTable.tsx (localizedName 적용)

이 파일들을 확인하고, 같은 패턴으로 DefectHistoryTable도 수정해주세요.
```

### 방법 3: 문제 상황 전달

```
일본어로 전환했는데 DashboardKpiCards에서 "오늘의 현황"이
한글로 계속 표시됩니다. 수정해주세요.
```

> [!TIP]
> **가장 효과적인 방법**: "어떤 화면에서 어떤 문제가 있는지" 또는 "어떤 기능을 추가하고 싶은지"를 설명하세요. Antigravity가 직접 파일을 읽고 분석하므로 코드를 복사할 필요가 없습니다.

---

## 10. 작업 시작 체크리스트

### 최초 이관 시

- [ ] ChatGPT에서 마지막으로 수정한 파일과 내용을 정리했다.
- [ ] 미완료 작업 목록을 정리했다.
- [ ] `git status --short`로 현재 변경 상태를 확인했다.
- [ ] `npx tsc --noEmit`이 성공한다.
- [ ] `npm run build`가 성공한다.
- [ ] `npm run dev`로 개발 서버가 정상 실행된다.
- [ ] `/admin/login`에서 A001 로그인이 된다.
- [ ] 주요 페이지(`/dashboard`, `/production`, `/quality`, `/materials`)가 정상 표시된다.
- [ ] 이 가이드 문서(`CHATGPT_TO_ANTIGRAVITY_GUIDE.md`)가 프로젝트 루트에 있다.

### 매 작업 시작 시

- [ ] `git status`로 이전 변경 확인
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 수정 대상 파일의 현재 상태 확인
- [ ] 수정 후 `npx tsc --noEmit` 통과 확인

### 작업 종료 시

- [ ] `npx tsc --noEmit` 성공
- [ ] `npm run build` 성공
- [ ] 브라우저에서 수정 결과 확인
- [ ] 사용자에게 변경 내용 보고

---

## 11. 문제 발생 시 대응

### `column ... name_ja does not exist`

DB에 컬럼을 추가하지 말고, 코드의 `.select()`, insert/update payload, mapper, 타입에서 일본어 필드 참조를 제거합니다.

### 일본어 전환 시 한글이 표시됨

1. 해당 컴포넌트에서 데이터 필드가 `localizedName()`으로 감싸져 있는지 확인
2. `localizedName` import와 `locale` 변수가 있는지 확인
3. 필요한 한글 명칭이 `DEFAULT_JA_FALLBACKS`에 등록되어 있는지 확인

### `Failed to fetch`

1. 개발 서버 실행 중인지 확인
2. `.env.local` 변수 이름 확인 (값 수정 금지)
3. `lib/supabase/client.ts`의 URL 정규화 유지 확인
4. seed를 다시 실행하지 않음

### 빌드 실패

1. `npx tsc --noEmit`으로 타입 오류 확인
2. import 경로와 export 확인
3. ChatGPT에서 적용한 코드가 현재 파일과 충돌하지 않는지 확인

---

## 12. 관련 문서

| 문서 | 용도 |
|---|---|
| [CODEX_HANDOVER_GUIDE.md](./CODEX_HANDOVER_GUIDE.md) | Antigravity 작업 인수인계 (한국어 제출본 기준) |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | 코덱스 환경 기술 사양 및 아키텍처 |
| [HOME_WORK_GUIDE.md](./HOME_WORK_GUIDE.md) | 집 PC 이관 및 개발 가이드 |
| [AGENTS.md](./AGENTS.md) | AI 에이전트 공통 규칙 |
| [context/AppProviders.tsx](./context/AppProviders.tsx) | Provider 순서 정의 |
| [lib/i18n/localized.ts](./lib/i18n/localized.ts) | 데이터 명칭 일본어 변환 함수 |
| [lib/i18n/translations.ts](./lib/i18n/translations.ts) | UI 문구 번역 사전 |
| [context/LanguageContext.tsx](./context/LanguageContext.tsx) | 언어 상태 관리 |

---

> **한 줄 요약**: ChatGPT에서는 "코드를 제안받아 직접 붙여넣기"했지만, Antigravity에서는 **"무엇을 하고 싶은지 설명"하면 에이전트가 직접 파일을 읽고 수정**합니다. 코드 복사 대신 **의도와 문제 상황**을 전달하세요.
