import type { Room } from "./rooms";

interface Props {
  cityName: string;
  room: Room;
  apparent: number;
  high: number;
  low: number;
}

/**
 * 아이폰 날씨 앱의 머리 부분을 그대로 따랐다. 도시 이름, 큰 온도, 상태 한 줄,
 * 최고·최저 순서다. 상태 자리에 "흐림" 대신 방 이름이 들어간다 —
 * 이 페이지가 하려는 말이 거기 있기 때문에 굵기도 그 줄에만 준다.
 *
 * 온도는 아주 얇게 크게 둔다. 뒤에 사진이 깔려 있어서 획이 굵으면
 * 사진을 가리고, 얇으면 사진 위에 얹힌 유리처럼 보인다.
 */
export default function VerdictCard({ cityName, room, apparent, high, low }: Props) {
  return (
    <div className="text-center text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]">
      <h1 className="text-[2rem] font-normal leading-tight tracking-tight">{cityName}</h1>
      <p className="mt-1 pl-[0.15em] text-[6rem] font-thin leading-[1.05] tracking-tighter tabular-nums">
        {Math.round(apparent)}°
      </p>
      <p className="-mt-2 text-xl font-semibold tracking-tight break-keep">{room.name}</p>
      <p className="mt-1 text-sm text-white/75 break-keep">{room.line}</p>
      <p className="mt-1.5 text-sm font-medium tabular-nums text-white/85">
        최고 {Math.round(high)}° 최저 {Math.round(low)}°
      </p>
    </div>
  );
}
