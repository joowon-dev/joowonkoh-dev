import { describe, it, expect } from "vitest";
import {
  EMPTY_PROGRAM,
  MAX_SHOTS,
  addShot,
  nextShot,
  peekIndex,
  removeShot,
  replaceShot,
  sanitizeProgram,
  suggestShot,
  type Program,
} from "./program";
import { BURST_HUES, type Shot } from "./firework";

const gold: Shot = { kind: "peony", hue: 48 };
const blue: Shot = { kind: "ring", hue: 210 };
const red: Shot = { kind: "willow", hue: 8 };

/** 프로그램을 n발 쏘고 나간 순서를 낸다 */
function fire(program: Program, n: number): (Shot | null)[] {
  let index = 0;
  const out: (Shot | null)[] = [];
  for (let i = 0; i < n; i += 1) {
    const step = nextShot(program, index);
    index = step.index;
    out.push(step.shot);
  }
  return out;
}

describe("nextShot", () => {
  it("짠 순서대로 나가고 끝나면 처음으로 돌아온다", () => {
    expect(fire([gold, blue, red], 7)).toEqual([gold, blue, red, gold, blue, red, gold]);
  });

  it("한 발짜리 프로그램은 계속 그 발만 나간다", () => {
    expect(fire([blue], 3)).toEqual([blue, blue, blue]);
  });

  it("비어 있으면 null — 부르는 쪽이 무작위로 만든다", () => {
    expect(nextShot(EMPTY_PROGRAM, 0)).toEqual({ shot: null, index: 0 });
  });

  it("프로그램이 줄어 커서가 범위를 벗어나도 살아난다", () => {
    // 5발짜리를 쏘던 중에 2발로 줄인 상황
    expect(nextShot([gold, blue], 4).shot).toBe(gold);
    expect(nextShot([gold, blue], 7).shot).toBe(blue);
  });

  it("커서가 음수여도 접어서 받는다", () => {
    expect(nextShot([gold, blue, red], -1).shot).toBe(red);
  });
});

describe("peekIndex", () => {
  it("다음에 나갈 칸을 가리킨다", () => {
    expect(peekIndex([gold, blue], 0)).toBe(0);
    expect(peekIndex([gold, blue], 3)).toBe(1);
  });

  it("빈 프로그램에는 가리킬 칸이 없다", () => {
    expect(peekIndex(EMPTY_PROGRAM, 0)).toBeNull();
  });
});

describe("sanitizeProgram", () => {
  it("정상 저장값은 그대로 돌아온다", () => {
    expect(sanitizeProgram([gold, blue])).toEqual([gold, blue]);
  });

  it("배열이 아니면 빈 프로그램", () => {
    for (const junk of [null, undefined, 42, "peony", { kind: "peony" }]) {
      expect(sanitizeProgram(junk)).toEqual([]);
    }
  });

  it("모르는 모양이 섞이면 그 칸만 버린다 — 나머지 공연은 살린다", () => {
    const saved = [gold, { kind: "supernova", hue: 100 }, blue];
    expect(sanitizeProgram(saved)).toEqual([gold, blue]);
  });

  it("색이 숫자가 아니면 그 칸만 버린다", () => {
    expect(sanitizeProgram([{ kind: "peony", hue: "gold" }, blue])).toEqual([blue]);
    expect(sanitizeProgram([{ kind: "peony", hue: NaN }, blue])).toEqual([blue]);
  });

  it("팔레트 밖 색도 살린다 — 나중에 팔레트를 바꿔도 저장분이 안 깨진다", () => {
    expect(sanitizeProgram([{ kind: "peony", hue: 400 }])).toEqual([{ kind: "peony", hue: 40 }]);
    expect(sanitizeProgram([{ kind: "peony", hue: -20 }])).toEqual([{ kind: "peony", hue: 340 }]);
  });

  it("상한을 넘긴 저장값은 잘라 낸다", () => {
    const many = Array.from({ length: MAX_SHOTS + 5 }, () => gold);
    expect(sanitizeProgram(many)).toHaveLength(MAX_SHOTS);
  });
});

describe("편집", () => {
  it("추가·교체·삭제는 원본을 안 건드린다", () => {
    const before: Program = [gold, blue];
    const snapshot = structuredClone(before);
    addShot(before, red);
    replaceShot(before, 0, red);
    removeShot(before, 0);
    expect(before).toEqual(snapshot);
  });

  it("가득 차면 더 안 들어간다", () => {
    const full = Array.from({ length: MAX_SHOTS }, () => gold);
    expect(addShot(full, blue)).toHaveLength(MAX_SHOTS);
  });

  it("범위 밖 칸을 고치거나 지우라고 하면 그대로 둔다", () => {
    const p: Program = [gold];
    expect(replaceShot(p, 5, blue)).toEqual([gold]);
    expect(removeShot(p, -1)).toEqual([gold]);
  });

  it("교체와 삭제가 자리를 지킨다", () => {
    expect(replaceShot([gold, blue, red], 1, gold)).toEqual([gold, gold, red]);
    expect(removeShot([gold, blue, red], 1)).toEqual([gold, red]);
  });
});

describe("suggestShot", () => {
  it("빈 프로그램의 첫 발은 팔레트 첫 색의 국화", () => {
    expect(suggestShot(EMPTY_PROGRAM)).toEqual({ kind: "peony", hue: BURST_HUES[0] });
  });

  it("모양은 물려받고 색만 다음으로 넘긴다 — 같은 발이 연달아 생기지 않게", () => {
    const next = suggestShot([{ kind: "willow", hue: BURST_HUES[0] }]);
    expect(next.kind).toBe("willow");
    expect(next.hue).toBe(BURST_HUES[1]);
  });

  it("팔레트 끝에서 처음으로 돈다", () => {
    const last = BURST_HUES[BURST_HUES.length - 1];
    expect(suggestShot([{ kind: "peony", hue: last }]).hue).toBe(BURST_HUES[0]);
  });
});
