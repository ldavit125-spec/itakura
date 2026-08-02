begin;

-- 1. 권한
insert into public.permissions (code, module, name, description) values
('DASHBOARD_VIEW','DASHBOARD','대시보드 조회','통합 대시보드를 조회합니다.'),
('MASTER_DATA_VIEW','MASTER_DATA','기준정보 조회','기준정보를 조회합니다.'),
('MATERIALS_VIEW','MATERIALS','자재 조회','자재 현황을 조회합니다.'),
('MATERIALS_CREATE','MATERIALS','자재 등록','입고·출고를 등록합니다.'),
('MATERIALS_UPDATE','MATERIALS','자재 수정','자재 업무 데이터를 수정합니다.'),
('MATERIALS_CANCEL','MATERIALS','자재 취소','입고·출고를 취소합니다.'),
('PRODUCTION_VIEW','PRODUCTION','생산 조회','생산 데이터를 조회합니다.'),
('PRODUCTION_CREATE','PRODUCTION','생산 등록','생산계획과 실적을 등록합니다.'),
('PRODUCTION_UPDATE','PRODUCTION','생산 수정','생산계획과 작업지시를 수정합니다.'),
('PRODUCTION_APPROVE','PRODUCTION','생산 확정','계획과 실적을 확정합니다.'),
('PRODUCTION_EXECUTE','PRODUCTION','생산 실행','작업 시작·중지·완료를 처리합니다.'),
('SHIPMENTS_VIEW','SHIPMENTS','출하 조회','출하 현황과 이력을 조회합니다.'),
('SHIPMENTS_CREATE','SHIPMENTS','출하 등록','출하 예정 정보를 등록합니다.'),
('SHIPMENTS_UPDATE','SHIPMENTS','출하 수정','출하 정보와 준비 상태를 변경합니다.'),
('SHIPMENTS_COMPLETE','SHIPMENTS','출하 완료','재고를 검증하고 출하를 완료합니다.'),
('QUALITY_VIEW','QUALITY','품질 조회','품질 데이터를 조회합니다.'),
('QUALITY_CREATE','QUALITY','품질 등록','검사와 부적합을 등록합니다.'),
('QUALITY_UPDATE','QUALITY','품질 수정','검사와 시정조치를 수정합니다.'),
('QUALITY_APPROVE','QUALITY','품질 판정','검사 결과를 판정·승인합니다.'),
('TRACEABILITY_VIEW','TRACEABILITY','LOT 추적 조회','원재료·완제품 LOT을 추적합니다.'),
('REPORTS_VIEW','REPORTS','보고서 조회','통합 보고서를 조회합니다.'),
('REPORTS_EXPORT','REPORTS','보고서 내보내기','보고서를 파일로 내보냅니다.'),
('ADMIN_VIEW','ADMIN','관리자 화면 조회','관리자 화면에 접근합니다.'),
('USERS_MANAGE','ADMIN','사용자 관리','사용자 역할과 상태를 관리합니다.'),
('ROLES_MANAGE','ADMIN','역할 관리','역할 정보를 관리합니다.'),
('PERMISSIONS_MANAGE','ADMIN','권한 관리','역할별 권한을 관리합니다.'),
('AUDIT_VIEW','ADMIN','감사 로그 조회','관리자 변경 이력을 조회합니다.')
on conflict (code) do update set module=excluded.module, name=excluded.name, description=excluded.description;

-- 2. 역할
insert into public.roles (id, code, name, description, is_system, status) values
('role-admin','ADMIN','시스템 관리자','전체 시스템과 관리자 기능을 관리합니다.',true,'ACTIVE'),
('role-material','MATERIAL_MANAGER','자재 관리자','자재 입출고와 재고를 관리합니다.',true,'ACTIVE'),
('role-production','PRODUCTION_MANAGER','생산 관리자','허용 생산라인의 계획·작업·실적과 출하를 관리합니다.',true,'ACTIVE'),
('role-quality','QUALITY_MANAGER','품질 관리자','품질 검사와 판정을 관리합니다.',true,'ACTIVE'),
('role-worker','WORKER','현장 작업자','허용 생산라인의 작업을 수행하고 출하를 조회합니다.',true,'ACTIVE')
on conflict (id) do update set code=excluded.code, name=excluded.name, description=excluded.description, is_system=excluded.is_system, status=excluded.status;

insert into public.role_permissions (role_id, permission_code)
select r.id, v.permission_code
from (values
  ('ADMIN','DASHBOARD_VIEW'),('ADMIN','MASTER_DATA_VIEW'),('ADMIN','MATERIALS_VIEW'),('ADMIN','MATERIALS_CREATE'),('ADMIN','MATERIALS_UPDATE'),('ADMIN','MATERIALS_CANCEL'),('ADMIN','PRODUCTION_VIEW'),('ADMIN','PRODUCTION_CREATE'),('ADMIN','PRODUCTION_UPDATE'),('ADMIN','PRODUCTION_APPROVE'),('ADMIN','PRODUCTION_EXECUTE'),('ADMIN','SHIPMENTS_VIEW'),('ADMIN','SHIPMENTS_CREATE'),('ADMIN','SHIPMENTS_UPDATE'),('ADMIN','SHIPMENTS_COMPLETE'),('ADMIN','QUALITY_VIEW'),('ADMIN','QUALITY_CREATE'),('ADMIN','QUALITY_UPDATE'),('ADMIN','QUALITY_APPROVE'),('ADMIN','TRACEABILITY_VIEW'),('ADMIN','REPORTS_VIEW'),('ADMIN','REPORTS_EXPORT'),('ADMIN','ADMIN_VIEW'),('ADMIN','USERS_MANAGE'),('ADMIN','ROLES_MANAGE'),('ADMIN','PERMISSIONS_MANAGE'),('ADMIN','AUDIT_VIEW'),
  ('MATERIAL_MANAGER','DASHBOARD_VIEW'),('MATERIAL_MANAGER','MASTER_DATA_VIEW'),('MATERIAL_MANAGER','MATERIALS_VIEW'),('MATERIAL_MANAGER','MATERIALS_CREATE'),('MATERIAL_MANAGER','MATERIALS_UPDATE'),('MATERIAL_MANAGER','MATERIALS_CANCEL'),('MATERIAL_MANAGER','TRACEABILITY_VIEW'),('MATERIAL_MANAGER','REPORTS_VIEW'),('MATERIAL_MANAGER','REPORTS_EXPORT'),
  ('PRODUCTION_MANAGER','DASHBOARD_VIEW'),('PRODUCTION_MANAGER','MASTER_DATA_VIEW'),('PRODUCTION_MANAGER','MATERIALS_VIEW'),('PRODUCTION_MANAGER','PRODUCTION_VIEW'),('PRODUCTION_MANAGER','PRODUCTION_CREATE'),('PRODUCTION_MANAGER','PRODUCTION_UPDATE'),('PRODUCTION_MANAGER','PRODUCTION_APPROVE'),('PRODUCTION_MANAGER','PRODUCTION_EXECUTE'),('PRODUCTION_MANAGER','SHIPMENTS_VIEW'),('PRODUCTION_MANAGER','SHIPMENTS_CREATE'),('PRODUCTION_MANAGER','SHIPMENTS_UPDATE'),('PRODUCTION_MANAGER','SHIPMENTS_COMPLETE'),('PRODUCTION_MANAGER','QUALITY_VIEW'),('PRODUCTION_MANAGER','TRACEABILITY_VIEW'),('PRODUCTION_MANAGER','REPORTS_VIEW'),('PRODUCTION_MANAGER','REPORTS_EXPORT'),
  ('QUALITY_MANAGER','DASHBOARD_VIEW'),('QUALITY_MANAGER','MASTER_DATA_VIEW'),('QUALITY_MANAGER','MATERIALS_VIEW'),('QUALITY_MANAGER','PRODUCTION_VIEW'),('QUALITY_MANAGER','QUALITY_VIEW'),('QUALITY_MANAGER','QUALITY_CREATE'),('QUALITY_MANAGER','QUALITY_UPDATE'),('QUALITY_MANAGER','QUALITY_APPROVE'),('QUALITY_MANAGER','TRACEABILITY_VIEW'),('QUALITY_MANAGER','REPORTS_VIEW'),('QUALITY_MANAGER','REPORTS_EXPORT'),
  ('WORKER','DASHBOARD_VIEW'),('WORKER','PRODUCTION_VIEW'),('WORKER','PRODUCTION_EXECUTE'),('WORKER','SHIPMENTS_VIEW'),('WORKER','QUALITY_VIEW'),('WORKER','TRACEABILITY_VIEW')
) as v(role_code, permission_code)
join public.roles r on r.code=v.role_code
join public.permissions p on p.code=v.permission_code
on conflict (role_id, permission_code) do nothing;

