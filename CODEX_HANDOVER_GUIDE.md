# Codex 작업 인계 및 DM 가이드 문서 (CODEX_HANDOVER_GUIDE.md)

이 문서는 Codex 환경에서 이타쿠라(Itakura) 제과/제빵 통합 MES 관리 시스템 작업을 연속성 있게 진행할 수 있도록 작성된 **작업 인계 및 개발 가이드(DM Guide)**입니다.

---

## 1. 프로젝트 개요

* **프로젝트명**: 이타쿠라(Itakura) 제과/제빵 통합 MES 관리 시스템
* **기술 스택**: Next.js 16.2 (Turbopack, App Router), React 19, TypeScript, TailwindCSS v4, Supabase (`@supabase/supabase-js`)
* **주요 기능**:
  * **기준 정보 관리 (`/master-data`)**: 제품, 원자재, 설비, 공정, 거래처 기준 데이터
  * **자재/원료 관리 (`/materials`)**: 입고, 자재 재고, 부족 자재 등록 및 자재 입출고 관리
  * **생산 관리 (`/production`)**: 생산 계획 등록, 작업 지시, 공정 일시정지 및 진행 현황
  * **품질 관리 (`/quality`)**: 수입 검사, 공정 검사, 완제품 검사, 불량 이력 및 시정 조치(CAPA)
  * **출하 관리 (`/shipments`)**: 출하 지시, 출하 현황 및 배송 상태
  * **이력 추적 (`/traceability`)**: 정방향/역방향 추적, 롯(Lot) 추적 및 리콜 영향도 분석

---

## 2. 저장소 및 작업 경로 정보

* **로컬 작업 저장소**: `C:\Users\Asus\Documents\Codex\2026-08-01\rlt\work\local-site\itakura-git`
* **원본 참고 경로**: `C:\Users\Asus\Documents\Codex\2026-08-01\rlt\work\local-site\itakura-main` (읽기 전용 원본)
* **GitHub 원격 저장소**: `https://github.com/ldavit125-spec/itakura.git`
* **주요 브랜치**: `main`

---

## 3. 환경변수 (Environment Variables) 설정

보안 정책상 실제 API 키가 포함된 `.env.local` 파일은 Git 추적에서 제외되어 있습니다. 로컬 개발 및 Supabase 연동 시 아래와 같이 `.env.local` 파일을 생성하여 설정합니다.

### `.env.local` 예시
```env
# Supabase Project Settings > API 설정값
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

> **주의사항**: `SUPABASE_SERVICE_ROLE_KEY` 및 비공개 비밀키는 클라이언트 코드나 `.env.local`에 노출되지 않도록 주의하십시오. 가이드 템플릿은 루트의 `.env.example`을 참고합니다.

---

## 4. 개발 환경 실행 및 빌드 명령어

### 실행 런타임 경로 (Windows 환경)
* **Node.js**: `C:\Users\Asus\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
* **pnpm CLI**: `C:\Users\Asus\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs`

### 주요 CLI 명령어

1. **의존성 설치**
   ```bash
   pnpm install
   ```

2. **개발 서버 실행 (Port 3000)**
   ```bash
   pnpm run dev
   # 또는 직접 실행:
   node node_modules/next/dist/bin/next dev -p 3000
   ```

3. **프로덕션 빌드 및 타입 검사**
   ```bash
   pnpm run build
   # 또는 직접 실행:
   node node_modules/next/dist/bin/next build
   ```

4. **린트 검사**
   ```bash
   pnpm run lint
   ```

---

## 5. 프로젝트 디렉토리 구조 및 핵심 모듈

