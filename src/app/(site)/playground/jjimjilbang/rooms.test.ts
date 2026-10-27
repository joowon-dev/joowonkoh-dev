import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
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

  it("습도 55%부터 습한 방으로 갈린다", () => {
    expect(roomFor(30, 54.9)).toBe(ROOMS.drySauna);
    expect(roomFor(30, 55)).toBe(ROOMS.wetSauna);
    expect(roomFor(38, 55)).toBe(ROOMS.hellBath);
    expect(roomFor(24, 55)).toBe(ROOMS.salt);
    expect(roomFor(14, 55)).toBe(ROOMS.fog);
  });

  it("한여름 서울쯤 되는 습도는 습한 쪽으로 간다", () => {
    // 기준이 60%이던 시절 습도 54%의 서울이 "건식사우나"로 갔다
    expect(roomFor(35, 56)).toBe(ROOMS.hellBath);
    expect(roomFor(32, 56)).toBe(ROOMS.wetSauna);
  });

  it("얼음방은 습도를 보지 않는다", () => {
    expect(roomFor(-5, 10)).toBe(ROOMS.ice);
    expect(roomFor(-5, 95)).toBe(ROOMS.ice);
  });

  it("같은 기온이라도 습도가 방을 가른다", () => {
    expect(roomFor(30, 30)).not.toBe(roomFor(30, 80));
  });
});

describe("방 사진", () => {
  /*
   * 캐시를 우회하려고 파일 이름을 바꾼 적이 있다. 그때 rooms.ts의 경로를
   * 같이 안 고치면 화면에는 배경이 통째로 비고, 타입 검사도 린트도
   * 아무 말을 하지 않는다. 문자열이라서 그렇다.
   */
  it("모든 방의 사진 파일이 실제로 있다", () => {
    for (const room of Object.values(ROOMS)) {
      const path = join(process.cwd(), "public", room.image);
      expect(existsSync(path), `${room.name}: ${room.image} 없음`).toBe(true);
    }
  });
});
