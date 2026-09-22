/**
 * 바탕화면 상어의 배포 이력.
 *
 * **최신 버전의 주소만은 버전이 올라가도 그대로다** — `/downloads/DesktopShark-mac.dmg`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온
 * 파일이 되고, 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
 * 지난 버전은 평판을 쌓을 일이 없으므로 버전 폴더에 그대로 둔다.
 *
 * 새 버전을 낼 때:
 *   1. 지금 최신본을 `public/downloads/desktop-shark/v<이전>/` 로 복사한다
 *   2. 그 항목의 mac/win 주소를 버전 폴더로 바꾸고 `latest` 를 지운다
 *   3. 새 파일을 `public/downloads/` 의 고정 주소에 덮어쓰고 맨 위에 항목을 더한다
 *
 * **파일은 GitHub 릴리스에서 받아 온다** — 맥 것은 이 맥에서 공증한 뒤 릴리스에
 * 덮어쓴 그것이라야 한다. CI 가 만든 맥 산출물은 임시 서명이라 Gatekeeper 가 막는다.
 *   gh release download v1.0.0 -R joowon-dev/desktop-shark -p 'DesktopShark-*'
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
    version: "1.0.0",
    date: "2026-09-22",
    latest: true,
    notes: [
      "바탕화면에 상어가 삽니다. 평소에는 흐릿한 그림자로 지나가고, 배가 고프면 화면 가운데를 맴돕니다.",
      "밥은 그냥 일하면 줍니다. 아무 데나 클릭하면 그 자리에 큰 밥이, 타자를 치면 아무 데나 작은 밥이 떨어집니다 — 창은 클릭을 삼키지 않으니 하던 일은 그대로 합니다.",
      "먹은 만큼 자랍니다. 1단계에서 6단계까지 몸 길이가 일곱 배가 되고, 단계마다 눈에 띄게 커집니다.",
      "상어 도감이 있습니다. 백상아리로 시작해서 뱀상어 · 귀상어 · 환도상어 · 톱상어 · 고래상어까지 여섯 종이고, 앞 종을 6단계까지 다 키워야 다음이 열립니다.",
      "다 키운 상어는 고정할 수 있고, 지나온 단계와 종으로 언제든 돌아갈 수 있습니다.",
      "랭킹은 몰래 야구와 같은 계정을 씁니다. 복구 코드 하나로 두 게임이 이어집니다.",
      "맥은 dmg 로, 윈도우는 설치 파일로 받습니다. 새 버전이 나오면 앱이 메뉴로 알려 주고, 눌러야만 갈아 낍니다.",
    ],
    mac: { href: "/downloads/DesktopShark-mac.dmg", size: "575KB" },
    windows: { href: "/downloads/DesktopShark-win-Setup.exe", size: "2.3MB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
