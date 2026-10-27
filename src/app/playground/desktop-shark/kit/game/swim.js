// 조향 — 「이 방향으로 가고 있는데 저기로 가고 싶다」를 한 스텝의 움직임으로 바꾼다.
//
// **상태를 모른다. 밥도 모른다.** 목표점 하나와 원하는 속력만 받는다.
// 그래서 상어가 밥을 지나쳤다가 크게 선회해 돌아오는 움직임이 따로 짜지 않아도 나온다 —
// 방향을 한 번에 못 꺾는다는 성질 하나에서 전부 나온다.
//
// 좌표는 화면 짧은 변을 1 로 보는 정규 좌표다. 픽셀은 그리는 쪽이 안다.

import { SPEED_LERP, TURN_RATE } from './constants.js'

/** 각도를 (-π, π] 로 접는다. 접지 않으면 「오른쪽으로 350°」를 돌게 된다. */
export function wrapAngle(angle) {
  let a = angle
  while (a > Math.PI) a -= Math.PI * 2
  while (a <= -Math.PI) a += Math.PI * 2
  return a
}

/** 새 상어. */
export function createSwimmer(x, y, heading, speed = 0) {
  return { x, y, heading, speed }
}

/**
 * 한 스텝.
 *
 * @param {{x,y,heading,speed}} swimmer
 * @param {{x,y}} target 가고 싶은 점
 * @param {number} desiredSpeed 내고 싶은 속력
 * @param {number} dt 초
 * @param {number} turnRate 초당 최대 선회 각도(라디안)
 * @returns {{x,y,heading,speed}} 새 상어 (원본은 안 건드린다)
 */
export function step(swimmer, target, desiredSpeed, dt, turnRate = TURN_RATE) {
  const wanted = Math.atan2(target.y - swimmer.y, target.x - swimmer.x)
  const diff = wrapAngle(wanted - swimmer.heading)

  // **한 스텝에 돌 수 있는 각도에 상한이 있다.** 이 한 줄이 상어를 물고기로 만든다.
  const maxTurn = turnRate * dt
  const turn = Math.max(-maxTurn, Math.min(maxTurn, diff))
  const heading = wrapAngle(swimmer.heading + turn)

  // 속력은 천천히 붙는다. 갑자기 최고 속력이 되면 멈칫하는 순간이 사라진다.
  const speed = swimmer.speed + (desiredSpeed - swimmer.speed) * Math.min(1, SPEED_LERP * dt)

  return {
    x: swimmer.x + Math.cos(heading) * speed * dt,
    y: swimmer.y + Math.sin(heading) * speed * dt,
    heading,
    speed,
  }
}

/** 두 점 사이 거리. */
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
