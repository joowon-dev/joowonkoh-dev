// 상태기계 — 「지금 무엇을 하고 싶은가」와 「그래서 어디로 가고 싶은가」.
//
// **어떻게 헤엄치는지는 모른다.** 목표점과 원하는 속력만 내놓고, 거기까지 가는 길은
// swim.js 가 정한다. 둘을 갈라 놓아서 상어가 밥을 지나쳤다가 크게 돌아 오는 움직임이
// 공짜로 나온다 — brain 은 그냥 계속 밥을 가리키고, swim 이 못 꺾을 뿐이다.
//
// 좌표는 화면 짧은 변을 1 로 본 정규 좌표. bounds = { w, h } 로 화면 크기를 받는다.

import {
  CRUISE_MAX, CRUISE_MIN, CRUISE_SPEED, DASH_MULTIPLIER, DASH_SLOW_RANGE, DASH_SLOW_TO,
  DASH_TURN_RATE, EAT_DURATION, EAT_RADIUS, LURK_MAX, LURK_MIN, PROWL_SPEED,
  SATED_DURATION, SATED_SPEED, SPEED_LERP, TURN_RATE, WALL_MARGIN,
} from './constants.js'
import { isHungry } from './hunger.js'
import { bestFood } from './food.js'
import { range } from './rng.js'

export const STATES = ['lurk', 'cruise', 'prowl', 'dash', 'eat', 'sated']

/** 화면 밖으로 이만큼 나가면 「사라졌다」로 본다. 이제는 거기까지 갈 일이 없다. */
const OFF_SCREEN = 0.35

export function createBrain(rng) {
  return {
    state: 'lurk',
    timer: range(rng, LURK_MIN, LURK_MAX),
    /** 에워쌀 때·어슬렁거릴 때 도는 각도. */
    prowlAngle: range(rng, 0, Math.PI * 2),
    /** 어슬렁거릴 때 머무는 쪽. 화면 안이다. */
    lurkAngle: range(rng, 0, Math.PI * 2),
    /**
     * 지금 쫓는 밥의 id. **한 번 정하면 먹거나 사라질 때까지 안 바꾼다.**
     * 매 프레임 「제일 나은 밥」을 다시 고르면, 밥이 여럿일 때 목표가 계속 뒤바뀌어
     * 상어가 그 사이를 맴돌기만 하고 아무것도 못 먹는다. 실제로 10 분에 99 개를
     * 못 먹고 흘려보냈다.
     */
    targetId: null,
  }
}

/**
 * 목표를 화면 안으로 끌어온다.
 *
 * **상어는 화면 밖으로 나가지 않는다.** 나가면 「바탕화면에 산다」가 아니라 「가끔
 * 지나간다」가 되고, 밥을 줘도 한참을 기다려야 한다. 가장자리 띠(WALL_MARGIN) 안에
 * 들어오면 목표를 안쪽으로 밀어서 스스로 크게 선회해 돌아 나오게 한다 —
 * 위치를 억지로 붙잡지 않으므로 벽에 부딪혀 미끄러지는 모양이 안 나온다.
 */
export function keepInside(target, swimmer, bounds) {
  const m = WALL_MARGIN
  let { x, y } = target

  // 목표 자체를 띠 안쪽으로 접는다.
  x = Math.max(m, Math.min(bounds.w - m, x))
  y = Math.max(m, Math.min(bounds.h - m, y))

  // 상어가 이미 띠에 들어와 있으면 그만큼 더 안쪽을 가리킨다. 가까울수록 세게 민다.
  const push = (distance) => Math.max(0, 1 - distance / m)
  x += push(swimmer.x) * m * 1.6
  x -= push(bounds.w - swimmer.x) * m * 1.6
  y += push(swimmer.y) * m * 1.6
  y -= push(bounds.h - swimmer.y) * m * 1.6

  return { x, y }
}

/**
 * 지금 가고 싶은 곳과 속력.
 *
 * @returns {{target: {x,y}, speed: number, turnRate: number}}
 */
