import type { Room } from "./rooms";

interface Props {
  cityName: string;
  room: Room;
  apparent: number;
  humidity: number;
}

/**
 * 오늘의 방 한 장. 상태를 갖지 않는다.
 *
 * 방 이름을 제일 크게 둔다. 이 페이지가 하려는 말이 온도가 아니라
 * "오늘 서울은 습식사우나"라는 한 문장이기 때문이다. 숫자는 그 밑에서
 * 근거 노릇만 한다.
 */
export default function VerdictCard({ cityName, room, apparent, humidity }: Props) {
  return (
    <div className="text-center text-white">
      <p className="text-sm font-medium tracking-wide text-white/70">
        오늘 {cityName}은
      </p>
      <p className="mt-4 text-6xl leading-none" aria-hidden>
        {room.emoji}
      </p>
      <h2 className="mt-4 font-display text-4xl font-bold tracking-tight break-keep md:text-5xl">
        {room.name}
      </h2>
      <p className="mt-3 text-base text-white/85 break-keep md:text-lg">
        {room.line}
      </p>
      <dl className="mx-auto mt-8 flex max-w-xs items-stretch justify-center divide-x divide-white/20 rounded-2xl bg-black/15 py-3 text-white/90 backdrop-blur-sm">
        <div className="flex-1 px-4">
          <dt className="text-[11px] tracking-wide text-white/60">체감온도</dt>
          <dd className="mt-1 font-display text-xl font-semibold tabular-nums">
            {Math.round(apparent)}°
          </dd>
        </div>
        <div className="flex-1 px-4">
          <dt className="text-[11px] tracking-wide text-white/60">습도</dt>
          <dd className="mt-1 font-display text-xl font-semibold tabular-nums">
            {Math.round(humidity)}%
          </dd>
        </div>
      </dl>
    </div>
  );
}
