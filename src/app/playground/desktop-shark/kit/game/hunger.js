// 배고픔. **상어를 모른다.** 시각 두 개를 받아 0..1 을 준다.
//
// 앱이 꺼져 있던 시간도 그대로 흐른다 — 마지막으로 먹인 벽시계 시각에서 재기 때문이다.
// 프레임에서 누적하면 껐다 켠 시간이 사라져 「하루 만에 켜니 배고파 있다」가 안 된다.

import { HUNGER_FULL_SECONDS, PROWL_THRESHOLD } from './constants.js'

/**
 * @param {number|null} lastFedAt 마지막으로 먹인 시각 (ms). 한 번도 안 먹였으면 null
 * @param {number} now 지금 (ms)
 * @returns {number} 0(배부름) .. 1(끝까지 배고픔)
 */
export function hungerAt(lastFedAt, now) {
  // 한 번도 안 먹인 상어는 배고픈 채로 만난다. 그래야 첫 밥이 사건이 된다.
  if (lastFedAt == null) return 1

  const elapsed = (now - lastFedAt) / 1000
  if (elapsed <= 0) return 0
  return Math.min(1, elapsed / HUNGER_FULL_SECONDS)
}

/** 보챌 만큼 배고픈가. */
export function isHungry(hunger) {
  return hunger >= PROWL_THRESHOLD
}

/** 메뉴바에 적을 한 마디. */
export function hungerLabel(hunger) {
  if (hunger >= 0.95) return '굶주림'
  if (hunger >= PROWL_THRESHOLD) return '배고픔'
  if (hunger >= 0.35) return '출출함'
  return '배부름'
}