export function intent(brain, ctx) {
  const { swimmer, food, bounds } = ctx
  // 먹힘 반경과 몸 절반. 엔진이 종·단계를 보고 준다.
  const reach = ctx.reach ?? EAT_RADIUS
  const center = { x: bounds.w / 2, y: bounds.h / 2 }

  switch (brain.state) {
    case 'lurk': {
      // 평소 상태. **사라지지 않는다** — 제일 흐릴 뿐 화면 어딘가에 늘 있다.
      // 한쪽에서 느리게 맴돌다 순찰 시간이 되면 가로질러 나간다.
      const radius = Math.min(bounds.w, bounds.h) * 0.30
      return {
        target: keepInside({
          x: center.x + Math.cos(brain.lurkAngle) * radius,
          y: center.y + Math.sin(brain.lurkAngle) * radius,
        }, swimmer, bounds),
        speed: CRUISE_SPEED * 0.55,
        turnRate: TURN_RATE,
      }
    }

    case 'cruise': {
      // 지금 향한 쪽으로 곧장 나아간다. 가장자리에 닿으면 keepInside 가 안쪽으로
      // 끌어당겨서 스스로 크게 선회한다 — 화면을 벗어나지 않는다.
      const far = Math.max(bounds.w, bounds.h)
      return {
        target: keepInside({
          x: swimmer.x + Math.cos(swimmer.heading) * far,
          y: swimmer.y + Math.sin(swimmer.heading) * far,
        }, swimmer, bounds),
        speed: CRUISE_SPEED,
        turnRate: TURN_RATE,
      }
    }

    case 'prowl': {
      // 화면 가장자리를 따라 도는 큰 원. 보채는 것이 보이도록 화면 안에 머문다.
      const radius = Math.min(bounds.w, bounds.h) * 0.38
      return {
        target: keepInside({
          x: center.x + Math.cos(brain.prowlAngle) * radius,
          y: center.y + Math.sin(brain.prowlAngle) * radius,
        }, swimmer, bounds),
        speed: PROWL_SPEED,
        turnRate: TURN_RATE,
      }
    }

    case 'dash': {
      // 쫓기로 한 밥이 아직 있으면 그것만 본다.
      const prey = food.find((f) => f.id === brain.targetId) ?? bestFood(food, swimmer)
      // 밥이 방금 사라졌다면 제자리를 가리킨다 — 다음 스텝에서 상태가 바뀐다.
      //
      // **밥 쪽으로는 벽 보정을 걸지 않는다** — 가장자리에 떨어뜨린 밥을 못 먹게 된다.
      // 그래도 화면 밖으로 안 나가는 이유는 **밥이 이미 화면 안으로 당겨져 있기**
      // 때문이다(food.js 의 clampFood). 밥이 갈 수 없는 곳은 상어도 못 간다.
      const full = CRUISE_SPEED * DASH_MULTIPLIER
      if (!prey) {
        return { target: { x: swimmer.x, y: swimmer.y }, speed: full, turnRate: DASH_TURN_RATE }
      }

      // **가까워지면 속도를 줄인다.** 선회 반경은 속력 ÷ 선회 속도라, 전속력으로
      // 달려들면 반경이 먹힘 반경보다 커서 제 선회 원 안쪽의 밥에 영원히 못 닿는다.
      // `slowest` 는 그 반경이 먹힘 반경의 DASH_SLOW_TO 배가 되는 속력이다 —
      // 1 보다 작으므로 **닿는 것이 보장된다.**
      const gap = Math.hypot(prey.x - swimmer.x, prey.y - swimmer.y)
      const slowest = Math.min(full, reach * DASH_SLOW_TO * DASH_TURN_RATE)
      // **감속에 필요한 거리를 더한다.** 속력은 SPEED_LERP 로 천천히 붙고 떨어지므로,
      // 먹힘 반경 근처에서야 줄이기 시작하면 이미 늦어 그대로 지나친다 — 그러면
      // 다시 돌아와 또 지나치는 것을 되풀이한다.
      const brake = (full - slowest) / SPEED_LERP
      const near = reach * DASH_SLOW_RANGE + brake
      const speed = gap >= near
        ? full
        : Math.min(full, Math.max(slowest, full * (gap / near)))

      return { target: { x: prey.x, y: prey.y }, speed, turnRate: DASH_TURN_RATE }
    }

    case 'eat':
      return { target: { x: swimmer.x, y: swimmer.y }, speed: 0, turnRate: TURN_RATE }

    case 'sated':
    default:
      return {
        target: keepInside({
          x: center.x + Math.cos(brain.prowlAngle) * Math.min(bounds.w, bounds.h) * 0.25,
          y: center.y + Math.sin(brain.prowlAngle) * Math.min(bounds.w, bounds.h) * 0.25,
        }, swimmer, bounds),
        speed: SATED_SPEED,
        turnRate: TURN_RATE,
      }
  }
}

