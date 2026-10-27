/**
 * 1열 좌석의 시점.
 *
 * 행렬 수학을 전부 여기에 모았다. 눈이 어디 있고 어디를 보는지만 정하면
 * 화면에 보이는 왜곡은 전부 투영이 알아서 만든다.
 */

import { screenPoint, type Vec3 } from "./screen";

/** 열 하나짜리 극장이다. 1열 정중앙에 앉는다 */
export const SEAT = {
  /**
   * 스크린 중앙 평면에서 뒤로 물러난 거리. 1열은 이만큼밖에 못 물러난다.
   *
   * 6m로 잡았다가 4.5m로 당겼다. 6m에서는 기하가 맞는데도 화면이 얌전했다 —
   * 스크린 위아래의 거리 차가 2배밖에 안 나서 얼굴이 거의 안 눌린다.
   * 실제 아이맥스 1열이 스크린에서 4~5m다.
   */
  distance: 4.5,
  /** 앉은 눈높이 */
  eyeHeight: 1.4,
} as const;

export const EYE: Vec3 = [0, SEAT.eyeHeight, SEAT.distance];

export const VIEW = {
  /**
   * 세로 화각.
   *
   * 100°로 잡았다가 66°로 좁혔다. 넓은 화각은 «다 보이게» 만들지만 그 대가로
   * 전부 작아진다. 스크린 위아래 끝이 프레임 안에 얌전히 들어오는 순간
   * 그건 1열이 아니라 그냥 큰 화면을 멀리서 보는 그림이다.
   *
   * 66°면 스크린이 위아래로 프레임을 넘쳐서 끝이 안 보인다. 1열의 정체가
   * «한눈에 안 들어온다»니까 이쪽이 맞다. 상영관 바닥·무대턱·측벽은
   * 기본 시야에서 밀려나지만, 고개를 내리거나 돌리면 그대로 있다.
   */
  fovY: (66 * Math.PI) / 180,
  /**
   * 기본 앙각. 스크린 한복판이 아니라 얼굴이 걸리는 높이를 향한다.
   *
   * 원근이 극단적이라 스크린 위쪽 절반은 시야에서 16°밖에 차지하지 않는다.
   * 기하학적 중앙을 보면 정작 얼굴은 저 위에 작게 붙는다.
   */
  basePitch: (42 * Math.PI) / 180,
  /** 고개 좌우 한계 */
  yawLimit: (40 * Math.PI) / 180,
  /** 고개 상하 한계. 바닥을 보거나 뒤로 넘어가지 않을 만큼 */
  pitchMin: (-6 * Math.PI) / 180,
  pitchMax: (80 * Math.PI) / 180,
  near: 0.05,
  far: 200,
} as const;

export interface Look {
  /** 오른쪽이 양수 */
  yaw: number;
  /** 위쪽이 양수 */
  pitch: number;
}

export const BASE_LOOK: Look = { yaw: 0, pitch: VIEW.basePitch };

export function clampLook(look: Look): Look {
  return {
    yaw: clamp(look.yaw, -VIEW.yawLimit, VIEW.yawLimit),
    pitch: clamp(look.pitch, VIEW.pitchMin, VIEW.pitchMax),
  };
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/** 시선 방향 단위벡터. yaw=0, pitch=0이면 스크린 정면(-Z) */
export function lookDirection({ yaw, pitch }: Look): Vec3 {
  const cp = Math.cos(pitch);
  return [Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp];
}

/** 눈에서 어떤 점을 볼 때의 앙각(라디안). 위를 보면 양수 */
export function elevationTo(point: Vec3, eye: Vec3 = EYE): number {
  const dx = point[0] - eye[0];
  const dy = point[1] - eye[1];
  const dz = point[2] - eye[2];
  return Math.atan2(dy, Math.hypot(dx, dz));
}

/** 눈에서 어떤 점을 볼 때 정면에서 벌어진 좌우 각(라디안) */
export function azimuthTo(point: Vec3, eye: Vec3 = EYE): number {
  const dx = point[0] - eye[0];
  const dz = point[2] - eye[2];
  // 정면이 -Z라 그쪽을 0으로 놓는다
  return Math.atan2(dx, -dz);
}

// ── 행렬. WebGL이 쓰는 열 우선(column-major) 16칸 배열 ──────────────

export type Mat4 = Float32Array;

export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}

