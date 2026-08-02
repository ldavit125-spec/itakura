begin;

-- 데모 로그인 단계용 임시 RLS 정책입니다.
-- 현재 프론트엔드는 Supabase Auth와 연결되지 않았으므로 anon/authenticated 역할에
-- SELECT, INSERT, UPDATE만 허용합니다. DELETE 권한은 부여하지 않습니다.
-- Auth 연동 후에는 anon 정책을 제거하고 business_users.auth_user_id 및 역할 기준으로 교체해야 합니다.

do $rls$
declare
  table_name text;
  table_names constant text[] := array[
    'permissions',
    'roles',
    'role_permissions',
    'business_users',
    'user_roles',
    'suppliers',
    'production_lines',
    'user_production_lines',
    'products',
    'materials',
    'product_bom_items',
    'material_inbounds',
    'material_inventory_lots',
    'material_purchase_requests',
    'production_plans',
    'work_orders',
    'material_outbounds',
    'material_transactions',
    'production_results',
    'production_result_defects',
    'finished_goods_lots',
    'inspection_requests',
    'incoming_inspections',
    'process_inspections',
    'finished_goods_inspections',
    'inspection_item_results',
    'inspection_status_history',
    'inspection_standards',
    'inspection_standard_items',
    'product_weight_standards',
    'defect_histories',
    'nonconformities',
    'corrective_actions',
    'shipments',
    'trace_history',
    'audit_logs'
  ];
begin
  foreach table_name in array table_names loop
    execute format('alter table public.%I enable row level security', table_name);

    -- Supabase의 기본 권한 상태와 관계없이 허용 범위를 명시적으로 고정합니다.
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update on table public.%I to anon, authenticated', table_name);

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'demo_select'
    ) then
      execute format(
        'create policy demo_select on public.%I for select to anon, authenticated using (true)',
        table_name
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'demo_insert'
    ) then
      execute format(
        'create policy demo_insert on public.%I for insert to anon, authenticated with check (true)',
        table_name
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'demo_update'
    ) then
      execute format(
        'create policy demo_update on public.%I for update to anon, authenticated using (true) with check (true)',
        table_name
      );
    end if;
  end loop;
end
$rls$;

commit;
