-- 원재료/자재 및 공급업체/거래처 테이블에 일본어 명칭 컬럼 추가 (안전한 migration)
alter table public.materials add column if not exists name_ja text null;
alter table public.suppliers add column if not exists name_ja text null;
