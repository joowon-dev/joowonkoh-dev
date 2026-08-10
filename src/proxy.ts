import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // 어드민에만 건다. 공개 사이트는 인증이 없으므로 세션 갱신을 돌릴 이유가 없고,
  // 모든 요청에 Supabase 왕복을 붙이면 블로그·플레이그라운드가 느려진다.
  matcher: ["/admin/:path*"],
};
