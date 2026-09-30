/**
 * SNS 승인함 — 화면과 서버 액션이 같이 쓰는 순수 함수.
 *
 * 결정의 진짜 관문은 DB 함수 sns_decide() 다(허용목록·대기 상태·만료·길이).
 * 여기서 한 번 더 거르는 건 잘못된 요청을 DB 까지 보내지 않고 화면에 바로 이유를 보여 주려는 것이다.
 */

export const SNS_CHANNELS = ["threads", "x", "instagram"] as const;
export type SnsChannel = (typeof SNS_CHANNELS)[number];

export const SNS_KINDS = ["my_reply", "engage_comment", "quote", "self_comment"] as const;
export type SnsKind = (typeof SNS_KINDS)[number];

export type SnsStatus = "pending" | "approved" | "edited" | "rejected" | "posted" | "failed" | "expired";

export type SnsDraft = {
  id: string;
  created_at: string;
  expires_at: string;
  channel: SnsChannel;
  kind: SnsKind;
  target_url: string;
  target_author: string | null;
  target_summary: string | null;
  draft_text: string;
  note: string | null;
  status: SnsStatus;
  final_text: string | null;
  decided_at: string | null;
  decided_by: string | null;
  posted_url: string | null;
  posted_at: string | null;
  error: string | null;
};

export const CHANNEL_LABEL: Record<SnsChannel, string> = {
  threads: "Threads",
  x: "X",
  instagram: "인스타",
};

export const KIND_LABEL: Record<SnsKind, string> = {
  my_reply: "내 글 답글",
  engage_comment: "소통 댓글",
  quote: "인용",
  self_comment: "자기 댓글",
};

export const STATUS_LABEL: Record<SnsStatus, string> = {
  pending: "대기",
  approved: "승인",
  edited: "고쳐서 승인",
  rejected: "안 함",
  posted: "게시됨",
  failed: "실패",
  expired: "만료",
};

export const MAX_TEXT = 500;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Decision =
  | { ok: true; id: string; action: "approve" | "reject" }
  | { ok: true; id: string; action: "edit"; text: string }
  | { ok: false; error: string };

/** 폼 값 → 결정. 모르는 값은 전부 거절한다. */
export function parseDecision(input: { id: unknown; action: unknown; text?: unknown }): Decision {
  const id = typeof input.id === "string" ? input.id.trim() : "";
  if (!UUID.test(id)) return { ok: false, error: "잘못된 초안이에요." };

  const action = input.action;
  if (action === "approve" || action === "reject") return { ok: true, id, action };

  if (action === "edit") {
    const text = typeof input.text === "string" ? input.text.trim() : "";
    if (!text) return { ok: false, error: "고친 문구가 비어 있어요." };
    if ([...text].length > MAX_TEXT) return { ok: false, error: `문구는 ${MAX_TEXT}자까지예요.` };
    return { ok: true, id, action, text };
  }

  return { ok: false, error: "알 수 없는 동작이에요." };
}

/** DB 함수가 던지는 영문 사유를 화면 말로 바꾼다. 모르는 오류는 그대로 둔다. */
export function decisionErrorMessage(message: string): string {
  if (message.includes("not allowed")) return "권한이 없어요.";
  if (message.includes("already decided")) return "이미 결정된 초안이에요.";
  if (message.includes("expired")) return "만료된 초안이에요.";
  if (message.includes("draft not found")) return "초안을 찾지 못했어요.";
  if (message.includes("edit text")) return `문구는 1~${MAX_TEXT}자여야 해요.`;
  return message;
}

/** 대기 중이어도 만료 시각이 지났으면 결정할 수 없다. 화면에서는 만료로 보여 준다. */
export function effectiveStatus(draft: Pick<SnsDraft, "status" | "expires_at">, now: Date): SnsStatus {
  if (draft.status === "pending" && new Date(draft.expires_at).getTime() <= now.getTime()) return "expired";
  return draft.status;
}

/** 대기(결정할 것, 오래된 순) 와 나머지(최근 순) 로 나눈다. */
export function splitDrafts(drafts: readonly SnsDraft[], now: Date) {
  const pending: SnsDraft[] = [];
  const done: SnsDraft[] = [];
  for (const d of drafts) {
    (effectiveStatus(d, now) === "pending" ? pending : done).push(d);
  }
  pending.sort((a, b) => a.created_at.localeCompare(b.created_at));
  done.sort((a, b) => latestAt(b).localeCompare(latestAt(a)));
  return { pending, done };
}

function latestAt(d: SnsDraft): string {
  return d.posted_at ?? d.decided_at ?? d.created_at;
}

/** 남은 시간 "1시간 12분" / "8분". 지났으면 null. */
export function timeLeft(expiresAt: string, now: Date): string | null {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}

/** 원글 링크는 https 만 보여 준다. DB 제약과 같지만 화면에서도 한 번 더. */
export function safeHref(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
