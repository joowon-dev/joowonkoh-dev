-- 어드민 「앱」 2단계 — 스토어 공개 정보(한국 스토어).
--
-- 설계 문서: docs/superpowers/specs/2026-10-26-admin-app-hub-design.md (2단계)
--
-- 쓰기는 collect-metrics(service_role)의 store 소스가 1시간마다 한다.

-- 시간별 숫자 ----------------------------------------------------------------
-- rating, rating_count, installs(Play 정확한 설치 수), rank_overall, rank_category.
-- 순위는 차트(App Store 100, Play 200) 안에 있을 때만 행이 있다. 앱 5개 × 24시간이라 지우지 않는다.

create table if not exists public.store_metrics (
  at         timestamptz not null,
  app_slug   text        not null references public.apps (slug) on delete cascade,
  store      text        not null check (store in ('ios', 'android')),
  metric_key text        not null,
  value      numeric     not null,
  primary key (at, app_slug, store, metric_key)
);

create index if not exists store_metrics_app_idx on public.store_metrics (app_slug, store, at desc);

alter table public.store_metrics enable row level security;

create policy "store_metrics: 관리자만 조회"
  on public.store_metrics
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

-- 앱 × 스토어마다 최신 한 장(제목·버전·업데이트·장르) --------------------------

create table if not exists public.store_listing (
  app_slug  text        not null references public.apps (slug) on delete cascade,
  store     text        not null check (store in ('ios', 'android')),
  at        timestamptz not null,
  title     text,
  version   text,
  updated   text,
  genre     text,
  genre_key text,
  primary key (app_slug, store)
);

alter table public.store_listing enable row level security;

create policy "store_listing: 관리자만 조회"
  on public.store_listing
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

-- 리뷰 ------------------------------------------------------------------------
-- 스토어는 최신 수십 개만 주므로 매시간 받아 쌓는다. first_seen_at 은 수집기가 보내지 않아
-- 처음 들어온 시각으로 남는다.

create table if not exists public.store_reviews (
  store         text        not null check (store in ('ios', 'android')),
  review_id     text        not null,
  app_slug      text        not null references public.apps (slug) on delete cascade,
  rating        int         not null,
  title         text,
  body          text        not null,
  author        text,
  version       text,
  reviewed_at   timestamptz not null,
  replied       boolean     not null default false,
  first_seen_at timestamptz not null default now(),
  primary key (store, review_id)
);

create index if not exists store_reviews_recent_idx on public.store_reviews (reviewed_at desc);

alter table public.store_reviews enable row level security;

create policy "store_reviews: 관리자만 조회"
  on public.store_reviews
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

grant select on public.store_metrics to authenticated;
grant select on public.store_listing to authenticated;
grant select on public.store_reviews to authenticated;

alter table public.collection_runs drop constraint if exists collection_runs_source_check;
alter table public.collection_runs add constraint collection_runs_source_check
  check (source in ('ga4', 'admob', 'instagram', 'ga4_live', 'admob_today', 'ga4_discover', 'store'));

-- 매시 7분. 정각은 다른 cron 과 겹친다.
select cron.schedule(
  'collect-metrics-store',
  '7 * * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=store',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);
