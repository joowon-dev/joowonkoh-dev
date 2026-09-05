/**
 * 손 랜드마크 → «쥐었다 폈다» 판정.
 *
 * 이 파일은 카메라도 MediaPipe도 DOM도 모른다. 정규화된 점 21개와 이전 상태만
 * 받아 다음 상태와 «이번 프레임에 발사됐는가»를 낸다. 신원 식별은 하지 않는다 —
 * 다루는 값은 좌표뿐이다.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * MediaPipe HandLandmarker가 주는 21개 점 중 이 파일이 쓰는 것들.
 * 엄지(1~4)는 안 쓴다 — 주먹을 쥐어도 옆으로 붙을 뿐 손목 쪽으로 접히지 않아서,
 * 다른 손가락과 같은 자로 재면 «반쯤 편 손»으로 잘못 나온다.
 */
const WRIST = 0;
const MIDDLE_MCP = 9;
/** 검지·중지·약지·새끼 끝 */
const FINGER_TIPS = [8, 12, 16, 20];
/** 손바닥을 이루는 다섯 점. 이것들의 평균이 손바닥 한가운데다. */
const PALM = [0, 5, 9, 13, 17];

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * 손바닥 한가운데. 손가락 끝이 아니라 여기서 불꽃이 나가야 «손에서 나온다»로 보인다.
 * 손가락 끝을 쓰면 손을 펴는 순간 발사점이 손 밖으로 튀어나간다.
 */
export function palmCenter(lm: Point[]): Point {
  let x = 0;
  let y = 0;
  for (const i of PALM) {
    x += lm[i].x;
    y += lm[i].y;
  }
  return { x: x / PALM.length, y: y / PALM.length };
}

/** 이 비율 아래면 접힌 손가락 */
export const CURLED_RATIO = 1.15;
/** 이 비율 위면 편 손가락 */
export const EXTENDED_RATIO = 1.95;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * 손이 얼마나 펴졌는가. 0이 주먹, 1이 쫙 편 손.
 *
 * 손가락 끝과 손목의 거리를 **손바닥 길이(손목→중지 밑마디)로 나눠서** 잰다.
 * 픽셀 거리를 그대로 쓰면 카메라에서 멀어질 때마다 임계값을 다시 잡아야 하는데,
 * 손바닥으로 나누면 손이 화면의 5%든 40%든 같은 숫자가 나온다.
 *
 * 손바닥이 화면과 나란하지 않으면(손날을 보이면) 원근 때문에 값이 작아진다.
 * 그건 그대로 둔다 — 그 자세는 어차피 랜드마크 자체가 못 미더워서, 안 쏘는 편이 낫다.
 */
export function handOpenness(lm: Point[]): number {
  const wrist = lm[WRIST];
  const palm = distance(wrist, lm[MIDDLE_MCP]);
  if (palm <= 1e-6) return 0;

  let sum = 0;
  for (const tip of FINGER_TIPS) {
    const ratio = distance(wrist, lm[tip]) / palm;
    sum += clamp01((ratio - CURLED_RATIO) / (EXTENDED_RATIO - CURLED_RATIO));
  }
  return sum / FINGER_TIPS.length;
}

/** 이 아래로 내려가면 «쥐었다»로 걸어 잠근다 */
export const CLOSE_BELOW = 0.25;
/** 잠긴 상태에서 이 위로 올라오면 발사 */
export const OPEN_ABOVE = 0.62;
/** 발사 뒤 이만큼(ms)은 같은 손에서 다시 안 나간다 */
export const COOLDOWN_MS = 380;

export interface HandState {
  /** 손을 프레임 사이에 이어 붙이는 이름. "Left" / "Right"에서 온다. */
  key: string;
  /** 0~1. 화면에 손바닥 고리를 그릴 때도 쓴다 */
  openness: number;
  /** 손바닥 위치. **화면 좌표**다 — 거울로 뒤집은 뒤의 값. */
  palm: Point;
  /** 주먹으로 걸어 잠긴 상태인가 */
  cocked: boolean;
  /** 남은 쿨다운(ms) */
  cooldown: number;
}

/** 한 프레임에 들어온 손 하나 */
export interface HandObservation {
  key: string;
  landmarks: Point[];
}

export interface Launch {
  key: string;
  /** 화면 좌표(0~1). 좌상단 기준 */
  x: number;
  y: number;
  /** 0.45~1. 손을 높이 들수록 크다 */
  power: number;
}

/**
 * 카메라는 나를 마주 보고 찍으므로 내가 오른손을 들면 프레임 왼쪽에 찍힌다.
 * 영상을 거울처럼 뒤집어 보여주니 좌표도 같이 뒤집어야 손과 불꽃이 겹친다.
 */
export const mirrorX = (x: number): number => 1 - x;

/**
 * 손을 높이 들수록 세게. 화면 맨 아래에서도 0.45는 나온다 —
 * 무릎 위에 손을 얹고 놀아도 뭔가는 터져야 한다.
 */
export function powerFromHeight(screenY: number): number {
  return 0.45 + 0.55 * clamp01(1 - screenY);
}

export function stepHands(
  prev: HandState[],
  observed: HandObservation[],
  dtMs: number,
): { hands: HandState[]; launches: Launch[] } {
  const hands: HandState[] = [];
  const launches: Launch[] = [];

  for (const obs of observed) {
    const before = prev.find((h) => h.key === obs.key);
    const openness = handOpenness(obs.landmarks);
    const raw = palmCenter(obs.landmarks);
    const palm = { x: mirrorX(raw.x), y: raw.y };
    const cooldown = Math.max(0, (before?.cooldown ?? 0) - dtMs);

    // 두 문턱 사이(0.25~0.62)에서는 아무 일도 안 일어난다. 하나로 두면 손을 반쯤
    // 편 채 가만히 있을 때 검출 흔들림만으로 연발이 나간다.
    let cocked = before?.cocked ?? false;
    if (openness < CLOSE_BELOW) {
      cocked = true;
    } else if (cocked && openness > OPEN_ABOVE && cooldown <= 0) {
      cocked = false;
      launches.push({ key: obs.key, x: palm.x, y: palm.y, power: powerFromHeight(palm.y) });
    }

    hands.push({
      key: obs.key,
      openness,
      palm,
      cocked,
      cooldown: launches.some((l) => l.key === obs.key) ? COOLDOWN_MS : cooldown,
    });
  }

  return { hands, launches };
}
