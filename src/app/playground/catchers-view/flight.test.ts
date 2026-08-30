import { describe, expect, it } from "vitest";
import {
  BALL_RADIUS,
  GRAVITY,
  NO_SPIN,
  kmhToMs,
  liftCoefficient,
  magnusDirection,
  simulate,
  throwPitch,
  type Spin,
  type Vec3,
} from "./flight";

const RELEASE: Vec3 = { x: -0.35, y: 1.8, z: 16.5 };
const TARGET = { x: 0, y: 0.85 };

/** 우투 기준 구종. 좌투는 tiltHours를 12에서 뺀 값이 된다 */
const FOUR_SEAM: Spin = { rpm: 2300, efficiency: 0.95, tiltHours: 11 };

function fourSeam(kmh = 145, spin: Spin = FOUR_SEAM) {
  return throwPitch({ release: RELEASE, speed: kmhToMs(kmh), target: TARGET, spin });
}

describe("magnusDirection", () => {
  const straight: Vec3 = { x: 0, y: 0, z: -40 };

  it("문자판 시각을 화면에서 보이는 방향 그대로 읽는다", () => {
    // 12시는 위, 3시는 포수가 볼 때 오른쪽, 6시는 아래, 9시는 왼쪽
    expect(magnusDirection(12, straight).y).toBeCloseTo(1, 6);
    expect(magnusDirection(3, straight).x).toBeCloseTo(1, 6);
    expect(magnusDirection(6, straight).y).toBeCloseTo(-1, 6);
    expect(magnusDirection(9, straight).x).toBeCloseTo(-1, 6);
  });

  it("속도와 직각이다", () => {
    // 위아래로도 기울어 날아가는 공에서도 성립해야 한다
    const slanted: Vec3 = { x: 1.5, y: 2.2, z: -38 };
    const d = magnusDirection(11, slanted);
    const dot = (d.x * slanted.x + d.y * slanted.y + d.z * slanted.z) / 38;
    expect(dot).toBeCloseTo(0, 6);
    expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1, 6);
  });
});

describe("liftCoefficient", () => {
  it("회전이 늘수록 커지되 1을 넘지 않는다", () => {
    expect(liftCoefficient(0)).toBe(0);
    expect(liftCoefficient(0.2)).toBeGreaterThan(liftCoefficient(0.1));
    // 말도 안 되는 회전수를 넣어도 궤적이 터지지 않아야 한다
    expect(liftCoefficient(1000)).toBeLessThan(1);
  });
});

describe("simulate", () => {
  it("공기와 회전이 없으면 포물선 해석해와 mm 단위로 일치한다", () => {
    // 적분기 자체가 맞는지 보는 가장 확실한 시험
    const v: Vec3 = { x: 0, y: 0, z: -40 };
    const flight = simulate(RELEASE, v, NO_SPIN, { dragCoefficient: 0 });

    const t = RELEASE.z / 40; // 등속으로 16.5m
    expect(flight.duration).toBeCloseTo(t, 5);
    expect(flight.arrival.y).toBeCloseTo(RELEASE.y - 0.5 * GRAVITY * t * t, 3);
    expect(flight.arrival.x).toBeCloseTo(RELEASE.x, 6);
  });

  it("스텝을 절반으로 줄여도 도착점이 1mm 안에서 같다", () => {
    const v: Vec3 = { x: 0.3, y: 1.2, z: -40 };
    const coarse = simulate(RELEASE, v, FOUR_SEAM, { step: 1 / 1000 });
    const fine = simulate(RELEASE, v, FOUR_SEAM, { step: 1 / 4000 });

    expect(Math.abs(coarse.arrival.x - fine.arrival.x)).toBeLessThan(0.001);
    expect(Math.abs(coarse.arrival.y - fine.arrival.y)).toBeLessThan(0.001);
  });

  it("홈플레이트 평면에서 정확히 끊는다", () => {
    const flight = simulate(RELEASE, { x: 0, y: 0, z: -40 }, NO_SPIN);
    expect(flight.arrival.z).toBe(0);
    expect(flight.samples.at(-1)?.p.z).toBe(0);
  });

  it("땅에 닿아도 홈플레이트까지 계산을 이어간다", () => {
    // 여기서 끊으면 무회전 궤적과의 변화량 비교가 성립하지 않는다
    const flight = simulate(RELEASE, { x: 0, y: -3, z: -25 }, NO_SPIN);
    expect(flight.bounced).toBe(true);
    expect(flight.arrival.z).toBe(0);
    expect(flight.arrival.y).toBeLessThan(BALL_RADIUS);
  });
});

