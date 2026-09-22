import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * OAuth 리다이렉트를 받아 코드를 세션으로 바꾼다.
 *
 * 여기서는 허용목록을 보지 않는다. 세션만 세워 두면 (protected) 레이아웃이
 * 판정하고 거부 사유를 화면에 보여준다. 판정 지점을 한 곳으로 모아 두는 편이
 * 나중에 규칙이 바뀔 때 빠뜨릴 여지가 적다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/admin/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}/admin`);
}
