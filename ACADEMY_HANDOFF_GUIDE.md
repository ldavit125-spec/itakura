# 이타쿠라 제빵 시스템 교육원 작업 인수인계 가이드

이 문서는 현재 로컬 프로젝트를 교육원에서 이어서 설정·검증하기 위한 가이드입니다. 현재 구현된 Supabase Auth, 역할별 권한, RLS, 자재·생산·품질·출하·LOT·대시보드·보고서 기능을 유지하면서 작업하세요.

## 1. 가장 중요한 주의사항

1. 기존 Migration 파일을 수정하지 마세요. DB 변경이 더 필요하면 새로운 타임스탬프의 Migration 파일을 추가하세요.
2. 운영 DB에 적용하기 전에 Supabase 개발 프로젝트 또는 백업된 DB에서 먼저 검증하세요.
3. `202608020002_role_based_rls.sql`은 업무 테이블의 기존 정책을 역할 기반 정책으로 재구성합니다. 교육원 DB에 별도 커스텀 정책이 있다면 반드시 백업하고 충돌 여부를 검토한 뒤 실행하세요.
4. `.env.local`의 내용을 화면, 문서, 채팅, Git에 출력하지 마세요.
5. `service_role` 키, secret key, 실제 이메일, 실제 비밀번호를 프론트엔드 코드나 Migration에 넣지 마세요. 브라우저에서는 publishable/anon 키만 사용합니다.
6. `service_role`은 RLS를 우회하므로 클라이언트에서 절대 사용하지 마세요.
7. 권한은 이메일이나 이름이 아니라 `auth.users.id = business_users.auth_user_id` 관계로 판정해야 합니다.
8. 메뉴와 버튼을 숨기는 것만으로 보안을 처리하지 마세요. 페이지 가드와 Supabase RLS가 함께 차단해야 합니다.
9. `anon` 전체 허용, `USING (true)`, `WITH CHECK (true)`, 권한 조회 실패 시 ADMIN 처리 같은 우회 코드를 다시 추가하지 마세요.
10. 일반 사용자가 자신의 `auth_user_id`, 활성 상태, 역할을 변경할 수 있게 만들지 마세요.
11. 현재 업무용 Mock 데이터는 임의로 삭제하지 마세요. 특히 관리자 사용자 관리 화면 일부는 아직 로컬 Mock 상태일 수 있으므로 실제 DB 저장 기능과 혼동하지 마세요.
12. 한 작업에서 npm과 pnpm을 섞어 의존성을 다시 설치하지 마세요. 교육원에서 정한 패키지 관리자를 하나만 사용하세요.

## 2. 현재 구현 상태

- Supabase 이메일·비밀번호 로그인 및 로그아웃
- 새로고침 후 세션 유지 및 인증 상태 변경 감지
- 비활성 업무 사용자 즉시 로그아웃 및 보호 화면 차단
- Auth UUID를 기준으로 `business_users` 프로필 조회
- `user_roles → roles → role_permissions → permissions` 경로의 역할·권한 조회
- 미로그인 사용자의 보호 페이지 접근 차단
- ADMIN 전용 관리자 화면 접근 제어
- 역할별 사이드바 메뉴, 화면, 등록·수정·삭제·승인·상태 변경 제어
- anon 접근을 차단하는 역할 기반 RLS Migration
- 생산라인 담당 공정 및 제품 분류 자유 입력 UI
- 생산용 자재 출고 시 실제 작업지시와 생산라인 관계 검증

주의: 관리자 화면의 사용자 목록 및 편집 기능이 실제 Supabase `business_users`와 `user_roles`에 완전히 연결되었는지는 별도로 확인해야 합니다. 로컬 Mock 저장이면 화면에서 변경해도 DB 역할과 활성 상태가 바뀌지 않습니다.

## 3. Migration 적용 순서

Supabase Dashboard의 **SQL Editor**에서 다음 파일을 파일명 순서대로 적용하는 방법이 가장 명확합니다.

1. `supabase/migrations/202608010001_initial_schema.sql`
2. `supabase/migrations/202608010003_demo_rls_policies.sql`
3. `supabase/migrations/202608020001_supabase_auth_rls.sql`
4. `supabase/migrations/202608020002_role_based_rls.sql`
5. `supabase/migrations/202608020003_production_line_process_free_text.sql`
6. `supabase/migrations/202608020004_product_category_free_text.sql`

이미 적용된 파일은 다시 실행하지 말고 Supabase Migration 이력과 실제 스키마를 먼저 확인하세요. 새 DB를 처음 구성할 때만 전체 순서를 사용합니다.

특히 다음 두 파일을 빠뜨리면 자유 입력 등록 오류가 발생합니다.

- `202608020003_production_line_process_free_text.sql`: `production_lines_process_check` 제거
- `202608020004_product_category_free_text.sql`: `products_category_check` 제거

제약조건 제거 여부 확인 SQL:

```sql
select conrelid::regclass as table_name, conname
from pg_constraint
where conname in (
  'production_lines_process_check',
  'products_category_check'
);
```

