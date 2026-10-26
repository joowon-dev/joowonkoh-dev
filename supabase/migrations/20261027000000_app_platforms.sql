-- 어드민 「앱」 — AdMob 앱 id 가 iOS 인지 Android 인지.
--
-- AdMob 은 플랫폼마다 앱을 따로 만든다. 이름이 같은 앱이 두 줄로 나와서 어느 쪽인지
-- 알 수 없었다. 앱 id → 'ios' | 'android'.

alter table public.apps
  add column if not exists admob_platforms jsonb not null default '{}'::jsonb;

-- 2026-10-27 각 앱 저장소의 app.json / app.config.js / Info.plist / AndroidManifest.xml 에서 읽었다.
update public.apps set admob_platforms = v.p
from (values
  ('moneytick',      '{"ca-app-pub-7807290470382730~9813704971":"ios","ca-app-pub-7807290470382730~2022401327":"android"}'::jsonb),
  ('yourmealmymeal', '{"ca-app-pub-7807290470382730~3040565990":"ios","ca-app-pub-7807290470382730~4885054143":"android"}'::jsonb),
  ('jigumia',        '{"ca-app-pub-7807290470382730~3274994627":"ios","ca-app-pub-7807290470382730~7470525971":"android"}'::jsonb),
  ('chibiaku',       '{"ca-app-pub-7807290470382730~6480841886":"ios","ca-app-pub-7807290470382730~1968997211":"android"}'::jsonb),
  ('wapanyang',      '{"ca-app-pub-7807290470382730~2681498993":"ios","ca-app-pub-7807290470382730~3648853897":"android"}'::jsonb)
) as v(slug, p)
where apps.slug = v.slug;
