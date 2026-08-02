/**
 * 공의 궤적.
 *
 * 물리 시뮬레이션을 돌리지 않는다. 결과(클린/앞링/뒤링/백보드/짧음/넘김)는
 * 타자 속도로 이미 정해져 있으므로, 그 결말에 맞는 궤적을 역으로 깔아준다.
 * 시뮬레이션을 돌리면 "백보드 맞고 들어감"이라고 띄워놓고 공은 안 들어가는
 * 상황이 반드시 생긴다 — 화면과 판정이 어긋나는 쪽이 훨씬 나쁘다.
 *
 * 궤적은 포물선 조각(Arc)의 나열이다. 조각마다 시작점·끝점·꼭대기 높이·시간을
 * 주면 되고, 조각 사이는 이어 붙기만 하면 된다.
 */

export interface Vec3 {
  /** 좌우(m). 골대 정면이 0 */
  x: number;
  /** 높이(m) */
  y: number;
  /** 깊이(m). 던지는 사람이 0, 골대 쪽이 + */
  z: number;
}

export interface Arc {
  from: Vec3;
  to: Vec3;
  /** 이 조각의 꼭대기 높이(m). 시작·끝보다 낮게 주면 그냥 떨어지는 곡선이 된다 */
  apex: number;
  ms: number;
}

export type Outcome = "clean" | "frontRim" | "backRim" | "bank" | "short" | "long";

export const RIM_HEIGHT = 3.05;
export const RIM_RADIUS = 0.23;
/** 링 뒤쪽 끝에서 백보드까지의 틈 */
export const BOARD_GAP = 0.15;
export const BOARD_BOTTOM = 2.9;
export const BOARD_TOP = 3.95;
export const BALL_RADIUS = 0.12;

/** 공을 놓는 자리. 던지는 사람 머리 위 약간 앞 */
export const RELEASE: Vec3 = { x: 0, y: 2.15, z: 0.35 };

export function boardZ(distanceM: number): number {
  return distanceM + RIM_RADIUS + BOARD_GAP;
}

const v = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

/**
 * 조각 하나 위의 한 점. u는 0~1.
 *
 * x·z는 직선으로 가고 y만 포물선이다. u=0.5에서 정확히 apex를 지난다.
 */
export function evalArc(arc: Arc, u: number): Vec3 {
  const t = Math.min(1, Math.max(0, u));
  const mid = (arc.from.y + arc.to.y) / 2;
  return {
    x: arc.from.x + (arc.to.x - arc.from.x) * t,
    y: arc.from.y + (arc.to.y - arc.from.y) * t + 4 * (arc.apex - mid) * t * (1 - t),
    z: arc.from.z + (arc.to.z - arc.from.z) * t,
  };
}

export interface Flight {
  arcs: Arc[];
  totalMs: number;
  /** 공이 림을 통과하는 순간(ms). 안 들어가면 null — 그물 흔들림·효과음 타이밍이다 */
  swishAtMs: number | null;
}

function assemble(arcs: Arc[], swishArcIndex: number | null): Flight {
  const totalMs = arcs.reduce((s, a) => s + a.ms, 0);
  const swishAtMs =
    swishArcIndex === null
      ? null
      : arcs.slice(0, swishArcIndex).reduce((s, a) => s + a.ms, 0);
  return { arcs, totalMs, swishAtMs };
}

/** 던지는 힘이 셀수록 체공이 길다. 거리도 같이 반영한다 */
function riseMs(distanceM: number): number {
  return 820 + distanceM * 55;
}

/** 골대까지의 거리에 따라 자연스러운 아치 높이 */
function apexFor(distanceM: number): number {
  return RIM_HEIGHT + 1.05 + distanceM * 0.07;
}

/**
 * 림을 통과해 바닥까지 떨어지는 마지막 조각.
 *
 * `fromZ`는 앞 조각이 끝난 자리 그대로여야 한다. 골대 중심으로 고정해 두면
 * 링을 맞고 튄 공이 마지막 순간에 몇 센티 순간이동한다.
 */
function dropThrough(fromZ: number, x: number): Arc {
  return {
    from: v(x, RIM_HEIGHT, fromZ),
    to: v(x, BALL_RADIUS, fromZ + 0.05),
    // 꼭대기를 시작 높이에 맞추면 위로 안 솟고 아래로만 떨어진다
    apex: RIM_HEIGHT,
    ms: 340,
  };
}

/**
 * 결말에 맞는 궤적을 만든다.
 *
 * `lateral`은 좌우로 살짝 흘리는 값(m)이다. 매번 정확히 정중앙으로 날아가면
 * 열 번이 다 같은 그림이 된다. 게임 쪽에서 슛마다 다른 값을 넣어준다.
 */
