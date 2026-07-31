# 🚚 ITakura (MES/ERP 시스템) 코덱스(Codex) 이관 및 개발 가이드

이 문서는 ITakura 프로젝트를 코덱스(Codex) 환경으로 이관하여 작업을 원활하게 이어가기 위한 **기술 사양, 아키텍처 구조, 개발 패턴 및 주의사항**을 정리한 가이드라인입니다.

---

## 1. 기술 스택 (Technology Stack)

*   **Framework**: Next.js `16.2.12` (App Router 기반)
*   **Library**: React `19.2.4` (React 19 최신 기능 및 컴포넌트 모델 지원)
*   **Styling**: Tailwind CSS `v4` (`@tailwindcss/postcss` 연동)
*   **Data Visualization**: Recharts `^3.10.1` (대시보드 및 보고서 차트 시각화)
*   **Development Tools**: ESLint `^9`, TypeScript `^5`

---

## 2. 프로젝트 디렉토리 구조 및 역할

프로젝트는 명확한 역할 분담을 위해 다음과 같이 모듈화되어 있습니다.

```text
itakura/
├── app/                      # Next.js App Router 페이지 및 레이아웃
│   └── (app)/                # 인증/AppShell 적용 공통 그룹 라우트 (대시보드, 생산 등)
├── components/               # UI 및 비즈니스 컴포넌트 (도메인별 분리)
│   ├── dashboard/            # 대시보드 전용 차트 및 KPI 카드 컴포넌트
│   ├── layout/               # AppShell, Header, Sidebar 등 공통 레이아웃
│   ├── master-data/          # 기준정보 관리 (품목, 자재, 라인, 거래처 등)
│   ├── materials/            # 자재관리 (입고, 출고, 재고, 수불이력 등)
│   ├── production/           # 생산관리 (계획, 작업지시, 진행, 실적, 완제품 LOT 등)
│   ├── quality/              # 품질관리 (검사 대기열, 수입/공정/출하검사, 부적합, 시정조치)
│   ├── reports/              # 보고서 (생산, 자재, 품질, LOT 추적 보고서 및 PDF 뷰어)
│   ├── traceability/         # LOT 추적 (정방향/역방향 추적 및 LOT 관계도 다이어그램)
│   └── ui/                   # 공통 UI 컴포넌트 (DashboardCard, PageHeader 등)
├── constants/                # 상수, 라벨 및 업무 로직 검증 규칙
├── context/                  # React Context API를 통한 도메인별 상태 관리 (Single Source of Truth)
├── data/                     # 도메인별 고도화된 Mock 데이터
├── lib/                      # 공통 수학 연산, 번호 생성기 및 데이터 가공 셀렉터(Selectors)
│   └── selectors/            # 화면 간 지표 정합성을 검증하고 집계하는 핵심 셀렉터
├── types/                    # TypeScript 인터페이스 및 타입 정의
└── package.json              # 프로젝트 종속성 및 스크립트 정의
```

---

## 3. 핵심 아키텍처 패턴 (Architectural Patterns)

