import { roomFor } from "./rooms";
import { hourOf, type Reading } from "./weather";

interface Props {
  hourly: Reading[];
  /** 지금 시각. 이 칸에 표시를 남긴다 */
  nowHour: number;
}

/** 3시간 간격으로 추린다. 24칸을 다 보여주면 띠가 아니라 표가 된다 */
const STEP = 3;

/**
 * 오늘 하루가 어떤 방들을 지나가는지. 상태를 갖지 않는다.
 *
 * 방이 바뀌는 지점이 눈에 걸리는 게 목적이다 — 낮에 불가마였다가
 * 밤에 황토방이 되는 하루와, 온종일 습식사우나인 하루는 다르게 보여야 한다.
 */
export default function Timeline({ hourly, nowHour }: Props) {
  const slots = hourly.filter((reading) => hourOf(reading.time) % STEP === 0);
  if (slots.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-center text-xs font-medium tracking-wide text-white/60">
        오늘 하루
      </h3>
      {/* 좁은 화면에서는 칸을 줄이는 대신 옆으로 밀리게 둔다. 8칸을 390px에
          우겨넣으면 "습식사우나"가 석 줄이 되어 방 이름이 안 읽힌다. */}
      <ol className="mt-3 flex gap-1.5 overflow-x-auto pb-1 md:justify-center">
        {slots.map((reading) => {
          const hour = hourOf(reading.time);
          const room = roomFor(reading.apparent, reading.humidity);
          const isNow = hour <= nowHour && nowHour < hour + STEP;
          return (
            <li
              key={reading.time}
              aria-current={isNow ? "time" : undefined}
              className={`flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-white ${
                isNow ? "bg-white/25 ring-1 ring-white/40" : "bg-black/15"
              }`}
            >
              <span className="text-[10px] tabular-nums text-white/60">
                {hour}시
              </span>
              <span className="text-lg leading-none" aria-hidden>
                {room.emoji}
              </span>
              <span className="text-[10px] leading-tight break-keep text-center text-white/85">
                {room.name}
              </span>
              <span className="text-[10px] tabular-nums text-white/60">
                {Math.round(reading.apparent)}°
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
