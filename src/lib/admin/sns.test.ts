import { describe, expect, it } from "vitest";
import {
  decisionErrorMessage,
  effectiveStatus,
  parseDecision,
  safeHref,
  type SnsDraft,
  splitDrafts,
  timeLeft,
} from "./sns";

const ID = "3f2b8c1e-9a4d-4e6b-8c2a-1d5e7f9a0b3c";
const NOW = new Date("2026-10-01T03:00:00Z");

function draft(over: Partial<SnsDraft>): SnsDraft {
  return {
    id: ID,
    created_at: "2026-10-01T02:00:00Z",
    expires_at: "2026-10-01T04:00:00Z",
    channel: "threads",
    kind: "engage_comment",
    target_url: "https://www.threads.com/@a/post/1",
    target_author: "a",
    target_summary: null,
    draft_text: "고생했다 정말",
    note: null,
    status: "pending",
    final_text: null,
    decided_at: null,
    decided_by: null,
    posted_url: null,
    posted_at: null,
    error: null,
    ...over,
  };
}

describe("parseDecision", () => {
  it("거절은 문구를 버린다", () => {
    expect(parseDecision({ id: ID, action: "reject", text: "무시됨" })).toEqual({ ok: true, id: ID, action: "reject", text: null });
  });

  it("승인은 카드의 문구를 앞뒤 공백 지워 같이 보낸다", () => {
    expect(parseDecision({ id: ID, action: "approve", text: "  긍정 신호다!!  " })).toEqual({
      ok: true,
      id: ID,
      action: "approve",
      text: "긍정 신호다!!",
    });
  });

  it("문구를 다 지우고 승인하면 막는다", () => {
    expect(parseDecision({ id: ID, action: "approve", text: "   " }).ok).toBe(false);
    expect(parseDecision({ id: ID, action: "approve" }).ok).toBe(false);
    expect(parseDecision({ id: ID, action: "edit", text: "" }).ok).toBe(false);
  });

  it("500자를 넘으면 막는다", () => {
    expect(parseDecision({ id: ID, action: "approve", text: "가".repeat(501) }).ok).toBe(false);
    expect(parseDecision({ id: ID, action: "approve", text: "가".repeat(500) }).ok).toBe(true);
  });

  it("이모지는 한 글자로 센다", () => {
    expect(parseDecision({ id: ID, action: "approve", text: "👏".repeat(500) }).ok).toBe(true);
  });

  it("모르는 동작과 잘못된 id 를 막는다", () => {
    expect(parseDecision({ id: ID, action: "post", text: "x" }).ok).toBe(false);
    expect(parseDecision({ id: ID, action: null }).ok).toBe(false);
    expect(parseDecision({ id: "1; drop table", action: "approve", text: "x" }).ok).toBe(false);
    expect(parseDecision({ id: undefined, action: "reject" }).ok).toBe(false);
  });
});

describe("decisionErrorMessage", () => {
  it("DB 사유를 화면 말로 바꾼다", () => {
    expect(decisionErrorMessage("already decided")).toBe("이미 결정된 초안이에요.");
    expect(decisionErrorMessage("expired")).toBe("만료된 초안이에요.");
    expect(decisionErrorMessage("not allowed")).toBe("권한이 없어요.");
  });

  it("모르는 오류는 그대로 둔다", () => {
    expect(decisionErrorMessage("network down")).toBe("network down");
  });
});

describe("effectiveStatus", () => {
  it("만료 시각이 지난 대기는 만료로 본다", () => {
    expect(effectiveStatus(draft({ expires_at: "2026-10-01T03:00:00Z" }), NOW)).toBe("expired");
    expect(effectiveStatus(draft({}), NOW)).toBe("pending");
  });

  it("만료 시각이 없으면 계속 대기다", () => {
    expect(effectiveStatus(draft({ expires_at: null }), NOW)).toBe("pending");
  });

  it("이미 결정된 건 만료와 상관없다", () => {
    expect(effectiveStatus(draft({ status: "posted", expires_at: "2026-10-01T01:00:00Z" }), NOW)).toBe("posted");
  });
});

describe("splitDrafts", () => {
  it("대기는 오래된 순, 나머지는 최근 순으로 나눈다", () => {
    const a = draft({ id: "a", created_at: "2026-10-01T02:30:00Z" });
    const b = draft({ id: "b", created_at: "2026-10-01T02:10:00Z" });
    const old = draft({ id: "old", expires_at: "2026-10-01T02:50:00Z" });
    const posted = draft({ id: "p", status: "posted", posted_at: "2026-10-01T02:55:00Z" });
    const rejected = draft({ id: "r", status: "rejected", decided_at: "2026-10-01T02:40:00Z" });

    const { pending, done } = splitDrafts([a, old, posted, b, rejected], NOW);
    expect(pending.map((d) => d.id)).toEqual(["b", "a"]);
    expect(done.map((d) => d.id)).toEqual(["p", "r", "old"]);
  });
});

describe("timeLeft", () => {
  it("남은 시간을 분·시간으로", () => {
    expect(timeLeft("2026-10-01T03:08:00Z", NOW)).toBe("8분");
    expect(timeLeft("2026-10-01T04:12:00Z", NOW)).toBe("1시간 12분");
    expect(timeLeft("2026-10-01T03:00:00Z", NOW)).toBeNull();
    expect(timeLeft(null, NOW)).toBeNull();
  });
});

describe("safeHref", () => {
  it("https 만 링크로 둔다", () => {
    expect(safeHref("https://x.com/a/status/1")).toBe("https://x.com/a/status/1");
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("http://x.com")).toBeNull();
    expect(safeHref("not a url")).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});
