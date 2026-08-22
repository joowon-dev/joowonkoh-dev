/**
 * 재생 시각을 만드는 순수 함수들.
 *
 * 이 파일의 함수들은 값만 받아 값만 돌려준다 — DOM도, performance.now()도
 * 직접 부르지 않는다. 그래야 "프레임 카운터가 아니라 경과 초로부터 재생 시각을
 * 구한다"거나 "타일을 더 기다려야 하는가" 같은 판단을, 실제 rAF 루프나
 * TileCache 없이도 테스트할 수 있다.
 */

export interface PlayRange {
  from: number;
  to: number;
}

/**
 * 경과 시간(초)을 타임라인 위의 시각(epoch ms)으로 바꾼다.
 *
 * 프레임 수로 세면 느린 기기는 같은 시간 동안 프레임이 덜 나와서 영상이
 * 더 길어진다. 실제 경과 시간을 durationSec에 대한 비율로 바꿔 기간에
 * 곱하면, 기기 성능과 무관하게 durationSec 뒤에는 항상 기간의 끝에 닿는다.
 */
export function computeNow(elapsedSec: number, durationSec: number, range: PlayRange): number {
  const ratio = durationSec <= 0 ? 1 : Math.max(0, Math.min(1, elapsedSec / durationSec));
  return range.from + ratio * (range.to - range.from);
}

/**
 * 한 프레임이 건너뛰는 타임라인 시간(ms).
 *
 * 꼬리 길이와 만남 링 지속을 이 값에 맞춰 잡는다. 90일을 10초에 담으면
 * 한 프레임이 7시간을 넘게 건너뛰므로, 타임라인 시간으로 고정한 꼬리·링은
 * 한 프레임보다 짧아져 화면에 아예 안 나온다. (render.ts의 tailMsFor 참조)
 */
export function paceMsPerFrame(
  range: PlayRange,
  durationSec: number,
  fps: number,
): number {
  const frames = durationSec * fps;
  if (frames <= 0) return 0;
  return Math.max(0, range.to - range.from) / frames;
}

/**
 * 녹화를 시작하기 전, 타일을 더 기다려야 하는지.
 *
 * 대기 중인 타일이 있어도 최대 시간을 넘기면 포기한다 — 타일 서버가 느리거나
 * 죽었을 때 "MP4 만들기"가 영원히 먹통이 되는 것을 막는다. 그 대가로 앞부분
 * 몇 초가 빈 지도로 녹화될 수 있지만, 버튼이 죽는 것보다는 낫다.
 */
export function shouldKeepWaitingForTiles(
  pendingCount: number,
  elapsedMs: number,
  maxWaitMs: number,
): boolean {
  return pendingCount > 0 && elapsedMs < maxWaitMs;
}

/**
 * 마무리 카드의 불투명도. 재생 마지막 3초 동안 0에서 1로 올라간다.
 *
 * durationSec이 3초 이하면(설정 가능한 최솟값이 10초라 실제로는 안 나오지만
 * 방어적으로 다룬다) 시작하자마자 완전히 덮은 것으로 본다 — 3초보다 짧은
 * 기간을 3초짜리 램프로 나누면 분모가 음수가 되어 값이 뒤집힌다.
 */
export function summaryOpacity(ratio: number, durationSec: number): number {
  const cardSec = 3;
  if (durationSec <= cardSec) return ratio > 0 ? 1 : 0;

  const startRatio = 1 - cardSec / durationSec;
  if (ratio <= startRatio) return 0;
  return Math.min(1, (ratio - startRatio) / (1 - startRatio));
}

/**
 * "YYYY-MM-DD" 두 개를 [from, to] epoch ms 구간으로 바꾼다.
 *
 * endDate는 그날 자정이 아니라 자정 "직전"까지를 포함해야 그날 하루가
 * 통째로 들어간다 — 안 그러면 종료일에 있었던 기록이 전부 잘려 나간다.
 * 둘 중 하나라도 못 읽으면 null을 돌려줘 "지정 안 함"과 구분한다.
 */
export function dateRangeBounds(startDate: string, endDate: string): PlayRange | null {
  const from = Date.parse(startDate);
  const toStart = Date.parse(endDate);
  if (Number.isNaN(from) || Number.isNaN(toStart)) return null;

  const to = toStart + 24 * 60 * 60 * 1000 - 1;
  return from <= to ? { from, to } : null;
}