-- 3. 현장 사용자 프로필 (비밀번호와 auth.users 제외)
insert into public.business_users (id, employee_no, name, email, department, status) values
('user-admin','A001','이임원','admin@itakura.demo','시스템운영','ACTIVE'),
('user-material','M101','다나카 유키','material@itakura.demo','자재관리','ACTIVE'),
('user-production','P201','스즈키 다이치','production@itakura.demo','생산관리','ACTIVE'),
('user-quality','Q301','다카하시 미사키','quality@itakura.demo','품질관리','ACTIVE'),
('user-worker','W401','야마모토 렌','worker@itakura.demo','생산1팀','ACTIVE'),
('user-multi','C501','이토 아오이','combined@itakura.demo','품질·자재지원','ACTIVE')
on conflict (id) do update set employee_no=excluded.employee_no, name=excluded.name, email=excluded.email, department=excluded.department, status=excluded.status;

insert into public.user_roles (user_id, role_id) values
('user-admin','role-admin'),('user-material','role-material'),('user-production','role-production'),
('user-quality','role-quality'),('user-worker','role-worker'),('user-multi','role-material'),('user-multi','role-quality')
on conflict (user_id, role_id) do nothing;

-- 4. 공급업체·생산라인
insert into public.suppliers (id, code, name, type, contact_person, phone, status) values
('sup-1','SUP-001','사쿠라 제분','SUPPLIER','야마모토','03-1234-5678','ACTIVE'),
('sup-2','SUP-002','도쿄 식품상사','SUPPLIER','스즈키','03-2345-6789','ACTIVE'),
('sup-3','SUP-003','홋카이도 유업','SUPPLIER','다나카','011-345-6789','ACTIVE'),
('sup-4','SUP-004','아사히 농장','SUPPLIER','사토','04-4567-8901','ACTIVE'),
('sup-5','SUP-005','나고야 제과원료','SUPPLIER','이토','052-567-8901','ACTIVE')
on conflict (id) do update set code=excluded.code, name=excluded.name, type=excluded.type, contact_person=excluded.contact_person, phone=excluded.phone, status=excluded.status;

insert into public.production_lines (id, code, name, process, max_capacity, unit, status) values
('line-1','LINE-01','1호 라인','BREAD_PROCESS',5000,'개','ACTIVE'),
('line-2','LINE-02','2호 라인','SWEET_BREAD_PROCESS',8000,'개','ACTIVE'),
('line-3','LINE-03','3호 라인','PASTRY_PROCESS',4000,'개','ACTIVE')
on conflict (id) do update set code=excluded.code, name=excluded.name, process=excluded.process, max_capacity=excluded.max_capacity, unit=excluded.unit, status=excluded.status;

insert into public.user_production_lines (user_id, production_line_id, all_lines) values
('user-admin',null,true),('user-material',null,true),('user-production','line-1',false),('user-production','line-2',false),
('user-quality',null,true),('user-worker','line-1',false),('user-multi','line-2',false)
on conflict do nothing;

-- 5. 제품·자재·BOM
insert into public.products (id, code, name, category, unit, default_line_id, status) values
('prd-1','PRD-001','식빵','BREAD','개','line-1','ACTIVE'),
('prd-2','PRD-002','단팥빵','COOKED_BREAD','개','line-2','ACTIVE'),
('prd-3','PRD-003','멜론빵','SWEET_BREAD','개','line-2','ACTIVE'),
('prd-4','PRD-004','크림빵','SWEET_BREAD','개','line-2','ACTIVE'),
('prd-5','PRD-005','크루아상','PASTRY','개','line-3','ACTIVE')
on conflict (id) do update set code=excluded.code, name=excluded.name, category=excluded.category, unit=excluded.unit, default_line_id=excluded.default_line_id, status=excluded.status;

insert into public.materials (id, code, name, category, unit, safety_stock, default_supplier_id, status) values
('mat-1','MAT-001','강력분','MAIN','kg',500,'sup-1','ACTIVE'),
('mat-2','MAT-002','설탕','SUB','kg',150,'sup-2','ACTIVE'),
('mat-3','MAT-003','버터','DAIRY','kg',100,'sup-3','ACTIVE'),
('mat-4','MAT-004','계란','AGRICULTURAL','판',80,'sup-4','ACTIVE'),
('mat-5','MAT-005','팥앙금','PROCESSED','kg',120,'sup-5','ACTIVE')
on conflict (id) do update set code=excluded.code, name=excluded.name, category=excluded.category, unit=excluded.unit, safety_stock=excluded.safety_stock, default_supplier_id=excluded.default_supplier_id, status=excluded.status;

