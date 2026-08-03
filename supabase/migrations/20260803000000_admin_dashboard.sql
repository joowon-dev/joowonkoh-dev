-- 통합 어드민 대시보드 기반 스키마
--
-- 설계 문서: docs/superpowers/specs/2026-08-03-admin-dashboard-design.md
--
-- 쓰기는 전부 Edge Function이 service_role로 수행한다. service_role은 RLS를
-- 우회하므로 아래 정책에는 INSERT/UPDATE/DELETE를 열어두지 않는다.
-- authenticated에게 열린 것은 SELECT뿐이고, 그마저 허용목록으로 잠근다.

-- 관리자 허용목록 ---------------------------------------------------------

create table if not exists public.admin_users (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- 자기 행만 볼 수 있다. 앱은 "내가 관리자인가"만 물으면 되므로 이것으로 충분하고,
-- 다른 관리자의 이메일은 노출되지 않는다.
create policy "admin_users: 자기 행만 조회"
  on public.admin_users
  for select
  to authenticated
  using (email = (select auth.jwt() ->> 'email'));

-- 지표 ---------------------------------------------------------------------

create table if not exists public.metrics_daily (
  source      text        not null check (source in ('ga4', 'admob', 'instagram')),
  metric_date date        not null,
  entity      text        not null,
  metric_key  text        not null,
  value       numeric     not null,
  updated_at  timestamptz not null default now(),
  primary key (source, metric_date, entity, metric_key)
);

-- 화면은 항상 "최근 N일"을 훑는다. 날짜가 선행하는 인덱스를 따로 둔다.
create index if not exists metrics_daily_date_idx
  on public.metrics_daily (metric_date desc, source);

alter table public.metrics_daily enable row level security;

create policy "metrics_daily: 관리자만 조회"
  on public.metrics_daily
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

-- 수집 상태 -----------------------------------------------------------------

create table if not exists public.collection_runs (
  source       text primary key check (source in ('ga4', 'admob', 'instagram')),
  last_run_at  timestamptz,
  last_success timestamptz,
  status       text not null default 'ok' check (status in ('ok', 'error')),
  error        text
);

alter table public.collection_runs enable row level security;

create policy "collection_runs: 관리자만 조회"
  on public.collection_runs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

-- 감사 로그 -----------------------------------------------------------------

create table if not exists public.admin_audit_log (
  id         bigint generated always as identity primary key,
  email      text        not null,
  event      text        not null check (event in ('denied', 'signed_in')),
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- 로그인한 사용자는 자기 이름으로만 기록을 남길 수 있다. 거부당한 사용자도
-- 자기 시도를 남길 수 있어야 하므로 허용목록 조건을 걸지 않는다.
create policy "admin_audit_log: 자기 시도만 기록"
  on public.admin_audit_log
  for insert
  to authenticated
  with check (email = (select auth.jwt() ->> 'email'));

-- 읽기는 관리자만.
create policy "admin_audit_log: 관리자만 조회"
  on public.admin_audit_log
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

-- Data API 노출 --------------------------------------------------------------
-- 새로 만든 테이블은 프로젝트 설정에 따라 REST로 자동 노출되지 않을 수 있다.
-- 위 RLS 정책이 행 단위를 막고, 아래 GRANT가 테이블 접근 자체를 연다.
-- anon에게는 아무것도 주지 않는다.

grant select on public.admin_users     to authenticated;
grant select on public.metrics_daily   to authenticated;
grant select on public.collection_runs to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
