export type Viewport = { w: number; h: number };
export type Projected = { screenX: number; screenY: number; scale: number };

export const DEPTH_REF = 800;
export const VANISH_Y_RATIO = 0.32;
export const GROUND_Y_RATIO = 0.82;

// x: 전진 거리(px, depth), y: 물리 높이(px, y-UP). vp: 화면 크기.
export function project(x: number, y: number, vp: Viewport): Projected {
  const depth = Math.max(0, x);
  const scale = DEPTH_REF / (DEPTH_REF + depth);
  const vanishY = vp.h * VANISH_Y_RATIO;
  const groundBaseY = vp.h * GROUND_Y_RATIO;
  const screenX = vp.w / 2;
  const screenY =
    groundBaseY + (vanishY - groundBaseY) * (1 - scale) - y * scale;
  return { screenX, screenY, scale };
}
