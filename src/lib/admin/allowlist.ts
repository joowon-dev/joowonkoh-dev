/**
 * 관리자 허용목록 판정.
 *
 * 로그인 성공과 접근 허용은 다르다. Google OAuth는 누구나 로그인에 성공하므로
 * 여기가 실질적인 관문이다. 판정 로직을 순수 함수로 떼어 둔 이유는 테스트에서
 * Supabase 없이 경계 조건을 확인하기 위해서다.
 */

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAllowedEmail(
  email: string | null | undefined,
  allowlist: readonly string[],
): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return allowlist.some((allowed) => normalizeEmail(allowed) === normalized);
}
