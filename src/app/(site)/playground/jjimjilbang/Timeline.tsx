import styles from "./backdrop.module.css";
import { roomFor } from "./rooms";
import { hourOf, type Reading } from "./weather";

interface Props {
  /** 지금 시각부터 차례로. 첫 칸이 "지금"이다 */
  hourly: Reading[];
}

/**
 * 아이폰 날씨 앱의 시간별 예보 카드. 반투명 유리판 위에 시각·그림·온도가
 * 세로로 쌓이고 옆으로 밀린다.
 *
 * 날씨 아이콘 자리에 그 시각의 방 사진을 조각으로 넣었다. 같은 사진을
 * 배경에서 쓰고 있어서 새로 받아올 게 없고, 무엇보다 "3시에는 저 방"이
 * 글자보다 먼저 읽힌다.
 */
export default function Timeline({ hourly }: Props) {
  if (hourly.length === 0) return null;

  /*
   * 유리판을 얇게 만든다. 모바일에서는 이 카드와 아래 타일이 화면의 절반을
   * 차지해서, 흐림이 세면 방 사진이 거의 안 보인다. 사진이 이 페이지의
   * 절반이므로 글자가 읽히는 선까지 얇게 간다 — 글자는 자기 그림자로
   * 버티고, 판은 사진을 가리지 않을 만큼만 깐다.
   */
  return (
    <section className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/12 backdrop-blur-[2px]">
      <h2 className="px-1 text-[11px] font-medium tracking-wide text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
        시간별 찜질방
      </h2>
      <div className="mt-2.5 border-t border-white/15 pt-3">
        <ol className={`${styles.strip} flex gap-3 overflow-x-auto pb-0.5`}>
          {hourly.map((reading, index) => {
            const hour = hourOf(reading.time);
            const room = roomFor(reading.apparent, reading.humidity);
            const isNow = index === 0;
            return (
              <li
                key={reading.time}
                aria-current={isNow ? "time" : undefined}
                className="flex w-12 shrink-0 flex-col items-center gap-1.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
              >
                <span
                  className={`text-[13px] tabular-nums ${
                    isNow ? "font-semibold" : "font-medium text-white/85"
                  }`}
                >
                  {isNow ? "지금" : `${hour}시`}
                </span>
                <span
                  role="img"
                  aria-label={room.name}
                  className="block h-9 w-9 rounded-lg bg-cover bg-center ring-1 ring-white/25"
                  style={{ backgroundImage: `url(${room.image})` }}
                />
                {/* 아이폰 날씨라면 여기 방 이름이 없다. 그래도 남긴 건
                    이 페이지가 알려주려는 게 온도가 아니라 방이기 때문이다 */}
                <span className="text-[9px] leading-tight break-keep text-center text-white/70">
                  {room.name}
                </span>
                <span className="text-[15px] font-semibold tabular-nums">
                  {Math.round(reading.apparent)}°
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
