/**
 * 날씨를 찜질방 방 이름으로 바꾸는 규칙.
 *
 * 기온이 아니라 체감온도를 쓴다. 같은 30도라도 바람이 부는 30도와
 * 습기가 얹힌 30도는 몸이 받는 게 다르고, 이 페이지가 하려는 말이 바로 그 차이다.
 *
 * 습도는 방을 정하는 두 번째 축이다. 28도에 습도 30%면 건식사우나,
 * 같은 28도에 습도 80%면 습식사우나 — 온도 한 줄로는 이 갈림이 안 나온다.
 *
 * 비와 눈은 따로 보지 않는다. 이미 습도에 나타나 있다.
 */

export interface Room {
  id: string;
  name: string;
  emoji: string;
  /** 판정 카드 밑에 붙는 한 줄 */
  line: string;
  /** 사진이 뜨기 전까지 깔리는 배경 그라데이션(위→아래) */
  bg: [string, string];
  /** 그 방을 실제로 찍은 것처럼 만든 사진 */
  image: string;
}

/** 이 위로는 습한 방, 아래는 마른 방 */
const HUMID_THRESHOLD = 60;

export const ROOMS = {
  bulgama: {
    id: "bulgama",
    name: "불가마",
    emoji: "🔥",
    line: "문 열면 훅 끼치는 그 열기",
    bg: ["#8c2408", "#d2551f"],
    image: "/playground/jjimjilbang/bulgama.webp",
  },
  hellBath: {
    id: "hellBath",
    name: "열탕지옥",
    emoji: "🌋",
    line: "공기가 아니라 국물 속을 걷는다",
    bg: ["#7a1b3a", "#c44a3e"],
    image: "/playground/jjimjilbang/hellBath.webp",
  },
  drySauna: {
    id: "drySauna",
    name: "건식사우나",
    emoji: "🟠",
    line: "땀은 나는데 끈적이진 않는다",
    bg: ["#9c4a12", "#e0913c"],
    image: "/playground/jjimjilbang/drySauna.webp",
  },
  wetSauna: {
    id: "wetSauna",
    name: "습식사우나",
    emoji: "💦",
    line: "숨 쉬는 게 곧 반신욕",
    /*
     * 처음엔 청록이었다. 습기를 물로 읽어 파랗게 잡았는데, 28~35도짜리
     * 더운 방이 화면에서는 제일 시원해 보였다. 색이 온도 순서를 깨면
     * 사진과 방 이름이 서로 다른 말을 한다.
     */
    bg: ["#6e2c10", "#c06a30"],
    image: "/playground/jjimjilbang/wetSauna.webp",
  },
  ocher: {
    id: "ocher",
    name: "황토방",
    emoji: "🟤",
    line: "제일 오래 누워 있게 되는 온도",
    bg: ["#7d5024", "#d2a260"],
    image: "/playground/jjimjilbang/ocher.webp",
  },
  salt: {
    id: "salt",
    name: "소금방",
    emoji: "🪨",
    line: "따뜻한데 어쩐지 눅눅하다",
    bg: ["#584f6d", "#a498b6"],
    image: "/playground/jjimjilbang/salt.webp",
  },
  sleep: {
    id: "sleep",
    name: "수면실",
    emoji: "❄️",
    line: "얇은 담요 한 장이 필요한 공기",
    bg: ["#2a3a55", "#647da0"],
    image: "/playground/jjimjilbang/sleep.webp",
  },
  fog: {
    id: "fog",
    name: "안개방",
    emoji: "🌫️",
    line: "김 서린 유리창 안쪽 같은 공기",
    bg: ["#3d4d59", "#8ba2ad"],
    image: "/playground/jjimjilbang/fog.webp",
  },
  ice: {
    id: "ice",
    name: "얼음방",
    emoji: "🧊",
    line: "들어가자마자 나오고 싶어진다",
    bg: ["#1d3a57", "#5aa6c8"],
    image: "/playground/jjimjilbang/ice.webp",
  },
} satisfies Record<string, Room>;

export type RoomId = keyof typeof ROOMS;

/**
 * 체감온도와 습도로 방 하나를 고른다.
 *
 * 얼음방만 습도를 보지 않는다. 영하에 가까운 공기는 습하든 마르든
 * 몸이 느끼는 게 같아서, 굳이 두 방으로 나누면 규칙만 복잡해진다.
 */
export function roomFor(apparent: number, humidity: number): Room {
  const humid = humidity >= HUMID_THRESHOLD;

  if (apparent >= 35) return humid ? ROOMS.hellBath : ROOMS.bulgama;
  if (apparent >= 28) return humid ? ROOMS.wetSauna : ROOMS.drySauna;
  if (apparent >= 20) return humid ? ROOMS.salt : ROOMS.ocher;
  if (apparent >= 10) return humid ? ROOMS.fog : ROOMS.sleep;
  return ROOMS.ice;
}
