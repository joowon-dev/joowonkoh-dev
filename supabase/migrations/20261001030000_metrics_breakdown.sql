-- 어드민 v2 — 세부 지표(페이지별, 유입경로별, 광고단위별, 게시물별 ...).
--
-- 설계: docs/superpowers/specs/2026-10-01-admin-v2-design.md
--
-- metrics_daily 는 "소스 합계" 로 남기고, 차원별로 쪼갠 값은 여기에 쌓는다.
-- 합산 가능한 지표만 저장한다. 비율(참여율, eCPM, CTR)은 분자·분모를 저장하고 화면에서 낸다.

create table if not exists public.metrics_breakdown (
  source      text        not null check (source in ('ga4', 'admob', 'instagram')),
  metric_date date        not null,
  dimension   text        not null,
  dim_value   text        not null,
  dim_label   text,
  metric_key  text        not null,
  value       numeric     not null,
  updated_at  timestamptz not null default now(),
  primary key (source, metric_date, dimension, dim_value, metric_key)
);

-- 화면은 항상 "이 소스의 이 차원을 기간으로" 묻는다.
create index if not exists metrics_breakdown_lookup_idx
  on public.metrics_breakdown (source, dimension, metric_date);

alter table public.metrics_breakdown enable row level security;

create policy "metrics_breakdown: 관리자만 조회"
  on public.metrics_breakdown
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

revoke all on public.metrics_breakdown from anon;
grant select on public.metrics_breakdown to authenticated;

-- 기간 합계 --------------------------------------------------------------------
-- PostgREST 는 기본 1000행에서 자른다. 페이지 차원 30일이면 넘으므로 합계는 DB 가 낸다.
-- security invoker — 부른 사람의 RLS 로 돈다. 관리자가 아니면 빈 결과다.
-- dim_label 은 기간 안의 마지막 값을 쓴다(페이지 제목이 바뀌었으면 최신 제목).

create or replace function public.admin_breakdown(
  p_source    text,
  p_dimension text,
  p_start     date,
  p_end       date
)
returns table (dim_value text, dim_label text, metric_key text, total numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    b.dim_value,
    (array_agg(b.dim_label order by b.metric_date desc) filter (where b.dim_label is not null))[1],
    b.metric_key,
    sum(b.value)
  from public.metrics_breakdown b
  where b.source = p_source
    and b.dimension = p_dimension
    and b.metric_date between p_start and p_end
  group by b.dim_value, b.metric_key;
$$;

revoke all on function public.admin_breakdown(text, text, date, date) from public, anon;
grant execute on function public.admin_breakdown(text, text, date, date) to authenticated;
