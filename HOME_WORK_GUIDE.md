# ITakura 집 작업 이전 및 개발 가이드

이 문서는 회사/현재 PC에서 작업하던 ITakura 프로젝트를 집 PC로 안전하게 옮기고, 동일한 환경에서 계속 개발하기 위한 가이드입니다.

> **가장 중요한 사항**
>
> 현재 프로젝트의 주요 소스 폴더(`app/(app)`, `components`, `context`, `data`, `lib`, `types` 등)가 Git에서 아직 추적되지 않은 상태로 보입니다.  
> 집으로 이동하기 전에 반드시 변경 파일을 Git에 커밋하여 원격 저장소에 올리거나, 프로젝트 폴더 전체를 별도로 복사해야 합니다. `git pull`만으로는 추적되지 않은 파일이 집 PC에 전달되지 않습니다.

## 1. 프로젝트 환경

| 항목 | 버전/구성 |
|---|---|
| Framework | Next.js 16.2.12, App Router |
| UI | React 19.2.4 |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS 4 |
| Chart | Recharts 3.10.1 |
| Data storage | React Context와 mock data |
| Database/Auth | 아직 Supabase, 실제 인증, RLS 미사용 |

권장 환경:

- Node.js 20 LTS 이상
- npm 10 이상
- Git 최신 버전
- VS Code
- Windows PowerShell 또는 일반 터미널

버전을 확인합니다.

```powershell
node --version
npm --version
git --version
```

## 2. 집으로 가져가기 전 필수 작업

### 2.1 현재 변경 상태 확인

```powershell
git status
```

특히 `??`로 표시되는 파일은 Git이 아직 추적하지 않는 파일입니다. 이 파일들은 커밋하지 않으면 원격 저장소로 전달되지 않습니다.

### 2.2 Git을 이용하는 경우

원격 저장소 주소와 현재 브랜치를 확인합니다.

```powershell
git remote -v
git branch --show-current
```

변경 내용을 검토한 후 필요한 파일을 추가하고 커밋합니다.

```powershell
git add app components constants context data lib types
git add package.json package-lock.json MIGRATION_GUIDE.md HOME_WORK_GUIDE.md
git status
git commit -m "feat: MES 통합관리 기능 및 집 작업 가이드"
git push
```

`git add .`는 편리하지만 `.env`, 인증서, 개인 파일까지 포함할 수 있으므로 먼저 `.gitignore`를 확인해야 합니다.

### 2.3 USB, 외장 디스크 또는 클라우드로 복사하는 경우

다음 항목을 포함해 프로젝트 루트 전체를 복사합니다.

