// 받는 쪽 — 쏜 세기·각도로 어디서 들어와 어디에 꽂히는지, 날아오는 길까지.
//
// 내 화면 오른쪽 밖이 친구 화면 왼쪽인 것처럼: 오른쪽으로 쏘면 친구 화면 왼쪽에서 들어온다.
// 거의 수직이면 위에서 떨어진다. 세기는 「들어온 가장자리에서 얼마나 깊이」다.
// 같은 쪽지는 언제나 같은 자리 — 흔들림의 씨는 쪽지 id 다.
import { rng } from './rng.js'

/** 꽂히는 자리가 room 가장자리에서 떨어져 있는 거리(px). */
export const MARGIN = 40
/** 이미 꽂힌 화살과 이보다 가까우면 옆으로 민다. */
export const SPACING = 60
const FRAMES = 24
/** |cos| 가 이보다 작으면 위에서 떨어진다. */
const VERTICAL = 0.2

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function landing({ power, angle, seed, room, taken = [] }) {
  const r = rng(seed)
  const j1 = r() * 2 - 1
  const j2 = r() * 2 - 1
  const p = clamp(Number(power) || 0, 0, 1)
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const elevation = Math.atan2(Math.abs(s), Math.abs(c)) / (Math.PI / 2) // 0 수평 … 1 수직

  const side = Math.abs(c) < VERTICAL ? 'top' : c > 0 ? 'left' : 'right'
  let x, y
  if (side === 'top') {
    x = room.x + room.w * (0.5 + c * 1.6 + j1 * 0.06)
    y = room.y + room.h * (0.1 + 0.75 * p + j2 * 0.04)
  } else {
    const depth = 0.06 + 0.84 * p + j1 * 0.03
    x = side === 'left' ? room.x + room.w * depth : room.x + room.w * (1 - depth)
    y = room.y + room.h * (0.2 + 0.55 * (1 - elevation) + j2 * 0.06)
  }

  const lo = { x: room.x + MARGIN, y: room.y + MARGIN }
  const hi = { x: room.x + room.w - MARGIN, y: room.y + room.h - MARGIN }
  const inside = (pt) => ({ x: clamp(pt.x, lo.x, hi.x), y: clamp(pt.y, lo.y, hi.y) })
  const crowded = (pt) => taken.some((t) => Math.hypot(t.x - pt.x, t.y - pt.y) < SPACING)

  // 자리가 차 있으면 아래로 한 칸씩, 바닥에 닿으면 위로 돌아가 옆으로 조금. 다 차 있으면 처음 자리.
  const first = inside({ x, y })
  let to = first
  const rows = Math.max(1, Math.floor((hi.y - lo.y) / (SPACING + 10)))
  for (let k = 1; crowded(to) && k <= rows * 6; k++) {
    const col = Math.floor(k / rows)
    const row = k % rows
    const dir = side === 'right' ? -1 : 1
    to = inside({
      x: first.x + dir * col * (SPACING + 10),
      y: lo.y + ((first.y - lo.y + row * (SPACING + 10)) % Math.max(1, hi.y - lo.y)),
    })
  }
  if (crowded(to)) to = first

  let from
  if (side === 'top') {
    from = { x: to.x - c * 400, y: room.y - 160 }
  } else {
    const rise = (0.12 + 0.3 * elevation) * room.h
    from = { x: side === 'left' ? room.x - 160 : room.x + room.w + 160, y: to.y - rise }
  }
  const arc = 60 + 140 * (1 - p) // 약하게 쏜 것일수록 높이 떠서 온다
  const ctrl = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - arc }

  const frames = []
  for (let i = 0; i <= FRAMES; i++) {
    const t = i / FRAMES
    const u = 1 - t
    const px = u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x
    const py = u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y
    const vx = 2 * u * (ctrl.x - from.x) + 2 * t * (to.x - ctrl.x)
    const vy = 2 * u * (ctrl.y - from.y) + 2 * t * (to.y - ctrl.y)
    frames.push({ x: px, y: py, rot: (Math.atan2(vy, vx) * 180) / Math.PI })
  }
  frames[FRAMES] = { ...frames[FRAMES], x: to.x, y: to.y }

  return { side, from, to, tilt: frames[FRAMES].rot, frames, duration: Math.round(1100 - 450 * p) }
}
