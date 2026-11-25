// 트리의 모양 — 방울이 달릴 수 있는 자리가 어디인지. 그림(view.js)과 자리 고르기가 같은 숫자를 본다.
// 화면을 모른다. 좌표는 전부 기준 판(460×560) 위의 px 이다.

export const BOARD = { w: 460, h: 560 }
/** 트리의 가운데 축. */
export const CX = 230
/** 떨어진 방울이 튀는 바닥(눈 더미의 위). */
export const FLOOR = 512
/** 방울의 반지름. */
export const BALL = 9

/** 잎의 층. 위에서 아래로. 각 층은 top 에서 뾰족하고 bottom 에서 half 만큼 벌어진다. */
export const TIERS = [
  { top: 78, bottom: 196, half: 80 },
  { top: 150, bottom: 288, half: 114 },
  { top: 232, bottom: 382, half: 146 },
  { top: 316, bottom: 470, half: 176 },
]

/** 방울을 다는 높이의 범위. 꼭대기 별과 맨 아래 물결 가장자리는 피한다. */
export const HANG = { top: 120, bottom: 452 }
/** 방울의 가운데가 잎 가장자리에서 떨어져 있어야 하는 거리. */
export const EDGE = 16

/** 높이 y 에서 잎이 가운데 축으로부터 벌어진 폭. 잎이 없으면 0. */
export function halfWidthAt(y) {
  let best = 0
  for (const tier of TIERS) {
    if (y < tier.top || y > tier.bottom) continue
    best = Math.max(best, (tier.half * (y - tier.top)) / (tier.bottom - tier.top))
  }
  return best
}

/** (x, y) 에 방울을 달 수 있나 — 잎 안쪽이고 가장자리에서 충분히 들어와 있나. */
export function fits(x, y) {
  if (y < HANG.top || y > HANG.bottom) return false
  return Math.abs(x - CX) <= halfWidthAt(y) - EDGE
}

/** 씨앗 하나로 같은 수열이 나오는 난수(mulberry32). 0 이상 1 미만. */
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 자리 하나를 고를 때 던져 보는 후보의 수. 많을수록 고르게 퍼진다. */
export const CANDIDATES = 60

/**
 * 빈 자리 하나를 고른다. 아무 데나 던져 보고, **이미 달린 것들에서 가장 먼 후보**를 고른다 —
 * 그래서 아무렇게나 흩어져 보이지만 서로 겹치지 않는다.
 * @param {{x:number,y:number}[]} taken 이미 달린 방울들
 * @param {() => number} rng
 */
export function pickSpot(taken, rng) {
  const maxHalf = TIERS[TIERS.length - 1].half
  let best = null
  let bestGap = -1
  let found = 0
  for (let tries = 0; found < CANDIDATES && tries < CANDIDATES * 20; tries++) {
    const x = CX + (rng() * 2 - 1) * maxHalf
    const y = HANG.top + rng() * (HANG.bottom - HANG.top)
    if (!fits(x, y)) continue
    found++
    let gap = Infinity
    for (const other of taken) gap = Math.min(gap, Math.hypot(other.x - x, other.y - y))
    if (gap > bestGap) {
      bestGap = gap
      best = { x: Math.round(x), y: Math.round(y) }
    }
  }
  return best || { x: CX, y: (HANG.top + HANG.bottom) / 2 }
}

/** 꼭대기 별과 기둥. 그림도 이 숫자로 그린다. */
export const STAR = { x: CX, y: 64, r: 24 }
export const TRUNK = { x: CX - 17, y: 462, w: 34, h: 50 }

/**
 * 트리의 몸통을 가로로 썬 네모들 — **잡고 끌 수 있는 데**다. 별, 잎(높이 step 씩), 기둥.
 * 잎의 띠는 그 높이에서 가장 넓은 폭으로 잡는다(끝이 조금 넉넉해도 잡히는 편이 낫다).
 * @returns {{x:number,y:number,w:number,h:number}[]}
 */
export function bodyBands(step = 6) {
  const bands = [{ x: STAR.x - STAR.r, y: STAR.y - STAR.r, w: STAR.r * 2, h: STAR.r * 2 }]
  const top = TIERS[0].top
  const bottom = TIERS[TIERS.length - 1].bottom
  for (let y = top; y < bottom; y += step) {
    const end = Math.min(y + step, bottom)
    const half = Math.max(halfWidthAt(y), halfWidthAt(end))
    if (half > 0) bands.push({ x: CX - half, y, w: half * 2, h: end - y })
  }
  bands.push({ ...TRUNK })
  return bands
}

/** 층 하나의 윤곽(SVG path). 옆은 살짝 안으로 휘고 밑은 물결이다. */
export function tierPath({ top, bottom, half }) {
  const height = bottom - top
  const left = CX - half
  const bowY = top + height * 0.6
  const scallops = Math.max(3, Math.round(half / 26))
  const width = (half * 2) / scallops
  let d = `M ${CX} ${top} Q ${CX - half * 0.46} ${bowY} ${left} ${bottom}`
  for (let i = 1; i <= scallops; i++) {
    d += ` Q ${(left + width * (i - 0.5)).toFixed(1)} ${bottom + 13} ${(left + width * i).toFixed(1)} ${bottom}`
  }
  return `${d} Q ${CX + half * 0.46} ${bowY} ${CX} ${top} Z`
}
