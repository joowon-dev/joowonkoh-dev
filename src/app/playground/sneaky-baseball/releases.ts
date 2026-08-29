/**
 * 몰래 야구의 배포 이력.
 *
 * **최신 버전의 주소만은 버전이 올라가도 그대로다** — `/downloads/SneakyBaseball-mac.zip`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온
 * 파일이 되고, 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
 * 지난 버전은 평판을 쌓을 일이 없으므로 버전 폴더에 그대로 둔다.
 *
 * 새 버전을 낼 때:
 *   1. 지금 최신본을 `public/downloads/sneaky-baseball/v<이전>/` 로 복사한다
 *   2. 그 항목의 mac/win 주소를 버전 폴더로 바꾸고 `latest` 를 지운다
 *   3. 새 zip 을 `public/downloads/` 의 고정 주소에 덮어쓰고 맨 위에 항목을 더한다
 */

export type Build = {
  /** 내려받는 주소. 최신만 고정 주소를 쓴다. */
  href: string;
  /** 사람이 읽는 크기. 실제 파일에서 재서 적는다. */
  size: string;
};

export type Release = {
  version: string;
  /** 배포한 날 (YYYY-MM-DD). */
  date: string;
  /** 맨 위에 오는 지금 버전. 목록에 하나뿐이다. */
  latest?: boolean;
  /** 이 버전에서 달라진 것. 한 줄씩, 사람 말로. */
  notes: string[];
  mac: Build;
  windows: Build;
};

export const RELEASES: Release[] = [
  {
    version: "1.1.0",
    date: "2026-08-29",
    latest: true,
    notes: [
      "외야수가 생겼습니다. 뜬공이 뜨면 낙구 지점으로 달려가고, 제때 닿으면 아웃입니다 — 잘 맞혔다고 다 안타가 아닙니다.",
      "파울이 화면 위로 솟습니다. 아깝게 빗맞을수록 높이 올라갑니다.",
      "홈런에 긴 잔상이 남아 포물선이 그대로 보입니다.",
      "투수를 끌어서 옮길 수 있습니다. 당기면 공이 일찍 와서 어려워지고, 밀면 쉬워집니다. 메뉴의 「투수 거리」에서도 고릅니다.",
    ],
    mac: { href: "/downloads/SneakyBaseball-mac.zip", size: "368KB" },
    windows: { href: "/downloads/SneakyBaseball-win-x64.zip", size: "640KB" },
  },
  {
    version: "1.0.1",
    date: "2026-08-20",
    notes: [
      "KBO 10개 구단의 홈·원정 유니폼을 타자와 투수에게 따로 입힐 수 있습니다.",
      "조작키를 메뉴에서 고릅니다 — ⌥Space 를 다른 앱이 가져가 스윙이 안 되던 문제 때문입니다.",
      "모니터가 여러 대면 어느 화면에 띄울지 고릅니다.",
    ],
    mac: {
      href: "/downloads/sneaky-baseball/v1.0.1/SneakyBaseball-mac.zip",
      size: "356KB",
    },
    windows: {
      href: "/downloads/sneaky-baseball/v1.0.1/SneakyBaseball-win-x64.zip",
      size: "632KB",
    },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