두 Migration이 정상 적용된 후에는 위 쿼리 결과가 0행이어야 합니다.

## 4. 테스트용 ADMIN 계정 연결

실제 계정과 비밀번호는 소스 코드에 작성하지 말고 Supabase Dashboard에서 직접 만드세요.

1. Supabase Dashboard에서 **Authentication** 메뉴를 엽니다.
2. **Users → Add user**를 선택합니다.
3. 테스트 이메일과 비밀번호를 입력합니다.
4. **Auto Confirm User** 설정을 확인하고 생성합니다.
5. 생성된 Auth User UUID를 복사합니다.
6. `business_users.auth_user_id`에 UUID를 연결합니다.
7. 해당 업무 사용자의 상태를 `ACTIVE`로 설정합니다.
8. `ADMIN` 역할을 연결합니다.
9. 생성한 계정으로 로그인합니다.

실제 테이블과 컬럼을 기준으로 사용할 SQL 예시:

```sql
update public.business_users
set
  auth_user_id = '00000000-0000-0000-0000-000000000000',
  status = 'ACTIVE'
where employee_no = 'A001';

insert into public.user_roles (user_id, role_id)
select business_user.id, role_row.id
from public.business_users as business_user
cross join public.roles as role_row
where business_user.employee_no = 'A001'
  and role_row.code = 'ADMIN'
on conflict (user_id, role_id) do nothing;
```

위 UUID와 사번은 예시입니다. Dashboard에서 확인한 실제 Auth UUID와 연결 대상 사번으로 바꾸세요. 이메일 또는 이름으로 사용자를 연결하지 마세요.

## 5. 역할별 기대 권한

| 역할 | 주요 허용 범위 | 반드시 차단할 범위 |
|---|---|---|
| `ADMIN` | 전체 메뉴, 전체 업무 CRUD, 관리자 설정, 사용자 역할·활성 상태 관리 | 일반 사용자에게도 금지된 감사로그 임의 변경·삭제 |
| `MATERIAL_MANAGER` | 대시보드·기준정보 조회, 자재 입고·재고·출고·수불 관리 | 관리자 설정, 생산계획 변경, 사용자 역할 변경 |
| `PRODUCTION_MANAGER` | 생산계획·작업지시·실적·완제품 LOT 관리, 관련 조회 | 관리자 설정, 사용자 역할 변경 |
| `QUALITY_MANAGER` | 품질검사·불량·부적합·시정조치·LOT 품질 판정 | 관리자 설정, 사용자 역할 변경 |
| `WORKER` | 배정 생산작업 조회, 허용된 생산실적 입력 | 기준정보 관리, 삭제, 관리자 상태 변경, 사용자 관리 |

권한 조회가 실패하면 기본 거부가 정상입니다. 실패한 사용자를 ADMIN으로 간주해서는 안 됩니다.

## 6. 교육원에서 실행할 순서

PowerShell에서 프로젝트 폴더로 이동합니다.

```powershell
Set-Location 'C:\Users\Asus\Documents\Codex\2026-08-01\rlt\work\local-site\itakura-git'
npm install
npm run dev
```

환경변수 파일은 교육원 PC에서 별도로 안전하게 구성합니다. 값은 문서나 Git에 남기지 않습니다. 개발 서버 확인 후 별도 터미널에서 빌드합니다.

```powershell
npm run build
```

`npm` 실행 파일이 없는 환경이면 Node.js LTS와 npm을 먼저 설치하세요. 기존 설치 폴더에서 npm과 pnpm을 번갈아 실행하지 마세요.

## 7. 반드시 수행할 기능 테스트

### 인증 공통

- 로그인 화면에 시스템명이 **이타쿠라 제빵**으로 표시되는지 확인
- 정상 계정 로그인, 틀린 비밀번호 오류 안내, 로그아웃 확인
- 로그인 후 새로고침해도 세션이 유지되는지 확인
- 미로그인 상태로 보호 URL을 직접 입력했을 때 `/login`으로 이동하는지 확인
- 비활성 계정이 즉시 로그아웃되고 보호 화면이 차단되는지 확인
- 프로필이 이메일이 아닌 Auth UUID로 조회되는지 확인

### 역할별 UI와 URL

- ADMIN: 전체 메뉴와 관리자 설정 접근
- MATERIAL_MANAGER: 자재 CRUD 가능, 관리자 및 생산 변경 차단
- PRODUCTION_MANAGER: 생산 CRUD 가능, 관리자 및 사용자 역할 변경 차단
- QUALITY_MANAGER: 품질 CRUD와 품질 판정 가능, 관리자 접근 차단
- WORKER: 배정 작업과 허용 실적만 가능, 삭제·기준정보·관리자 접근 차단
- 숨겨진 메뉴의 URL을 직접 입력해도 403 또는 접근 거부가 표시되는지 확인

### RLS

