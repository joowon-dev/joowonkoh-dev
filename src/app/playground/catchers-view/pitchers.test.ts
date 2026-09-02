import { describe, expect, it } from "vitest";
import { createRng } from "../_shared/random";
import { msToKmh } from "./flight";
import {
  PITCHERS,
  ZONE,
  findPitcher,
  mirrorTilt,
  pickSequence,
  planPitch,
  releasePoint,
  throwPlan,
  toThrow,
} from "./pitchers";

describe("mirrorTilt", () => {
  it("좌우만 뒤집는다", () => {
    expect(mirrorTilt(11)).toBe(1); // 우투 포심 → 좌투 포심
    expect(mirrorTilt(4)).toBe(8); // 우투 슬라이더 → 좌투 슬라이더
  });

  it("위아래는 그대로다", () => {
    expect(mirrorTilt(6)).toBe(6);
    expect(mirrorTilt(12)).toBe(0); // 12시와 0시는 같은 방향
  });
});

describe("releasePoint", () => {
  it("우투의 손은 포수가 볼 때 왼쪽에 있다", () => {
    // 투수는 포수를 마주 보므로 오른손이 -x 쪽에 온다
    const right = PITCHERS.find((p) => p.hand === "R")!;
    const left = PITCHERS.find((p) => p.hand === "L")!;
    expect(releasePoint(right).x).toBeLessThan(0);
    expect(releasePoint(left).x).toBeGreaterThan(0);
  });

  it("익스텐션만큼 투구판 앞에서 놓는다", () => {
    const pitcher = PITCHERS[0];
    expect(releasePoint(pitcher).z).toBeCloseTo(18.44 - pitcher.extension, 9);
  });
});