export function buildFlight(outcome: Outcome, distanceM: number, lateral = 0): Flight {
  const hoopZ = distanceM;
  const apex = apexFor(distanceM);
  const rise = riseMs(distanceM);
  const bZ = boardZ(distanceM);
  const x = lateral;

  switch (outcome) {
    // 링에 닿지 않고 그대로 통과한다
    case "clean":
      return assemble(
        [
          { from: RELEASE, to: v(x, RIM_HEIGHT, hoopZ), apex, ms: rise },
          dropThrough(hoopZ, x),
        ],
        1,
      );

    // 조금 약해서 앞 링을 때린다. 튀어 오르며 림 안쪽으로 굴러 들어간다
    case "frontRim":
      return assemble(
        [
          {
            from: RELEASE,
            to: v(x, RIM_HEIGHT, hoopZ - RIM_RADIUS),
            apex: apex - 0.15,
            ms: rise,
          },
          {
            from: v(x, RIM_HEIGHT, hoopZ - RIM_RADIUS),
            to: v(x, RIM_HEIGHT, hoopZ),
            apex: RIM_HEIGHT + 0.3,
            ms: 260,
          },
          dropThrough(hoopZ, x),
        ],
        2,
      );

    // 조금 세서 뒤 링을 때린다. 앞쪽으로 튕겨 나오다 림 안으로 떨어진다
    case "backRim":
      return assemble(
        [
          {
            from: RELEASE,
            to: v(x, RIM_HEIGHT, hoopZ + RIM_RADIUS),
            apex: apex + 0.1,
            ms: rise,
          },
          {
            from: v(x, RIM_HEIGHT, hoopZ + RIM_RADIUS),
            to: v(x, RIM_HEIGHT, hoopZ - 0.05),
            apex: RIM_HEIGHT + 0.38,
            ms: 280,
          },
          dropThrough(hoopZ - 0.05, x),
        ],
        2,
      );

    // 더 세서 백보드를 맞고 떨어진다. 뱅크슛
    case "bank":
      return assemble(
        [
          { from: RELEASE, to: v(x, RIM_HEIGHT + 0.5, bZ), apex: apex + 0.25, ms: rise + 60 },
          {
            from: v(x, RIM_HEIGHT + 0.5, bZ),
            to: v(x, RIM_HEIGHT, hoopZ - 0.02),
            apex: RIM_HEIGHT + 0.52,
            ms: 240,
          },
          dropThrough(hoopZ - 0.02, x),
        ],
        2,
      );

    // 힘이 모자라 링 앞 바닥에 떨어진다. 얼마나 모자랐는지는 궤적에 안 담는다 —
    // 어차피 0점이고, 화면에는 "짧았어요"만 보이면 된다
    case "short": {
      const landZ = Math.max(0.8, hoopZ - 1.1);
      return assemble(
        [
          { from: RELEASE, to: v(x, BALL_RADIUS, landZ), apex: apex - 0.7, ms: rise },
          {
            from: v(x, BALL_RADIUS, landZ),
            to: v(x, BALL_RADIUS, landZ + 0.6),
            apex: 0.75,
            ms: 300,
          },
        ],
        null,
      );
    }

    // 너무 세서 백보드 윗부분을 맞고 뒤로 넘어간다
    case "long":
      return assemble(
        [
          { from: RELEASE, to: v(x, BOARD_TOP - 0.1, bZ), apex: apex + 0.8, ms: rise - 40 },
          {
            from: v(x, BOARD_TOP - 0.1, bZ),
            to: v(x * 1.4, BALL_RADIUS, bZ + 1.4),
            apex: BOARD_TOP + 0.15,
            ms: 460,
          },
        ],
        null,
      );
  }
}

export interface FlightSample {
  pos: Vec3;
  /** 몇 번째 조각 위인가. 튕기는 순간에 효과를 주려고 노출한다 */
  arcIndex: number;
  done: boolean;
}

/** 날아간 지 t밀리초 뒤 공의 자리 */
export function flightAt(flight: Flight, t: number): FlightSample {
  let remain = Math.max(0, t);
  for (let i = 0; i < flight.arcs.length; i++) {
    const arc = flight.arcs[i];
    if (remain <= arc.ms || i === flight.arcs.length - 1) {
      const u = arc.ms > 0 ? Math.min(1, remain / arc.ms) : 1;
      return { pos: evalArc(arc, u), arcIndex: i, done: t >= flight.totalMs };
    }
    remain -= arc.ms;
  }
  const last = flight.arcs[flight.arcs.length - 1];
  return { pos: last.to, arcIndex: flight.arcs.length - 1, done: true };
}
