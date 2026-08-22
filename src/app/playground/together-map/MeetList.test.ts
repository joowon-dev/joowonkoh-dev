import { describe, expect, it } from "vitest";
import { formatMeetDistance, formatMeetDuration, splitMeetings, VISIBLE_ROWS } from "./MeetList";
import { t } from "./i18n";
import type { Meeting } from "./meet";

const strings = t("ko");

describe("formatMeetDuration", () => {
  it("한 시간 미만이면 분만 보여준다", () => {
    expect(formatMeetDuration(15 * 60_000, strings)).toBe("15분");
  });

  it("정확히 시간 단위면 분을 붙이지 않는다", () => {
    expect(formatMeetDuration(2 * 60 * 60_000, strings)).toBe("2시간");
  });

  it("시간과 분이 섞이면 둘 다 보여준다", () => {
    expect(formatMeetDuration(90 * 60_000, strings)).toBe("1시간 30분");
  });

  it("음수 입력은 0으로 바닥을 찍는다", () => {
    expect(formatMeetDuration(-1000, strings)).toBe("0분");
  });

  it("초 단위가 섞여 있으면 반올림한다 — Math.floor였다면 89분으로 잘렸을 것", () => {
    // 89분 40초는 반올림하면 90분(1시간 30분)이다. floor를 썼다면 89분,
    // 즉 "1시간 29분"이 됐을 것이므로 이 값이 Math.round의 존재를 검증한다.
    const ms = (89 * 60 + 40) * 1000;
    expect(formatMeetDuration(ms, strings)).toBe("1시간 30분");
  });
});

describe("formatMeetDistance", () => {
  it("1km 미만이면 미터로 보여준다", () => {
    expect(formatMeetDistance(85, strings)).toBe("85m");
  });

  it("1km 이상이면 km로, 소수 첫째 자리까지 반올림한다", () => {
    expect(formatMeetDistance(1234, strings)).toBe("1.2km");
  });

  it("정확히 1km 경계에서 km로 넘어간다", () => {
    expect(formatMeetDistance(1000, strings)).toBe("1km");
  });

  it("음수 입력은 0으로 바닥을 찍는다", () => {
    expect(formatMeetDistance(-5, strings)).toBe("0m");
  });
});

function makeMeetings(count: number): Meeting[] {
  return Array.from({ length: count }, (_, i) => ({
    start: i,
    end: i + 1,
    lat: 0,
    lon: 0,
    minDistance: 0,
  }));
}

describe("splitMeetings", () => {
  // VISIBLE_ROWS를 파라미터로만 참조하면 상수 자체가 바뀌어도 이 테스트들은
  // 여전히 "그 값 기준으로는" 맞으므로 통과해 버린다 — 값 자체를 못으로 박아 둔다.
  it("기준선은 브리핑에 적힌 대로 10건이다", () => {
    expect(VISIBLE_ROWS).toBe(10);
  });

  it("빈 배열은 둘 다 빈 배열이다", () => {
    expect(splitMeetings([], VISIBLE_ROWS)).toEqual({ visible: [], hidden: [] });
  });

  it("기준선보다 적으면 전부 visible이고 hidden은 비어 있다", () => {
    const { visible, hidden } = splitMeetings(makeMeetings(VISIBLE_ROWS - 1), VISIBLE_ROWS);
    expect(visible).toHaveLength(VISIBLE_ROWS - 1);
    expect(hidden).toHaveLength(0);
  });

  // 실제로 MeetList가 쓰는 기준선(VISIBLE_ROWS)을 그대로 참조한다. 상수를
  // 하드코딩해서 부르면 VISIBLE_ROWS 자체가 바뀌어도 이 테스트는 못 잡는다.
  it("정확히 기준선(VISIBLE_ROWS)이면 전부 visible이고 hidden은 비어 있다", () => {
    const { visible, hidden } = splitMeetings(makeMeetings(VISIBLE_ROWS), VISIBLE_ROWS);
    expect(visible).toHaveLength(VISIBLE_ROWS);
    expect(hidden).toHaveLength(0);
  });

  it("기준선보다 하나 많으면 하나만 hidden으로 넘어간다", () => {
    const { visible, hidden } = splitMeetings(makeMeetings(VISIBLE_ROWS + 1), VISIBLE_ROWS);
    expect(visible).toHaveLength(VISIBLE_ROWS);
    expect(hidden).toHaveLength(1);
    expect(hidden[0].start).toBe(VISIBLE_ROWS);
  });
});
