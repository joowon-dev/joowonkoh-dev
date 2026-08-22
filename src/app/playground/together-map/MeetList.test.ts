import { describe, expect, it } from "vitest";
import { formatMeetDistance, formatMeetDuration } from "./MeetList";
import { t } from "./i18n";

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
