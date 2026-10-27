// 떨어진 밥들. **상어의 상태를 모른다.** 가라앉고, 늙고, 먹히면 사라진다.

import {
  EAT_RADIUS, FOOD_FLOOR, FOOD_INSET, FOOD_KINDS, FOOD_LIFETIME, FOOD_SINK_SPEED, MAX_FOOD,
} from './constants.js'

/**
 * 밥 하나. id 는 그리는 쪽이 흔들림 위상을 고정하는 데 쓴다.
 * kind 는 'big'(클릭) 또는 'small'(타자).
 */
export function createFood(id, x, y, kind = 'big') {
  const spec = FOOD_KINDS[kind] ?? FOOD_KINDS.big
  return { id, x, y, kind, value: spec.value, radius: spec.radius, age: 0 }
}

/**
 * 밥이 놓일 수 있는 자리로 당긴다. **테두리에 딱 붙지 않는다** — 돌진한 상어가
 * 지나치면서 화면 밖으로 밀려 나간다. 바닥은 더 넉넉히 띄운다(가라앉으니까).
 */
export function clampFood(x, y, bounds) {
  return {
    x: Math.max(FOOD_INSET, Math.min(bounds.w - FOOD_INSET, x)),
    y: Math.max(FOOD_INSET, Math.min(bounds.h - FOOD_FLOOR, y)),
  }
}

/**
 * 밥을 하나 떨어뜨린다. 이미 가득이면 **안 떨어뜨린다** —
 * 오래된 것을 밀어내면 상어가 쫓던 밥이 발밑에서 사라진다.
 */
export function dropFood(list, id, x, y, kind = 'big', bounds = { w: 1, h: 1 }) {
  if (list.length >= MAX_FOOD) return list
  const at = clampFood(x, y, bounds)
  return [...list, createFood(id, at.x, at.y, kind)]
}

/**
 * 한 스텝. 가라앉히고 늙히고, 수명이 다한 것을 버린다.
 *
 * **바닥에서 멈춘다.** 화면 밖으로 내려가게 두면 상어가 따라 내려가서 안 보이는 데서
 * 먹는다 — 돌진에는 벽 보정을 안 걸므로 밥이 곧 상어가 갈 수 있는 가장 아래다.
 */
export function stepFood(list, dt, bounds = { w: 1, h: 1 }) {
  return list
    .map((f) => ({ ...f, ...clampFood(f.x, f.y + FOOD_SINK_SPEED * dt, bounds), age: f.age + dt }))
    .filter((f) => f.age < FOOD_LIFETIME)
}

/**
 * 상어가 다음으로 노릴 밥.
 *
 * **가까운 것이 아니라 「가까우면서 값진 것」을 고른다.** 거리만 보면 타자로 떨어진
 * 작은 밥이 화면에 흩어져 있는 동안 큰 밥을 영영 안 먹는다. 큰 밥을 조금 더 당겨 본다.
 */
export function bestFood(list, point) {
  let best = null
  let bestScore = Infinity
  for (const f of list) {
    const d = Math.hypot(f.x - point.x, f.y - point.y)
    const score = d / (f.value ?? 1) ** 0.4
    if (score < bestScore) {
      bestScore = score
      best = f
    }
  }
  return best
}

/** 상어에게 제일 가까운 밥. 없으면 null. 먹힘 판정에 쓴다. */
export function nearestFood(list, point) {
  let best = null
  let bestDistance = Infinity
  for (const f of list) {
    const d = Math.hypot(f.x - point.x, f.y - point.y)
    if (d < bestDistance) {
      bestDistance = d
      best = f
    }
  }
  return best
}

/**
 * 입이 닿았는가. 반경은 상어마다 다르다 — 큰 상어는 입도 크다.
 * 안 주면 최소 반경을 쓴다.
 */
export function canEat(food, mouth, radius = EAT_RADIUS) {
  if (!food) return false
  return Math.hypot(food.x - mouth.x, food.y - mouth.y) <= Math.max(EAT_RADIUS, radius)
}

/** 먹었다. 그 하나만 뺀다. */
export function removeFood(list, id) {
  return list.filter((f) => f.id !== id)
}

/** 사라지기 직전에는 흐려진다. 마지막 3초. */
export function foodAlpha(food) {
  const left = FOOD_LIFETIME - food.age
  if (left >= 3) return 1
  return Math.max(0, left / 3)
}
