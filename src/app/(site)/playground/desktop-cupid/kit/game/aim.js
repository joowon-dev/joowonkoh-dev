// 활 — 당긴 벡터(화면 좌표, y 는 아래로)를 세기와 쏘는 방향으로.
// 쏘는 방향은 당긴 방향의 반대다. angle 은 수학 좌표(오른쪽 0, 위가 +π/2)의 라디안.

/** 이보다 덜 당기면 안 쏜다(살짝 눌렀다 뗀 것). */
export const MIN_PULL = 24
/** 이만큼 당기면 세기 1. */
export const MAX_PULL = 220
/** 아래로는 못 쏜다 — 수평에서 이만큼 위로 눌러 둔다. */
const FLOOR = (10 * Math.PI) / 180

export function aim(dx, dy) {
  const pull = Math.hypot(dx, dy)
  if (pull < MIN_PULL) return null
  const power = Math.min(1, (pull - MIN_PULL) / (MAX_PULL - MIN_PULL))
  let angle = Math.atan2(dy, -dx) // 쏘는 벡터 (-dx, -dy) 를 y 위로 뒤집은 것
  if (angle < FLOOR || angle > Math.PI - FLOOR) {
    angle = Math.cos(angle) >= 0 ? FLOOR : Math.PI - FLOOR
  }
  return { power, angle, pull }
}
