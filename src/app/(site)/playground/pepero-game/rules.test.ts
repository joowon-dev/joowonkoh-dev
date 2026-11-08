import { describe, expect, it } from "vitest";

import {
  collision,
  decode,
  duration,
  encode,
  hashOf,
  judge,
  mouthsAt,
  routeOf,
  SPEED,
  STICK_MM,
} from "./rules";

describe("judge", () => {
  it("입이 안 닿으면 남은 길이로 칭호를 준다", () => {
    expect(judge(70, 73)).toMatchObject({ kind: "ok", leftMm: 3, tier: { title: "전설의 빼빼로" } });
    expect(judge(60, 70)).toMatchObject({ kind: "ok", leftMm: 10, tier: { title: "찰떡 호흡" } });
    expect(judge(20, 140)).toMatchObject({ kind: "ok", leftMm: 120, tier: { title: "낯가림 대폭발" } });
  });

  it("딱 맞닿아도(0mm) 깨문 것으로 친다", () => {
    expect(judge(70, 70).kind).toBe("bite");
  });

  it("왼쪽이 가운데 전에 멈췄으면 오른쪽이 왼쪽 입술을 깨문다", () => {
    expect(collision(50, 30)).toEqual({ at: 50, time: (STICK_MM - 50) / SPEED, biter: "right" });
  });

  it("오른쪽이 가운데 전에 멈췄으면 왼쪽이 깨문다", () => {
    expect(collision(120, 100)).toEqual({ at: 100, time: 100 / SPEED, biter: "left" });
  });

  it("둘 다 가운데를 넘보면 가운데서 만나고 더 욕심낸 쪽이 깨문다", () => {
    expect(collision(100, 60)).toMatchObject({ at: 75, biter: "left" }); // 왼쪽 25, 오른쪽 15 넘음
    expect(collision(80, 40)).toMatchObject({ at: 75, biter: "right" }); // 왼쪽 5, 오른쪽 35 넘음
    expect(collision(85, 65)).toMatchObject({ at: 75, biter: "right" }); // 똑같으면 나중 사람
  });
});

describe("mouthsAt", () => {
  it("같은 빠르기로 다가오다 각자 자리에서 멈춘다", () => {
    expect(mouthsAt(0, 60, 80)).toEqual({ left: 0, right: STICK_MM });
    const end = mouthsAt(duration(60, 80) + 1, 60, 80);
    expect(end).toEqual({ left: 60, right: 80 });
  });

  it("깨물면 닿은 자리에서 둘 다 멈춘다", () => {
    const end = mouthsAt(99, 50, 30);
    expect(end.left).toBe(50);
    expect(end.right).toBeCloseTo(50);
  });
});

describe("링크", () => {
  it("도전장·결과가 그대로 돌아온다(한글·이모지 이름 포함)", () => {
    const c = { a: 73, n: "주원🍫" };
    expect(decode(encode(c))).toEqual(c);
    const r = { a: 73, n: "주원", b: 77, m: "친구" };
    expect(decode(encode(r))).toEqual(r);
  });

  it("링크에 숫자가 그대로 보이지 않고, 같은 자리여도 링크가 매번 다르다", () => {
    expect(encode({ a: 73, n: "a" })).not.toMatch(/73/);
    const codes = new Set(Array.from({ length: 20 }, () => encode({ a: 73, n: "a" })));
    expect(codes.size).toBeGreaterThan(1);
  });

  it("망가진 링크는 null", () => {
    expect(decode("abc")).toBeNull();
    expect(decode("")).toBeNull();
    // 끝이 잘린 링크
    const code = encode({ a: 73, n: "주원" });
    expect(decode(code.slice(0, -4))).toBeNull();
  });

  it("# 로 화면을 고른다", () => {
    expect(routeOf("")).toEqual({ kind: "make" });
    expect(routeOf(hashOf({ a: 10, n: "가" }))).toEqual({ kind: "answer", game: { a: 10, n: "가" } });
    expect(routeOf(hashOf({ a: 10, n: "가", b: 20, m: "나" })).kind).toBe("replay");
    expect(routeOf("#c=@@")).toEqual({ kind: "broken" });
    // 도전장 자리에 결과를 넣으면 받지 않는다.
    expect(routeOf(`#c=${encode({ a: 10, n: "가", b: 20, m: "나" })}`)).toEqual({ kind: "broken" });
  });
});
