-- 어드민 대시보드 2단계 — collect-metrics 를 매일 부른다.
--
-- 설계 문서: docs/superpowers/specs/2026-08-03-admin-dashboard-design.md
--
-- Edge Function 은 x-collect-secret 헤더로 호출자를 확인한다. 그 값은 이 파일에
-- 두지 않고 Vault 에 'collect_metrics_secret' 이름으로 넣는다(저장소에 비밀이
-- 들어오지 않게). 함수도 같은 Vault 값을 읽어 비교한다(20261001010000).
--
--   select vault.create_secret('<값>', 'collect_metrics_secret');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 매일 02:00 KST(= 17:00 UTC). 최근 3일을 다시 받는다 — GA4 는 1~2일 늦게 값이 바뀐다.
select cron.schedule(
  'collect-metrics-ga4',
  '0 17 * * *',
  $$
  select net.http_post(
    url     := 'https://gshkmannztzwwkyyltvw.supabase.co/functions/v1/collect-metrics?source=ga4&days=3',
    headers := jsonb_build_object(
      'x-collect-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'collect_metrics_secret')
    ),
    timeout_milliseconds := 30000
  );
  $$
);
