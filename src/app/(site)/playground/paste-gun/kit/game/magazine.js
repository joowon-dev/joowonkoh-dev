// 탄창 하나. 총알(글자)의 줄과 「다음에 나갈 자리」만 안다.
// 어떤 총이 쏘는지, 언제 쏘는지는 모른다.

/** @typedef {{ name: string, rounds: string[], next: number }} Magazine */

export function createMagazine(name, rounds = []) {
  return { name, rounds: [...rounds], next: 0 }
}

/** 아직 안 쏜 발 수. */
export function remaining(mag) {
  return Math.max(0, mag.rounds.length - mag.next)
}

/** 약실에 든 것 — 다음에 나갈 총알. 다 쐈으면 null. */
export function chamber(mag) {
  return mag.next < mag.rounds.length ? mag.rounds[mag.next] : null
}

/** 한 발 뽑는다. 다 쐈으면 null 이고 자리는 그대로다. */
export function draw(mag) {
  const round = chamber(mag)
  if (round !== null) mag.next += 1
  return round
}

/** 남은 것을 전부 뽑는다 (샷건). */
export function drawAll(mag) {
  const rounds = mag.rounds.slice(mag.next)
  mag.next = mag.rounds.length
  return rounds
}

/** 처음부터 다시 쏠 수 있게 한다. 총알은 사라지지 않는다 — 쏜 것도 탄창에 남아 있다. */
export function reload(mag) {
  mag.next = 0
}

/**
 * 맨 뒤에 한 발 넣는다. cap 을 넘으면 가장 오래된 것을 버린다.
 *
 * **버릴 때 「다음 자리」도 같이 당긴다.** 안 당기면 앞에서 하나 빠진 만큼 자리가
 * 밀려서, 아직 안 쏜 총알 하나를 건너뛴다.
 */
export function push(mag, round, cap = Infinity) {
  mag.rounds.push(round)
  while (mag.rounds.length > cap) {
    mag.rounds.shift()
    mag.next = Math.max(0, mag.next - 1)
  }
}
