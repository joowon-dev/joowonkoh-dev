-- 어드민 「앱」 1단계 — 앱 등록부 + 실시간(GA4 최근 30분, AdMob 오늘치).
--
-- 설계 문서: docs/superpowers/specs/2026-10-26-admin-app-hub-design.md
--
-- 쓰기는 전부 collect-metrics(service_role)가 한다. authenticated 에게는 관리자만 SELECT.

-- 앱 등록부 ------------------------------------------------------------------

create table if not exists public.apps (
  slug             text primary key,
  name             text not null,
  kind             text not null default 'app' check (kind in ('app', 'web')),
  sort             int  not null default 0,
  ios_bundle_id    text,
  android_package  text,
  app_store_id     bigint,      -- apps.apple.com/app/id<이것>
  play_listed      boolean not null default false,
  admob_app_ids    text[] not null default '{}',
  firebase_project text,
  ga4_property_id  text,        -- ga4_discover 가 채운다. 웹은 처음부터 안다.
  created_at       timestamptz not null default now()
);

alter table public.apps enable row level security;

create policy "apps: 관리자만 조회"
  on public.apps
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

-- 2026-10-26 각 앱 저장소의 app.json / GoogleService-Info.plist / google-services.json 에서 읽었다.
insert into public.apps
  (slug, name, kind, sort, ios_bundle_id, android_package, app_store_id, play_listed, admob_app_ids, firebase_project, ga4_property_id)
values
  ('joowonkoh-com', 'joowonkoh.com', 'web', 0, null, null, null, false, '{}', null, '434494008'),
  ('moneytick', '이게내연봉', 'app', 1, 'dev.joowon.moneytick', 'dev.joowon.moneytick', 6795989020, true,
   '{ca-app-pub-7807290470382730~9813704971,ca-app-pub-7807290470382730~2022401327}', 'moneytick-e7343', null),
  ('yourmealmymeal', '네밥내밥', 'app', 2, 'com.joowonkoh.yourmealmymeal', 'com.joowonkoh.yourmealmymeal', 6812959704, true,
   '{ca-app-pub-7807290470382730~3040565990,ca-app-pub-7807290470382730~4885054143}', 'yourmealmymeal-ab448', null),
  ('jigumia', '지구미아', 'app', 3, 'com.jigumia.app', 'com.jigumia.app', 6772139871, true,
   '{ca-app-pub-7807290470382730~3274994627,ca-app-pub-7807290470382730~7470525971}', 'jigumia-697f0', null),
  ('chibiaku', '치비아쿠', 'app', 4, 'com.chibiaku.app', 'com.chibiaku.app', 6815060726, true,
   '{ca-app-pub-7807290470382730~6480841886,ca-app-pub-7807290470382730~1968997211}', 'chibiaku', null),
  ('wapanyang', '와파냥', 'app', 5, 'dev.joowon.wapanyang', 'dev.joowon.wapanyang', 6820956430, false,
   '{ca-app-pub-7807290470382730~2681498993,ca-app-pub-7807290470382730~3648853897}', 'wapanyang', null)
on conflict (slug) do nothing;

-- 실시간 합계 ----------------------------------------------------------------
-- at 은 분 단위. 오늘 분별 추이를 그리고, 30일 지나면 지운다(아래 cron).

create table if not exists public.live_metrics (
  source     text        not null check (source in ('ga4', 'admob')),
  at         timestamptz not null,
  entity     text        not null,
  metric_key text        not null,
  value      numeric     not null,
  primary key (source, at, entity, metric_key)
);

create index if not exists live_metrics_at_idx on public.live_metrics (at desc);

alter table public.live_metrics enable row level security;

create policy "live_metrics: 관리자만 조회"
  on public.live_metrics
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

-- 엔티티마다 최신 한 장(30분 분별 곡선, 상위 화면·국가) ----------------------

create table if not exists public.live_detail (
  source  text        not null check (source in ('ga4')),
  entity  text        not null,
  at      timestamptz not null,
  payload jsonb       not null,
  primary key (source, entity)
);

alter table public.live_detail enable row level security;

create policy "live_detail: 관리자만 조회"
  on public.live_detail
  for select
  to authenticated
  using (exists (select 1 from public.admin_users a where a.email = (select auth.jwt() ->> 'email')));

grant select on public.apps         to authenticated;
grant select on public.live_metrics to authenticated;
grant select on public.live_detail  to authenticated;

-- 수집 상태에 실시간 소스 셋 ----------------------------------------------------

alter table public.collection_runs drop constraint if exists collection_runs_source_check;
alter table public.collection_runs add constraint collection_runs_source_check
  check (source in ('ga4', 'admob', 'instagram', 'ga4_live', 'admob_today', 'ga4_discover'));

-- cron ------------------------------------------------------------------------

-- GA4 Realtime: 1분마다. 속성 6개 × 요청 4개 = 시간당 1,440회 — 속성당 시간 쿼터에 한참 못 미친다.
select cron.schedule(
  'collect-metrics-ga4-live',
  '* * * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=ga4_live',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- AdMob 오늘치: 10분마다. AdMob 이 몇 시간 늦게 채우므로 더 자주 불러도 숫자가 안 바뀐다.
select cron.schedule(
  'collect-metrics-admob-today',
  '*/10 * * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=admob_today',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);

-- GA4 속성 찾기: 매일 02:20 KST. 권한을 새로 준 날은 손으로 한 번 부르면 된다.
select cron.schedule(
  'collect-metrics-ga4-discover',
  '20 17 * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=ga4_discover',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- 30일 지난 실시간 합계는 지운다. 일별 숫자는 metrics_daily 에 따로 있다.
select cron.schedule(
  'live-metrics-prune',
  '40 17 * * *',
  $$ delete from public.live_metrics where at < now() - interval '30 days' $$
);
