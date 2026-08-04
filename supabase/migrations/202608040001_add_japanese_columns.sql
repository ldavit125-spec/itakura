-- 제품 및 생산라인 테이블에 일본어 명칭 및 분류 컬럼 추가 (안전한 migration)
alter table public.products add column if not exists name_ja text null;
alter table public.products add column if not exists category_ja text null;
alter table public.production_lines add column if not exists name_ja text null;
