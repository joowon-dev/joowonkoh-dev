import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicKey, supabaseUrl } from "./env";

// 서버 클라이언트는 요청마다 새로 만들어야 한다. 요청의 쿠키를 물고 fetch를
// 구성하는 물건이라 전역에 캐시하면 다른 사용자의 세션이 섞인다.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component에서 호출되면 쿠키를 쓸 수 없다. proxy가 세션을
          // 갱신해 주므로 여기서는 무시해도 된다.
        }
      },
    },
  });
}