insert into public.product_bom_items (product_id, material_id, base_quantity, base_output_quantity) values
('prd-1','mat-1',350,1000),('prd-1','mat-2',35,1000),('prd-1','mat-3',25,1000),('prd-1','mat-4',8,1000),
('prd-2','mat-1',280,1000),('prd-2','mat-2',30,1000),('prd-2','mat-3',18,1000),('prd-2','mat-4',10,1000),('prd-2','mat-5',120,1000),
('prd-3','mat-1',300,1000),('prd-3','mat-2',55,1000),('prd-3','mat-3',35,1000),('prd-3','mat-4',12,1000),
('prd-4','mat-1',290,1000),('prd-4','mat-2',40,1000),('prd-4','mat-3',25,1000),('prd-4','mat-4',11,1000),
('prd-5','mat-1',320,1000),('prd-5','mat-2',25,1000),('prd-5','mat-3',110,1000),('prd-5','mat-4',6,1000)
on conflict (product_id, material_id) do update set base_quantity=excluded.base_quantity, base_output_quantity=excluded.base_output_quantity;

-- 6. 자재 입고·재고
insert into public.material_inbounds (id,inbound_no,inbound_date,material_id,lot_no,supplier_id,quantity,unit,manufacture_date,expiration_date,inspection_status,inbound_status,remarks) values
('inb-1','IN-20260730-001','2026-07-30','mat-1','LOT-FLOUR-260730-A','sup-1',1000,'kg','2026-07-30','2027-01-30','PASSED','RECEIVED','정상 입고 검사 완료'),
('inb-2','IN-20260730-002','2026-07-30','mat-2','LOT-SUGAR-260730-A','sup-2',500,'kg','2026-07-30','2027-07-30','PASSED','RECEIVED','정상 포장 확인'),
('inb-3','IN-20260730-003','2026-07-30','mat-3','LOT-BUTTER-260730-A','sup-3',200,'kg','2026-07-30','2026-10-30','PASSED','RECEIVED','냉장차 탑재 확인'),
('inb-4','IN-20260730-004','2026-07-30','mat-4','LOT-EGG-260730-A','sup-4',120,'판','2026-07-30','2026-08-30','PASSED','RECEIVED','신선도 보장'),
('inb-5','IN-20260730-005','2026-07-30','mat-5','LOT-PASTE-260730-A','sup-5',300,'kg','2026-07-30','2026-12-30','PASSED','RECEIVED','밀봉 입고'),
('inb-6','IN-20260720-001','2026-07-20','mat-4','LOT-EGG-260720-B','sup-4',30,'판','2026-07-20','2026-08-10','PASSED','RECEIVED','임박 분량 샘플'),
('inb-7','IN-20260715-001','2026-07-15','mat-3','LOT-BUTTER-260715-H','sup-3',50,'kg','2026-07-15','2026-11-15','HOLD','RECEIVED','포장 상태 보류 검사 중')
on conflict (id) do update set inbound_no=excluded.inbound_no,inbound_date=excluded.inbound_date,material_id=excluded.material_id,lot_no=excluded.lot_no,supplier_id=excluded.supplier_id,quantity=excluded.quantity,unit=excluded.unit,manufacture_date=excluded.manufacture_date,expiration_date=excluded.expiration_date,inspection_status=excluded.inspection_status,inbound_status=excluded.inbound_status,remarks=excluded.remarks;

insert into public.material_inventory_lots (id,material_id,inbound_id,lot_no,current_stock,available_stock,hold_stock,unit,safety_stock,location,expiration_date,inventory_status,inspection_status,supplier_id) values
('inv-1','mat-1','inb-1','LOT-FLOUR-260730-A',1000,1000,0,'kg',500,'원료창고 A-01','2027-01-30','NORMAL','PASSED','sup-1'),
('inv-2','mat-2','inb-2','LOT-SUGAR-260730-A',500,500,0,'kg',150,'원료창고 A-02','2027-07-30','NORMAL','PASSED','sup-2'),
('inv-3','mat-3','inb-3','LOT-BUTTER-260730-A',200,200,0,'kg',100,'냉장창고 C-01','2026-10-30','NORMAL','PASSED','sup-3'),
('inv-4','mat-4','inb-4','LOT-EGG-260730-A',40,40,0,'판',80,'냉장창고 C-02','2026-08-30','LOW','PASSED','sup-4'),
('inv-5','mat-5','inb-5','LOT-PASTE-260730-A',300,300,0,'kg',120,'가공원료창고 B-01','2026-12-30','NORMAL','PASSED','sup-5'),
('inv-6','mat-4','inb-6','LOT-EGG-260720-B',15,15,0,'판',80,'냉장창고 C-02','2026-08-10','LOW','PASSED','sup-4'),
('inv-7','mat-3','inb-7','LOT-BUTTER-260715-H',50,0,50,'kg',100,'냉장창고 C-01','2026-11-15','HOLD','HOLD','sup-3')
on conflict (id) do update set material_id=excluded.material_id,inbound_id=excluded.inbound_id,lot_no=excluded.lot_no,current_stock=excluded.current_stock,available_stock=excluded.available_stock,hold_stock=excluded.hold_stock,unit=excluded.unit,safety_stock=excluded.safety_stock,location=excluded.location,expiration_date=excluded.expiration_date,inventory_status=excluded.inventory_status,inspection_status=excluded.inspection_status,supplier_id=excluded.supplier_id;

-- 7. 생산계획 (Mock 5건 + 누락된 과거 FK 부모 2건)
insert into public.production_plans (id,plan_no,planned_date,product_id,production_line_id,planned_quantity,unit,start_time,end_time,priority,plan_status,material_readiness,manager_user_id,manager_name,remarks) values
('plan-1','PLAN-20260731-001','2026-07-31','prd-1','line-1',4000,'개','08:00','12:00','URGENT','CONFIRMED','READY',null,'나카무라 쇼타','오전 식빵 정기 생산 및 대량 출하 대비'),
('plan-2','PLAN-20260731-002','2026-07-31','prd-2','line-2',3500,'개','08:00','11:00','HIGH','CONFIRMED','READY','user-production','스즈키 다이치','단팥빵 2호 라인 오전 배치'),
('plan-3','PLAN-20260731-003','2026-07-31','prd-3','line-2',2500,'개','13:00','16:00','NORMAL','DRAFT','PARTIAL',null,'고바야시 하루토','오후 멜론빵 초벌 생산'),
('plan-4','PLAN-20260731-004','2026-07-31','prd-4','line-2',2000,'개','17:00','20:00','LOW','DRAFT','NOT_CHECKED',null,'가토 소타','야간 크림빵 생산 계획 수립 중'),
('plan-5','PLAN-20260731-005','2026-07-31','prd-5','line-3',1800,'개','09:00','14:00','HIGH','CONFIRMED','SHORTAGE',null,'사이토 료','버터 재고 부족 알림 발생'),
('plan-history-1','PLAN-20260730-H01','2026-07-30','prd-1','line-1',4000,'개','08:00','12:00','NORMAL','COMPLETED','READY','user-production','스즈키 다이치','과거 출고·실적 FK 연결용'),
('plan-history-2','PLAN-20260730-H02','2026-07-30','prd-2','line-2',3500,'개','08:00','12:00','NORMAL','COMPLETED','READY','user-production','스즈키 다이치','과거 출고 FK 연결용')
on conflict (id) do update set plan_no=excluded.plan_no,planned_date=excluded.planned_date,product_id=excluded.product_id,production_line_id=excluded.production_line_id,planned_quantity=excluded.planned_quantity,unit=excluded.unit,start_time=excluded.start_time,end_time=excluded.end_time,priority=excluded.priority,plan_status=excluded.plan_status,material_readiness=excluded.material_readiness,manager_user_id=excluded.manager_user_id,manager_name=excluded.manager_name,remarks=excluded.remarks;

