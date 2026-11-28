// 문자열 씨 → 0 이상 1 미만의 수열. 같은 쪽지는 어느 컴퓨터에서든 같은 자리에 꽂혀야 해서 Math.random 을 쓰지 않는다.
export function rng(seed) {
  let h = 2166136261 >>> 0 // FNV-1a
  for (const ch of String(seed)) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619) >>> 0
  }
  let a = h || 1
  return () => {
    // mulberry32
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