### ① React Context API 기반 전역 상태 관리
*   도메인별 상태(`plans`, `results`, `workOrders`, `inventories` 등)는 각 Context(`ProductionContext`, `QualityContext` 등)에서 관리합니다.
*   모든 Context Provider는 [AppProviders.tsx](file:///d:/이임원/04_바이브코딩/itakura/context/AppProviders.tsx)에서 합쳐져 최상위 레이아웃에 공유되므로, 화면 이동 간 상태가 완벽히 반응형으로 연동됩니다.

### ② 공통 업무 날짜(Business Date) 체계
*   MES/ERP 시스템의 특성상 일관된 시간 집계를 위해 실시간 시계 대신 기준 날짜를 Mocking하여 사용합니다.
*   공통 업무 기준일은 `2026-07-31`로 고정되어 있으며, 날짜 및 시간 계산 유틸리티는 [business-date.ts](file:///d:/이임원/04_바이브코딩/itakura/lib/selectors/business-date.ts)에 정의되어 있습니다.

### ③ 전 화면 지표 정합성 검증 엔진 (Cross-Screen Validation)
*   **중요**: 사용자가 입력하거나 변경한 데이터가 대시보드, 관리 화면, 보고서 화면 전체에 정확히 실시간 반영되는지 검증하기 위한 엔진이 작동 중입니다.
*   [cross-screen-validator.ts](file:///d:/이임원/04_바이브코딩/itakura/lib/selectors/cross-screen-validator.ts)의 `validateCrossScreenMetrics` 함수는 전 화면의 데이터 불일치(Discrepancy)를 검사하며, 불일치가 감지되면 브라우저 콘솔에 개발 경고를 출력합니다.

---

## 4. 도메인별 기능 개발 현황

1.  **대시보드**: 생산 계획/실적 추이 Line Chart, 제품별 생산량 Pie Chart, 품질 합격률 Bar Chart(Recharts 사용) 및 KPI 카드 연동.
2.  **기준정보 관리**: 설비 라인 관리, 완제품 품목 관리, 원자재 목록 관리, 거래처 관리에 필요한 모달 폼과 CRUD(Context 내부 임시 저장).
3.  **자재관리**: 자재 입고/출고 승인 모달, 현재고 실시간 파악 및 재고 부족 품목 알림, 입출고 수불이력 제공.
4.  **생산관리**: 생산계획 시간대 중복 검증, 작업지시 발행 및 작업자 배정, 실시간 진행률 추적, 실적 등록 시 완제품 LOT 자동 생성 및 유통기한 자동 계산.
5.  **품질관리**: 수입검사, 공정검사, 완제품 검사 대기열 관리, 불합격 항목 입력 폼, 시정조치서(CAPA) 발행 및 조치 결과 추적.
6.  **LOT 추적**: 완제품 LOT 번호 기반 역방향(Backward) 추적(사용 자재 확인) 및 원자재 LOT 번호 기반 정방향(Forward) 추적(출하처 확인), LOT 계층 다이어그램 시각화.
7.  **보고서**: 기간 필터링 및 엑셀 다운로드 시뮬레이션, 인쇄용 PDF 뷰어 프리뷰 지원.

---

## 5. 코덱스(Codex)에서 작업 시 주의사항 (CRITICAL WARNINGS)

> [!WARNING]
> **1. 새로고침 시 상태 초기화 현상 (Mock State Reset)**
> * 현재 프로젝트의 모든 상태(입력, 수정, 삭제)는 데이터베이스가 아닌 **React Context 메모리 상태**로 유지됩니다.
> * 새로고침 시 `data/*.mock.ts`에 선언된 초기값으로 복구됩니다. 
> * **이후 단계 조치 사항**: 데이터 유지를 원한다면 Supabase API 연동 또는 `localStorage` 저장 로직을 Context 내부에 조기에 이식해야 합니다.

> [!IMPORTANT]
> **2. 지표 정합성 및 셀렉터 유지 (Cross-Screen Integrity)**
> * 데이터 필터링, 합계 연산 등은 `lib/selectors/` 내부의 전용 셀렉터를 거쳐서 연산됩니다.
> * 컴포넌트 내부에서 데이터를 직접 `filter`하거나 `reduce`하여 변환하기보다는, 공통 셀렉터를 호출하여 비즈니스 로직을 일관성 있게 구성하세요.
> * 새로운 CRUD 연산을 설계한 경우 반드시 `validateCrossScreenMetrics` 결과 콘솔 경고가 없는지 체크해야 합니다.

> [!NOTE]
> **3. Tailwind CSS v4 스타일링 규칙**
> * 이 프로젝트는 Tailwind CSS v4를 사용하고 있습니다. 
> * `@tailwindcss/postcss` 플러그인을 사용하여 새로운 CSS 빌드 아키텍처로 컴파일되므로, 기존 Tailwind v3 플러그인 또는 비표준 CSS 설정 파일을 임의로 수정할 시 빌드 에러가 발생할 수 있습니다.
> * UI 스타일은 기존 컴포넌트([components/ui/](file:///d:/이임원/04_바이브코딩/itakura/components/ui))의 일관된 테마(블루, 그레이 톤 기반의 정돈된 레이아웃)를 유지해 주십시오.

> [!TIP]
> **4. 아이콘 리소스 처리**
> * 무거운 아이콘 라이브러리(`lucide-react` 등)의 추가 설치를 피하고, 성능 최적화와 스타일 일관성을 유지하기 위해 **Inline SVG** 방식을 채택하고 있습니다.
> * 새로운 아이콘이 필요하면 기존 컴포넌트 내부의 SVG 포맷을 참고하여 작성하십시오.

---

## 6. 개발 및 실행 명령어

코덱스 터미널 또는 명령 프롬프트에서 프로젝트를 빌드하고 검증할 때 사용하는 기본 명령어 세트입니다.

*   **개발 서버 실행**:
    ```bash
    npm run dev
    ```
*   **ESLint 오류 및 정적 분석 검사**:
    ```bash
    npm run lint
    ```
*   **Next.js 빌드 및 배포 테스트**:
    ```bash
    npm run build
    ```
