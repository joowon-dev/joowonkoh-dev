/**
 * 포수 눈높이 카메라와 원근 투영.
 *
 * 공이 커지는 속도가 이 페이지의 연출 전부다. 16.5m에서는 몇 픽셀이다가
 * 마지막 3m에서 화면을 채우는데, 그 가속은 흉내내는 게 아니라 제대로 된
 * 투영에서 공짜로 따라 나온다. 그래서 여기를 따로 떼어 시험한다.
 *
 * 좌표계는 flight.ts와 같다 — 원점은 홈플레이트 앞 꼭짓점의 지면.
 */

import type { Vec3 } from "./flight";

/**
 * 쭈그려 앉은 포수의 눈.
 *
 * 홈플레이트는 앞 꼭짓점부터 43cm 깊이라 뒤끝이 z=-0.43이고, 포수 머리는
 * 거기서 다시 한 뼘쯤 뒤에 있다. 그래서 z=-1.2다. 처음에 -0.7로 잡았더니
 * 스트라이크존이 코앞이라 화면 아래로 잘려 나갔다.
 */
export const CATCHER_EYE: Vec3 = { x: 0, y: 1.05, z: -1.2 };
/** 수직 화각. 넓히면 다 보이는 대신 공이 작아진다 */
export const FIELD_OF_VIEW = (55 * Math.PI) / 180;
/** 이보다 가까워지면 투영이 발산한다 */
const NEAR = 0.05;

export interface Camera {
  eye: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  tanHalfFov: number;
  aspect: number;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z);
  if (l === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * 눈과 바라볼 지점으로 카메라를 만든다.
 *
 * `right`를 세계 위쪽과의 외적으로 뽑기 때문에 화면이 기울지 않는다 —
 * 포수는 고개를 갸웃하지 않는다.
 */
export function makeCamera(
  eye: Vec3,
  lookAt: Vec3,
  aspect: number,
  fov: number = FIELD_OF_VIEW,
): Camera {
  const forward = normalize(sub(lookAt, eye));
  const right = normalize(cross({ x: 0, y: 1, z: 0 }, forward));
  const up = cross(forward, right);
  return { eye, forward, right, up, aspect, tanHalfFov: Math.tan(fov / 2) };
}

export interface Projected {
  /** 화면 좌표. 가로세로 모두 -1~1, 중앙이 0 */
  x: number;
  y: number;
  /** 카메라 정면 축으로 잰 거리(m). 뒤에 있으면 음수 */
  depth: number;
}

/** 카메라 뒤에 있거나 너무 가까우면 null */
export function project(camera: Camera, p: Vec3): Projected | null {
  const d = sub(p, camera.eye);
  const depth = dot(d, camera.forward);
  if (depth <= NEAR) return null;

  const h = dot(d, camera.right);
  const v = dot(d, camera.up);
  const scale = depth * camera.tanHalfFov;
  return { x: h / (scale * camera.aspect), y: v / scale, depth };
}

/**
 * 구가 화면에서 차지하는 반지름. 세로 -1~1 기준이다.
 *
 * `radius / depth`로 대충 잡지 않고 `asin`으로 각반지름을 낸다. 공이 코앞에
 * 왔을 때 — 이 페이지에서 가장 중요한 순간이다 — 둘이 눈에 띄게 갈린다.
 */
export function projectedRadius(camera: Camera, p: Vec3, radius: number): number {
  const d = sub(p, camera.eye);
  const distance = Math.hypot(d.x, d.y, d.z);
  if (distance <= radius) return Infinity;
  return Math.tan(Math.asin(radius / distance)) / camera.tanHalfFov;
}

/** 포수 시점 기본 카메라. 마운드의 릴리스 높이쯤을 본다 */
export function catcherCamera(aspect: number): Camera {
  return makeCamera(CATCHER_EYE, { x: 0, y: 1.55, z: 16.5 }, aspect);
}
