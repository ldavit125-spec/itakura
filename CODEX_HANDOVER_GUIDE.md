# Antigravity 작업 인수인계 가이드

작성일: 2026-08-03  
프로젝트 경로: `D:\이임원\04_바이브코딩\itakura`

## 1. 현재 제출본의 기준 상태

이 프로젝트는 교육원 제출을 위해 **한국어 단일 언어 상태**로 복구했다.

- 화면 언어는 한국어로 고정되어 있다.
- 헤더와 관리자 로그인 화면의 언어 선택 UI는 제거했다.
- 일본어 상태, 일본어 localStorage 설정, 일본어 조건부 렌더링은 제거했다.
- 런타임 코드에 `name_ja`, `*_ja`, `nameJa`, 일본어 샘플 매핑 참조가 없다.
- DB에는 일본어 컬럼을 추가하지 않았다.
- `products.name_ja does not exist` 오류를 발생시키던 SELECT 참조는 제거했다.
- UI 컴포넌트가 이미 키 기반 문구를 많이 사용하므로 `context/LanguageContext.tsx`와 `lib/i18n/translations.ts`는 **한국어 문구 공급용 호환 계층**으로 남아 있다. 언어 전환 기능은 없다.

## 2. 절대 변경하거나 실행하지 말 것

- `db reset`, `DROP`, `TRUNCATE`, 전체 `DELETE` 실행 금지
- 기존 migration과 `supabase/seed.sql` 수정 또는 재실행 금지
- 새 migration 생성 금지
- `name_ja` 등 일본어 컬럼 추가 금지
- `.env.local` 수정 또는 내용 공개 금지
- Supabase client 설정 변경 금지
- Auth, 관리자 로그인, ADMIN 역할, 권한, RLS 구조 변경 금지
- 기존 CRUD 쿼리, 테이블명, 관계 ID 변경 금지
- 제품·자재·공급업체·라인명 등 기존 한국어 DB 값 변경 금지
- ID, 코드, LOT 번호, 작업지시 번호, 상태 코드 변경 금지
- `git reset --hard`, `git checkout -- .`, 강제 push 금지
- 사용자 승인 없이 commit 또는 push 금지

## 3. 매우 중요한 Git 상태

현재 작업 트리는 다수 파일이 수정된 **dirty 상태**다. 이 변경에는 한국어 UI 문구 키 정리, 관리자 세션 유지 보완, Supabase URL 정규화, 일본어 기능 제거가 섞여 있다.

- 기존 변경을 임의로 되돌리지 않는다.
- 특히 `context/AdminContext.tsx`와 `lib/supabase/client.ts`의 변경을 삭제하지 않는다.
- 작업 전 `git status --short`와 대상 파일의 `git diff -- <파일>`을 먼저 확인한다.
- 이번 제출 작업에서는 commit과 push를 하지 않는다.

## 4. Supabase 연결 주의사항

환경변수 이름은 다음 두 개다. 값은 문서나 로그에 남기지 않는다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

현재 `.env.local`의 URL은 `/rest/v1/`이 포함된 형태일 수 있다. `lib/supabase/client.ts`가 이를 프로젝트 기본 URL로 정규화한다. 이 처리를 제거하거나 URL을 다시 이어 붙이지 않는다.

현재 런타임 SELECT는 실제 스키마의 한국어 원본 컬럼만 사용한다.

- `products`: `id,code,name,category,unit,default_line_id,status`
- `materials`: `id,code,name,category,unit,safety_stock,default_supplier_id,status`
- `suppliers`: `id,code,name,type,contact_person,phone,status`
- `production_lines`: `id,code,name,process,max_capacity,unit,status`

2026-08-03 읽기 전용 확인 행 수:

- products: 7
- materials: 7
- suppliers: 7
- production_lines: 4
- production_plans: 8
- work_orders: 7
- shipments: 2
- inspection_requests: 3
- incoming_inspections: 2
- process_inspections: 1
- finished_goods_inspections: 1

## 5. 관리자 로그인 구조

관리자 로그인은 Supabase Auth 재설계 대상이 아니다. 기존 mock/RBAC 구조를 유지한다.

- 로그인 경로: `/admin/login`
- 관리자 사번: `A001`
- 관리자 사용자 ID: `user-admin`
- 관리자 역할 ID: `role-admin`
- 역할 코드: `ADMIN`
- 세션 키: `itakura-admin-session`
- 보호 가드: `components/AdminRouteGuard.tsx`
- 인증 판정: `lib/admin-auth.ts`
- 사용자·역할 원본: `data/admin.mock.ts`