insert into public.work_orders (id,work_order_no,production_plan_id,planned_date,product_id,production_line_id,ordered_quantity,unit,start_time,end_time,handler_user_id,handler_name,material_issue_status,work_status,actual_start_time,actual_end_time,current_quantity,remarks) values
('wo-1','WO-20260731-001','plan-1','2026-07-31','prd-1','line-1',4000,'개','08:00','12:00','user-worker','야마모토 렌','ISSUED','IN_PROGRESS','2026-07-31 08:05+09',null,2800,'식빵 1호 라인 현재 소성 완료 진행 중'),
('wo-2','WO-20260731-002','plan-2','2026-07-31','prd-2','line-2',3500,'개','08:00','11:00',null,'와타나베 유이','ISSUED','READY',null,null,0,'자재 출고 완비, 작업 작업준비 완료'),
('wo-3','WO-20260731-005','plan-5','2026-07-31','prd-5','line-3',1800,'개','09:00','14:00',null,'사이토 료','SHORTAGE','WAITING',null,null,0,'버터 자재 출고 대기 중'),
('wo-history-out-1','WO-20260730-01','plan-history-1','2026-07-30','prd-1','line-1',4000,'개','08:00','12:00','user-worker','야마모토 렌','ISSUED','COMPLETED','2026-07-30 08:00+09','2026-07-30 12:00+09',4000,'과거 자재 출고 FK 연결용'),
('wo-history-out-2','WO-20260730-02','plan-history-2','2026-07-30','prd-2','line-2',3500,'개','08:00','12:00',null,'와타나베 유이','ISSUED','COMPLETED','2026-07-30 08:00+09','2026-07-30 12:00+09',3500,'과거 자재 출고 FK 연결용'),
('wo-history-result-1','WO-20260730-001','plan-history-1','2026-07-30','prd-1','line-1',4000,'개','08:00','12:00','user-worker','야마모토 렌','ISSUED','COMPLETED','2026-07-30 08:00+09','2026-07-30 12:00+09',4000,'과거 생산실적·검사 FK 연결용')
on conflict (id) do update set work_order_no=excluded.work_order_no,production_plan_id=excluded.production_plan_id,planned_date=excluded.planned_date,product_id=excluded.product_id,production_line_id=excluded.production_line_id,ordered_quantity=excluded.ordered_quantity,unit=excluded.unit,start_time=excluded.start_time,end_time=excluded.end_time,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,material_issue_status=excluded.material_issue_status,work_status=excluded.work_status,actual_start_time=excluded.actual_start_time,actual_end_time=excluded.actual_end_time,current_quantity=excluded.current_quantity,remarks=excluded.remarks;

-- 8. 자재 출고·수불 이력
insert into public.material_outbounds (id,outbound_no,outbound_date,material_id,inventory_lot_id,quantity,unit,production_line_id,work_order_id,handler_user_id,handler_name,outbound_status,remarks) values
('out-1','OUT-20260730-001','2026-07-30','mat-1','inv-1',200,'kg','line-1','wo-history-out-1','user-worker','야마모토 렌','COMPLETED','식빵 생산용 투입'),
('out-2','OUT-20260730-002','2026-07-30','mat-4','inv-6',15,'판','line-2','wo-history-out-2',null,'와타나베 유이','COMPLETED','단팥빵 생산 FEFO 차감 투입'),
('out-3','OUT-20260730-003','2026-07-30','mat-5','inv-5',50,'kg','line-2','wo-history-out-2',null,'야마구치 타쿠미','COMPLETED','단팥빵 소 투입')
on conflict (id) do update set outbound_no=excluded.outbound_no,outbound_date=excluded.outbound_date,material_id=excluded.material_id,inventory_lot_id=excluded.inventory_lot_id,quantity=excluded.quantity,unit=excluded.unit,production_line_id=excluded.production_line_id,work_order_id=excluded.work_order_id,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,outbound_status=excluded.outbound_status,remarks=excluded.remarks;

insert into public.material_transactions (id,occurred_at,transaction_no,transaction_type,material_id,inventory_lot_id,inbound_quantity,outbound_quantity,balance_after,handler_user_id,handler_name,remarks) values
('txn-1','2026-07-30 09:10+09','TXN-20260730-001','INBOUND','mat-1','inv-1',1000,0,1200,'user-worker','야마모토 렌','입고 등록 (IN-20260730-001)'),
('txn-2','2026-07-30 09:30+09','TXN-20260730-002','INBOUND','mat-2','inv-2',500,0,500,null,'와타나베 유이','입고 등록 (IN-20260730-002)'),
('txn-3','2026-07-30 10:15+09','TXN-20260730-003','INBOUND','mat-3','inv-3',200,0,200,'user-worker','야마모토 렌','입고 등록 (IN-20260730-003)'),
('txn-4','2026-07-30 11:00+09','TXN-20260730-004','INBOUND','mat-4','inv-4',120,0,120,null,'야마구치 타쿠미','입고 등록 (IN-20260730-004)'),
('txn-5','2026-07-30 11:45+09','TXN-20260730-005','INBOUND','mat-5','inv-5',300,0,300,null,'와타나베 유이','입고 등록 (IN-20260730-005)'),
('txn-6','2026-07-30 14:00+09','TXN-20260730-006','OUTBOUND','mat-1','inv-1',0,200,1000,'user-worker','야마모토 렌','생산 출고 (OUT-20260730-001)'),
('txn-7','2026-07-30 15:20+09','TXN-20260730-007','OUTBOUND','mat-4','inv-6',0,15,55,null,'와타나베 유이','생산 출고 (OUT-20260730-002)')
on conflict (id) do update set occurred_at=excluded.occurred_at,transaction_no=excluded.transaction_no,transaction_type=excluded.transaction_type,material_id=excluded.material_id,inventory_lot_id=excluded.inventory_lot_id,inbound_quantity=excluded.inbound_quantity,outbound_quantity=excluded.outbound_quantity,balance_after=excluded.balance_after,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,remarks=excluded.remarks;

