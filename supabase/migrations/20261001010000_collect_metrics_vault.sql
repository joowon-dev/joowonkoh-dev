-- collect-metrics 의 자격증명을 Vault 에서 꺼내 준다.
--
-- Edge Function secrets 대신 Vault 에 둔다. secrets 는 Supabase CLI 로그인이 있어야
-- 넣을 수 있는데, Vault 는 SQL 로 넣을 수 있어 MCP 만으로 운영이 끝난다.
-- 비밀값은 이 파일에 두지 않는다. 넣는 법:
--
--   select vault.create_secret('<값>', '<이름>');
--
-- 꺼낼 수 있는 이름은 아래 목록으로 못 박는다. 다른 Vault 비밀은 이 함수로 새지 않는다.

create or replace function public.collect_metrics_secret(secret_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = secret_name
    and name in ('collect_metrics_secret', 'ga4_service_account_json');
$$;

-- 함수는 기본으로 PUBLIC 에 EXECUTE 가 붙어 태어난다. service_role(Edge Function)만 남긴다.
revoke all on function public.collect_metrics_secret(text) from public, anon, authenticated;
grant execute on function public.collect_metrics_secret(text) to service_role;
