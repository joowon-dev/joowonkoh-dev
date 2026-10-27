// 시드 난수. Math.random() 을 쓰면 같은 각본이 매번 다른 쇼가 되어 테스트가 못 잡는다.
//
// mulberry32 — 32비트 상태 하나로 도는 작고 통계적으로 멀쩡한 생성기. 암호용이 아니다.

/**
 * @param {number} seed 32비트로 잘려 들어간다.
 * @returns {() => number} [0, 1) 을 주는 함수
 */
export function makeRng(seed) {
  let state = seed >>> 0
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** [min, max) 안의 실수. */
export function range(rng, min, max) {
  return min + rng() * (max - min)
}

/** 배열에서 하나. 빈 배열이면 undefined — 부르는 쪽이 빈 배열을 넘기지 않게 한다. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)]
}
