import { describe, it, expect } from "vitest";
import {
  NEUTRAL_SPECIES,
  characterThickness,
  drawCharacter,
  winksOf,
  speciesFor,
  type PieceGeom,
} from "./character";
import { COIN_RADIUS, NEUTRAL_RADII, createCoin } from "./physics";
import { SKINS, skinOf } from "./skins";
import { drawSkinSample, type Palette } from "./render";

/** 그리기 호출을 기록하는 가짜 컨텍스트. 캔버스 없이 그림 코드가 도는지 확인한다. */
function fakeCtx() {
  const calls: string[] = [];
  const fills: string[] = [];
  const texts: string[] = [];
  const ctx = {
    calls,
    fills,
    texts,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "butt",
    font: "",
    textAlign: "start",
    textBaseline: "alphabetic",
    globalAlpha: 1,
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    beginPath: () => calls.push("beginPath"),
    moveTo: () => calls.push("moveTo"),
    lineTo: () => calls.push("lineTo"),
    quadraticCurveTo: () => calls.push("quadraticCurveTo"),
    closePath: () => calls.push("closePath"),
    ellipse: () => calls.push("ellipse"),
    rect: () => calls.push("rect"),
    roundRect: () => calls.push("roundRect"),
    stroke: () => calls.push("stroke"),
    translate: () => calls.push("translate"),
    rotate: () => calls.push("rotate"),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fill() {
      calls.push("fill");
      fills.push(String(ctx.fillStyle));
    },
    fillText(text: string) {
      calls.push("fillText");
      texts.push(text);
    },
  };
  return ctx as unknown as CanvasRenderingContext2D & {
    calls: string[];
    fills: string[];
    texts: string[];
  };
}

const geom = (rx: number): PieceGeom => ({
  sx: 100,
  sy: 100,
  rx,
  ry: rx * 0.72,
  thickness: rx * 0.42,
});

// readPalette는 DOM이 필요하므로(테스트 환경은 node) 같은 모양의 팔레트를 직접 만든다
const palette: Palette = {
  bg: "#ffffff",
  board: "#f2f4f8",
  boardFar: "#d9dee7",
  boardEdge: "#e5e7eb",
  pusher: "#c4cad5",
  pusherFace: "#8b94a3",
  coinBySize: NEUTRAL_RADII.map(() => ["#eef1f6", "#c6cedb"] as const),
  player: "#2563eb",
  playerSide: "#2563eb",
  text: "#23272f",
  accent: "#2563eb",
};

describe("종족 배정", () => {
  it("중립 종족 목록은 크기 목록과 길이가 같다", () => {
    // 하나라도 어긋나면 어떤 크기는 종족이 없어 가운데 종족으로 떨어진다
    expect(NEUTRAL_SPECIES).toHaveLength(NEUTRAL_RADII.length);
  });

  it("크기마다 다른 종족이 배정된다", () => {
    const kinds = NEUTRAL_RADII.map(
      (r) => speciesFor(createCoin({ id: 1, x: 0, y: 0, radius: r }), "#2563eb").kind,
    );
    expect(new Set(kinds).size).toBe(NEUTRAL_RADII.length);
  });

  it("목록에 없는 크기도 종족이 배정된다", () => {
    const s = speciesFor(createCoin({ id: 1, x: 0, y: 0, radius: 13 }), "#2563eb");
    expect(NEUTRAL_SPECIES.map((n) => n.kind)).toContain(s.kind);
  });

  it("참가자는 종족 대신 강조색 하나로 통일된다", () => {
    const a = speciesFor(
      createCoin({ id: 1, x: 0, y: 0, kind: "player", ownerIndex: 0, radius: COIN_RADIUS }),
      "#2563eb",
    );
    const b = speciesFor(
      createCoin({ id: 2, x: 0, y: 0, kind: "player", ownerIndex: 7, radius: COIN_RADIUS }),
      "#2563eb",
    );
    expect(a).toEqual(b);
    expect(a.top).toBe("#2563eb");
    // 옆면 색을 따로 주지 않으므로 어둡게 눌러 두께를 만든다
    expect(a.sideShade).toBeGreaterThan(0);
  });

  it("몸 두께는 코인보다 두툼하고 반지름에 비례한다", () => {
    expect(characterThickness(14)).toBeGreaterThan(14 * (5 / 14));
    expect(characterThickness(28)).toBeCloseTo(characterThickness(14) * 2, 10);
  });
});

