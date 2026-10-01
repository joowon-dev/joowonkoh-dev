-- SNS 승인함 손보기 (주원, 2026-10-01)
--
-- 1. 2시간 만료를 없앤다. 승인은 주원이 볼 수 있을 때 하면 된다.
--    expires_at 은 남겨 두되 기본값을 비운다. 값이 있는 행만 만료를 본다(Claude 가 일부러 넣을 때만).
-- 2. 카드에서 문구를 바로 고쳐 [승인] 을 누른다. 그래서 approve 에 문구가 같이 오고,
--    초안과 다르면 함수가 "고쳐서 승인(edit)" 으로 기록한다. 같으면 그냥 승인.

alter table public.sns_drafts alter column expires_at drop not null;
alter table public.sns_drafts alter column expires_at set default null;

-- 아직 결정 안 된 초안은 만료 없이 둔다
update public.sns_drafts set expires_at = null where status = 'pending';

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
  v_email  text := lower(trim(coalesce((select auth.jwt() ->> 'email'), '')));
  v_draft  public.sns_drafts;
  v_text   text := nullif(trim(coalesce(p_text, '')), '');
  v_action text := p_action;
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

  if v_draft.expires_at is not null and v_draft.expires_at <= now() then
    raise exception 'expired' using errcode = '55000';
  end if;

  -- 승인과 함께 온 문구가 초안과 다르면 고쳐서 승인이다
  if v_action = 'approve' and v_text is not null and v_text <> v_draft.draft_text then
    v_action := 'edit';
  end if;

  if v_action = 'edit' and (v_text is null or char_length(v_text) > 500) then
    raise exception 'edit text must be 1-500 chars' using errcode = '22023';
  end if;

  update public.sns_drafts d
     set status     = case v_action when 'approve' then 'approved' when 'edit' then 'edited' else 'rejected' end,
         final_text = case v_action when 'approve' then d.draft_text when 'edit' then v_text else null end,
         decided_at = now(),
         decided_by = v_email
   where d.id = p_id
  returning * into v_draft;

  insert into public.sns_decision_log (draft_id, email, action, text)
  values (p_id, v_email, v_action, case when v_action = 'edit' then v_text end);

  return v_draft;
end;
$$;

revoke all on function public.sns_decide(uuid, text, text) from public, anon;
grant execute on function public.sns_decide(uuid, text, text) to authenticated;