- `app`
- `components`
- `constants`
- `context`
- `data`
- `lib`
- `types`
- `public`이 존재하면 `public`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.*`
- `postcss.config.*`
- `eslint.config.*`
- `MIGRATION_GUIDE.md`
- `HOME_WORK_GUIDE.md`
- `.git` 폴더를 포함하면 Git 이력과 브랜치도 함께 이동

다음 폴더는 복사하지 않아도 됩니다.

- `node_modules`
- `.next`
- 빌드 결과물과 임시 캐시

집 PC에서 `npm ci`와 `npm run build`를 실행하면 다시 생성됩니다.

## 3. 집 PC에서 프로젝트 설치

### Git으로 받는 경우

```powershell
git clone <원격-저장소-주소>
cd itakura
git switch <사용하던-브랜치>
npm ci
```

이미 clone한 프로젝트라면:

```powershell
git status
git pull
npm ci
```

로컬 변경이 남아 있는 상태에서 바로 `git pull`하지 마세요. 먼저 `git status`를 확인하고 커밋 또는 별도 백업해야 합니다.

### 폴더를 직접 복사한 경우

프로젝트 루트에서 실행합니다.

```powershell
npm ci
```

`package-lock.json`과 정확히 같은 의존성을 설치하기 위해 `npm install`보다 `npm ci`를 우선 사용합니다.

## 4. 실행 및 접속

개발 서버:

```powershell
npm run dev
```

터미널에 표시되는 로컬 주소로 접속합니다. 일반적으로 다음 주소입니다.

```text
http://localhost:3000
```

관리자 로그인:

```text
경로: /admin/login
초기 관리자 사번: A001
초기 관리자 이메일: admin@itakura.demo
초기 비밀번호: admin1234
```

위 계정은 실제 인증 서버가 아닌 Context 기반 데모 계정입니다. 외부에 배포할 실제 비밀번호로 사용하면 안 됩니다.

## 5. 작업 시작 전 검증

다음 순서로 실행합니다.

```powershell
npx tsc --noEmit
npm run build
```

성공 기준:

- TypeScript 오류 없음
- Next.js production build 성공
- `/dashboard`, `/production`, `/quality`, `/shipments`, `/traceability`, `/reports`, `/admin` 라우트 생성

전체 lint:

```powershell
npm run lint
```

> **주의:** 현재 프로젝트 전체 lint에는 기존 모달의 `react-hooks/set-state-in-effect`, 보고서 코드의 `no-explicit-any` 등 누적 오류가 남아 있을 수 있습니다. 새 작업 파일은 반드시 개별 lint를 통과시키고, 전체 lint 실패가 새 변경 때문인지 기존 오류인지 구분해야 합니다.

예시:

```powershell
npx eslint components/quality/QualityStatistics.tsx lib/selectors/quality-statistics-selectors.ts
```

## 6. 데이터 저장 방식 — 매우 중요

현재 데이터는 데이터베이스에 저장되지 않습니다.

- 초기 데이터: `data/*.mock.ts`
- 실행 중 상태: 각 `context/*Context.tsx`의 React state
- 새로고침: Context 상태가 초기 mock data로 복원됨
- 브라우저를 닫거나 개발 서버를 재시작해도 입력 데이터가 보존되지 않음

따라서 테스트 중 입력한 생산계획, 생산실적, 불량 이력, 출하, 사용자 변경사항은 새로고침하면 사라질 수 있습니다.

지속 저장이 필요할 때만 다음 단계에서 Supabase 또는 `localStorage` 저장 계층을 별도로 설계합니다. 현재 단계에서 Context마다 임의로 저장 로직을 추가하지 마세요.

## 7. Provider 순서

업무 Context는 [context/AppProviders.tsx](./context/AppProviders.tsx)에 한 번만 배치합니다.

현재 의존 순서:

```text
AdminProvider (app/layout.tsx)
└─ MasterDataProvider
   └─ MaterialsProvider
      └─ ProductionProvider
         └─ QualityProvider
            └─ ShipmentProvider
               └─ TraceabilityProvider
                  └─ ReportsProvider
```

Provider 순서는 의존 관계 때문에 중요합니다.

- `QualityProvider`는 생산 LOT와 자재 상태를 사용
- `ShipmentProvider`는 생산 LOT와 품질검사 결과를 사용
- Traceability와 Reports는 앞 단계의 업무 데이터를 조회

페이지나 개별 컴포넌트에서 Provider를 다시 생성하면 화면별로 서로 다른 상태가 생깁니다. Provider를 중복 추가하지 마세요.

## 8. 단일 데이터 원본과 집계 규칙

### 생산

- 생산계획, 작업지시, 생산실적, 완제품 LOT: `ProductionContext`
- 초기값: `data/production.mock.ts`
- 확정 실적만 기간 KPI에 포함
- DRAFT 실적은 상세 목록에는 표시하지만 기본 집계에서는 제외

### 불량

- 불량 이력: `QualityContext.defectHistory`
- 초기값: `data/defect-history.mock.ts`
- 생산실적과 불량 이력을 동시에 더하지 않음
- 연결 순서: `완제품 LOT 번호 → resultNo → 생산실적`
- LOT에 연결된 불량 이력이 있으면 그 합계를 사용
- 연결 이력이 아직 없을 때만 생산실적의 `defectQuantity`를 대체값으로 사용

### 출하 및 완제품 재고

- 출하 단일 원본: `ShipmentContext.shipments`
- 최초 완제품 재고: `FinishedGoodsLot.goodQuantity`
- 현재 재고: `LOT 양품수량 - 완료 출하수량`
- 출하 가능 재고: `현재 재고 - 예정/준비 출하 예약수량`
- 품질검사 완료, 합격, 출하 가능 상태를 모두 만족해야 출하 가능
- 음수 재고를 허용하지 않음

### 대시보드

- 컴포넌트에서 수치를 하드코딩하지 않음
- 생산·불량 집계: `lib/dashboard-monitoring.ts`
- 출하 KPI: `ShipmentContext` selector
- 같은 KPI를 다른 화면에서 다시 계산하지 말고 공통 selector를 사용

## 9. 날짜 처리 주의사항

- 날짜 기준은 브라우저의 로컬 시간대
- 공통 함수: `lib/selectors/business-date.ts`
- 날짜 범위는 `Date` 객체로 계산
- 문자열을 단순 비교해 주간/월간 범위를 만들지 않음
- 주간 시작일은 월요일, 종료일은 일요일
- 월말, 윤년, 12월과 1월 전환을 안전하게 처리
- 특정 날짜를 JSX나 selector에 새로 하드코딩하지 않음

Mock data의 업무 날짜와 실제 오늘 날짜가 다르면 “오늘” KPI가 0으로 표시될 수 있습니다. 이 경우 숫자를 화면에서 임의로 맞추지 말고 데이터의 `productionDate`, `inspectionDate`, `plannedDate`와 집계 기준을 확인해야 합니다.

## 10. RBAC 및 관리자 기능

공통 권한 판정:

- `hasPermission`
- `canAccessModule`
- `canAccessPath`
- `canAccessProductionLine`

권한 로직을 버튼마다 역할명으로 직접 비교하지 마세요. `AdminContext`와 `lib/rbac.ts`의 공통 함수를 사용합니다.

현재 역할:

- `ADMIN`
- `MATERIAL_MANAGER`
- `PRODUCTION_MANAGER`
- `QUALITY_MANAGER`
- `WORKER`

출하 등록·수정·완료는 `ADMIN`, `PRODUCTION_MANAGER`만 가능하고 `WORKER`는 조회만 가능합니다.

새 메뉴를 추가할 때 함께 확인할 파일:

- `types/admin.ts`
- `data/admin.mock.ts`
- `lib/rbac.ts`
- `constants/navigation.ts`
- `components/layout/AppShell.tsx`

메뉴만 숨기고 URL 접근을 허용하는 상태가 되지 않도록 `canAccessPath`까지 확인합니다.

## 11. Next.js 16 주의사항

이 프로젝트는 Next.js 16.2.12입니다. 기존 Next.js 지식만으로 API를 작성하지 말고, 라우팅이나 서버 API를 변경하기 전에 다음 로컬 문서를 확인합니다.

```text
node_modules/next/dist/docs/
```

특히 확인할 내용:

- App Router의 page/layout 규칙
- `params`, `searchParams`의 Promise 타입
- Client Component와 Server Component 경계
- `next/navigation` 사용법
- Route Handler 규칙

`"use client"`는 Context, state, event handler, 브라우저 API를 실제로 사용하는 컴포넌트에만 추가합니다.

## 12. 한글 및 경로 인코딩

현재 Windows 프로젝트 경로에 한글이 포함되어 있습니다.

```text
D:\이임원\04_바이브코딩\itakura
```

주의사항:

- 파일은 UTF-8로 저장
- PowerShell 출력이 깨져 보여도 파일 자체 인코딩을 먼저 확인
- 깨진 터미널 출력을 그대로 복사해 소스에 덮어쓰지 않음
- 가능하면 집 PC에서는 짧은 영문 경로 사용 권장

예:

```text
C:\dev\itakura
```

## 13. Git 작업 권장 흐름

집과 현재 PC에서 같은 브랜치를 동시에 수정하지 않는 것이 안전합니다.

작업 시작:

```powershell
git status
git pull
npm ci
npx tsc --noEmit
```

작업 종료:

```powershell
git status
git diff
npx tsc --noEmit
npm run build
git add <변경한 파일>
git commit -m "feat: 작업 내용"
git push
```

다른 PC로 이동하기 전에 반드시 `git push`가 성공했는지 확인합니다.

## 14. 절대 하지 말아야 할 작업

- 수치를 맞추기 위해 대시보드 JSX에 KPI 하드코딩
- 화면별 mock data 새로 생성
- 같은 업무 Context Provider를 페이지마다 중복 배치
- 생산실적 불량수량과 불량 이력을 동시에 합산
- 사용자 이름을 컴포넌트에 직접 하드코딩
- ID, 사번, LOT 번호를 이름 변경과 함께 수정
- 품질 불합격 또는 검사 미완료 LOT 출하
- 재고 검증 없이 출하 완료 처리
- `node_modules` 또는 `.next`를 Git에 커밋
- `.env`, API 키, 실제 비밀번호를 원격 저장소에 커밋
- 빌드 실패 상태로 다른 PC에 작업 인계

## 15. 작업 재개 체크리스트

- [ ] 현재 PC에서 변경 파일을 커밋 또는 전체 백업했다.
- [ ] 원격 저장소에 `git push`가 성공했다.
- [ ] 집 PC에서 올바른 브랜치를 받았다.
- [ ] `npm ci`가 성공했다.
- [ ] `npx tsc --noEmit`이 성공했다.
- [ ] `npm run build`가 성공했다.
- [ ] 관리자 로그인 화면이 열린다.
- [ ] 역할별 메뉴가 정상적으로 보인다.
- [ ] 생산실적과 불량 이력의 LOT 연결이 일치한다.
- [ ] 품질 통계의 일간·주간·월간 불량률이 표시된다.
- [ ] 출하 완료 시 LOT 재고가 차감된다.
- [ ] 새로고침하면 Context 데이터가 초기화된다는 점을 인지했다.

## 16. 관련 문서

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- [package.json](./package.json)
- [context/AppProviders.tsx](./context/AppProviders.tsx)
- [lib/selectors/business-date.ts](./lib/selectors/business-date.ts)
- [lib/selectors/production-analytics-selectors.ts](./lib/selectors/production-analytics-selectors.ts)
- [lib/selectors/quality-statistics-selectors.ts](./lib/selectors/quality-statistics-selectors.ts)