describe("drawCharacter", () => {
  it("모든 종족을 그려도 예외가 없다", () => {
    for (const s of NEUTRAL_SPECIES) {
      const ctx = fakeCtx();
      expect(() => drawCharacter(ctx, geom(20), s, false)).not.toThrow();
      expect(ctx.calls).toContain("fill");
    }
  });

  it("참가자 이름을 이름표에 쓴다", () => {
    const ctx = fakeCtx();
    const s = speciesFor(
      createCoin({ id: 1, x: 0, y: 0, kind: "player", ownerIndex: 0 }),
      "#2563eb",
    );
    drawCharacter(ctx, geom(22), s, false, "주원");
    expect(ctx.texts).toEqual(["주원"]);
  });

  it("긴 이름은 줄여 쓴다", () => {
    const ctx = fakeCtx();
    drawCharacter(ctx, geom(22), NEUTRAL_SPECIES[2], false, "김주원입니다");
    expect(ctx.texts[0]).toBe("김주원…");
  });

  it("이름이 없으면 글자를 쓰지 않는다", () => {
    const ctx = fakeCtx();
    drawCharacter(ctx, geom(22), NEUTRAL_SPECIES[2], false);
    expect(ctx.texts).toEqual([]);
  });

  it("아주 작은 캐릭터도 눈이 사라지지 않는다", () => {
    // 반지름이 작을 때 눈 크기를 비례로만 두면 0에 가까워져 얼굴이 없어진다
    const ctx = fakeCtx();
    drawCharacter(ctx, geom(2), NEUTRAL_SPECIES[0], false);
    expect(ctx.fills).toContain("#3b3a36");
  });

  it("표정은 코인 번호로만 정해진다", () => {
    // 회전각처럼 매 프레임 바뀌는 값에 걸면 밀리는 동안 눈이 지글거린다
    const ids = Array.from({ length: 40 }, (_, i) => i);
    const winking = ids.filter(winksOf);
    expect(winking.length).toBeGreaterThan(0);
    expect(winking.length).toBeLessThan(ids.length / 2);
    expect(winksOf(7)).toBe(winksOf(7));
  });

  it("눈 감은 표정은 뜬 표정과 다르게 그려진다", () => {
    const open = fakeCtx();
    const wink = fakeCtx();
    drawCharacter(open, geom(22), NEUTRAL_SPECIES[2], false);
    drawCharacter(wink, geom(22), NEUTRAL_SPECIES[2], true);
    expect(wink.calls.filter((c) => c === "stroke").length).toBeGreaterThan(
      open.calls.filter((c) => c === "stroke").length,
    );
  });

  it("roundRect가 없는 환경에서도 이름표를 그린다", () => {
    const ctx = fakeCtx();
    // 구형 브라우저 대비 — rect로 떨어져야 한다
    delete (ctx as unknown as Record<string, unknown>).roundRect;
    expect(() => drawCharacter(ctx, geom(22), NEUTRAL_SPECIES[2], false, "나")).not.toThrow();
    expect(ctx.calls).toContain("rect");
  });
});

describe("스킨 설정", () => {
  it("스킨마다 문구가 따로 있다", () => {
    expect(SKINS.map((s) => s.id)).toEqual(["coin", "character"]);
    for (const s of SKINS) {
      expect(s.startLabel.length).toBeGreaterThan(0);
      expect(s.scrambleLabel).toContain("!");
    }
  });

  it("모르는 스킨은 기본 스킨으로 떨어진다", () => {
    expect(skinOf("nope" as never).id).toBe("coin");
  });
});

describe("drawSkinSample", () => {
  it("두 스킨 모두 미리보기를 그린다", () => {
    for (const s of SKINS) {
      const ctx = fakeCtx();
      drawSkinSample(ctx, { w: 240, h: 62 }, palette, s.id, "나");
      expect(ctx.calls).toContain("fill");
      expect(ctx.texts).toEqual(["나"]); // 참가자 표본에 이름이 붙는다
    }
  });

  it("카드가 좁아도 표본이 넘치지 않는다", () => {
    const ctx = fakeCtx();
    expect(() => drawSkinSample(ctx, { w: 90, h: 62 }, palette, "character", "나")).not.toThrow();
  });
});
