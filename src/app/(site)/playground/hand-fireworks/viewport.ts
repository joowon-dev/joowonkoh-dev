/**
 * 웹캠 프레임과 무대(캔버스) 사이의 좌표 변환.
 *
 * 왜 필요한가: 랜드마크는 **영상 프레임** 기준 0~1이고, 불꽃은 **무대** 위에 그린다.
 * 둘의 가로세로비가 다르면 `object-cover`가 영상을 잘라서 보여주는데, 그 잘린
 * 만큼을 안 빼면 손을 화면 왼쪽 끝으로 옮겼을 때 불꽃이 손보다 먼저 끝에 닿는다.
 * 전체화면으로 들어가면 무대 비율이 확 바뀌므로 이건 반드시 생기는 문제다.
 */

/** 무대 안에서 영상이 실제로 차지하는 사각형. CSS 픽셀. */
export interface CoverRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * `object-fit: cover`가 영상을 놓는 자리. 무대를 꽉 채우도록 키운 뒤 가운데 정렬하고,
 * 남는 쪽은 무대 밖으로 잘려 나간다(그래서 x나 y가 음수가 될 수 있다).
 */
export function coverRect(stageW: number, stageH: number, videoAspect: number): CoverRect {
  if (stageW <= 0 || stageH <= 0 || videoAspect <= 0) return { x: 0, y: 0, w: stageW, h: stageH };

  const stageAspect = stageW / stageH;
  const w = stageAspect > videoAspect ? stageW : stageH * videoAspect;
  const h = stageAspect > videoAspect ? stageW / videoAspect : stageH;
  return { x: (stageW - w) / 2, y: (stageH - h) / 2, w, h };
}

/** 세계 좌표. 화면 높이를 1로 둔다 — firework.ts와 같은 자. */
export interface WorldPoint {
  x: number;
  y: number;
}

/**
 * 영상 프레임 기준 0~1 좌표 → 세계 좌표.
 * 무대 밖으로 잘려 나간 자리를 가리키면 0~1 밖의 값이 나온다. 그대로 둔다 —
 * 화면 밖에서 쏜 불꽃이 화면 안으로 날아 들어오는 건 자연스럽다.
 */
export function toWorld(n: WorldPoint, rect: CoverRect, stageH: number): WorldPoint {
  if (stageH <= 0) return { x: 0, y: 0 };
  return {
    x: (rect.x + n.x * rect.w) / stageH,
    y: (rect.y + n.y * rect.h) / stageH,
  };
}
