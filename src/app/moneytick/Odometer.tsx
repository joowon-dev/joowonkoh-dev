"use client";

/**
 * 굴러가는 금액.
 *
 * 자리마다 0~9 가 세로로 늘어선 띠를 두고, 그 자리의 "소수 위치" 만큼 위로 민다.
 * 10^p 자리의 위치는 `value / 10^p` 의 소수부다 — 그래서 일의 자리는 1초에
 * 1.27칸씩 구르고, 만의 자리는 아래가 한 바퀴 돌 때에 맞춰 천천히 넘어간다.
 * 자동차 주행거리계와 같은 방식이고, 사람이 "지금 돈이 흐른다" 고 읽는 움직임이다.
 *
 * 소수점 아래는 굴리지 않는다. 1초에 127칸을 도는 자리는 굴려봤자 얼룩이라,
 * 앱과 같은 70ms 간격으로 숫자만 바꿔 끼운다 — 그 대비가 "윗자리는 느리고
 * 아랫자리는 정신없다" 는 체감을 만든다.
 */

/** 띠 한 칸의 높이. 글자 크기에 비례하므로 반응형에서 따로 손볼 필요가 없다. */
const LINE = 1.1;

/**
 * 띠를 얼마나 내려 앉힐지.
 *
 * `overflow: hidden` 인 인라인 박스는 글자의 베이스라인이 아니라 **박스 아래
 * 모서리**로 줄을 맞춘다. 그대로 두면 굴러가는 숫자만 쉼표·"원" 보다 떠 보인다.
 * 이 값만큼 내려서 베이스라인을 다시 맞춘다 — 눈으로 맞춘 값이라, 띠의 높이
 * (`LINE`)를 바꾸면 여기도 다시 봐야 한다.
 */
const BASELINE_NUDGE = -0.195;

const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

/** 윗자리 하나가 넘어가는 데 걸리는 시간. */
const FLIP_MS = 350;

/**
 * 그 자리의 띠가 얼마나 돌아가 있는지.
 *
 * 일의 자리는 계속 구른다 — 돈이 흐르는 게 보이는 건 이 자리다.
 *
 * 윗자리는 **자기가 넘어가기 직전 0.35초** 동안에만 구른다. 기어처럼 물려
 * 돌리면 만의 자리가 십 분 넘게 어중간하게 떠 있어서, 가만히 있어야 할 숫자가
 * 어긋난 것처럼 보인다. 넘어갈 때만 짧게 구르는 쪽이 주행거리계에 가깝다.
 *
 * 9 에서 0 으로 넘어가는 순간에 띠가 되감기지 않는 건 맨 아래에 0 을 한 번 더
 * 붙여 뒀기 때문이다 — 10번 칸(0)과 0번 칸(0)은 같은 그림이라 이음매가 없다.
 */
function wheelOffset(value: number, place: number, rate: number): number {
  const raw = value / 10 ** place;
  if (place === 0) return raw % 10;

  const digit = Math.floor(raw) % 10;
  if (rate <= 0) return digit;

  const step = 10 ** place;
  const secondsLeft = (step - (value % step)) / rate;
  const flip = FLIP_MS / 1000;
  return digit + (secondsLeft < flip ? 1 - secondsLeft / flip : 0);
}

function Wheel({ offset }: { offset: number }) {
  return (
    <span
      className="inline-block overflow-hidden"
      style={{ height: `${LINE}em`, verticalAlign: `${BASELINE_NUDGE}em` }}
      aria-hidden
    >
      <span
        className="flex flex-col"
        style={{ transform: `translateY(calc(${-offset} * ${LINE}em))` }}
      >
        {STRIP.map((d, i) => (
          <span key={i} style={{ height: `${LINE}em`, lineHeight: `${LINE}em` }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function Odometer({
  value,
  /** 초당 얼마나 오르는지. 윗자리를 언제 굴릴지 정하는 데 쓴다. */
  ratePerSecond,
  /** 소수점 아래에 쓸, 70ms 눈금에 맞춰 끊은 값. */
  steppedValue,
  suffix = "원",
  className = "",
  decimalClassName = "",
}: {
  value: number;
  ratePerSecond: number;
  steppedValue: number;
  suffix?: string;
  className?: string;
  decimalClassName?: string;
}) {
  const whole = Math.floor(value);
  const highest = whole > 0 ? Math.floor(Math.log10(whole)) : 0;

  const cells: React.ReactNode[] = [];
  for (let p = highest; p >= 0; p -= 1) {
    cells.push(
      <Wheel key={`d${p}`} offset={wheelOffset(value, p, ratePerSecond)} />,
    );
    if (p > 0 && p % 3 === 0) {
      cells.push(
        <span key={`s${p}`} aria-hidden>
          ,
        </span>,
      );
    }
  }

  const dec = Math.floor((steppedValue % 1) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {cells}
      <span className={decimalClassName} aria-hidden>
        .{dec}
      </span>
      {suffix ? <span aria-hidden> {suffix}</span> : null}
      {/* 화면 낭독기에는 굴러가는 띠 대신 읽을 수 있는 한 줄을 준다. */}
      <span className="sr-only">
        {whole.toLocaleString("ko-KR")}.{dec}
        {suffix}
      </span>
    </span>
  );
}