-- 9. 생산실적·불량 세부·완제품 LOT
insert into public.production_results (id,result_no,work_order_id,production_date,product_id,production_line_id,ordered_quantity,total_quantity,good_quantity,defect_quantity,rework_quantity,achievement_rate,defect_rate,actual_start_time,actual_end_time,working_hours,handler_user_id,handler_name,result_status,remarks) values
('res-1','RESULT-20260730-001','wo-history-result-1','2026-07-30','prd-1','line-1',4000,4000,3920,50,30,100,1.3,'2026-07-30 08:00+09','2026-07-30 12:00+09','4시간 00분','user-worker','야마모토 렌','CONFIRMED','어제 식빵 생산 실적 확정 완료')
on conflict (id) do update set result_no=excluded.result_no,work_order_id=excluded.work_order_id,production_date=excluded.production_date,product_id=excluded.product_id,production_line_id=excluded.production_line_id,ordered_quantity=excluded.ordered_quantity,total_quantity=excluded.total_quantity,good_quantity=excluded.good_quantity,defect_quantity=excluded.defect_quantity,rework_quantity=excluded.rework_quantity,achievement_rate=excluded.achievement_rate,defect_rate=excluded.defect_rate,actual_start_time=excluded.actual_start_time,actual_end_time=excluded.actual_end_time,working_hours=excluded.working_hours,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,result_status=excluded.result_status,remarks=excluded.remarks;

insert into public.production_result_defects (id,production_result_id,defect_type,quantity) values
('00000000-0000-4000-8000-000000000001','res-1','DOUGH_DEFECT',30),
('00000000-0000-4000-8000-000000000002','res-1','BAKING_DEFECT',20)
on conflict (production_result_id, defect_type) do update set quantity=excluded.quantity;

insert into public.finished_goods_lots (id,fg_lot_no,production_result_id,work_order_id,production_date,product_id,production_line_id,total_quantity,good_quantity,unit,expiration_date,quality_status,is_release_available) values
('fg-1','FG-PRD001-20260730-001','res-1','wo-history-result-1','2026-07-30','prd-1','line-1',4000,3920,'개','2026-08-04','PASSED',true)
on conflict (id) do update set fg_lot_no=excluded.fg_lot_no,production_result_id=excluded.production_result_id,work_order_id=excluded.work_order_id,production_date=excluded.production_date,product_id=excluded.product_id,production_line_id=excluded.production_line_id,total_quantity=excluded.total_quantity,good_quantity=excluded.good_quantity,unit=excluded.unit,expiration_date=excluded.expiration_date,quality_status=excluded.quality_status,is_release_available=excluded.is_release_available;

-- 10. 품질검사 요청
insert into public.inspection_requests (id,request_no,request_time,category,target_no,target_name,lot_no,line_or_supplier,requester_user_id,requester_name,inspector_user_id,inspector_name,priority,status,notes) values
('q-1','REQ-20260731-001','2026-07-31 08:30+09','INCOMING','IN-20260730-001','강력분','LOT-FLOUR-260730-A','사쿠라 제분','user-material','다나카 유키','user-quality','다카하시 미사키','HIGH','ASSIGNED','식빵 생산 투입 대기 자재 수입검사 요청'),
('q-2','REQ-20260731-002','2026-07-31 09:15+09','PROCESS','WO-20260731-001','식빵','LOT-FLOUR-260730-A','1호 라인','user-worker','야마모토 렌','user-multi','이토 아오이','URGENT','IN_PROGRESS','식빵 소성 공정 중 오븐 온도 및 중심 온도 샘플링 검사'),
('q-3','REQ-20260731-003','2026-07-31 10:00+09','FINISHED_GOODS','FG-PRD001-20260730-001','식빵','FG-PRD001-20260730-001','1호 라인','user-production','스즈키 다이치','user-quality','다카하시 미사키','NORMAL','COMPLETED','식빵 완제품 출하 전 품질 적합성 최종 검사')
on conflict (id) do update set request_no=excluded.request_no,request_time=excluded.request_time,category=excluded.category,target_no=excluded.target_no,target_name=excluded.target_name,lot_no=excluded.lot_no,line_or_supplier=excluded.line_or_supplier,requester_user_id=excluded.requester_user_id,requester_name=excluded.requester_name,inspector_user_id=excluded.inspector_user_id,inspector_name=excluded.inspector_name,priority=excluded.priority,status=excluded.status,notes=excluded.notes;

-- Mock에는 검사 결과와 대기열 간 직접 ID가 없어 request_id는 NULL로 유지한다.
insert into public.incoming_inspections (id,iqc_no,request_id,inbound_id,inspector_user_id,inspector_name,inspection_date,status,judgment,judgment_reason) values
('iqc-1','IQC-20260730-001',null,'inb-1','user-quality','다카하시 미사키','2026-07-30 09:30+09','COMPLETED','PASSED','외관, 포장, 수분(13.2%) 전 항목 적합 기준 충족'),
('iqc-2','IQC-20260715-001',null,'inb-7','user-multi','이토 아오이','2026-07-15 11:00+09','COMPLETED','HOLD','입고 온도 12.5℃로 기준(10.0℃ 이하) 이탈 및 포장 박스 일부 누유 발견')
on conflict (id) do update set iqc_no=excluded.iqc_no,request_id=excluded.request_id,inbound_id=excluded.inbound_id,inspector_user_id=excluded.inspector_user_id,inspector_name=excluded.inspector_name,inspection_date=excluded.inspection_date,status=excluded.status,judgment=excluded.judgment,judgment_reason=excluded.judgment_reason;

insert into public.process_inspections (id,pqc_no,request_id,work_order_id,production_date,process,inspection_timing,worker_user_id,worker_name,inspector_user_id,inspector_name,inspection_date,status,judgment,judgment_reason) values
('pqc-1','PQC-20260730-001',null,'wo-history-result-1','2026-07-30','BAKING','소성 중반 (오븐 3번 구간)','user-worker','야마모토 렌','user-multi','이토 아오이','2026-07-30 10:15+09','COMPLETED','PASSED','오븐 온도 212℃, 중심 온도 96.5℃로 소성 적정 기준 만족')
on conflict (id) do update set pqc_no=excluded.pqc_no,request_id=excluded.request_id,work_order_id=excluded.work_order_id,production_date=excluded.production_date,process=excluded.process,inspection_timing=excluded.inspection_timing,worker_user_id=excluded.worker_user_id,worker_name=excluded.worker_name,inspector_user_id=excluded.inspector_user_id,inspector_name=excluded.inspector_name,inspection_date=excluded.inspection_date,status=excluded.status,judgment=excluded.judgment,judgment_reason=excluded.judgment_reason;

