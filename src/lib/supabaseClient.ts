import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * 처음 쓸 때 클라이언트를 만든다.
 *
 * 예전에는 모듈 최상단에서 createClient를 호출했다. 그러면 이 모듈을 import하는
 * 페이지를 프리렌더하는 순간 환경변수가 없을 때 빌드 전체가 죽는다. 실제로
 * Cloudflare 빌드에서 /playground/paper-plane 프리렌더가 "supabaseUrl is required"로
 * 깨졌다. 빌드 환경에 변수가 있느냐 없느냐에 빌드 성공이 걸려 있으면 안 된다.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인하세요.",
    );
  }

  client = createClient(url, key);
  return client;
}
