begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 사용자·역할·권한
create table public.permissions (
  code text primary key,
  module text not null check (module in ('DASHBOARD','MASTER_DATA','MATERIALS','PRODUCTION','SHIPMENTS','QUALITY','TRACEABILITY','REPORTS','ADMIN')),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id text primary key,
  code text not null unique check (code in ('ADMIN','MATERIAL_MANAGER','PRODUCTION_MANAGER','QUALITY_MANAGER','WORKER')),
  name text not null,
  description text not null default '',
  is_system boolean not null default false,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id text not null references public.roles(id) on delete restrict,
  permission_code text not null references public.permissions(code) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (role_id, permission_code)
);

create table public.business_users (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  employee_no text not null unique,
  name text not null,
  email text not null unique,
  department text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id text not null references public.business_users(id) on delete restrict,
  role_id text not null references public.roles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- 기준정보
create table public.suppliers (
  id text primary key,
  code text not null unique,
  name text not null unique,
  type text not null check (type in ('SUPPLIER','CUSTOMER','PARTNER')),
  contact_person text not null default '',
  phone text not null default '',
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.production_lines (
  id text primary key,
  code text not null unique,
  name text not null unique,
  process text not null check (process in ('BREAD_PROCESS','SWEET_BREAD_PROCESS','PASTRY_PROCESS')),
  max_capacity numeric(14,3) not null check (max_capacity > 0),
  unit text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_production_lines (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.business_users(id) on delete restrict,
  production_line_id text references public.production_lines(id) on delete restrict,
  all_lines boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((all_lines and production_line_id is null) or (not all_lines and production_line_id is not null))
);

create unique index user_production_lines_all_unique
  on public.user_production_lines(user_id) where all_lines;
create unique index user_production_lines_line_unique
  on public.user_production_lines(user_id, production_line_id) where not all_lines;

create table public.products (
  id text primary key,
  code text not null unique,
  name text not null,
  category text not null check (category in ('BREAD','COOKED_BREAD','SWEET_BREAD','PASTRY')),
  unit text not null,
  default_line_id text references public.production_lines(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.materials (
  id text primary key,
  code text not null unique,
  name text not null,
  category text not null check (category in ('MAIN','SUB','DAIRY','AGRICULTURAL','PROCESSED')),
  unit text not null,
  safety_stock numeric(14,3) not null default 0 check (safety_stock >= 0),
  default_supplier_id text references public.suppliers(id) on delete restrict,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_bom_items (
  product_id text not null references public.products(id) on delete restrict,
  material_id text not null references public.materials(id) on delete restrict,
  base_quantity numeric(14,3) not null check (base_quantity > 0),
  base_output_quantity numeric(14,3) not null default 1000 check (base_output_quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, material_id)
);

-- 자재 입고·재고·출고·수불
create table public.material_inbounds (
  id text primary key,
  inbound_no text not null unique,
  inbound_date date not null,
  material_id text not null references public.materials(id) on delete restrict,
  lot_no text not null unique,
  supplier_id text not null references public.suppliers(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null,
  manufacture_date date,
  expiration_date date not null,
  inspection_status text not null default 'PENDING' check (inspection_status in ('PENDING','PASSED','HOLD','FAILED')),
  inbound_status text not null default 'RECEIVED' check (inbound_status in ('RECEIVED','CANCELLED')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (manufacture_date is null or expiration_date >= manufacture_date)
);

create table public.material_inventory_lots (
  id text primary key,
  material_id text not null references public.materials(id) on delete restrict,
  inbound_id text references public.material_inbounds(id) on delete restrict,
  lot_no text not null unique,
  current_stock numeric(14,3) not null default 0 check (current_stock >= 0),
  available_stock numeric(14,3) not null default 0 check (available_stock >= 0),
  hold_stock numeric(14,3) not null default 0 check (hold_stock >= 0),
  unit text not null,
  safety_stock numeric(14,3) not null default 0 check (safety_stock >= 0),
  location text not null,
  expiration_date date not null,
  inventory_status text not null default 'NORMAL' check (inventory_status in ('NORMAL','LOW','CRITICAL','HOLD','EXPIRED')),
  inspection_status text not null default 'PENDING' check (inspection_status in ('PENDING','PASSED','HOLD','FAILED')),
  supplier_id text not null references public.suppliers(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (available_stock + hold_stock <= current_stock)
);

create table public.material_purchase_requests (
  id text primary key,
  request_no text not null unique,
  request_date date not null,
  material_id text not null references public.materials(id) on delete restrict,
  supplier_id text references public.suppliers(id) on delete restrict,
  requested_quantity numeric(14,3) not null check (requested_quantity > 0),
  unit text not null,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','RECEIVED')),
  requester_user_id text references public.business_users(id) on delete restrict,
  requester_name text not null,
  received_inbound_id text references public.material_inbounds(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 생산계획·작업지시
create table public.production_plans (
  id text primary key,
  plan_no text not null unique,
  planned_date date not null,
  product_id text not null references public.products(id) on delete restrict,
  production_line_id text not null references public.production_lines(id) on delete restrict,
  planned_quantity numeric(14,3) not null check (planned_quantity > 0),
  unit text not null,
  start_time time not null,
  end_time time not null,
  priority text not null default 'NORMAL' check (priority in ('URGENT','HIGH','NORMAL','LOW')),
  plan_status text not null default 'DRAFT' check (plan_status in ('DRAFT','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')),
  material_readiness text not null default 'NOT_CHECKED' check (material_readiness in ('READY','PARTIAL','SHORTAGE','NOT_CHECKED')),
  manager_user_id text references public.business_users(id) on delete restrict,
  manager_name text not null,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.work_orders (
  id text primary key,
  work_order_no text not null unique,
  production_plan_id text not null references public.production_plans(id) on delete restrict,
  planned_date date not null,
  product_id text not null references public.products(id) on delete restrict,
  production_line_id text not null references public.production_lines(id) on delete restrict,
  ordered_quantity numeric(14,3) not null check (ordered_quantity > 0),
  unit text not null,
  start_time time not null,
  end_time time not null,
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null default '',
  material_issue_status text not null default 'NOT_ISSUED' check (material_issue_status in ('NOT_ISSUED','PARTIALLY_ISSUED','ISSUED','SHORTAGE')),
  work_status text not null default 'WAITING' check (work_status in ('WAITING','READY','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED')),
  actual_start_time timestamptz,
  actual_end_time timestamptz,
  current_quantity numeric(14,3) not null default 0 check (current_quantity >= 0),
  pause_reason text,
  paused_at timestamptz,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.material_outbounds (
  id text primary key,
  outbound_no text not null unique,
  outbound_date date not null,
  material_id text not null references public.materials(id) on delete restrict,
  inventory_lot_id text not null references public.material_inventory_lots(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null,
  production_line_id text not null references public.production_lines(id) on delete restrict,
  work_order_id text not null references public.work_orders(id) on delete restrict,
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null,
  outbound_status text not null default 'COMPLETED' check (outbound_status in ('COMPLETED','CANCELLED')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.material_transactions (
  id text primary key,
  occurred_at timestamptz not null,
  transaction_no text not null unique,
  transaction_type text not null check (transaction_type in ('INBOUND','OUTBOUND','INBOUND_CANCEL','OUTBOUND_CANCEL','ADJUSTMENT_INCREASE','ADJUSTMENT_DECREASE')),
  material_id text not null references public.materials(id) on delete restrict,
  inventory_lot_id text references public.material_inventory_lots(id) on delete restrict,
  inbound_quantity numeric(14,3) not null default 0 check (inbound_quantity >= 0),
  outbound_quantity numeric(14,3) not null default 0 check (outbound_quantity >= 0),
  balance_after numeric(14,3) not null check (balance_after >= 0),
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (inbound_quantity > 0 or outbound_quantity > 0)
);

-- 생산실적·완제품 LOT
create table public.production_results (
  id text primary key,
  result_no text not null unique,
  work_order_id text not null references public.work_orders(id) on delete restrict,
  production_date date not null,
  product_id text not null references public.products(id) on delete restrict,
  production_line_id text not null references public.production_lines(id) on delete restrict,
  ordered_quantity numeric(14,3) not null check (ordered_quantity > 0),
  total_quantity numeric(14,3) not null check (total_quantity >= 0),
  good_quantity numeric(14,3) not null check (good_quantity >= 0),
  defect_quantity numeric(14,3) not null default 0 check (defect_quantity >= 0),
  rework_quantity numeric(14,3) not null default 0 check (rework_quantity >= 0),
  achievement_rate numeric(7,3) not null check (achievement_rate >= 0),
  defect_rate numeric(7,3) not null check (defect_rate >= 0 and defect_rate <= 100),
  actual_start_time timestamptz not null,
  actual_end_time timestamptz not null,
  working_hours text not null,
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null,
  result_status text not null default 'DRAFT' check (result_status in ('DRAFT','SUBMITTED','CONFIRMED')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (actual_end_time >= actual_start_time),
  check (good_quantity + defect_quantity <= total_quantity + rework_quantity)
);

create table public.production_result_defects (
  id uuid primary key default gen_random_uuid(),
  production_result_id text not null references public.production_results(id) on delete cascade,
  defect_type text not null check (defect_type in ('DOUGH_DEFECT','BAKING_DEFECT','SHAPE_DEFECT','WEIGHT_DEFECT','PACKAGING_DEFECT','OTHER')),
  quantity numeric(14,3) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (production_result_id, defect_type)
);

create table public.finished_goods_lots (
  id text primary key,
  fg_lot_no text not null unique,
  production_result_id text not null unique references public.production_results(id) on delete restrict,
  work_order_id text not null references public.work_orders(id) on delete restrict,
  production_date date not null,
  product_id text not null references public.products(id) on delete restrict,
  production_line_id text not null references public.production_lines(id) on delete restrict,
  total_quantity numeric(14,3) not null check (total_quantity >= 0),
  good_quantity numeric(14,3) not null check (good_quantity >= 0 and good_quantity <= total_quantity),
  unit text not null,
  expiration_date date not null,
  quality_status text not null default 'PENDING' check (quality_status in ('PENDING','PASSED','HOLD','FAILED')),
  is_release_available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 품질검사
create table public.inspection_requests (
  id text primary key,
  request_no text not null unique,
  request_time timestamptz not null,
  category text not null check (category in ('INCOMING','PROCESS','FINISHED_GOODS')),
  target_no text not null,
  target_name text not null,
  lot_no text not null,
  line_or_supplier text not null,
  requester_user_id text references public.business_users(id) on delete restrict,
  requester_name text not null,
  inspector_user_id text references public.business_users(id) on delete restrict,
  inspector_name text,
  priority text not null default 'NORMAL' check (priority in ('URGENT','HIGH','NORMAL','LOW')),
  status text not null default 'REQUESTED' check (status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incoming_inspections (
  id text primary key,
  iqc_no text not null unique,
  request_id text references public.inspection_requests(id) on delete restrict,
  inbound_id text not null references public.material_inbounds(id) on delete restrict,
  inspector_user_id text references public.business_users(id) on delete restrict,
  inspector_name text not null,
  inspection_date timestamptz not null,
  status text not null check (status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  judgment text not null check (judgment in ('PASSED','CONDITIONAL_PASS','HOLD','FAILED')),
  judgment_reason text,
  attachment_file_name text,
  previous_inspection_id text references public.incoming_inspections(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.process_inspections (
  id text primary key,
  pqc_no text not null unique,
  request_id text references public.inspection_requests(id) on delete restrict,
  work_order_id text not null references public.work_orders(id) on delete restrict,
  production_date date not null,
  process text not null check (process in ('MIXING','DOUGH','FERMENTATION','DIVIDING','SHAPING','BAKING','COOLING','PACKAGING')),
  inspection_timing text not null,
  worker_user_id text references public.business_users(id) on delete restrict,
  worker_name text not null,
  inspector_user_id text references public.business_users(id) on delete restrict,
  inspector_name text not null,
  inspection_date timestamptz not null,
  status text not null check (status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  judgment text not null check (judgment in ('PASSED','CONDITIONAL_PASS','HOLD','FAILED')),
  judgment_reason text,
  follow_up_action text,
  previous_inspection_id text references public.process_inspections(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finished_goods_inspections (
  id text primary key,
  fqc_no text not null unique,
  request_id text references public.inspection_requests(id) on delete restrict,
  finished_goods_lot_id text not null references public.finished_goods_lots(id) on delete restrict,
  sample_quantity numeric(14,3) not null check (sample_quantity > 0),
  defective_sample_quantity numeric(14,3) not null default 0 check (defective_sample_quantity >= 0),
  avg_weight numeric(14,3) not null check (avg_weight >= 0),
  min_weight numeric(14,3) not null check (min_weight >= 0),
  max_weight numeric(14,3) not null check (max_weight >= min_weight),
  inspector_user_id text references public.business_users(id) on delete restrict,
  inspector_name text not null,
  inspection_date timestamptz not null,
  status text not null check (status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  judgment text not null check (judgment in ('PASSED','CONDITIONAL_PASS','HOLD','FAILED')),
  judgment_reason text,
  is_release_available boolean not null default false,
  recheck_required boolean not null default false,
  previous_inspection_id text references public.finished_goods_inspections(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (defective_sample_quantity <= sample_quantity)
);

create table public.inspection_item_results (
  id uuid primary key default gen_random_uuid(),
  inspection_category text not null check (inspection_category in ('INCOMING','PROCESS','FINISHED_GOODS')),
  incoming_inspection_id text references public.incoming_inspections(id) on delete cascade,
  process_inspection_id text references public.process_inspections(id) on delete cascade,
  finished_goods_inspection_id text references public.finished_goods_inspections(id) on delete cascade,
  item_name text not null,
  standard_value text not null,
  measured_value text not null,
  unit text,
  is_mandatory boolean not null default false,
  result text not null default 'NOT_TESTED' check (result in ('NOT_TESTED','PASS','FAIL','NOT_APPLICABLE')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(incoming_inspection_id, process_inspection_id, finished_goods_inspection_id) = 1),
  check (
    (inspection_category = 'INCOMING' and incoming_inspection_id is not null) or
    (inspection_category = 'PROCESS' and process_inspection_id is not null) or
    (inspection_category = 'FINISHED_GOODS' and finished_goods_inspection_id is not null)
  )
);

create table public.inspection_status_history (
  id text primary key,
  inspection_category text not null check (inspection_category in ('INCOMING','PROCESS','FINISHED_GOODS')),
  incoming_inspection_id text references public.incoming_inspections(id) on delete cascade,
  process_inspection_id text references public.process_inspections(id) on delete cascade,
  finished_goods_inspection_id text references public.finished_goods_inspections(id) on delete cascade,
  changed_at timestamptz not null,
  previous_status text not null check (previous_status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  new_status text not null check (new_status in ('REQUESTED','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED')),
  changed_by_user_id text references public.business_users(id) on delete restrict,
  changed_by_name text not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(incoming_inspection_id, process_inspection_id, finished_goods_inspection_id) = 1)
);

create table public.inspection_standards (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('INCOMING','PROCESS','FINISHED_GOODS')),
  target_code text not null,
  target_name text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, target_code)
);

create table public.inspection_standard_items (
  id uuid primary key default gen_random_uuid(),
  inspection_standard_id uuid not null references public.inspection_standards(id) on delete cascade,
  item_name text not null,
  standard_value text not null,
  is_mandatory boolean not null default false,
  unit text,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_standard_id, item_name)
);

create table public.product_weight_standards (
  product_id text primary key references public.products(id) on delete restrict,
  base_weight numeric(14,3) not null check (base_weight > 0),
  tolerance numeric(14,3) not null check (tolerance >= 0),
  min_allowed numeric(14,3) not null check (min_allowed >= 0),
  max_allowed numeric(14,3) not null check (max_allowed >= min_allowed),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.defect_histories (
  id text primary key,
  defect_no text not null unique,
  finished_goods_lot_id text not null references public.finished_goods_lots(id) on delete restrict,
  product_id text not null references public.products(id) on delete restrict,
  production_date date not null,
  inspection_date timestamptz not null,
  inspector_user_id text references public.business_users(id) on delete restrict,
  inspector_name text not null,
  defect_type text not null check (defect_type in ('FOREIGN_MATERIAL','WEIGHT','PACKAGING','APPEARANCE','SEALING','LABEL','DAMAGE','OTHER')),
  defect_quantity numeric(14,3) not null check (defect_quantity > 0),
  defect_rate numeric(7,3) not null check (defect_rate >= 0 and defect_rate <= 100),
  cause text not null default '',
  corrective_action text not null default '',
  status text not null check (status in ('INVESTIGATING','CAUSE_ANALYZED','REWORK','DISCARDED','SHIPMENT_HOLD','COMPLETED')),
  assignee_user_id text references public.business_users(id) on delete restrict,
  assignee_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nonconformities (
  id text primary key,
  nc_no text not null unique,
  occurred_date date not null,
  category text not null check (category in ('INCOMING','PROCESS','FINISHED_GOODS')),
  inspection_no text not null,
  target_no text not null,
  target_name text not null,
  lot_no text not null,
  nc_type text not null check (nc_type in ('MATERIAL_DEFECT','PACKAGING_DAMAGE','FOREIGN_MATERIAL','TEMPERATURE_DEVIATION','WEIGHT_DEVIATION','APPEARANCE_DEFECT','SHAPE_DEFECT','BAKING_DEFECT','LABELING_ERROR','HYGIENE_ISSUE','PROCESS_DEVIATION','OTHER')),
  defect_quantity numeric(14,3) not null check (defect_quantity >= 0),
  unit text not null,
  severity text not null check (severity in ('CRITICAL','MAJOR','MINOR')),
  nc_status text not null default 'OPEN' check (nc_status in ('OPEN','INVESTIGATING','ACTION_REQUIRED','ACTION_IN_PROGRESS','RESOLVED','CLOSED')),
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null,
  due_date date not null,
  details text not null,
  interim_action text,
  admin_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.corrective_actions (
  id text primary key,
  ca_no text not null unique,
  nonconformity_id text not null references public.nonconformities(id) on delete restrict,
  request_date date not null,
  target_department text not null check (target_department in ('MATERIALS','PRODUCTION','QUALITY','FACILITY','HYGIENE')),
  handler_user_id text references public.business_users(id) on delete restrict,
  handler_name text not null,
  problem_summary text not null,
  interim_action text,
  direct_cause text,
  root_cause text,
  analysis_method text check (analysis_method is null or analysis_method in ('FIVE_WHY','FISHBONE','CHECKLIST','INTERVIEW','DATA_ANALYSIS','OTHER')),
  action_plan text,
  preventive_measure text,
  ca_status text not null default 'REQUESTED' check (ca_status in ('REQUESTED','ANALYZING','PLANNED','IN_PROGRESS','COMPLETED','VERIFIED','CLOSED')),
  start_date date,
  due_date date not null,
  completed_date date,
  verification_content text,
  verifier_user_id text references public.business_users(id) on delete restrict,
  verifier_name text,
  verification_date date,
  verification_status text not null default 'NOT_VERIFIED' check (verification_status in ('NOT_VERIFIED','EFFECTIVE','INEFFECTIVE','RECHECK_REQUIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 출하·LOT 추적·감사
create table public.shipments (
  id text primary key,
  shipment_number text not null unique,
  finished_goods_lot_id text not null references public.finished_goods_lots(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  customer_supplier_id text references public.suppliers(id) on delete restrict,
  customer_name text not null,
  planned_date date not null,
  shipped_date date,
  status text not null default 'PLANNED' check (status in ('PLANNED','READY','COMPLETED','CANCELLED')),
  manager_user_id text references public.business_users(id) on delete restrict,
  manager_name text not null,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (shipped_date is null or shipped_date >= planned_date)
);

create table public.trace_history (
  id text primary key,
  trace_timestamp timestamptz not null,
  direction text not null check (direction in ('FORWARD','BACKWARD','INTEGRATED_SEARCH','RELATION_VIEW')),
  search_query text not null,
  start_no text not null,
  result_count integer not null default 0 check (result_count >= 0),
  related_raw_lot_count integer not null default 0 check (related_raw_lot_count >= 0),
  related_fg_lot_count integer not null default 0 check (related_fg_lot_count >= 0),
  has_quality_anomaly boolean not null default false,
  user_id text references public.business_users(id) on delete restrict,
  user_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id text primary key,
  occurred_at timestamptz not null,
  actor_user_id text references public.business_users(id) on delete restrict,
  actor_name text not null,
  action text not null,
  target_type text not null check (target_type in ('USER','ROLE','PERMISSION','SESSION','SHIPMENT')),
  target_id text not null,
  description text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 조회·조인·상태 필터 인덱스
create index business_users_auth_user_id_idx on public.business_users(auth_user_id);
create index products_status_idx on public.products(status);
create index materials_status_idx on public.materials(status);
create index materials_supplier_idx on public.materials(default_supplier_id);
create index material_inbounds_material_date_idx on public.material_inbounds(material_id, inbound_date desc);
create index material_inbounds_status_idx on public.material_inbounds(inbound_status, inspection_status);
create index material_inventory_material_status_idx on public.material_inventory_lots(material_id, inventory_status);
create index material_inventory_expiration_idx on public.material_inventory_lots(expiration_date);
create index material_purchase_status_idx on public.material_purchase_requests(status, request_date desc);
create index production_plans_date_status_idx on public.production_plans(planned_date, plan_status);
create index production_plans_line_idx on public.production_plans(production_line_id);
create index work_orders_plan_idx on public.work_orders(production_plan_id);
create index work_orders_line_status_idx on public.work_orders(production_line_id, work_status);
create index material_outbounds_lot_idx on public.material_outbounds(inventory_lot_id);
create index material_outbounds_work_order_idx on public.material_outbounds(work_order_id);
create index material_transactions_material_time_idx on public.material_transactions(material_id, occurred_at desc);
create index production_results_work_order_idx on public.production_results(work_order_id);
create index production_results_date_status_idx on public.production_results(production_date, result_status);
create index finished_goods_lots_product_date_idx on public.finished_goods_lots(product_id, production_date desc);
create index finished_goods_lots_quality_idx on public.finished_goods_lots(quality_status, is_release_available);
create index inspection_requests_category_status_idx on public.inspection_requests(category, status);
create index inspection_requests_lot_idx on public.inspection_requests(lot_no);
create index incoming_inspections_inbound_idx on public.incoming_inspections(inbound_id);
create index process_inspections_work_order_idx on public.process_inspections(work_order_id);
create index finished_inspections_lot_idx on public.finished_goods_inspections(finished_goods_lot_id);
create index inspection_standards_category_idx on public.inspection_standards(category, status);
create index defect_histories_lot_idx on public.defect_histories(finished_goods_lot_id);
create index nonconformities_lot_status_idx on public.nonconformities(lot_no, nc_status);
create index corrective_actions_nc_status_idx on public.corrective_actions(nonconformity_id, ca_status);
create index shipments_lot_status_idx on public.shipments(finished_goods_lot_id, status);
create index shipments_planned_date_idx on public.shipments(planned_date);
create index trace_history_time_idx on public.trace_history(trace_timestamp desc);
create index audit_logs_actor_time_idx on public.audit_logs(actor_user_id, occurred_at desc);
create index audit_logs_target_idx on public.audit_logs(target_type, target_id);

-- updated_at 자동 갱신
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'permissions','roles','role_permissions','business_users','user_roles','suppliers','production_lines',
    'user_production_lines','products','materials',
    'product_bom_items','material_inbounds','material_inventory_lots','material_purchase_requests',
    'production_plans','work_orders','material_outbounds','material_transactions','production_results',
    'production_result_defects','finished_goods_lots','inspection_requests','incoming_inspections',
    'process_inspections','finished_goods_inspections','inspection_item_results','inspection_status_history',
    'inspection_standards','inspection_standard_items','product_weight_standards',
    'defect_histories','nonconformities','corrective_actions','shipments','trace_history','audit_logs'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end;
$$;

commit;
