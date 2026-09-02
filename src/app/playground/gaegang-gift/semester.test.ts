import { describe, it, expect } from "vitest";
import {
  SEMESTER_START,
  SEMESTER_END,
  semesterStatus,
  formatPercent,
} from "./semester";

/** KST 시각 문자열을 Date로. 학사일정은 서버 시간대와 무관하게 한국 기준이다. */
function kst(iso: string): Date {
  return new Date(`${iso}+09:00`);
}

const START = new Date(SEMESTER_START);
const END = new Date(SEMESTER_END);
const DAY = 86_400_000;

describe("개강 전", () => {
  it("phase가 before다", () => {
    expect(semesterStatus(kst("2026-08-20T12:00:00")).phase).toBe("before");
  });

  it("진행률이 0이다 — 음수로 내려가지 않는다", () => {
    expect(semesterStatus(kst("2026-08-20T12:00:00")).progress).toBe(0);
  });

  it("남은 일수는 개강 전 기간까지 포함해서 센다", () => {
    const now = new Date(START.getTime() - 10 * DAY);
    const total = Math.ceil((END.getTime() - now.getTime()) / DAY);
    expect(semesterStatus(now).daysLeft).toBe(total);
  });
});

describe("학기 중", () => {
  it("개강 직후에는 phase가 during이고 진행률이 0보다 크지만 1%도 안 된다", () => {
    const s = semesterStatus(new Date(START.getTime() + 12 * 3600_000));
    expect(s.phase).toBe("during");
    expect(s.progress).toBeGreaterThan(0);
    expect(s.progress).toBeLessThan(0.01);
  });

  it("딱 절반이면 진행률이 0.5다", () => {
    const mid = new Date((START.getTime() + END.getTime()) / 2);
    expect(semesterStatus(mid).progress).toBeCloseTo(0.5, 6);
  });

  it("남은 일수는 올림이다 — 몇 시간 남아도 하루로 센다", () => {
    expect(semesterStatus(new Date(END.getTime() - 3600_000)).daysLeft).toBe(1);
  });

  it("하루 뒤가 종강이면 1일 남았다", () => {
    expect(semesterStatus(new Date(END.getTime() - DAY)).daysLeft).toBe(1);
  });
});

describe("종강 이후", () => {
  it("종강 시점에 phase가 after로 바뀐다", () => {
    expect(semesterStatus(END).phase).toBe("after");
  });

  it("진행률이 1을 넘지 않는다", () => {
    expect(semesterStatus(new Date(END.getTime() + 400 * DAY)).progress).toBe(1);
  });

  it("남은 일수가 음수로 가지 않는다", () => {
    expect(semesterStatus(new Date(END.getTime() + 400 * DAY)).daysLeft).toBe(0);
  });
});

describe("진행률 표기", () => {
  it("소수점 한 자리까지 보여준다 — 눈에 안 띄게 움직이는 게 요점이다", () => {
    expect(formatPercent(0.008)).toBe("0.8%");
  });

  it("0은 0.0%다", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("1은 100%다 — 끝났는데 100.0%는 어색하다", () => {
    expect(formatPercent(1)).toBe("100%");
  });
});
