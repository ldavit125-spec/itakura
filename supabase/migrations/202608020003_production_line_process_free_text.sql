begin;

-- 담당 공정을 미리 정한 세 가지 코드가 아닌 업무 용어로 자유롭게 입력할 수 있게 한다.
alter table public.production_lines
  drop constraint if exists production_lines_process_check;

commit;