`A001` → `user-admin` → `role-admin` → `ADMIN` 연결이 유지되어 있다. 관리자 세션은 localStorage에 유지되고 로그아웃 시 제거된다. 이 구조를 Supabase Auth로 바꾸지 않는다.

## 6. 한국어 UI 호환 계층

다음 파일명에는 과거 다국어 작업의 이름이 남아 있지만 현재 기능은 한국어 전용이다.

- `context/LanguageContext.tsx`
- `lib/i18n/translations.ts`

현재 동작:

- `LanguageContext`에는 `language`, `setLanguage`, localStorage 언어 상태가 없다.
- `t(key)`는 한국어 `ko` 문구만 읽는다.
- 일본어 사전과 일본어 선택 옵션은 없다.
- 이 두 파일을 급하게 삭제하면 많은 화면의 import가 깨질 수 있으므로 제출 직전에는 이름 변경이나 대규모 직접 문자열 치환을 하지 않는다.

새 일본어 사전, 자동 번역, `情報` fallback, 단어 자동 치환을 다시 추가하지 않는다.

## 7. 현재 검증 결과

마지막 확인 결과:

```text
npx tsc --noEmit
성공

npm run build
성공
Next.js 16.2.12
14/14 정적 페이지 생성 성공
```

로컬 페이지 응답:

- `/admin/login`: 200
- `/dashboard`: 200
- `/master-data`: 200
- `/materials`: 200
- `/production`: 200
- `/quality`: 200
- `/shipments`: 200
- `/traceability`: 200
- `/reports`: 200

## 8. Antigravity에서 시작할 때 순서

1. 작업 경로가 `D:\이임원\04_바이브코딩\itakura`인지 확인한다.
2. 이 문서를 끝까지 읽는다.
3. `git status --short`로 기존 변경을 확인한다.
4. `.env.local`은 열어 값 확인만 하고 수정하거나 출력하지 않는다.
5. `npm run dev -- -p 3001`로 개발 서버를 실행한다.
6. `/admin/login`에서 A001 로그인을 확인한다.
7. `/dashboard`, `/master-data`, `/materials`, `/production`에서 데이터가 보이는지 확인한다.
8. 브라우저 콘솔에서 `column ... does not exist`, `Failed to fetch`가 없는지 확인한다.
9. 수정이 필요하면 표시 문자열/CSS 등 최소 범위만 변경한다.
10. 마지막에 `npx tsc --noEmit`과 `npm run build`를 실행한다.

## 9. 제출 직전 체크리스트

- [ ] 언어 선택 드롭다운이 없다.
- [ ] 화면에 일본어 또는 한·일 혼합 문구가 없다.
- [ ] `rg "_ja|nameJa|setLanguage|itakura-language|日本語|情報" app components context lib types` 결과가 0건이다.
- [ ] Supabase 제품·자재·생산 데이터가 0건으로 표시되지 않는다.
- [ ] `column products.name_ja does not exist` 오류가 없다.
- [ ] A001 관리자 로그인과 `/admin` 접근이 정상이다.
- [ ] 새로고침 후 관리자 세션이 유지된다.
- [ ] 로그아웃 후 `/admin/login`으로 이동한다.
- [ ] 등록·수정 기능의 기존 한국어 값과 관계 ID가 유지된다.
- [ ] `npx tsc --noEmit`이 성공한다.
- [ ] `npm run build`가 성공한다.
- [ ] `.env.local`과 비밀키가 Git 변경 목록에 없다.
- [ ] commit과 push를 하지 않았다.

## 10. 문제가 생겼을 때 우선 확인

### `column ... name_ja does not exist`

DB에 컬럼을 추가하지 말고, 코드의 `.select()`, insert/update payload, mapper, 타입에서 해당 일본어 필드 참조를 제거한다.

### `Failed to fetch`

1. 개발 서버가 실행 중인지 확인한다.
2. `.env.local` 변수 이름만 확인한다.
3. `lib/supabase/client.ts`의 URL 정규화가 유지되는지 확인한다.
4. 네트워크 오류와 RLS 오류를 구분한다.
5. 데이터가 삭제됐다고 가정하거나 seed를 다시 실행하지 않는다.

### 데이터가 0건으로 보임

DB를 초기화하지 않는다. 먼저 브라우저 네트워크 응답, Supabase 프로젝트 URL, SELECT 오류, RLS, 화면 필터를 확인한다.

---

이 제출본의 최우선 원칙은 **한국어 단일 언어, 기존 데이터 보존, 관리자 권한 유지, 빌드 성공**이다.
