/**
 * 먹는 장면의 움직임 — 판정(rules.ts)과 따로, 「어떻게 보여 줄지」만 정한다.
 */

/** 한 입 크기(mm). 입은 미끄러지지 않고 한 입씩 콕콕 나아간다. */
export const BITE_STEP = 6;
/** 한 입 안에서 앞으로 나아가는 데 쓰는 몫 — 나머지는 오물오물 멈춰 있다. */
const LUNGE = 0.42;

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * 먹은 거리 d 를 화면에 보여 줄 거리로. 끝(target)에 닿으면 정확히 target.
 * 한 입마다 빠르게 앞으로 나갔다가 잠깐 멈춘다.
 */
export function stepped(d: number, target: number): number {
  if (d >= target) return target;
  const k = Math.floor(d / BITE_STEP);
  const f = (d - k * BITE_STEP) / BITE_STEP;
  return Math.min(target, BITE_STEP * (k + smooth(Math.min(1, f / LUNGE))));
}

/** 이 거리(mm)보다 가까워지면 느려진다. */
export const SLOW_FROM = 40;

/**
 * 시간 흐름 배율. 둘 사이가 가까울수록 슬로모션 — 끝에는 0.25배까지.
 * 한쪽이 이미 멈췄더라도 사이가 가까우면 똑같이 느려진다.
 */
export function slowFactor(gap: number): number {
  if (gap >= SLOW_FROM) return 1;
  return 0.25 + 0.75 * Math.max(0, gap / SLOW_FROM);
}

/** 카메라 배율 — 멀 때 1, 붙을수록 1.2까지(머리가 잘리지 않을 만큼만). */
export function camZoom(gap: number): number {
  const t = 1 - Math.min(1, Math.max(0, gap) / 110);
  return 1 + 0.2 * smooth(t);
}

/** 화면에서 두 입 사이가 이보다 가까워지지 않는다(mm) — 얼굴이 맞닿아 보이지 않게. */
export const MIN_VISIBLE_GAP = 40;
/** 이 거리부터 화면 속 틈을 천천히 줄여 MIN_VISIBLE_GAP 에 닿게 한다. */
const EASE_FROM = 75;

/**
 * 실제 틈(mm) → 화면에 그릴 틈. 멀 때는 그대로, 가까우면 부드럽게 눌러서
 * 실제로 0 이 돼도 화면에서는 MIN_VISIBLE_GAP 이 남는다. 숫자(cm)는 늘 실제 값으로 보여 준다.
 */
export function visibleGap(gap: number): number {
  if (gap >= EASE_FROM) return gap;
  const g = Math.max(0, gap);
  return MIN_VISIBLE_GAP + (g / EASE_FROM) * (EASE_FROM - MIN_VISIBLE_GAP);
}
