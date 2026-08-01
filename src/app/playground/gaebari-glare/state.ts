/**
 * 침입자 거리 → 개바리 4단계 상태.
 *
 * 이 앱의 품질은 여기서 갈린다. 얼굴 검출 박스는 매 프레임 몇 픽셀씩 떨리고,
 * 임계값 근처에 사람이 서 있으면 상태가 초당 몇 번씩 오간다. 개바리가 발작하듯
 * 표정을 바꾸면 무섭지도 웃기지도 않고 그냥 고장 난 것처럼 보인다.
 */

export type GlareLevel = "idle" | "glance" | "stare" | "glare";

/** 낮은 단계부터. 인덱스가 곧 세기다. */
export const LEVELS: readonly GlareLevel[] = ["idle", "glance", "stare", "glare"];

/**
 * 박스 높이 ÷ 프레임 높이. 노트북 웹캠 세로 화각이 대략 45°라 비율에서 거리가 역산된다.
 * 참고로 60cm 앞의 내 얼굴은 0.4 근처다 — 침입자가 나보다 가까워지는 일은 사실상 없다.
 */
export const THRESHOLDS: Readonly<Record<Exclude<GlareLevel, "idle">, number>> = {
  glance: 0.06, // ~4m
  stare: 0.12, // ~2m
  glare: 0.22, // ~1.2m
};

/** 상승 지연(프레임). 10fps 기준 0.3초 — 단발 오검출은 걸러내고 반응은 굼떠 보이지 않는다. */
export const RISE_FRAMES = 3;
/**
 * 하강 지연(프레임). 1.5초. 내려올 때는 훨씬 느리게 —
 * 상대가 잠깐 고개를 돌렸다고 개바리가 바로 평온해지면 김이 샌다.
 */
export const FALL_FRAMES = 15;
/** 임계 여유구간. 올라갈 땐 110%, 내려올 땐 90%를 쓴다. 경계에 선 사람 때문에 떨리는 것을 막는다. */
export const THRESHOLD_MARGIN = 0.1;

export interface GlareState {
  /** 지금 화면에 보이는 단계 */
  level: GlareLevel;
  /** 바뀌려고 대기 중인 단계. level과 같으면 대기 없음. */
  pending: GlareLevel;
  /** pending을 연속으로 관측한 프레임 수 */
  frames: number;
}

export function createGlareState(): GlareState {
  return { level: "idle", pending: "idle", frames: 0 };
}

/**
 * 비율이 어느 단계에 해당하는지. 방향에 따라 임계값에 여유를 준다.
 *
 * @param rising true면 올라가는 판정(임계값을 높게 잡아 더 다가와야 올라감)
 */
function levelFor(ratio: number, sensitivity: number, rising: boolean): GlareLevel {
  const margin = rising ? 1 + THRESHOLD_MARGIN : 1 - THRESHOLD_MARGIN;
  // 민감도가 높을수록 임계값이 낮아진다 = 멀리서도 반응한다
  const scale = margin / Math.max(0.1, sensitivity);

  if (ratio >= THRESHOLDS.glare * scale) return "glare";
  if (ratio >= THRESHOLDS.stare * scale) return "stare";
  if (ratio >= THRESHOLDS.glance * scale) return "glance";
  return "idle";
}

export function levelIndex(level: GlareLevel): number {
  return LEVELS.indexOf(level);
}

/**
 * 한 프레임 진행. 이전 상태를 건드리지 않고 새 상태를 만든다.
 *
 * @param ratio 침입자 박스 높이 ÷ 프레임 높이. 침입자가 없거나 나가 미확정이면 null.
 * @param sensitivity 임계값 배율. 1이 기본, 클수록 예민(멀리서도 반응).
 */
export function stepGlare(prev: GlareState, ratio: number | null, sensitivity = 1): GlareState {
  // 목표 단계를 구할 때, 현재보다 올라가려는 건지 내려가려는 건지에 따라 임계값이 달라진다.
  // 먼저 상승 기준으로 재고, 그게 현재보다 낮으면 하강 기준으로 다시 잰다.
  let target: GlareLevel;
  if (ratio === null) {
    target = "idle";
  } else {
    target = levelFor(ratio, sensitivity, true);
    if (levelIndex(target) < levelIndex(prev.level)) {
      target = levelFor(ratio, sensitivity, false);
      // 하강 기준으로도 현재보다 높게 나오면 유지한다(여유구간 안에 있다는 뜻)
      if (levelIndex(target) > levelIndex(prev.level)) target = prev.level;
    }
  }

  if (target === prev.level) {
    // 흔들려서 잠깐 다른 값이 나왔던 것 — 대기를 취소한다
    return prev.pending === prev.level && prev.frames === 0
      ? prev
      : { level: prev.level, pending: prev.level, frames: 0 };
  }

  // 목표가 도중에 바뀌면 카운터를 처음부터
  const frames = target === prev.pending ? prev.frames + 1 : 1;
  const needed = levelIndex(target) > levelIndex(prev.level) ? RISE_FRAMES : FALL_FRAMES;

  if (frames >= needed) return { level: target, pending: target, frames: 0 };
  return { level: prev.level, pending: target, frames };
}
