import { describe, it, expect, vi, beforeEach } from "vitest";

const from = vi.fn();
vi.mock("./supabaseClient", () => ({
  getSupabase: () => ({ from: (...a: unknown[]) => from(...a) }),
}));

import { fetchTopScores, submitScore, sanitizeNickname } from "./leaderboard";

beforeEach(() => from.mockReset());

describe("sanitizeNickname", () => {
  it("공백을 트림하고 12자로 자른다", () => {
    expect(sanitizeNickname("  hello  ")).toBe("hello");
    expect(sanitizeNickname("a".repeat(20))).toBe("a".repeat(12));
  });
  it("빈 값은 익명 처리", () => {
    expect(sanitizeNickname("   ")).toBe("익명");
  });
});

describe("fetchTopScores", () => {
  it("distance 내림차순 상위 N을 조회한다", async () => {
    const order = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        data: [{ id: "1", nickname: "a", distance: 10, created_at: "t" }],
        error: null,
      }),
    });
    from.mockReturnValue({ select: vi.fn().mockReturnValue({ order }) });
    const rows = await fetchTopScores(5);
    expect(rows).toHaveLength(1);
    expect(order).toHaveBeenCalledWith("distance", { ascending: false });
  });
});

describe("submitScore", () => {
  it("insert 후 생성 행을 반환한다", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "1", nickname: "cat", distance: 42, created_at: "t" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });
    const row = await submitScore("cat", 42);
    expect(insert).toHaveBeenCalledWith({ nickname: "cat", distance: 42 });
    expect(row.distance).toBe(42);
  });
});
