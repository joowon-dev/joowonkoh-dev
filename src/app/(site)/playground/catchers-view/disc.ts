/**
 * 공이 홈플레이트를 지나간 자리에 찍는 반투명 원판.
 *
 * 궤적선과 같은 파이프라인(TRIANGLE_STRIP)을 쓴다. 스트립으로 부채꼴을 그리려면
 * 중심과 테두리를 번갈아 넣으면 된다 — 그러면 삼각형 절반은 두 꼭짓점이 겹친
 * 납작한 것이라 아무것도 안 그리고, 나머지 절반이 원을 채운다. 원 하나 그리자고
 * 새 셰이더와 새 인덱스 버퍼를 만드는 것보다 이쪽이 싸다.
 *
 * 가운데를 진하게, 테두리를 옅게 둔다. 균일하게 채우면 «공이 여기 박혔다»가
 * 아니라 «여기에 스티커가 붙었다»로 보인다.
 */

import { project, projectedRadius, type Camera } from "./camera";
import type { Vec3 } from "./flight";

/** 테두리 점 개수. 24개면 화면에서 원과 다각형을 구별 못 한다 */
export const DISC_SEGMENTS = 24;
/** 테두리 알파. 0이면 가장자리가 사라져 지름이 줄어 보인다 */
export const RIM_ALPHA = 0.45;

export interface Disc {
  /** NDC 좌표 쌍 */
  positions: Float32Array;
  alphas: Float32Array;
  count: number;
}

/**
 * 월드 좌표의 원판 하나를 화면 좌표 스트립으로 만든다.
 * 카메라 뒤에 있거나 눈에 닿을 만큼 가까우면 null.
 */
export function buildDisc(
  camera: Camera,
  center: Vec3,
  radius: number,
  segments: number = DISC_SEGMENTS,
): Disc | null {
  const middle = project(camera, center);
  if (!middle) return null;

  const r = projectedRadius(camera, center, radius);
  if (!Number.isFinite(r) || r <= 0) return null;

  // 세로 반지름이 기준이다. 가로는 화면비만큼 눌러야 원으로 보인다
  const rx = r / camera.aspect;

  const count = (segments + 1) * 2;
  const positions = new Float32Array(count * 2);
  const alphas = new Float32Array(count);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const at = i * 4;
    positions[at] = middle.x;
    positions[at + 1] = middle.y;
    positions[at + 2] = middle.x + Math.cos(angle) * rx;
    positions[at + 3] = middle.y + Math.sin(angle) * r;
    alphas[i * 2] = 1;
    alphas[i * 2 + 1] = RIM_ALPHA;
  }

  return { positions, alphas, count };
}
