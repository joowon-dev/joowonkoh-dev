/**
 * 상영관 분위기를 만드는 값들.
 *
 * 전부 시간 t(초)를 받아 값 하나를 내는 순수 함수다. 난수를 쓰지 않고
 * 사인 몇 개를 섞은 이유는, 프레임마다 튀는 난수는 흔들림이 아니라 지직거림으로
 * 보이기 때문이다. 필름은 부드럽게 떨린다.
 */

/** 서로 나눠떨어지지 않는 주파수를 섞어야 눈에 주기가 안 보인다 */
function wobble(t: number, a: number, b: number, c: number): number {
  return (
    (Math.sin(t * a) + Math.sin(t * b + 1.7) * 0.6 + Math.sin(t * c + 4.1) * 0.35) / 1.95
  );
}

export interface Weave {
  /** -1 ~ 1 */
  x: number;
  /** -1 ~ 1 */
  y: number;
  /** -1 ~ 1 */
  roll: number;
}

/**
 * 게이트 위블 — 영사기 안에서 필름이 미세하게 떨리는 것.
 * 세로가 가로보다 크다. 필름을 세로로 끌어당기니까 그쪽이 더 흔들린다.
 */
export function gateWeave(t: number): Weave {
  // 몇 Hz를 넘기면 60fps에서 프레임마다 값이 건너뛰어, 떨림이 아니라
  // 지직거림으로 보인다. 실제 영사기의 위블도 이 대역에 있다
  return {
    x: wobble(t, 1.7, 3.9, 7.1) * 0.55,
    y: wobble(t + 11, 2.3, 4.7, 8.9),
    roll: wobble(t + 23, 1.3, 3.1, 5.9) * 0.7,
  };
}

/**
 * 램프 밝기 흔들림. 1을 중심으로 아주 조금.
 * 크게 잡고 싶은 유혹이 있는데, 2%를 넘기면 고장난 화면처럼 보인다.
 */
export function flicker(t: number): number {
  return 1 + wobble(t, 11.3, 23.9, 47.1) * 0.02;
}

export type Rgb = readonly [number, number, number];

/**
 * 스크린 빛이 상영관에 번지는 색.
 *
 * 어두운 상영관에서 유일한 광원은 스크린이다. 벽이 고정된 회색이면
 * 화면이 밝아져도 방은 그대로라 합성한 티가 난다.
 *
 * @param average 웹캠 프레임의 평균색. 0~1
 */
export function spillColor(average: Rgb): Rgb {
  // 극장 벽은 검은 흡음재라 빛을 거의 안 돌려준다. 세게 깎는다
  const gain = 0.16;
  // 어두운 화면에서도 비상등 정도의 바닥은 남긴다
  const floor = 0.012;
  return [
    floor + average[0] * gain,
    floor + average[1] * gain,
    floor + average[2] * gain * 1.05,
  ] as const;
}

/** 스크린 밝기 대표값. 스필 세기를 정할 때 쓴다 */
export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 아무것도 안 할 때의 미세한 몸 흔들림.
 *
 * 완전히 정지한 시점은 화면 녹화처럼 보인다. 사람은 가만히 앉아 있어도
 * 이 정도는 움직인다. 라디안.
 */
export function idleSway(t: number): { yaw: number; pitch: number } {
  return {
    yaw: wobble(t, 0.21, 0.37, 0.13) * 0.012,
    pitch: wobble(t + 7, 0.17, 0.29, 0.11) * 0.007,
  };
}

/** EXIT 등 위치. 스크린 양옆 벽 아래쪽에 붙어 있다 */
export const EXIT_LIGHTS = [
  [-13.5, 2.4, 7.5],
  [13.5, 2.4, 7.5],
] as const;
