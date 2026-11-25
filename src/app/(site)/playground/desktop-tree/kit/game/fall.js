// 떨어지는 방울 — 줄이 끊어진 방울이 바닥에 튀고 굴러가는 길을 **미리 다 계산한다.**
// 화면은 이 길을 transform 애니메이션 하나로 넘긴다(매 프레임 그리지 않는다). 고정 타임스텝.

/** 계산하는 간격(초). */
export const STEP = 1 / 120
/** 내보내는 간격 — STEP 몇 번에 한 장. 2 면 초당 60장. */
export const SAMPLE = 2

export const GRAVITY = 2200 // px/s²
/** 바닥에 튈 때 남는 속도의 비율. */
export const BOUNCE = 0.46
/** 튈 때 옆으로 가는 속도가 남는 비율. */
export const SCRUB = 0.7
/** 이 속도보다 느리게 튀면 더는 튀지 않고 구른다. */
export const REST = 70
/** 구를 때 1초에 남는 속도의 비율. */
export const ROLL = 0.12
/** 구르다 이보다 느려지면 멈춘 것이다. */
export const STOP = 10
export const MAX_TIME = 2.6

/**
 * @param {{x:number, y:number, vx:number, floor:number, radius:number}} from 방울의 가운데, 옆으로 가는 속도, 바닥의 높이
 * @returns {{frames:{t:number,x:number,y:number,rot:number}[], duration:number, bounces:number[]}}
 *   frames 의 첫 장은 t=0, 마지막 장은 t=duration. bounces 는 바닥에 닿은 뒤 튀어 오른 속도들.
 */
export function fall({ x, y, vx, floor, radius }) {
  const ground = floor - radius
  let vy = 0
  let rot = 0
  let t = 0
  let resting = y >= ground
  const frames = [{ t: 0, x, y, rot: 0 }]
  const bounces = []

  for (let step = 1; t < MAX_TIME; step++) {
    let touched = false // 바닥에 닿은 걸음은 꼭 내보낸다 — 건너뛰면 방울이 허공에서 튀는 것처럼 보인다
    if (resting) {
      vx *= Math.pow(ROLL, STEP)
    } else {
      vy += GRAVITY * STEP
      y += vy * STEP
      if (y >= ground) {
        y = ground
        touched = true
        vy = -vy * BOUNCE
        vx *= SCRUB
        if (-vy < REST) {
          vy = 0
          resting = true
        } else {
          bounces.push(-vy)
        }
      }
    }
    x += vx * STEP
    rot += (vx / radius) * STEP
    t = step * STEP
    const done = resting && Math.abs(vx) < STOP
    if (step % SAMPLE === 0 || touched || done) frames.push({ t, x, y, rot })
    if (done) break
  }
  if (frames[frames.length - 1].t !== t) frames.push({ t, x, y, rot })
  return { frames, duration: t, bounces }
}
