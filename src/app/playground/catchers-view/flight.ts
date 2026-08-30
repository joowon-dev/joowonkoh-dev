/**
 * 야구공의 비행. 중력·항력·마그누스 세 힘을 넣고 적분한다.
 *
 * 구종마다 곡선을 손으로 깎아 두지 않은 이유는, 그러면 화면에 띄우는
 * 회전수·회전축이 궤적과 아무 상관 없는 장식이 되기 때문이다. 여기서는
 * 회전축을 바꾸면 궤적이 실제로 따라 바뀐다.
 *
 * 좌표계 — 원점은 홈플레이트 앞 꼭짓점의 지면, 단위는 m/s/kg.
 *   +z 홈플레이트 → 마운드 (공은 -z로 날아온다)
 *   +y 위
 *   +x 포수가 볼 때 오른쪽 (= 1루 쪽. 우타자는 -x에 선다)
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const BALL_MASS = 0.145; // kg, 공인구 규격 중앙값
export const BALL_RADIUS = 0.0366; // m, 둘레 229mm
export const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;
export const AIR_DENSITY = 1.225; // kg/m³, 해수면 15℃
export const GRAVITY = 9.81;
/** 실밥 있는 야구공의 통상 범위(0.30~0.35) 중앙 */
export const DRAG_COEFFICIENT = 0.33;
/** 투구판 */
export const RUBBER_Z = 18.44;
/** 적분 스텝. 0.4초 비행이면 400스텝이라 절반으로 줄여도 결과가 같다 */
export const STEP = 1 / 1000;
/** 렌더용 표본 간격 — 적분보다 성기게 남긴다 */
const SAMPLE_STEP = 1 / 250;
/** 공이 홈에 못 오고 땅에 처박히는 경우까지 포함한 상한 */
const MAX_TIME = 2;

/**
 * 양력 계수. 회전 파라미터 S = rω/|v|에 대해 포화하는 형태를 쓴다.
 *
 * S가 아무리 커져도 1을 넘지 않아 극단적인 회전수를 넣어도 궤적이 터지지
 * 않는다. 분모 0.8은 가장 자료가 많은 경우 — 145km/h 포심에 유효 회전
 * 2300rpm이면 무회전 대비 45cm 덜 떨어진다 — 에 맞춰 잡은 값이다.
 * 실측 곡선의 근사이지 유도된 상수가 아니다.
 */
export const LIFT_SATURATION = 0.8;

export function liftCoefficient(spinParameter: number): number {
  return spinParameter / (LIFT_SATURATION + spinParameter);
}

function length(v: Vec3): number {
  return Math.hypot(v.x, v.y, v.z);
}