/**
 * 한 스텝. 전이만 한다 — 상어를 움직이지 않는다.
 *
 * @param {object} brain
 * @param {{swimmer, food, hunger, bounds, ateThisStep: boolean, rng}} ctx
 * @param {number} dt
 * @returns {object} 새 brain
 */
export function stepBrain(brain, ctx, dt) {
  const { food, hunger, swimmer, bounds, ateThisStep, rng } = ctx
  const next = { ...brain, timer: brain.timer - dt }

  // 도는 각도는 상태와 상관없이 흐른다. 원 위의 목표점이 앞서 가야 상어가 쫓아 돈다.
  next.prowlAngle = brain.prowlAngle + dt * 0.5

  // 먹은 순간은 어떤 규칙보다 먼저다. 쫓던 밥은 없어졌으니 잠금도 푼다.
  if (ateThisStep) {
    return { ...next, state: 'eat', timer: EAT_DURATION, targetId: null }
  }

  // 쫓던 밥이 사라졌으면 잠금을 푼다. 아직 있으면 그대로 둔다.
  if (next.targetId != null && !food.some((f) => f.id === next.targetId)) {
    next.targetId = null
  }

  switch (brain.state) {
    case 'eat':
      if (next.timer <= 0) return { ...next, state: 'sated', timer: SATED_DURATION }
      return next

    case 'dash':
      // 쫓던 밥이 사라졌다(수명이 다했거나). 도로 어슬렁거린다.
      if (food.length === 0) {
        return { ...next, state: 'lurk', timer: lurkDelay(rng), lurkAngle: nearbyAngle(swimmer, bounds) }
      }
      // 쫓던 것이 사라졌으면 남은 것 중에서 다시 고른다.
      if (next.targetId == null) next.targetId = lockOn(next, food, swimmer)
      return next

    case 'sated':
      if (food.length > 0) return { ...next, state: 'dash', targetId: lockOn(next, food, swimmer) }
      if (next.timer <= 0) return { ...next, state: 'lurk', timer: lurkDelay(rng), lurkAngle: nearbyAngle(swimmer, bounds) }
      return next

    case 'prowl':
      if (food.length > 0) return { ...next, state: 'dash', targetId: lockOn(next, food, swimmer) }
      if (!isHungry(hunger)) return { ...next, state: 'lurk', timer: lurkDelay(rng), lurkAngle: nearbyAngle(swimmer, bounds) }
      return next

    case 'cruise':
      if (food.length > 0) return { ...next, state: 'dash', targetId: lockOn(next, food, swimmer) }
      if (isHungry(hunger)) return { ...next, state: 'prowl' }
      // **화면 밖으로 나가서 끝나지 않는다** — 정해진 시간만큼 돌다 도로 어슬렁거린다.
      if (next.timer <= 0) return { ...next, state: 'lurk', timer: lurkDelay(rng), lurkAngle: nearbyAngle(swimmer, bounds) }
      return next

    case 'lurk':
    default:
      if (food.length > 0) return { ...next, state: 'dash', targetId: lockOn(next, food, swimmer) }
      if (isHungry(hunger)) return { ...next, state: 'prowl' }
      if (next.timer <= 0) return { ...next, state: 'cruise', timer: range(rng, CRUISE_MIN, CRUISE_MAX) }
      return next
  }
}

/** 쫓을 밥을 정한다. **한 번 정하면 먹거나 사라질 때까지 안 바꾼다.** */
function lockOn(brain, food, swimmer) {
  if (brain.targetId != null && food.some((f) => f.id === brain.targetId)) return brain.targetId
  const prey = bestFood(food, swimmer)
  return prey ? prey.id : null
}

export function lurkDelay(rng) {
  return range(rng, LURK_MIN, LURK_MAX)
}

/** 화면 밖으로 충분히 나갔는가. 이제는 거기까지 갈 일이 없다. */
export function isOffScreen(point, bounds) {
  return point.x < -OFF_SCREEN || point.x > bounds.w + OFF_SCREEN
    || point.y < -OFF_SCREEN || point.y > bounds.h + OFF_SCREEN
}

/** 어슬렁거릴 쪽 — 지금 있는 쪽. 화면 안이다. */
function nearbyAngle(point, bounds) {
  return Math.atan2(point.y - bounds.h / 2, point.x - bounds.w / 2)
}
