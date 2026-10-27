/**
 * 3D 폴리라인을 화면에 그릴 띠로 바꾼다. 궤적 자국과 스트라이크존이 쓴다.
 *
 * `gl.LINES`를 안 쓴다. WebGL의 선 굵기는 대부분의 브라우저에서 1픽셀로
 * 고정이라 궤적이 실오라기처럼 보인다. 직접 사각형을 이어 붙이면 굵기도
 * 정하고 끝으로 갈수록 옅어지게 만들 수도 있다.
 */

import type { Camera } from "./camera";
import { project } from "./camera";
import type { Vec3 } from "./flight";

export interface Ribbon {
  /** TRIANGLE_STRIP용 화면 좌표 쌍 */
  positions: Float32Array;
  /** 정점별 알파 */
  alphas: Float32Array;
  /** 정점 개수 */
  count: number;
}

export interface RibbonOptions {
  /** 화면 세로 -1~1 기준 반폭 */
  width: number;
  /** 점 순서(0~1)를 받아 알파를 준다. 없으면 전부 불투명 */
  fade?: (progress: number) => number;
}

/**
 * 카메라 뒤로 넘어간 점에서 띠를 끊는다.
 *
 * 안 끊고 이으면 화면 반대편까지 가로지르는 선 하나가 생긴다 — 릴리스
 * 직후처럼 공이 시야 밖에서 들어올 때 실제로 나오는 그림이다.
 */
export function buildRibbons(
  camera: Camera,
  points: readonly Vec3[],
  { width, fade }: RibbonOptions,
): Ribbon[] {
  const runs: { x: number; y: number; progress: number }[][] = [];
  let run: { x: number; y: number; progress: number }[] = [];

  points.forEach((p, i) => {
    const screen = project(camera, p);
    if (!screen) {
      if (run.length > 1) runs.push(run);
      run = [];
      return;
    }
    run.push({ x: screen.x, y: screen.y, progress: points.length < 2 ? 1 : i / (points.length - 1) });
  });
  if (run.length > 1) runs.push(run);

  return runs.map((path) => {
    const positions = new Float32Array(path.length * 4);
    const alphas = new Float32Array(path.length * 2);

    for (let i = 0; i < path.length; i++) {
      const previous = path[Math.max(0, i - 1)];
      const next = path[Math.min(path.length - 1, i + 1)];

      // 화면비를 곱해 실제로 보이는 비율에서 방향을 잰다. 안 그러면 가로로
      // 흐르는 구간에서만 띠가 얇아진다
      let dx = (next.x - previous.x) * camera.aspect;
      let dy = next.y - previous.y;
      const length = Math.hypot(dx, dy);
      if (length < 1e-9) {
        dx = 1;
        dy = 0;
      } else {
        dx /= length;
        dy /= length;
      }

      // 직각으로 눕힌 뒤 화면비를 되돌린다
      const offsetX = (-dy * width) / camera.aspect;
      const offsetY = dx * width;

      positions[i * 4 + 0] = path[i].x + offsetX;
      positions[i * 4 + 1] = path[i].y + offsetY;
      positions[i * 4 + 2] = path[i].x - offsetX;
      positions[i * 4 + 3] = path[i].y - offsetY;

      const alpha = fade ? fade(path[i].progress) : 1;
      alphas[i * 2] = alpha;
      alphas[i * 2 + 1] = alpha;
    }

    return { positions, alphas, count: path.length * 2 };
  });
}

/** 3D 공간의 닫힌 사각형(스트라이크존)을 띠로 */
export function rectangleLoop(
  left: number,
  right: number,
  bottom: number,
  top: number,
  z: number,
): Vec3[] {
  return [
    { x: left, y: bottom, z },
    { x: right, y: bottom, z },
    { x: right, y: top, z },
    { x: left, y: top, z },
    { x: left, y: bottom, z },
  ];
}