```
itakura-git/
├── app/                        # Next.js App Router (페이지 및 레이아웃)
│   ├── (app)/                  # 메인 대시보드 및 모듈별 페이지
│   │   ├── admin/              # 관리자 및 계정 권한
│   │   ├── master-data/        # 기준 정보 관리
│   │   ├── materials/          # 자재/원료 관리
│   │   ├── production/         # 생산 관리
│   │   ├── quality/            # 품질 관리
│   │   ├── shipments/          # 출하 관리
│   │   └── traceability/       # 이력 추적
│   ├── globals.css             # TailwindCSS 및 전역 스타일
│   └── layout.tsx              # Root Layout
├── components/                 # UI 컴포넌트 & 모달
│   ├── materials/              # 자재 관련 모달 및 테이블
│   ├── production/             # 생산 관련 모달 및 테이블
│   ├── quality/                # 품질/불량/시정조치 모달
│   ├── shipment/               # 출하 관련 클라이언트
│   └── traceability/           # 추적 패널 및 결과 테이블
├── context/                    # React Context (전역 상태 및 데이터 바인딩)
│   ├── MasterDataContext.tsx
│   ├── MaterialsContext.tsx
│   ├── ProductionContext.tsx
│   ├── QualityContext.tsx
│   ├── ShipmentContext.tsx
│   └── TraceabilityContext.tsx
├── lib/                        # 비즈니스 로직 및 Supabase API 연동
│   ├── supabase/               # Supabase 클라이언트 & 모듈별 DB 쿼리
│   │   ├── client.ts           # Supabase Client 초기화 (Fallback 지원)
│   │   ├── master-data.ts
│   │   ├── materials.ts
│   │   ├── production.ts
│   │   ├── quality.ts
│   │   ├── shipments.ts
│   │   └── traceability.ts
│   ├── production-calculations.ts
│   └── traceability-calculations.ts
├── supabase/                   # Database 마이그레이션 & SQL 시드
│   ├── migrations/
│   │   ├── 202608010001_initial_schema.sql    # 테이블 & 인덱스 스키마
│   │   └── 202608010003_demo_rls_policies.sql # RLS 보안 정책
│   └── seed.sql                # 데모 초기 데이터
├── types/                      # TypeScript 인터페이스 & 타입 정의
├── .env.example                # 환경변수 안내 템플릿
├── package.json
└── CODEX_HANDOVER_GUIDE.md     # 본 인계 가이드 문서
```

---

## 6. 작업 시 반드시 지켜야 할 안전 수칙

1. **원존 저장소 보존**: `itakura-main`은 참조용 원본이므로 삭제하거나 직접 변경하지 않습니다.
2. **`.git` 보존**: `itakura-git` 내의 `.git` 폴더 및 이력을 삭제하거나 덮어쓰지 않습니다.
3. **민감정보 보호**:
   * 비밀번호, API 키, 서비스 역할 키(`SUPABASE_SERVICE_ROLE_KEY`), JWT, 개인키(`.pem`, `.key`)는 절대 커밋/push하지 않습니다.
   * `git add` 실행 전 `git status` 및 `git diff --staged`로 대상 파일을 확인합니다.
4. **Git 안전 수칙**:
   * `git push --force`, `git reset --hard` 등 파괴적 명령어를 사용하지 않습니다.
   * 원격 `main`과 충돌 발생 시 강제로 덮어쓰지 않고 변경점을 비교 검토합니다.
5. **빌드 검증**: 변경 사항 적용 후 반드시 `pnpm run build`를 실행하여 컴파일 및 static prerender가 오류 없이 통과하는지 검증합니다.

---

## 7. 다음 작업자(Codex)를 위한 체크리스트

- [ ] `.env.local`에 연동할 Supabase 실제 프로젝트 URL 및 API Key 입력
- [ ] Supabase 대시보드 또는 CLI로 `supabase/migrations/` 및 `supabase/seed.sql` 적용
- [ ] 신규 기능 개발 시 `components/` 및 `context/`에 상태 반영
- [ ] 작업 완료 후 `pnpm run build` 실행하여 검증
- [ ] `git status` 확인 후 `git commit -m "feat: ..."` 및 `git push origin main` 진행