- 로그아웃 상태의 Supabase 업무 테이블 SELECT/INSERT/UPDATE/DELETE가 실패하는지 확인
- 권한 없는 역할의 INSERT/UPDATE/DELETE가 실패하는지 확인
- 일반 사용자가 자신의 역할, `auth_user_id`, 상태를 바꾸지 못하는지 확인
- WORKER가 배정되지 않은 생산라인 데이터를 변경하지 못하는지 확인
- 일반 사용자의 감사로그 UPDATE/DELETE가 거부되는지 확인
- 불합격 또는 HOLD LOT의 출하 상태 변경이 거부되는지 확인

### 회귀 테스트

- 자재, 생산, 품질, 출하, LOT, 대시보드, 보고서 화면 정상 표시
- 생산라인 담당 공정에 임의 문자열 입력 후 등록 성공
- 제품 분류에 임의 문자열 입력 후 등록 성공
- 생산라인 최대 생산량은 `0`이 아닌 양수로 등록
- 생산용 자재 출고에서 실제 작업지시를 선택하고 출고 완료 성공
- TypeScript 오류 없이 `npm run build` 성공

브라우저 계정 테스트는 역할별 Auth 계정과 DB 데이터가 필요합니다. 계정이 없으면 검증 완료로 표시하지 말고 미검증 항목으로 남기세요.

## 8. 자주 발생하는 오류와 조치

### `production_lines_process_check` 위반

원인: DB에 기존 담당 공정 고정값 제약이 남아 있습니다.

조치: `202608020003_production_line_process_free_text.sql`을 적용하고 제약조건 확인 SQL을 실행합니다.

### `products_category_check` 위반

원인: DB에 기존 제품 분류 고정값 제약이 남아 있습니다.

조치: `202608020004_product_category_free_text.sql`을 적용하고 제약조건 확인 SQL을 실행합니다.

### `production_lines_max_capacity_check` 위반

원인: 최대 생산량이 0 또는 허용 범위를 벗어난 값입니다.

조치: 최대 생산량에 0보다 큰 숫자를 입력합니다. 이 제약은 제거 대상이 아닙니다.

### `출고 관계 ID를 찾을 수 없습니다`

확인 순서:

1. 선택한 생산라인에 실제 `work_orders` 레코드가 있는지 확인합니다.
2. 취소 또는 완료되지 않은 작업지시인지 확인합니다.
3. 작업지시의 `production_line_id`가 선택한 생산라인과 일치하는지 확인합니다.
4. 페이지를 새로고침한 후 목록에서 실제 작업지시를 다시 선택합니다.
5. 임의 문자열로 작업지시 번호나 관계 ID를 만들지 않습니다.

### 로그인은 되지만 메뉴가 보이지 않음

확인 순서:

1. `business_users.auth_user_id`가 현재 `auth.users.id`와 일치하는지 확인합니다.
2. 업무 사용자 상태가 `ACTIVE`인지 확인합니다.
3. `user_roles`에 역할이 연결됐는지 확인합니다.
4. `role_permissions`와 `permissions` 데이터가 존재하는지 확인합니다.
5. 역할 기반 RLS Migration 적용 여부를 확인합니다.

## 9. 추가 개발 시 원칙

- 새 권한은 프론트엔드 `PermissionGate`와 DB RLS를 함께 수정합니다.
- 실제 이벤트 핸들러에서도 `hasRole()` 또는 `hasPermission()`으로 차단합니다.
- DB 함수는 `auth.uid()` 기준, 명시적 `search_path`, 최소 권한으로 작성합니다.
- `SECURITY DEFINER` 함수는 RLS 재귀 방지 목적과 권한 범위를 검토합니다.
- 사용자 관리 기능을 실제 DB에 연결할 때 ADMIN만 역할과 활성 상태를 수정하도록 RPC 또는 엄격한 RLS를 사용합니다.
- 기존 정상 기능을 전면 리팩터링하지 말고 작은 단위로 수정한 후 매번 회귀 테스트합니다.
- 오류 메시지에 내부 SQL, 토큰, 키, 개인정보 전체를 노출하지 않습니다.

## 10. 완료 기준

다음 항목이 모두 확인되어야 교육원 작업 완료로 판단합니다.

- 모든 신규 Migration 적용 및 스키마 확인
- 역할별 Auth 계정과 업무 프로필 UUID 연결
- 로그인·로그아웃·세션 유지·비활성 차단 성공
- 역할별 메뉴, URL, 버튼, 실제 이벤트 차단 성공
- anon 및 권한 없는 DB 요청 RLS 차단 성공
- 자유 입력 제품 분류와 생산라인 담당 공정 등록 성공
- 자재 출고의 실제 작업지시 관계 검증 성공
- 기존 업무 화면 회귀 테스트 성공
- `npm run build` 성공
- 실제 Supabase 사용자 관리 기능과 로컬 Mock 기능의 남은 범위 기록

## 11. Git 작업 전 마지막 확인

실제 키와 환경변수 파일이 포함되지 않았는지 먼저 확인합니다.

```powershell
git status --short
git diff --check
```

검증이 끝난 뒤 교육원 담당자가 승인한 경우에만 커밋과 push를 수행하세요. 이 인수인계 작업에서는 자동 커밋이나 자동 push를 하지 않습니다.
