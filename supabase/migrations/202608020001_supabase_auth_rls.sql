begin;

-- 데모 익명 정책을 제거하고 실제 Supabase Auth 세션만 업무 데이터에 접근하도록 전환한다.
do $rls$
declare
  table_name text;
  business_tables constant text[] := array[
    'suppliers','production_lines','user_production_lines','products','materials','product_bom_items',
    'material_inbounds','material_inventory_lots','material_purchase_requests','production_plans','work_orders',
    'material_outbounds','material_transactions','production_results','production_result_defects','finished_goods_lots',
    'inspection_requests','incoming_inspections','process_inspections','finished_goods_inspections',
    'inspection_item_results','inspection_status_history','inspection_standards','inspection_standard_items',
    'product_weight_standards','defect_histories','nonconformities','corrective_actions','shipments','trace_history','audit_logs'
  ];
begin
  foreach table_name in array array['permissions','roles','role_permissions','business_users','user_roles'] || business_tables loop
    execute format('drop policy if exists demo_select on public.%I', table_name);
    execute format('drop policy if exists demo_insert on public.%I', table_name);
    execute format('drop policy if exists demo_update on public.%I', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
  end loop;

  grant select on public.permissions, public.roles, public.role_permissions to authenticated;
  grant select on public.business_users, public.user_roles to authenticated;

  create policy authenticated_reference_select on public.permissions for select to authenticated using (true);
  create policy authenticated_reference_select on public.roles for select to authenticated using (status = 'ACTIVE');
  create policy authenticated_reference_select on public.role_permissions for select to authenticated using (true);
  create policy own_profile_select on public.business_users for select to authenticated using (auth_user_id = (select auth.uid()));
  create policy own_roles_select on public.user_roles for select to authenticated using (
    exists (select 1 from public.business_users u where u.id = user_roles.user_id and u.auth_user_id = (select auth.uid()))
  );

  foreach table_name in array business_tables loop
    execute format('grant select, insert, update on table public.%I to authenticated', table_name);
    execute format('create policy authenticated_select on public.%I for select to authenticated using (true)', table_name);
    execute format('create policy authenticated_insert on public.%I for insert to authenticated with check (true)', table_name);
    execute format('create policy authenticated_update on public.%I for update to authenticated using (true) with check (true)', table_name);
  end loop;
end
$rls$;

commit;
