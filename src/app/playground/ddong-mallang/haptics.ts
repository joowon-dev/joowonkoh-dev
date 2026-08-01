/**
 * 진동 래퍼.
 *
 * iOS 사파리는 Vibration API를 지원하지 않고, 되게 만들 방법이 없다. 그래서
 * 감지해서 조용히 no-op이 된다 — 경고도 안내도 띄우지 않는다. 화면과 문구만으로
 * 앱이 온전히 동작해야 한다는 뜻이고, 진동은 어디까지나 덤이다.
 */

/** 카운트가 한 칸 줄 때 */
export const BUZZ_TICK = 12;
/** 힘주기를 온전히 채웠을 때 */
export const BUZZ_PRAISE: number[] = [30, 60, 30];
/** 다 쌌을 때 */
export const BUZZ_DONE: number[] = [40, 80, 40, 80, 120];

type Vibrator = { vibrate?: (pattern: number | number[]) => boolean };

export function buzz(pattern: number | number[]): boolean {
  if (typeof navigator === "undefined") return false;
  const vibrate = (navigator as Vibrator).vibrate;
  if (typeof vibrate !== "function") return false;
  try {
    vibrate.call(navigator, pattern);
    return true;
  } catch {
    // 사용자 설정이나 브라우저 정책으로 막힌 경우. 앱은 그대로 돌아간다.
    return false;
  }
}
