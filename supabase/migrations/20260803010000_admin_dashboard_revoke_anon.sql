-- anon 권한 회수
--
-- 앞선 마이그레이션의 `grant select ... to authenticated`는 사실상 무의미했다.
-- Supabase는 public 스키마의 기본 권한으로 anon과 authenticated 모두에게 ALL을
-- 부여하기 때문에, 새로 만든 테이블은 이미 anon이 전권을 쥔 상태로 태어난다.
--
-- RLS 정책이 없으므로 행은 새지 않지만, 그러면 방어가 RLS 한 겹뿐이다.
-- 테이블 접근 자체를 닫아 두면 정책을 하나 잘못 쓰더라도 anon 경로로는 새지 않는다.
--
-- leaderboard는 공개 기능이므로 건드리지 않는다.

revoke all on public.admin_users     from anon;
revoke all on public.metrics_daily   from anon;
revoke all on public.collection_runs from anon;
revoke all on public.admin_audit_log from anon;

-- authenticated에게도 필요한 것만 남긴다. 쓰기는 service_role이 한다.
revoke all on public.admin_users     from authenticated;
revoke all on public.metrics_daily   from authenticated;
revoke all on public.collection_runs from authenticated;
revoke all on public.admin_audit_log from authenticated;

grant select on public.admin_users     to authenticated;
grant select on public.metrics_daily   to authenticated;
grant select on public.collection_runs to authenticated;
grant select, insert on public.admin_audit_log to authenticated;

-- 앞으로 이 스키마에 만들어지는 테이블에는 anon 기본 권한이 붙지 않게 한다.
-- 기존 테이블에는 영향이 없다.
alter default privileges in schema public revoke all on tables from anon;