function normalize(v: Vec3): Vec3 {
  const l = length(v);
  if (l === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

/**
 * 마그누스 힘이 공을 미는 방향. 회전축 벡터와 외적 대신 **시계 문자판**으로
 * 받는다 — 12시는 위, 3시는 포수가 볼 때 오른쪽, 6시는 아래.
 *
 * 회전축을 적고 외적을 취하는 관습은 부호를 세 번 헷갈리게 만드는데, 이쪽은
 * 데이터에 적힌 그대로이자 화면에서 눈에 보이는 그대로다.
 *
 * 마그누스 힘은 속도와 직각이어야 하므로 진행 방향 성분을 빼고 다시 정규화한다.
 */
export function magnusDirection(tiltHours: number, velocity: Vec3): Vec3 {
  const theta = (((tiltHours % 12) + 12) % 12) * (Math.PI / 6);
  const face: Vec3 = { x: Math.sin(theta), y: Math.cos(theta), z: 0 };
  const vhat = normalize(velocity);
  const along = face.x * vhat.x + face.y * vhat.y + face.z * vhat.z;
  const perpendicular: Vec3 = {
    x: face.x - along * vhat.x,
    y: face.y - along * vhat.y,
    z: face.z - along * vhat.z,
  };
  return normalize(perpendicular);
}

export interface Spin {
  /** 분당 회전수 (총 회전) */
  rpm: number;
  /**
   * 유효 회전 비율 0~1. 회전축이 진행 방향과 나란한 성분(자이로 회전)은
   * 휘는 데 기여하지 않는다. 슬라이더가 커브만큼 돌면서도 커브만큼
   * 안 떨어지는 이유가 이것이다.
   */
  efficiency: number;
  /** 마그누스 힘 방향, 시계 문자판 시각 (0~12) */
  tiltHours: number;
}

export const NO_SPIN: Spin = { rpm: 0, efficiency: 0, tiltHours: 12 };

export interface FlightSample {
  t: number;
  p: Vec3;
  /** 그 순간까지 공이 돈 각도(rad). 실밥 회전에 그대로 쓴다 */
  rotation: number;
}

export interface Flight {
  samples: FlightSample[];
  /** 홈플레이트까지 걸린 시간(s) */
  duration: number;
  /** 홈플레이트 통과 지점 */
  arrival: Vec3;
  /** 도착 속력(m/s) */
  arrivalSpeed: number;
  /** 홈에 못 오고 땅에 닿았으면 true */
  bounced: boolean;
}

/** 공에 걸리는 가속도(m/s²) */
function acceleration(velocity: Vec3, spin: Spin, drag: number): Vec3 {
  const speed = length(velocity);
  if (speed === 0) return { x: 0, y: -GRAVITY, z: 0 };

  const q = 0.5 * AIR_DENSITY * BALL_AREA;

  // 항력 — 속도의 제곱에 비례하고 진행 반대 방향
  const dragMagnitude = (q * drag * speed * speed) / BALL_MASS;
  const vhat = normalize(velocity);
  let ax = -dragMagnitude * vhat.x;
  let ay = -dragMagnitude * vhat.y;
  let az = -dragMagnitude * vhat.z;

  // 마그누스
  const omegaEffective = ((2 * Math.PI * spin.rpm) / 60) * spin.efficiency;
  if (omegaEffective > 0) {
    const spinParameter = (BALL_RADIUS * omegaEffective) / speed;
    const cl = liftCoefficient(spinParameter);
    const magnitude = (q * cl * speed * speed) / BALL_MASS;
    const d = magnusDirection(spin.tiltHours, velocity);
    ax += magnitude * d.x;
    ay += magnitude * d.y;
    az += magnitude * d.z;
  }

  ay -= GRAVITY;
  return { x: ax, y: ay, z: az };
}

/**
 * 릴리스 지점과 초기 속도를 받아 홈플레이트(z=0)까지 적분한다.
 *
 * 위치를 `p += v·dt + ½a·dt²`로 밀어 준다. 그냥 `p += v·dt`로 하는
 * semi-implicit Euler는 중력만 있는 경우에도 도착 높이가 2mm 빗나가는데,
 * 항 하나를 더 쓰면 등가속 구간에서 해석해와 정확히 같아진다. 이러면
 * «공기를 끄면 포물선 공식과 일치한다»가 오차 허용치 없이 성립해서,
 * 적분기가 맞는지를 근사가 아니라 등식으로 시험할 수 있다. RK4는 필요 없다.
 *
 * 회전 감쇠는 무시한다. 0.4초 동안 rpm은 2%도 안 줄어든다.
 */
export function simulate(
  release: Vec3,
  velocity: Vec3,
  spin: Spin,
  options: SimulateOptions = {},
): Flight {
  const drag = options.dragCoefficient ?? DRAG_COEFFICIENT;
  const step = options.step ?? STEP;
  const p = { ...release };
  const v = { ...velocity };
  const omega = (2 * Math.PI * spin.rpm) / 60;

  const samples: FlightSample[] = [{ t: 0, p: { ...p }, rotation: 0 }];
  let t = 0;
  let nextSample = SAMPLE_STEP;
  let bounced = false;

  while (t < MAX_TIME) {
    const previous = { ...p };
    const previousT = t;

    const a = acceleration(v, spin, drag);
    const half = 0.5 * step * step;
    p.x += v.x * step + a.x * half;
    p.y += v.y * step + a.y * half;
    p.z += v.z * step + a.z * half;
    v.x += a.x * step;
    v.y += a.y * step;
    v.z += a.z * step;
    t += step;

    if (p.z <= 0) {
      // 홈플레이트 평면을 지난 만큼 되돌려 정확히 z=0에서 끊는다
      const span = previous.z - p.z;
      const f = span === 0 ? 0 : previous.z / span;
      p.x = previous.x + (p.x - previous.x) * f;
      p.y = previous.y + (p.y - previous.y) * f;
      p.z = 0;
      t = previousT + step * f;
      break;
    }
    // 땅에 닿아도 적분을 멈추지 않는다. 여기서 끊으면 도착 지점이 z=0이
    // 아니게 되어 무회전 궤적과의 변화량 비교가 성립하지 않는다.
    // 바닥에서 튕기는 그림은 렌더 쪽에서 이 표시를 보고 알아서 자른다.
    if (p.y <= BALL_RADIUS) bounced = true;

    if (t >= nextSample) {
      samples.push({ t, p: { ...p }, rotation: omega * t });
      nextSample += SAMPLE_STEP;
    }
  }

  samples.push({ t, p: { ...p }, rotation: omega * t });

  return {
    samples,
    duration: t,
    arrival: { ...p },
    arrivalSpeed: length(v),
    bounced,
  };
}

export interface SimulateOptions {
  /**
   * 항력 계수를 바꿔 끼운다. 0을 넣으면 공기가 없는 세계가 되어 궤적이
   * 포물선 해석해와 정확히 일치한다 — 적분기가 맞는지 보는 가장 확실한 시험.
   */
  dragCoefficient?: number;
  /** 적분 스텝. 절반으로 줄여도 도착점이 같아야 한다 */
  step?: number;
}

export interface PitchThrow {
  release: Vec3;
  /** 초속(m/s) */
  speed: number;
  /** 홈플레이트에서 통과시키고 싶은 지점 */
  target: { x: number; y: number };
  spin: Spin;
}

export interface ThrownPitch extends Flight {
  /** 무회전으로 똑같이 던졌을 때 대비 변화량(m) */
  movement: { horizontal: number; vertical: number };
  /** 무회전 궤적. 리플레이에서 비교용으로 겹쳐 그린다 */
  spinless: Flight;
}

/**
 * 조준점을 목표로 실제로 던진다.
 *
 * 릴리스에서 목표를 직선으로 겨누면 중력과 마그누스 때문에 그만큼 빗나간다.
 * 실제 투수가 하는 것처럼 빗나간 만큼 조준을 밀어 올리는 보정을 몇 번 돌린다 —
 * 네 번이면 mm 단위로 수렴한다.
 */
export function throwPitch({ release, speed, target, spin }: PitchThrow): ThrownPitch {
  const aim = { x: target.x, y: target.y };
  let flight: Flight | null = null;
  let velocity: Vec3 = { x: 0, y: 0, z: -speed };

  for (let i = 0; i < 6; i++) {
    const direction = normalize({
      x: aim.x - release.x,
      y: aim.y - release.y,
      z: -release.z,
    });
    velocity = { x: direction.x * speed, y: direction.y * speed, z: direction.z * speed };
    flight = simulate(release, velocity, spin);
    // 땅에 처박혀도 보정을 멈추지 않는다. 낙차 큰 커브는 첫 시도에서 반드시
    // 처박히고, 그 바운스 지점이 «더 위로 겨눠라»는 신호가 된다.
    aim.x += target.x - flight.arrival.x;
    aim.y += target.y - flight.arrival.y;
  }

  const resolved = flight as Flight;
  // 변화량은 **같은 초기 속도**의 무회전 궤적과 비교해야 의미가 있다
  const spinless = simulate(release, velocity, NO_SPIN);

  return {
    ...resolved,
    spinless,
    movement: {
      horizontal: resolved.arrival.x - spinless.arrival.x,
      vertical: resolved.arrival.y - spinless.arrival.y,
    },
  };
}

/** km/h → m/s */
export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

/** m/s → km/h */
export function msToKmh(ms: number): number {
  return ms * 3.6;
}
