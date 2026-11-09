-- 막대과자 게임(/playground/pepero-game) — 친구끼리 겨룬 판을 쌓아 두는 곳.
--
-- 판 하나 = 결과 링크 코드 하나. 받은 사람이 결과를 보는 순간, 보낸 사람이 결과 링크를 여는 순간
-- 둘 다 기록을 시도하지만 코드가 같아서 한 판으로만 남는다. 컴퓨터랑 한 연습 판은 쌓지 않는다.
--
-- 표는 아무도 직접 못 읽고 못 쓴다(RLS 켜고 정책 없음). 브라우저는 아래 두 함수로만 만난다.
--   pepero_record(...) — 한 판 넣고, 곧바로 통계를 돌려준다
--   pepero_stats(rest)  — 통계만(rest 를 주면 그 기록보다 나은 판 수도)
-- 이름은 TOP 5 에 오른 판만 밖으로 나간다.

create table if not exists public.pepero_matches (
  code       text          primary key check (char_length(code) between 10 and 400),
  left_name  text          not null check (char_length(left_name) between 1 and 8),
  right_name text          not null check (char_length(right_name) between 1 and 8),
  left_mm    numeric(4, 1) not null check (left_mm between 0 and 150),
  right_mm   numeric(4, 1) not null check (right_mm between 0 and 150),
  outcome    text          not null check (outcome in ('ok', 'bump', 'bonk')),
  rest_mm    numeric(4, 1) check (rest_mm between 0 and 150),
  created_at timestamptz   not null default now(),
  check ((outcome = 'ok') = (rest_mm is not null))
);

-- 「찰떡 호흡 TOP」·「상위 몇 %」는 끝까지 간(ok) 판의 남은 길이로 줄 세운다
create index if not exists pepero_matches_ok_rest_idx
  on public.pepero_matches (rest_mm, created_at)
  where outcome = 'ok';
create index if not exists pepero_matches_created_idx on public.pepero_matches (created_at);

alter table public.pepero_matches enable row level security;

create or replace function public.pepero_stats(p_rest numeric default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'total', (select count(*) from public.pepero_matches),
    'today', (select count(*) from public.pepero_matches
              where created_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul')),
    'bonk',  (select count(*) from public.pepero_matches where outcome <> 'ok'),
    'ok',    (select count(*) from public.pepero_matches where outcome = 'ok'),
    'better', case when p_rest is null then null
              else (select count(*) from public.pepero_matches where outcome = 'ok' and rest_mm < p_rest) end,
    'top', coalesce((
      select jsonb_agg(jsonb_build_object('l', t.left_name, 'r', t.right_name, 'rest', t.rest_mm) order by t.rest_mm, t.created_at)
      from (
        select left_name, right_name, rest_mm, created_at
        from public.pepero_matches
        where outcome = 'ok'
        order by rest_mm, created_at
        limit 5
      ) t
    ), '[]'::jsonb)
  );
$$;

create or replace function public.pepero_record(
  p_code text,
  p_left_name text,
  p_right_name text,
  p_left_mm numeric,
  p_right_mm numeric,
  p_outcome text,
  p_rest_mm numeric
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  insert into public.pepero_matches (code, left_name, right_name, left_mm, right_mm, outcome, rest_mm)
  values (
    p_code,
    p_left_name,
    p_right_name,
    round(p_left_mm, 1),
    round(p_right_mm, 1),
    p_outcome,
    case when p_outcome = 'ok' then round(p_rest_mm, 1) end
  )
  on conflict (code) do nothing;
  return public.pepero_stats(case when p_outcome = 'ok' then round(p_rest_mm, 1) end);
end;
$$;

revoke all on function public.pepero_stats(numeric) from public;
revoke all on function public.pepero_record(text, text, text, numeric, numeric, text, numeric) from public;
grant execute on function public.pepero_stats(numeric) to anon, authenticated;
grant execute on function public.pepero_record(text, text, text, numeric, numeric, text, numeric) to anon, authenticated;
