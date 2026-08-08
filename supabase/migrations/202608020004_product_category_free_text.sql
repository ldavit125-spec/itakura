begin;

-- 제품 분류를 고정 코드 목록 대신 업무에 맞는 자유 입력값으로 저장한다.
alter table public.products
  drop constraint if exists products_category_check;

commit;