export interface CameraBasis {
  right: Vec3;
  up: Vec3;
  forward: Vec3;
}

/**
 * 카메라 축 세 개.
 *
 * 위쪽 벡터를 월드 Y에서 만든다. 고개를 기울이는 조작이 없어서 문제없고,
 * 화면이 미묘하게 기우는 것만큼 어지러운 게 없다.
 */
export function cameraBasis(look: Look): CameraBasis {
  const forward = lookDirection(look);
  const [fx, fy, fz] = forward;
  // right = normalize(cross(forward, (0,1,0)))
  const sl = Math.hypot(fz, fx) || 1;
  const right: Vec3 = [-fz / sl, 0, fx / sl];
  // up = cross(right, forward)
  const up: Vec3 = [
    right[1] * fz - right[2] * fy,
    right[2] * fx - right[0] * fz,
    right[0] * fy - right[1] * fx,
  ];
  return { right, up, forward };
}

export function lookAtMatrix(eye: Vec3, look: Look): Mat4 {
  const {
    right: [s0, s1, s2],
    up: [u0, u1, u2],
    forward: [fx, fy, fz],
  } = cameraBasis(look);

  const m = new Float32Array(16);
  m[0] = s0;
  m[4] = s1;
  m[8] = s2;
  m[1] = u0;
  m[5] = u1;
  m[9] = u2;
  m[2] = -fx;
  m[6] = -fy;
  m[10] = -fz;
  m[12] = -(s0 * eye[0] + s1 * eye[1] + s2 * eye[2]);
  m[13] = -(u0 * eye[0] + u1 * eye[1] + u2 * eye[2]);
  m[14] = fx * eye[0] + fy * eye[1] + fz * eye[2];
  m[15] = 1;
  return m;
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[row + k * 4] * b[k + col * 4];
      out[row + col * 4] = sum;
    }
  }
  return out;
}

export function identity(): Mat4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** 점을 행렬로 통과시켜 클립 좌표 [x, y, z, w]를 낸다 */
export function transformPoint(m: Mat4, p: Vec3): [number, number, number, number] {
  const [x, y, z] = p;
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
    m[3] * x + m[7] * y + m[11] * z + m[15],
  ];
}

/**
 * 클립 좌표를 화면 좌표로. w가 0 이하면 카메라 뒤라 화면에 없다.
 * 그 경우 null을 준다 — 나눠버리면 뒤에 있는 점이 앞에 있는 것처럼 보인다.
 */
export function toNdc(clip: [number, number, number, number]): [number, number] | null {
  const w = clip[3];
  if (w <= 1e-6) return null;
  return [clip[0] / w, clip[1] / w];
}

export function viewProjection(aspect: number, look: Look, eye: Vec3 = EYE): Mat4 {
  return multiply(perspective(VIEW.fovY, aspect, VIEW.near, VIEW.far), lookAtMatrix(eye, look));
}

/**
 * 영사기 흔들림(게이트 위블)을 스크린 자체에 건다.
 *
 * 카메라를 흔들면 관객이 고개를 떠는 것이 되어 상영관 벽까지 같이 흔들린다.
 * 실제로 떠는 건 필름이라, 스크린에 걸린 그림만 흔들려야 한다.
 */
export const WEAVE = {
  /** 스크린 높이 대비 이동 폭. 실제 영사기가 이 정도 뜬다 */
  shift: 0.0012,
  /** 회전 폭(라디안) */
  roll: 0.0004,
} as const;

export function screenModelMatrix(weave: { x: number; y: number; roll: number }): Mat4 {
  const center = screenPoint(0.5, 0.5);
  const a = weave.roll * WEAVE.roll;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = weave.x * WEAVE.shift * 16;
  const dy = weave.y * WEAVE.shift * 16;

  // 스크린 중앙을 축으로 Z축 회전 후 평행이동. 열 우선으로 직접 채운다
  const m = identity();
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  m[12] = center[0] - (c * center[0] - s * center[1]) + dx;
  m[13] = center[1] - (s * center[0] + c * center[1]) + dy;
  return m;
}
