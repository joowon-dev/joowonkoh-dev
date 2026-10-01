"use server";

import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin/auth";
import { decisionErrorMessage, parseDecision } from "@/lib/admin/sns";
import { createServerSupabase } from "@/lib/supabase/server";

export type DecideState = { error: string | null; done: string | null };

/**
 * 초안 하나에 결정을 내린다.
 *
 * service_role 을 쓰지 않는다. 로그인한 사용자의 세션으로 sns_decide() 를 부르고,
 * 그 함수가 허용목록·대기 상태·만료를 다시 본다. 여기서 checkAdmin 을 먼저 부르는 건
 * 거부 사유를 화면에 빨리 돌려주려는 것이지 관문이 아니다.
 */
export async function decideDraft(_prev: DecideState, formData: FormData): Promise<DecideState> {
  const check = await checkAdmin();
  if (!check.ok) return { error: "권한이 없어요. 다시 로그인해 주세요.", done: null };

  const decision = parseDecision({
    id: formData.get("id"),
    action: formData.get("action"),
    text: formData.get("text"),
  });
  if (!decision.ok) return { error: decision.error, done: null };

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("sns_decide", {
    p_id: decision.id,
    p_action: decision.action,
    p_text: decision.text,
  });
  if (error) return { error: decisionErrorMessage(error.message), done: null };

  revalidatePath("/admin/sns");
  const done = decision.action === "reject" ? "안 하기로 했어요." : "승인했어요. Claude 가 다음 확인 때 올려요.";
  return { error: null, done };
}
