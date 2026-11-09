-- 막대과자 게임 — 도전장을 보낸 사람이 「자기가 만든 도전장 링크로 다시 들어오면」 결과를 본다.
--
-- 친구가 도전장 링크로 한 판을 끝내면 그 판에 도전장 코드(challenge)를 같이 남긴다.
-- 보낸 사람은 도전장 코드로 그 도전장에 붙은 판들(결과 링크 코드 = 두 사람 입력)을 받아 다시 틀어 본다.
-- 결과 링크를 친구가 따로 돌려보내지 않아도 된다.

alter table public.pepero_matches
  add column if not exists challenge text check (challenge is null or char_length(challenge) between 10 and 300);

create index if not exists pepero_matches_challenge_idx
  on public.pepero_matches (challenge, created_at desc)
  where challenge is not null;

-- 기록 함수에 도전장 코드를 받는 인자를 더한다(인자 목록이 바뀌어 옛것은 지운다)
drop function if exists public.pepero_record(text, text, text, numeric, numeric, text, numeric);

create or replace function public.pepero_record(
  p_code text,
  p_left_name text,
  p_right_name text,
  p_left_mm numeric,
  p_right_mm numeric,
  p_outcome text,
  p_rest_mm numeric,
  p_challenge text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  insert into public.pepero_matches (code, left_name, right_name, left_mm, right_mm, outcome, rest_mm, challenge)
  values (
    p_code,
    p_left_name,
    p_right_name,
    round(p_left_mm, 1),
    round(p_right_mm, 1),
    p_outcome,
    case when p_outcome = 'ok' then round(p_rest_mm, 1) end,
    p_challenge
  )
  on conflict (code) do update
    set challenge = coalesce(public.pepero_matches.challenge, excluded.challenge);
  return public.pepero_stats(case when p_outcome = 'ok' then round(p_rest_mm, 1) end);
end;
$$;

-- 도전장 하나에 붙은 판들(최근 것부터 50개). 결과 링크 코드가 있어야 다시 틀 수 있다.
create or replace function public.pepero_challenge(p_challenge text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'code', m.code,
    'name', m.right_name,
    'outcome', m.outcome,
    'left', m.left_mm,
    'right', m.right_mm,
    'at', m.created_at
  ) order by m.created_at desc), '[]'::jsonb)
  from (
    select code, right_name, outcome, left_mm, right_mm, created_at
    from public.pepero_matches
    where challenge = p_challenge
    order by created_at desc
    limit 50
  ) m;
$$;

revoke all on function public.pepero_record(text, text, text, numeric, numeric, text, numeric, text) from public;
revoke all on function public.pepero_challenge(text) from public;
grant execute on function public.pepero_record(text, text, text, numeric, numeric, text, numeric, text) to anon, authenticated;
grant execute on function public.pepero_challenge(text) to anon, authenticated;
