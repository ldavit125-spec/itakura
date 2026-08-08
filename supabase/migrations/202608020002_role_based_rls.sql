begin;

-- Auth UUID를 기준으로 현재 활성 업무 사용자를 찾는다. SECURITY DEFINER는 RLS 재귀만 피하고
-- 결과는 auth.uid()에 고정하며, 모든 객체를 public 스키마로 한정한다.
create or replace function public.current_business_user_id()
returns text language sql stable security definer
set search_path = pg_catalog, public
as $$
  select u.id from public.business_users u
  where u.auth_user_id = (select auth.uid()) and u.status = 'ACTIVE'
  limit 1
$$;

create or replace function public.current_user_roles()
returns text[] language sql stable security definer
set search_path = pg_catalog, public
as $$
  select coalesce(array_agg(distinct r.code), array[]::text[])
  from public.business_users u
  join public.user_roles ur on ur.user_id = u.id
  join public.roles r on r.id = ur.role_id and r.status = 'ACTIVE'
  where u.auth_user_id = (select auth.uid()) and u.status = 'ACTIVE'
$$;

create or replace function public.has_role(role_code text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$ select role_code = any(public.current_user_roles()) $$;

create or replace function public.has_permission(requested_permission text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.business_users u
    join public.user_roles ur on ur.user_id = u.id
    join public.roles r on r.id = ur.role_id and r.status = 'ACTIVE'
    join public.role_permissions rp on rp.role_id = r.id
    where u.auth_user_id = (select auth.uid())
      and u.status = 'ACTIVE'
      and rp.permission_code = requested_permission
  )
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$ select public.has_role('ADMIN') $$;

create or replace function public.can_access_production_line(line_id text)
returns boolean language sql stable security definer
set search_path = pg_catalog, public
as $$
  select public.is_admin() or exists (
    select 1 from public.user_production_lines upl
    where upl.user_id = public.current_business_user_id()
      and (upl.all_lines or upl.production_line_id = line_id)
  )
$$;

revoke all on function public.current_business_user_id() from public, anon;
revoke all on function public.current_user_roles() from public, anon;
revoke all on function public.has_role(text) from public, anon;
revoke all on function public.has_permission(text) from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.can_access_production_line(text) from public, anon;
grant execute on function public.current_business_user_id(), public.current_user_roles(), public.has_role(text), public.has_permission(text), public.is_admin(), public.can_access_production_line(text) to authenticated;

-- 역할 설명에 맞게 조회 권한을 보완한다. 기존 권한은 삭제하지 않는다.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.permission_code
from (values
  ('MATERIAL_MANAGER', 'PRODUCTION_VIEW'), ('MATERIAL_MANAGER', 'QUALITY_VIEW'), ('MATERIAL_MANAGER', 'SHIPMENTS_VIEW')
) as v(role_code, permission_code)
join public.roles r on r.code = v.role_code
join public.permissions p on p.code = v.permission_code
on conflict (role_id, permission_code) do nothing;

-- 앞선 데모/과도기 정책을 포함해 대상 테이블의 정책을 모두 교체한다.
do $reset$
declare p record; t text;
  all_tables constant text[] := array[
    'permissions','roles','role_permissions','business_users','user_roles','suppliers','production_lines',
    'user_production_lines','products','materials','product_bom_items','material_inbounds','material_inventory_lots',
    'material_purchase_requests','production_plans','work_orders','material_outbounds','material_transactions',
    'production_results','production_result_defects','finished_goods_lots','inspection_requests','incoming_inspections',
    'process_inspections','finished_goods_inspections','inspection_item_results','inspection_status_history',
    'inspection_standards','inspection_standard_items','product_weight_standards','defect_histories','nonconformities',
    'corrective_actions','shipments','trace_history','audit_logs'
  ];
begin
  foreach t in array all_tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end $reset$;

-- 사용자/역할/권한: 본인 프로필 조회, 변경은 ADMIN만 허용한다.
grant select on public.business_users, public.user_roles, public.user_production_lines, public.roles, public.permissions, public.role_permissions to authenticated;
grant insert, update, delete on public.business_users, public.user_roles, public.user_production_lines, public.roles, public.role_permissions to authenticated;
create policy profile_select on public.business_users for select to authenticated using (auth_user_id = (select auth.uid()) or public.is_admin());
create policy profile_admin_write on public.business_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy user_roles_select on public.user_roles for select to authenticated using (user_id = public.current_business_user_id() or public.is_admin());
create policy user_roles_admin_write on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy user_lines_select on public.user_production_lines for select to authenticated using (user_id = public.current_business_user_id() or public.is_admin());
create policy user_lines_admin_write on public.user_production_lines for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy roles_select on public.roles for select to authenticated using (status = 'ACTIVE' or public.is_admin());
create policy roles_admin_write on public.roles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy permissions_select on public.permissions for select to authenticated using (public.current_business_user_id() is not null);
create policy role_permissions_select on public.role_permissions for select to authenticated using (public.current_business_user_id() is not null);
create policy role_permissions_admin_write on public.role_permissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 기준정보: 권한 보유자는 조회, ADMIN만 변경한다.
do $master$
declare t text;
begin
  foreach t in array array['suppliers','production_lines','products','materials','product_bom_items','inspection_standards','inspection_standard_items','product_weight_standards'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy rbac_select on public.%I for select to authenticated using (public.has_permission(''MASTER_DATA_VIEW'') or public.has_permission(''MATERIALS_VIEW'') or public.has_permission(''QUALITY_VIEW''))', t);
    execute format('create policy rbac_insert on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy rbac_update on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy rbac_delete on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $master$;

-- 자재 업무: 자재 관리자와 ADMIN만 쓰기, 삭제는 ADMIN만 허용한다.
do $materials$
declare t text;
begin
  foreach t in array array['material_inbounds','material_inventory_lots','material_purchase_requests','material_outbounds','material_transactions'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy rbac_select on public.%I for select to authenticated using (public.has_permission(''MATERIALS_VIEW''))', t);
    execute format('create policy rbac_insert on public.%I for insert to authenticated with check (public.has_permission(''MATERIALS_CREATE''))', t);
    execute format('create policy rbac_update on public.%I for update to authenticated using (public.has_permission(''MATERIALS_UPDATE'')) with check (public.has_permission(''MATERIALS_UPDATE''))', t);
    execute format('create policy rbac_delete on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $materials$;

-- 생산 관리자는 전체 생산 CRUD, 작업자는 배정 라인의 작업/실적만 접근한다.
grant select, insert, update, delete on public.production_plans, public.work_orders, public.production_results, public.production_result_defects, public.finished_goods_lots to authenticated;
create policy production_plans_select on public.production_plans for select to authenticated using (public.has_permission('PRODUCTION_VIEW') and not public.has_role('WORKER') or public.is_admin());
create policy production_plans_insert on public.production_plans for insert to authenticated with check (public.has_permission('PRODUCTION_CREATE'));
create policy production_plans_update on public.production_plans for update to authenticated using (public.has_permission('PRODUCTION_UPDATE')) with check (public.has_permission('PRODUCTION_UPDATE'));
create policy production_plans_delete on public.production_plans for delete to authenticated using (public.is_admin());
create policy work_orders_select on public.work_orders for select to authenticated using ((public.has_permission('PRODUCTION_VIEW') and not public.has_role('WORKER')) or public.can_access_production_line(production_line_id));
create policy work_orders_insert on public.work_orders for insert to authenticated with check (public.has_permission('PRODUCTION_CREATE'));
create policy work_orders_update on public.work_orders for update to authenticated using (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id))) with check (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id)));
create policy work_orders_delete on public.work_orders for delete to authenticated using (public.is_admin());
create policy production_results_select on public.production_results for select to authenticated using ((public.has_permission('PRODUCTION_VIEW') and not public.has_role('WORKER')) or public.can_access_production_line(production_line_id));
create policy production_results_insert on public.production_results for insert to authenticated with check (public.has_permission('PRODUCTION_CREATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id)));
create policy production_results_update on public.production_results for update to authenticated using (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id))) with check (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id)));
create policy production_results_delete on public.production_results for delete to authenticated using (public.is_admin());
create policy production_defects_select on public.production_result_defects for select to authenticated using (exists (select 1 from public.production_results pr where pr.id = production_result_id));
create policy production_defects_insert on public.production_result_defects for insert to authenticated with check (exists (select 1 from public.production_results pr where pr.id = production_result_id and (public.has_permission('PRODUCTION_CREATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(pr.production_line_id)))));
create policy production_defects_update on public.production_result_defects for update to authenticated using (exists (select 1 from public.production_results pr where pr.id = production_result_id and (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(pr.production_line_id))))) with check (exists (select 1 from public.production_results pr where pr.id = production_result_id and (public.has_permission('PRODUCTION_UPDATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(pr.production_line_id)))));
create policy production_defects_delete on public.production_result_defects for delete to authenticated using (public.is_admin());
create policy finished_lots_select on public.finished_goods_lots for select to authenticated using ((public.has_permission('PRODUCTION_VIEW') and not public.has_role('WORKER')) or public.can_access_production_line(production_line_id) or public.has_permission('QUALITY_VIEW') or public.has_permission('SHIPMENTS_VIEW'));
create policy finished_lots_insert on public.finished_goods_lots for insert to authenticated with check (public.has_permission('PRODUCTION_CREATE') or (public.has_permission('PRODUCTION_EXECUTE') and public.can_access_production_line(production_line_id)));
create policy finished_lots_update on public.finished_goods_lots for update to authenticated using (public.has_permission('PRODUCTION_UPDATE') or public.has_permission('QUALITY_APPROVE')) with check (public.has_permission('PRODUCTION_UPDATE') or public.has_permission('QUALITY_APPROVE'));
create policy finished_lots_delete on public.finished_goods_lots for delete to authenticated using (public.is_admin());

-- 품질: 조회 권한과 작성/수정/판정 권한을 분리하고 삭제는 ADMIN만 허용한다.
do $quality$
declare t text;
begin
  foreach t in array array['inspection_requests','incoming_inspections','process_inspections','finished_goods_inspections','inspection_item_results','inspection_status_history','defect_histories','nonconformities','corrective_actions'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy rbac_select on public.%I for select to authenticated using (public.has_permission(''QUALITY_VIEW''))', t);
    execute format('create policy rbac_insert on public.%I for insert to authenticated with check (public.has_permission(''QUALITY_CREATE''))', t);
    execute format('create policy rbac_update on public.%I for update to authenticated using (public.has_permission(''QUALITY_UPDATE'')) with check (public.has_permission(''QUALITY_UPDATE''))', t);
    execute format('create policy rbac_delete on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $quality$;

-- 출하: 권한 보유자만 변경하며 PASSED + 출하가능 LOT만 신규/변경 출하할 수 있다.
grant select, insert, update, delete on public.shipments to authenticated;
create policy shipments_select on public.shipments for select to authenticated using (public.has_permission('SHIPMENTS_VIEW'));
create policy shipments_insert on public.shipments for insert to authenticated with check (public.has_permission('SHIPMENTS_CREATE') and exists (select 1 from public.finished_goods_lots lot where lot.id = finished_goods_lot_id and lot.quality_status = 'PASSED' and lot.is_release_available));
create policy shipments_update on public.shipments for update to authenticated using (public.has_permission('SHIPMENTS_UPDATE')) with check (public.has_permission('SHIPMENTS_UPDATE') and exists (select 1 from public.finished_goods_lots lot where lot.id = finished_goods_lot_id and lot.quality_status = 'PASSED' and lot.is_release_available));
create policy shipments_delete on public.shipments for delete to authenticated using (public.is_admin());

-- 추적 이력은 추가만 허용하고, 감사로그 쓰기는 RLS를 우회하는 서버 시스템 동작에만 남긴다.
grant select, insert on public.trace_history to authenticated;
create policy trace_select on public.trace_history for select to authenticated using (public.has_permission('TRACEABILITY_VIEW'));
create policy trace_insert on public.trace_history for insert to authenticated with check (public.has_permission('TRACEABILITY_VIEW') and user_id = public.current_business_user_id());
grant select on public.audit_logs to authenticated;
create policy audit_select on public.audit_logs for select to authenticated using (public.has_permission('AUDIT_VIEW'));

commit;
