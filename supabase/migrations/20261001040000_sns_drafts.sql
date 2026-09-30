-- SNS 승인함 — Claude 가 쓴 댓글·답글 초안을 주원이 어드민에서 승인한다.
--
-- 흐름: Claude(주원 맥의 로컬 스크립트, service_role) 가 초안을 넣는다 → 주원이 /admin/sns 에서
-- 승인·고쳐서 승인·거절 → Claude 가 승인된 것만 브라우저로 게시하고 결과를 적는다.
--
-- 이 사이트에는 SNS 로그인이나 토큰이 없다. 여기서 뚫려도 할 수 있는 건 "승인 처리" 까지다.
--
-- 쓰기 경로는 둘뿐이다.
--   1. service_role(로컬 스크립트) — 초안 넣기, 게시 결과 적기. RLS 를 우회한다.
--   2. sns_decide() — 로그인한 관리자가 대기 중인 초안 하나에 결정을 내린다.
-- authenticated 에게 테이블 쓰기 권한은 주지 않는다. 결정은 함수 안의 검사를 거쳐야만 된다.

-- 초안 -------------------------------------------------------------------------

create table if not exists public.sns_drafts (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  -- 대기가 길어지면 원글 흐름이 지나가 버린다. 오래된 승인이 늦게 처리되지 않게 만료를 둔다.
  expires_at     timestamptz not null default (now() + interval '2 hours'),
  channel        text        not null check (channel in ('threads', 'x', 'instagram')),
  kind           text        not null check (kind in ('my_reply', 'engage_comment', 'quote', 'self_comment')),
  target_url     text        not null check (target_url ~ '^https://'),
  target_author  text,
  target_summary text,
  draft_text     text        not null check (char_length(draft_text) between 1 and 500),
  -- "지어낸 표현" 같은 Claude 의 메모
  note           text,
  status         text        not null default 'pending'
                   check (status in ('pending', 'approved', 'edited', 'rejected', 'posted', 'failed', 'expired')),
  -- 실제로 올릴 문구. 승인이면 draft_text 그대로, 고쳐서 승인이면 주원이 쓴 문구.
  final_text     text        check (final_text is null or char_length(final_text) between 1 and 500),
  decided_at     timestamptz,
  decided_by     text,
  posted_url     text,
  posted_at      timestamptz,
  error          text,

  -- 올릴 수 있는 상태면 올릴 문구가 반드시 있다
  constraint sns_drafts_final_text_present
    check (status not in ('approved', 'edited', 'posted') or final_text is not null)
);

-- 화면은 "대기 중(오래된 순)" 과 "최근 결정" 을 묻는다
create index if not exists sns_drafts_status_created_idx
  on public.sns_drafts (status, created_at desc);

alter table public.sns_drafts enable row level security;

create policy "sns_drafts: 관리자만 조회"
  on public.sns_drafts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

-- 결정 기록 ----------------------------------------------------------------------
-- 누가 언제 무엇을 눌렀는지. 초안 행이 나중에 posted 로 바뀌어도 결정 순간이 남는다.

create table if not exists public.sns_decision_log (
  id         bigint      generated always as identity primary key,
  draft_id   uuid        not null references public.sns_drafts (id) on delete cascade,
  email      text        not null,
  action     text        not null check (action in ('approve', 'edit', 'reject')),
  text       text,
  created_at timestamptz not null default now()
);

create index if not exists sns_decision_log_created_at_idx
  on public.sns_decision_log (created_at desc);

alter table public.sns_decision_log enable row level security;

create policy "sns_decision_log: 관리자만 조회"
  on public.sns_decision_log
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.email = (select auth.jwt() ->> 'email')
    )
  );

-- 권한 ---------------------------------------------------------------------------
-- Supabase 는 public 스키마의 새 테이블에 anon·authenticated 전권을 붙여 태어나게 한다.
-- 전부 걷고 읽기만 돌려준다(20260803010000 과 같은 방식).

revoke all on public.sns_drafts       from anon, authenticated;
revoke all on public.sns_decision_log from anon, authenticated;
grant select on public.sns_drafts       to authenticated;
grant select on public.sns_decision_log to authenticated;

-- 결정 --------------------------------------------------------------------------
-- security definer — 테이블 쓰기 권한이 없는 authenticated 대신 함수 주인이 쓴다.
-- 그래서 함수 안에서 직접 막는다: 허용목록, 대기 상태, 만료, 문구 길이.
-- search_path 를 비워 두고 모든 이름을 스키마로 적는다(검색 경로 끼워넣기 방지).

create or replace function public.sns_decide(
  p_id     uuid,
  p_action text,
  p_text   text default null
)
returns public.sns_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce((select auth.jwt() ->> 'email'), '')));
  v_draft public.sns_drafts;
  v_text  text := nullif(trim(coalesce(p_text, '')), '');
begin
  if v_email = '' or not exists (
    select 1 from public.admin_users a where lower(a.email) = v_email
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if p_action not in ('approve', 'edit', 'reject') then
    raise exception 'unknown action' using errcode = '22023';
  end if;

  -- 같은 초안에 두 번 눌러도 한 번만 반영되게 행을 잠근다
  select * into v_draft from public.sns_drafts d where d.id = p_id for update;

  if not found then
    raise exception 'draft not found' using errcode = 'P0002';
  end if;

  if v_draft.status <> 'pending' then
    raise exception 'already decided' using errcode = '55000';
  end if;

  if v_draft.expires_at <= now() then
    raise exception 'expired' using errcode = '55000';
  end if;

  if p_action = 'edit' and (v_text is null or char_length(v_text) > 500) then
    raise exception 'edit text must be 1-500 chars' using errcode = '22023';
  end if;

  update public.sns_drafts d
     set status     = case p_action when 'approve' then 'approved' when 'edit' then 'edited' else 'rejected' end,
         final_text = case p_action when 'approve' then d.draft_text when 'edit' then v_text else null end,
         decided_at = now(),
         decided_by = v_email
   where d.id = p_id
  returning * into v_draft;

  insert into public.sns_decision_log (draft_id, email, action, text)
  values (p_id, v_email, p_action, case when p_action = 'edit' then v_text end);

  return v_draft;
end;
$$;

revoke all on function public.sns_decide(uuid, text, text) from public, anon;
grant execute on function public.sns_decide(uuid, text, text) to authenticated;
