import { describe, it, expect } from "vitest";
import { roomFor, ROOMS } from "./rooms";

describe("roomFor", () => {
  it("체감 35도부터는 불가마 계열이다", () => {
    expect(roomFor(35, 30)).toBe(ROOMS.bulgama);
    expect(roomFor(34.9, 30)).toBe(ROOMS.drySauna);
  });

  it("체감 28도부터는 사우나 계열이다", () => {
    expect(roomFor(28, 30)).toBe(ROOMS.drySauna);
    expect(roomFor(27.9, 30)).toBe(ROOMS.ocher);
  });

  it("체감 20도부터는 황토방 계열이다", () => {
    expect(roomFor(20, 30)).toBe(ROOMS.ocher);
    expect(roomFor(19.9, 30)).toBe(ROOMS.sleep);
  });

  it("체감 10도부터는 수면실 계열이다", () => {
    expect(roomFor(10, 30)).toBe(ROOMS.sleep);
    expect(roomFor(9.9, 30)).toBe(ROOMS.ice);
  });

  it("습도 60%부터 습한 방으로 갈린다", () => {
    expect(roomFor(30, 59.9)).toBe(ROOMS.drySauna);
    expect(roomFor(30, 60)).toBe(ROOMS.wetSauna);
    expect(roomFor(38, 60)).toBe(ROOMS.hellBath);
    expect(roomFor(24, 60)).toBe(ROOMS.salt);
    expect(roomFor(14, 60)).toBe(ROOMS.fog);
  });

  it("얼음방은 습도를 보지 않는다", () => {
    expect(roomFor(-5, 10)).toBe(ROOMS.ice);
    expect(roomFor(-5, 95)).toBe(ROOMS.ice);
  });

  it("같은 기온이라도 습도가 방을 가른다", () => {
    expect(roomFor(30, 30)).not.toBe(roomFor(30, 80));
  });
});