describe("PITCHERS", () => {
  it("배합 비중의 합이 1이다", () => {
    for (const pitcher of PITCHERS) {
      const total = pitcher.pitches.reduce((sum, p) => sum + p.share, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it("모두 포심을 가지고 있고 그게 가장 빠르다", () => {
    for (const pitcher of PITCHERS) {
      const fastball = pitcher.pitches.find((p) => p.kind === "fastball");
      expect(fastball, pitcher.name).toBeDefined();
      for (const pitch of pitcher.pitches) {
        expect(pitch.kmh).toBeLessThanOrEqual(fastball!.kmh);
      }
    }
  });

  it("id가 겹치지 않는다", () => {
    const ids = PITCHERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("좌투가 최소 한 명 있다", () => {
    // 좌우 반전이 눈에 보여야 회전축이 진짜로 물리에 들어갔다는 게 증명된다
    expect(PITCHERS.some((p) => p.hand === "L")).toBe(true);
  });
});

describe("findPitcher", () => {
  it("없는 id면 첫 투수로 떨어진다", () => {
    expect(findPitcher("없는사람")).toBe(PITCHERS[0]);
    expect(findPitcher(PITCHERS[2].id)).toBe(PITCHERS[2]);
  });
});

describe("pickSequence", () => {
  it("같은 구종이 세 번 연속 나오지 않는다", () => {
    for (const pitcher of PITCHERS) {
      for (let seed = 0; seed < 40; seed++) {
        const sequence = pickSequence(pitcher, 30, createRng(seed));
        for (let i = 2; i < sequence.length; i++) {
          const three =
            sequence[i].kind === sequence[i - 1].kind &&
            sequence[i].kind === sequence[i - 2].kind;
          expect(three, `${pitcher.name} seed ${seed}`).toBe(false);
        }
      }
    }
  });

  it("같은 시드면 같은 배합이 나온다", () => {
    const a = pickSequence(PITCHERS[0], 12, createRng(7)).map((p) => p.kind);
    const b = pickSequence(PITCHERS[0], 12, createRng(7)).map((p) => p.kind);
    expect(a).toEqual(b);
  });

  it("비중이 큰 구종이 실제로 더 자주 나온다", () => {
    const pitcher = PITCHERS[2]; // 포심 0.62 / 슬라이더 0.38
    const sequence = pickSequence(pitcher, 400, createRng(11));
    const fastballs = sequence.filter((p) => p.kind === "fastball").length;
    expect(fastballs).toBeGreaterThan(160);
    expect(fastballs).toBeLessThan(280);
  });

  it("구종이 하나뿐인 투수라도 멈추지 않는다", () => {
    const single = { ...PITCHERS[0], pitches: [PITCHERS[0].pitches[0]] };
    expect(pickSequence(single, 5, createRng(1))).toHaveLength(5);
  });
});

describe("실제로 던져 보기", () => {
  it("모든 투수의 모든 구종이 포수에게 닿는다", () => {
    // 프리셋 수치가 하나라도 엉뚱하면 여기서 땅에 처박히거나 백네트로 간다
    for (const pitcher of PITCHERS) {
      for (const type of pitcher.pitches) {
        for (let seed = 0; seed < 12; seed++) {
          const plan = planPitch(pitcher, type, createRng(seed));
          const flight = throwPlan(plan);
          const where = `${pitcher.name} ${type.label} seed ${seed}`;

          expect(flight.bounced, where).toBe(false);
          expect(flight.arrival.y, where).toBeCloseTo(plan.target.y, 2);
          expect(flight.arrival.x, where).toBeCloseTo(plan.target.x, 2);
          // 사람이 던진 공다운 비행 시간
          expect(flight.duration, where).toBeGreaterThan(0.38);
          expect(flight.duration, where).toBeLessThan(0.58);
        }
      }
    }
  });

  it("구종별 변화 방향이 이름값을 한다", () => {
    const rng = createRng(3);
    const pitcher = PITCHERS[0]; // 우투
    const of = (kind: string) => {
      const type = pitcher.pitches.find((p) => p.kind === kind)!;
      return throwPlan(planPitch(pitcher, type, rng));
    };

    // 포심은 무회전 대비 덜 떨어지고 우타자 쪽으로 흐른다
    const fastball = of("fastball");
    expect(fastball.movement.vertical).toBeGreaterThan(0.3);
    expect(fastball.movement.horizontal).toBeLessThan(0);

    // 슬라이더는 반대쪽으로 휘면서 조금 떨어진다
    const slider = of("slider");
    expect(slider.movement.horizontal).toBeGreaterThan(0.1);
    expect(slider.movement.vertical).toBeLessThan(0);

    // 커브는 가로보다 세로가 훨씬 크다
    const curve = of("curve");
    expect(curve.movement.vertical).toBeLessThan(-0.3);
    expect(Math.abs(curve.movement.vertical)).toBeGreaterThan(
      Math.abs(curve.movement.horizontal) * 2,
    );

    // 체인지업은 포심과 같은 쪽으로 더 크게 흐르면서 덜 뜬다
    const changeup = of("changeup");
    expect(changeup.movement.horizontal).toBeLessThan(fastball.movement.horizontal);
    expect(changeup.movement.vertical).toBeLessThan(fastball.movement.vertical);
  });

  it("좌투 슬라이더는 우투와 반대로 휜다", () => {
    const right = PITCHERS.find((p) => p.hand === "R")!;
    const left = PITCHERS.find((p) => p.hand === "L")!;
    const slider = (p: typeof right) => {
      const type = p.pitches.find((t) => t.kind === "slider")!;
      return throwPlan(planPitch(p, type, createRng(5))).movement.horizontal;
    };
    expect(Math.sign(slider(right))).toBe(-Math.sign(slider(left)));
  });

  it("공기 저항으로 도착 구속이 표시 구속보다 느리다", () => {
    const plan = planPitch(PITCHERS[0], PITCHERS[0].pitches[0], createRng(2));
    const flight = throwPlan(plan);
    expect(msToKmh(flight.arrivalSpeed)).toBeLessThan(plan.kmh);
    expect(msToKmh(flight.arrivalSpeed)).toBeGreaterThan(plan.kmh * 0.85);
  });

  it("좌투는 회전축이 뒤집힌 채로 넘어간다", () => {
    const left = PITCHERS.find((p) => p.hand === "L")!;
    const type = left.pitches.find((t) => t.kind === "fastball")!;
    const spin = toThrow(planPitch(left, type, createRng(1))).spin;
    expect(spin.tiltHours).toBe(mirrorTilt(type.tiltHours));
  });
});

describe("pickTarget", () => {
  it("조준점이 존 근처를 벗어나지 않는다", () => {
    for (const pitcher of PITCHERS) {
      for (const type of pitcher.pitches) {
        for (let seed = 0; seed < 30; seed++) {
          const { target } = planPitch(pitcher, type, createRng(seed));
          expect(Math.abs(target.x)).toBeLessThan(ZONE.halfWidth + 0.2);
          expect(target.y).toBeGreaterThan(ZONE.bottom - 0.2);
          expect(target.y).toBeLessThan(ZONE.top + 0.2);
        }
      }
    }
  });
});