describe("throwPitch", () => {
  it("보정을 거쳐 목표 지점을 mm 단위로 맞힌다", () => {
    const flight = fourSeam();
    expect(flight.arrival.x).toBeCloseTo(TARGET.x, 3);
    expect(flight.arrival.y).toBeCloseTo(TARGET.y, 3);
  });

  it("낙차 큰 커브도 목표를 맞힌다", () => {
    // 첫 시도는 반드시 땅에 처박힌다. 거기서 보정이 멈추면 안 된다
    const curve = throwPitch({
      release: RELEASE,
      speed: kmhToMs(120),
      target: TARGET,
      spin: { rpm: 2700, efficiency: 0.6, tiltHours: 6.5 },
    });
    expect(curve.arrival.y).toBeCloseTo(TARGET.y, 3);
    expect(curve.bounced).toBe(false);
  });

  it("145km/h 포심이 홈까지 0.41~0.45초에 온다", () => {
    expect(fourSeam().duration).toBeGreaterThan(0.41);
    expect(fourSeam().duration).toBeLessThan(0.45);
  });

  it("공기 저항으로 도착 속력이 초속의 90~93%로 준다", () => {
    const flight = fourSeam();
    const ratio = flight.arrivalSpeed / kmhToMs(145);
    expect(ratio).toBeGreaterThan(0.9);
    expect(ratio).toBeLessThan(0.93);
  });

  it("백스핀 포심은 무회전 대비 35~50cm 덜 떨어진다", () => {
    // «직구가 떠오른다»는 착시의 실체가 이 숫자다
    const flight = fourSeam();
    expect(flight.movement.vertical).toBeGreaterThan(0.35);
    expect(flight.movement.vertical).toBeLessThan(0.5);
  });

  it("우투 포심은 우타자 쪽(포수가 볼 때 왼쪽)으로 흐른다", () => {
    expect(fourSeam().movement.horizontal).toBeLessThan(-0.15);
  });

  it("좌투는 같은 구종이 좌우만 뒤집혀 휜다", () => {
    const right = fourSeam(145, { ...FOUR_SEAM, tiltHours: 11 });
    const left = throwPitch({
      release: { ...RELEASE, x: -RELEASE.x },
      speed: kmhToMs(145),
      target: TARGET,
      spin: { ...FOUR_SEAM, tiltHours: 1 },
    });

    expect(left.movement.horizontal).toBeCloseTo(-right.movement.horizontal, 2);
    expect(left.movement.vertical).toBeCloseTo(right.movement.vertical, 2);
  });

  it("자이로 회전이 늘면(유효 비율이 줄면) 변화량이 따라 준다", () => {
    // 슬라이더가 커브만큼 돌면서도 커브만큼 안 떨어지는 이유
    const spun = fourSeam(140, { rpm: 2400, efficiency: 0.7, tiltHours: 4 });
    const gyro = fourSeam(140, { rpm: 2400, efficiency: 0.35, tiltHours: 4 });

    const ratio = gyro.movement.horizontal / spun.movement.horizontal;
    expect(ratio).toBeGreaterThan(0.4);
    expect(ratio).toBeLessThan(0.62);
  });

  it("무회전으로 던지면 변화량이 0이다", () => {
    const flight = fourSeam(145, NO_SPIN);
    expect(flight.movement.horizontal).toBeCloseTo(0, 9);
    expect(flight.movement.vertical).toBeCloseTo(0, 9);
  });

  it("렌더용 표본이 릴리스에서 시작해 홈에서 끝난다", () => {
    const { samples } = fourSeam();
    expect(samples.length).toBeGreaterThan(50);
    expect(samples[0].p.z).toBeCloseTo(RELEASE.z, 6);
    expect(samples.at(-1)?.p.z).toBe(0);
    // 회전각은 단조 증가해야 실밥이 한 방향으로 돈다
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].rotation).toBeGreaterThanOrEqual(samples[i - 1].rotation);
    }
  });
});
