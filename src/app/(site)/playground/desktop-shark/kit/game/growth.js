// 누적 먹이 → 단계 → 크기·선명도. **시간을 모른다.**
//
// 단계 문턱은 서버(`shark_stage`)에도 같은 값이 박혀 있다. 한쪽만 고치면 화면에 보이는
// 단계와 랭킹에 적힌 단계가 달라진다 — 고칠 때 둘 다 고친다.

import {
  GAME_MODE_ALPHA, MAX_ALPHA, MIN_ALPHA, STAGE_ALPHAS, STAGE_LENGTHS,
  STAGE_THRESHOLDS, STATE_ALPHA,
} from './constants.js'

/** 단계는 1부터 6까지. 누적 먹이가 문턱 이상이면 그 단계다. */
export function stageOf(eaten) {
  let stage = 1
  for (let i = 0; i < STAGE_THRESHOLDS.length; i += 1) {
    if (eaten >= STAGE_THRESHOLDS[i]) stage = i + 1
  }
  return stage
}

/** 다음 단계까지 몇 개 더. 최고 단계면 null — 「다 컸다」는 0 과 다른 뜻이다. */
export function toNextStage(eaten) {
  const stage = stageOf(eaten)
  if (stage >= STAGE_THRESHOLDS.length) return null
  return STAGE_THRESHOLDS[stage] - eaten
}

/** 몸 길이 (화면 짧은 변 대비). */
export function lengthOf(stage) {
  return STAGE_LENGTHS[clampStage(stage) - 1]
}

/** 단계가 주는 기본 선명도. */
export function baseAlphaOf(stage) {
  return STAGE_ALPHAS[clampStage(stage) - 1]
}

/**
 * 지금 얼마나 보이는가.
 *
 * 곱셈 한 자리고 위아래로 받친다. 「많이 먹일수록 형체가 또렷해진다」가 여기서 나오고,
 * **아무리 흐려도 사라지지는 않는다**(MIN_ALPHA).
 */
export function visibility(stage, state, gameMode) {
  const alpha = baseAlphaOf(stage)
    * (STATE_ALPHA[state] ?? STATE_ALPHA.lurk)
    * (gameMode ? GAME_MODE_ALPHA : 1)
  return Math.min(MAX_ALPHA, Math.max(MIN_ALPHA, alpha))
}

/** 단계마다 몸에 붙는 것. 커질수록 상어다워진다. */
export function detailOf(stage) {
  const s = clampStage(stage)
  return {
    dorsalFin: true,            // 등지느러미는 처음부터
    tailFin: true,
    pectoralFins: s >= 2,       // 가슴지느러미
    secondDorsal: s >= 3,       // 제2등지느러미
    gills: s >= 4,              // 아가미
    teeth: s >= 5,              // 이빨
    scars: s >= 6,              // 흉터 — 다 큰 상어의 표시
  }
}

function clampStage(stage) {
  return Math.max(1, Math.min(STAGE_THRESHOLDS.length, Math.round(stage)))
}
