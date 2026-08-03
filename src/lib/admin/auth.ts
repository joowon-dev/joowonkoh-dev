import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeEmail } from "./allowlist";

export type AdminIdentity = { email: string; userId: string };

export type AdminCheck =
  | { ok: true; identity: AdminIdentity }
  | { ok: false; reason: "no-session" | "not-allowed" };

/**
 * 실제 권한 판정. Proxy가 아니라 여기가 관문이다.
 *
 * getSession()은 쿠키를 그대로 믿기 때문에 쓰지 않는다. getClaims()는 요청마다
 * 프로젝트의 공개 키로 JWT 서명을 검증한다.
 *
 * 허용목록 조회는 RLS가 "자기 행만 보임"으로 잠겨 있어, 등록되지 않은 사용자에게는
 * 빈 결과가 돌아온다. 즉 이 조회는 앱 코드와 RLS 두 곳에서 같은 답을 낸다.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createServerSupabase();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const email = normalizeEmail(claims?.email as string | undefined);

  if (!claims || !email) return { ok: false, reason: "no-session" };

  const { data: row } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!row) {
    await recordDeniedAttempt(email);
    return { ok: false, reason: "not-allowed" };
  }

  return { ok: true, identity: { email, userId: String(claims.sub ?? "") } };
}

async function recordDeniedAttempt(email: string) {
  try {
    const supabase = await createServerSupabase();
    await supabase
      .from("admin_audit_log")
      .insert({ email, event: "denied" });
  } catch {
    // 감사 로그 실패가 접근 거부 자체를 막아서는 안 된다.
  }
}
