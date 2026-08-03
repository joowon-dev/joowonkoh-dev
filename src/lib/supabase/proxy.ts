import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicKey, supabaseUrl } from "./env";

export const LOGIN_PATH = "/admin/login";

/**
 * 세션 쿠키를 갱신하고, 로그인하지 않은 요청을 로그인 페이지로 보낸다.
 *
 * 여기서 하는 것은 낙관적 체크뿐이다. Next.js 문서가 Proxy를 인증 솔루션으로
 * 쓰지 말라고 명시하고 있고, Server Function은 자신이 선언된 라우트로의 POST로
 * 처리되므로 matcher 변경만으로 이 층이 조용히 사라질 수 있다.
 * 실제 권한 판정은 requireAdmin()과 RLS가 한다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // createServerClient와 getClaims() 사이에 코드를 넣지 말 것.
  // 여기가 어긋나면 사용자가 무작위로 로그아웃되는, 추적하기 어려운 버그가 난다.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && !isPublicAdminPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function isPublicAdminPath(pathname: string) {
  return pathname === LOGIN_PATH || pathname.startsWith("/admin/auth");
}
