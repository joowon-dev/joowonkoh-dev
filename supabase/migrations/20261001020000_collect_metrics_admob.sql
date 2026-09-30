-- 어드민 대시보드 3단계 — AdMob.
--
-- AdMob API 는 서비스 계정을 받지 않는다. GCP joowonkoh-site 의 OAuth 클라이언트
-- (데스크톱 앱, "프로덕션" 게시 — 테스트 상태면 리프레시 토큰이 7일에 만료된다)로
-- 주원 계정에서 한 번 동의받은 리프레시 토큰을 Vault 에 둔다. 값은 이 파일에 없다:
--
--   select vault.create_secret('<값>', 'admob_client_id');
--   select vault.create_secret('<값>', 'admob_client_secret');
--   select vault.create_secret('<값>', 'admob_refresh_token');

-- collect_metrics_secret() 이 꺼내 줄 수 있는 이름에 AdMob 셋을 더한다.
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
    and name in (
      'collect_metrics_secret',
      'ga4_service_account_json',
      'admob_client_id',
      'admob_client_secret',
      'admob_refresh_token'
    );
$$;

-- create or replace 는 기존 권한을 그대로 두지만, 처음부터 적용하는 환경을 위해 다시 못 박는다.
revoke all on function public.collect_metrics_secret(text) from public, anon, authenticated;
grant execute on function public.collect_metrics_secret(text) to service_role;

-- GA4 와 5분 어긋나게 02:05 KST.
select cron.schedule(
  'collect-metrics-admob',
  '5 17 * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=admob&days=3',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);
