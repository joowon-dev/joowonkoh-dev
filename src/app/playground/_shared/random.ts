export type Rng = () => number;

/** mulberry32 — 32비트 시드 PRNG. 같은 시드면 항상 같은 수열. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: Rng, minInclusive: number, maxExclusive: number): number {
  return Math.floor(randRange(rng, minInclusive, maxExclusive));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, 0, items.length)];
}