insert into public.finished_goods_inspections (id,fqc_no,request_id,finished_goods_lot_id,sample_quantity,defective_sample_quantity,avg_weight,min_weight,max_weight,inspector_user_id,inspector_name,inspection_date,status,judgment,judgment_reason,is_release_available,recheck_required) values
('fqc-1','FQC-20260730-001',null,'fg-1',20,0,452,445,460,'user-quality','다카하시 미사키','2026-07-30 14:00+09','COMPLETED','PASSED','평균 중량 452g (기준 450±15g) 적합 및 관능검사 항목 전체 적합',true,false)
on conflict (id) do update set fqc_no=excluded.fqc_no,request_id=excluded.request_id,finished_goods_lot_id=excluded.finished_goods_lot_id,sample_quantity=excluded.sample_quantity,defective_sample_quantity=excluded.defective_sample_quantity,avg_weight=excluded.avg_weight,min_weight=excluded.min_weight,max_weight=excluded.max_weight,inspector_user_id=excluded.inspector_user_id,inspector_name=excluded.inspector_name,inspection_date=excluded.inspection_date,status=excluded.status,judgment=excluded.judgment,judgment_reason=excluded.judgment_reason,is_release_available=excluded.is_release_available,recheck_required=excluded.recheck_required;

-- 11. 검사 결과 항목
insert into public.inspection_item_results (id,inspection_category,incoming_inspection_id,process_inspection_id,finished_goods_inspection_id,item_name,standard_value,measured_value,unit,is_mandatory,result,notes) values
('10000000-0000-4000-8000-000000000001','INCOMING','iqc-1',null,null,'외관','이상 없음','이상 없음',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000002','INCOMING','iqc-1',null,null,'포장 상태','파손/오염 없음','양호',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000003','INCOMING','iqc-1',null,null,'수분 함량','15.0% 이하','13.2%','%',true,'PASS',null),
('10000000-0000-4000-8000-000000000004','INCOMING','iqc-1',null,null,'이물 여부','이물 없음','불검출',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000005','INCOMING','iqc-2',null,null,'입고 온도','10.0℃ 이하','12.5℃','℃',true,'FAIL',null),
('10000000-0000-4000-8000-000000000006','INCOMING','iqc-2',null,null,'외관','변색/이상 없음','양호',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000007','INCOMING','iqc-2',null,null,'포장 상태','파손 및 누유 없음','박스 찌그러짐 및 누유',null,true,'FAIL',null),
('10000000-0000-4000-8000-000000000008','PROCESS',null,'pqc-1',null,'오븐 온도','210.0℃ ±5.0℃','212.0℃','℃',true,'PASS',null),
('10000000-0000-4000-8000-000000000009','PROCESS',null,'pqc-1',null,'소성 시간','25분 ±2분','25분','분',true,'PASS',null),
('10000000-0000-4000-8000-000000000010','PROCESS',null,'pqc-1',null,'중심 온도','95.0℃ 이상','96.5℃','℃',true,'PASS',null),
('10000000-0000-4000-8000-000000000011','PROCESS',null,'pqc-1',null,'굽기 색상','황금갈색 적정','양호',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000012','FINISHED_GOODS',null,null,'fqc-1','외관 및 굽기 색상','균일한 황금갈색','양호',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000013','FINISHED_GOODS',null,null,'fqc-1','평균 중량','435g ~ 465g','452g','g',true,'PASS',null),
('10000000-0000-4000-8000-000000000014','FINISHED_GOODS',null,null,'fqc-1','식감 및 풍미','부드럽고 쫄깃함','우수',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000015','FINISHED_GOODS',null,null,'fqc-1','이물 혼입 여부','이물 없음','불검출',null,true,'PASS',null),
('10000000-0000-4000-8000-000000000016','FINISHED_GOODS',null,null,'fqc-1','포장 및 씰링','완전 밀봉','적합',null,true,'PASS',null)
on conflict (id) do update set item_name=excluded.item_name,standard_value=excluded.standard_value,measured_value=excluded.measured_value,unit=excluded.unit,is_mandatory=excluded.is_mandatory,result=excluded.result,notes=excluded.notes;

insert into public.inspection_status_history (id,inspection_category,incoming_inspection_id,process_inspection_id,finished_goods_inspection_id,changed_at,previous_status,new_status,changed_by_user_id,changed_by_name,reason) values
('h-1','INCOMING','iqc-1',null,null,'2026-07-30 09:00+09','REQUESTED','IN_PROGRESS','user-quality','다카하시 미사키',null),
('h-2','INCOMING','iqc-1',null,null,'2026-07-30 09:30+09','IN_PROGRESS','COMPLETED','user-quality','다카하시 미사키','합격 판정 승인'),
('h-3','INCOMING','iqc-2',null,null,'2026-07-15 10:30+09','REQUESTED','IN_PROGRESS','user-multi','이토 아오이',null),
('h-4','INCOMING','iqc-2',null,null,'2026-07-15 11:00+09','IN_PROGRESS','COMPLETED','user-multi','이토 아오이','온도 이탈로 보류(HOLD) 판정'),
('hp-1','PROCESS',null,'pqc-1',null,'2026-07-30 10:00+09','REQUESTED','IN_PROGRESS','user-multi','이토 아오이',null),
('hp-2','PROCESS',null,'pqc-1',null,'2026-07-30 10:15+09','IN_PROGRESS','COMPLETED','user-multi','이토 아오이','소성 공정 합격 승인'),
('hf-1','FINISHED_GOODS',null,null,'fqc-1','2026-07-30 13:30+09','REQUESTED','IN_PROGRESS','user-quality','다카하시 미사키',null),
('hf-2','FINISHED_GOODS',null,null,'fqc-1','2026-07-30 14:00+09','IN_PROGRESS','COMPLETED','user-quality','다카하시 미사키','완제품 최종 합격')
on conflict (id) do update set changed_at=excluded.changed_at,previous_status=excluded.previous_status,new_status=excluded.new_status,changed_by_user_id=excluded.changed_by_user_id,changed_by_name=excluded.changed_by_name,reason=excluded.reason;

-- 12. 검사 기준 (Mock 14개 기준과 61개 항목)
insert into public.inspection_standards (category,target_code,target_name,status) values
('INCOMING','MAT-001','강력분','ACTIVE'),('INCOMING','MAT-002','설탕','ACTIVE'),('INCOMING','MAT-003','버터','ACTIVE'),('INCOMING','MAT-004','계란','ACTIVE'),('INCOMING','MAT-005','팥앙금','ACTIVE'),
('PROCESS','MIXING','배합 공정','ACTIVE'),('PROCESS','DOUGH','반죽 공정','ACTIVE'),('PROCESS','FERMENTATION','발효 공정','ACTIVE'),('PROCESS','DIVIDING','분할 공정','ACTIVE'),('PROCESS','SHAPING','성형 공정','ACTIVE'),('PROCESS','BAKING','소성 공정','ACTIVE'),('PROCESS','COOLING','냉각 공정','ACTIVE'),('PROCESS','PACKAGING','포장 공정','ACTIVE'),
('FINISHED_GOODS','ALL','전체 완제품','ACTIVE')
on conflict (category,target_code) do update set target_name=excluded.target_name,status=excluded.status;

insert into public.inspection_standard_items (inspection_standard_id,item_name,standard_value,is_mandatory,unit,display_order)
select s.id,v.item_name,v.standard_value,true,v.unit,v.display_order
from (values
('INCOMING','MAT-001','외관','이상 없음 (백색 미분)',null,1),('INCOMING','MAT-001','포장 상태','파손/오염 없음',null,2),('INCOMING','MAT-001','수분 함량','15.0% 이하','%',3),('INCOMING','MAT-001','이물 여부','이물/곤충 없음',null,4),('INCOMING','MAT-001','유통기한','잔여 6개월 이상',null,5),
('INCOMING','MAT-002','외관','백색 결정 상태',null,1),('INCOMING','MAT-002','포장 상태','밀봉 훼손 파손 없음',null,2),('INCOMING','MAT-002','수분 함량','0.1% 이하','%',3),('INCOMING','MAT-002','이물 여부','이물 없음',null,4),('INCOMING','MAT-002','유통기한','잔여 1년 이상',null,5),
('INCOMING','MAT-003','입고 온도','10.0℃ 이하','℃',1),('INCOMING','MAT-003','외관','변색/이상 없음',null,2),('INCOMING','MAT-003','냄새','이취 없음',null,3),('INCOMING','MAT-003','포장 상태','파손 및 누유 없음',null,4),('INCOMING','MAT-003','유통기한','잔여 3개월 이상',null,5),
('INCOMING','MAT-004','입고 온도','10.0℃ 이하','℃',1),('INCOMING','MAT-004','외관','난각 파손/오염 없음',null,2),('INCOMING','MAT-004','냄새','부패취/이취 없음',null,3),('INCOMING','MAT-004','유통기한','기준 충족 (20일 이상)',null,4),
('INCOMING','MAT-005','입고 온도','10.0℃ 이하','℃',1),('INCOMING','MAT-005','외관','이상 없음',null,2),('INCOMING','MAT-005','포장 상태','밀봉 팩 파손 없음',null,3),('INCOMING','MAT-005','이물 여부','이물 없음',null,4),('INCOMING','MAT-005','유통기한','잔여 4개월 이상',null,5),
('PROCESS','MIXING','원재료 투입 순서','작업표준 준수',null,1),('PROCESS','MIXING','배합 비율','레시피 대비 ±0.5%',null,2),('PROCESS','MIXING','배합 시간','15분 ±2분','분',3),('PROCESS','MIXING','작업장 청결','이상 없음',null,4),
('PROCESS','DOUGH','반죽 온도','26.0℃ ±1.0℃','℃',1),('PROCESS','DOUGH','반죽 상태','글루텐 형성 적정',null,2),('PROCESS','DOUGH','탄력성','양호',null,3),
('PROCESS','FERMENTATION','발효 실온','38.0℃ ±2.0℃','℃',1),('PROCESS','FERMENTATION','발효 습도','85% ±5%','%',2),('PROCESS','FERMENTATION','발효 시간','50분 ±5분','분',3),('PROCESS','FERMENTATION','발효 상태','2.5배 팽창 적정',null,4),
('PROCESS','DIVIDING','분할 중량','기준 중량 오차 범위 내','g',1),('PROCESS','DIVIDING','중량 편차','±2.0g 이내','g',2),('PROCESS','DIVIDING','형태 균일성','균일',null,3),
('PROCESS','SHAPING','제품 형태','정형 모양 준수',null,1),('PROCESS','SHAPING','크기 규격','표준 틀 적합',null,2),('PROCESS','SHAPING','표면 상태','상처/매끄러움 양호',null,3),
('PROCESS','BAKING','오븐 온도','210.0℃ ±5.0℃','℃',1),('PROCESS','BAKING','소성 시간','25분 ±2분','분',2),('PROCESS','BAKING','굽기 색상','황금갈색 적정',null,3),('PROCESS','BAKING','중심 온도','95.0℃ 이상','℃',4),
('PROCESS','COOLING','냉각 시간','40분 이상','분',1),('PROCESS','COOLING','제품 중심 온도','28.0℃ 이하','℃',2),('PROCESS','COOLING','결로 발생 여부','결로 없음',null,3),
('PROCESS','PACKAGING','포장 재질 상태','파손/구김 없음',null,1),('PROCESS','PACKAGING','라벨 표시','선명 및 정확',null,2),('PROCESS','PACKAGING','유통기한 인쇄','누락 없음',null,3),('PROCESS','PACKAGING','밀봉 상태','완전 씰링',null,4),
('FINISHED_GOODS','ALL','외관 및 굽기 색상','균일한 황금갈색',null,1),('FINISHED_GOODS','ALL','제품 형태 및 부피','변형 없음',null,2),('FINISHED_GOODS','ALL','평균 중량','허용 오차범위 내','g',3),('FINISHED_GOODS','ALL','풍미 및 향','고유 고소한 풍미',null,4),('FINISHED_GOODS','ALL','식감','부드럽고 쫄깃함',null,5),('FINISHED_GOODS','ALL','이물 혼입 여부','이물 일체 없음',null,6),('FINISHED_GOODS','ALL','포장 및 씰링','완전 밀봉',null,7),('FINISHED_GOODS','ALL','제품명 및 유통기한 인쇄','선명/정확',null,8),('FINISHED_GOODS','ALL','LOT 및 알레르기 표시','표준 표기 준수',null,9)
) as v(category,target_code,item_name,standard_value,unit,display_order)
join public.inspection_standards s on s.category=v.category and s.target_code=v.target_code
on conflict (inspection_standard_id,item_name) do update set standard_value=excluded.standard_value,is_mandatory=excluded.is_mandatory,unit=excluded.unit,display_order=excluded.display_order;

-- 13. 불량·부적합·시정조치
insert into public.defect_histories (id,defect_no,finished_goods_lot_id,product_id,production_date,inspection_date,inspector_user_id,inspector_name,defect_type,defect_quantity,defect_rate,cause,corrective_action,status,assignee_user_id,assignee_name,created_at,updated_at) values
('def-1','DEF-20260731-001','fg-1','prd-1','2026-07-30','2026-07-31 00:00+09','user-quality','다카하시 미사키','OTHER',30,0.75,'반죽 공정 불량','반죽 공정 조건 확인 및 불량품 선별','CAUSE_ANALYZED','user-production','스즈키 다이치','2026-07-31 09:20+09','2026-07-31 11:10+09'),
('def-2','DEF-20260731-002','fg-1','prd-1','2026-07-30','2026-07-31 00:00+09','user-quality','다카하시 미사키','APPEARANCE',20,0.5,'소성 공정 불량','소성 온도 조건 확인 및 외관 불량품 선별','REWORK','user-production','스즈키 다이치','2026-07-31 10:05+09','2026-07-31 10:50+09')
on conflict (id) do update set defect_no=excluded.defect_no,finished_goods_lot_id=excluded.finished_goods_lot_id,product_id=excluded.product_id,production_date=excluded.production_date,inspection_date=excluded.inspection_date,inspector_user_id=excluded.inspector_user_id,inspector_name=excluded.inspector_name,defect_type=excluded.defect_type,defect_quantity=excluded.defect_quantity,defect_rate=excluded.defect_rate,cause=excluded.cause,corrective_action=excluded.corrective_action,status=excluded.status,assignee_user_id=excluded.assignee_user_id,assignee_name=excluded.assignee_name;

insert into public.nonconformities (id,nc_no,occurred_date,category,inspection_no,target_no,target_name,lot_no,nc_type,defect_quantity,unit,severity,nc_status,handler_user_id,handler_name,due_date,details,interim_action) values
('nc-1','NC-20260715-001','2026-07-15','INCOMING','IQC-20260715-001','IN-20260715-001','버터','LOT-BUTTER-260715-H','TEMPERATURE_DEVIATION',50,'kg','MAJOR','ACTION_IN_PROGRESS','user-material','다나카 유키','2026-08-05','버터 입고 수송차량 냉장 온도 12.5℃로 기준(10.0℃ 이하) 초과 및 일부 박스 누유 발생','냉장창고 C-01 사용보류 구역 격리 조치 및 거래처 온도 기록지 제출 요구')
on conflict (id) do update set nc_no=excluded.nc_no,occurred_date=excluded.occurred_date,category=excluded.category,inspection_no=excluded.inspection_no,target_no=excluded.target_no,target_name=excluded.target_name,lot_no=excluded.lot_no,nc_type=excluded.nc_type,defect_quantity=excluded.defect_quantity,unit=excluded.unit,severity=excluded.severity,nc_status=excluded.nc_status,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,due_date=excluded.due_date,details=excluded.details,interim_action=excluded.interim_action;

insert into public.corrective_actions (id,ca_no,nonconformity_id,request_date,target_department,handler_user_id,handler_name,problem_summary,interim_action,direct_cause,root_cause,analysis_method,action_plan,preventive_measure,ca_status,start_date,due_date,verification_status) values
('ca-1','CA-20260716-001','nc-1','2026-07-16','MATERIALS','user-material','다나카 유키','버터 입고 차량 냉장 온도 12.5℃ 이탈 문제 발생','해당 버터 50kg 전량 사용 보류 격리 보관','공급업체 운송차량 냉장콤프레샤 온도 제어 센서 일시적 작동 오류','공급업체 차량 출고 전 타코메타 온도 기록지 점검 및 센서 교정 절차 미흡','FIVE_WHY','1) 입고 시 타코메타 온도 기록지 확인 의무화 2) 이탈 시 입고 거부 및 즉시 회차','원재료 수송차량 온도 모니터링 가이드라인 입고 검수 기준에 반영','IN_PROGRESS','2026-07-18','2026-08-10','NOT_VERIFIED')
on conflict (id) do update set ca_no=excluded.ca_no,nonconformity_id=excluded.nonconformity_id,request_date=excluded.request_date,target_department=excluded.target_department,handler_user_id=excluded.handler_user_id,handler_name=excluded.handler_name,problem_summary=excluded.problem_summary,interim_action=excluded.interim_action,direct_cause=excluded.direct_cause,root_cause=excluded.root_cause,analysis_method=excluded.analysis_method,action_plan=excluded.action_plan,preventive_measure=excluded.preventive_measure,ca_status=excluded.ca_status,start_date=excluded.start_date,due_date=excluded.due_date,verification_status=excluded.verification_status;

-- 14. 출하 (Mock 고객사는 공급업체 기준정보에 없으므로 customer_supplier_id는 NULL)
insert into public.shipments (id,shipment_number,finished_goods_lot_id,quantity,customer_supplier_id,customer_name,planned_date,shipped_date,status,manager_user_id,manager_name,memo,created_at,updated_at) values
('shipment-1','SHP-20260731-001','fg-1',800,null,'도쿄 베이커리 유통','2026-07-31','2026-07-31','COMPLETED',null,'오가와 하루','오전 정기 출하','2026-07-31 08:40+09','2026-07-31 11:30+09'),
('shipment-2','SHP-20260731-002','fg-1',500,null,'요코하마 푸드서비스','2026-07-31',null,'READY','user-production','스즈키 다이치','오후 차량 배차 완료','2026-07-31 09:10+09','2026-07-31 10:00+09')
on conflict (id) do update set shipment_number=excluded.shipment_number,finished_goods_lot_id=excluded.finished_goods_lot_id,quantity=excluded.quantity,customer_supplier_id=excluded.customer_supplier_id,customer_name=excluded.customer_name,planned_date=excluded.planned_date,shipped_date=excluded.shipped_date,status=excluded.status,manager_user_id=excluded.manager_user_id,manager_name=excluded.manager_name,memo=excluded.memo;

-- 15. LOT 추적 이력·감사로그
insert into public.trace_history (id,trace_timestamp,direction,search_query,start_no,result_count,related_raw_lot_count,related_fg_lot_count,has_quality_anomaly,user_id,user_name) values
('th-1','2026-07-31 09:10+09','FORWARD','LOT-FLOUR-260730-A','LOT-FLOUR-260730-A',2,1,2,false,'user-admin','이임원'),
('th-2','2026-07-31 08:45+09','BACKWARD','FG-PRD001-20260730-001','FG-PRD001-20260730-001',4,4,1,false,null,'나카무라 쇼타'),
('th-3','2026-07-15 11:30+09','FORWARD','LOT-BUTTER-260715-H','LOT-BUTTER-260715-H',1,1,0,true,'user-quality','다카하시 미사키')
on conflict (id) do update set trace_timestamp=excluded.trace_timestamp,direction=excluded.direction,search_query=excluded.search_query,start_no=excluded.start_no,result_count=excluded.result_count,related_raw_lot_count=excluded.related_raw_lot_count,related_fg_lot_count=excluded.related_fg_lot_count,has_quality_anomaly=excluded.has_quality_anomaly,user_id=excluded.user_id,user_name=excluded.user_name;

insert into public.audit_logs (id,occurred_at,actor_user_id,actor_name,action,target_type,target_id,description,before_data,after_data) values
('audit-shipment-initial','2026-07-31 11:30+09','user-production','스즈키 다이치','SHIPMENT_COMPLETED','SHIPMENT','shipment-1','SHP-20260731-001 출하를 완료하고 LOT 재고 800개를 차감했습니다.',null,null),
('audit-initial','2026-07-31 09:00+09','user-admin','이임원','RBAC_INITIALIZED','SESSION','rbac','데모 RBAC 초기 구성을 불러왔습니다.',null,null)
on conflict (id) do update set occurred_at=excluded.occurred_at,actor_user_id=excluded.actor_user_id,actor_name=excluded.actor_name,action=excluded.action,target_type=excluded.target_type,target_id=excluded.target_id,description=excluded.description,before_data=excluded.before_data,after_data=excluded.after_data;

commit;
