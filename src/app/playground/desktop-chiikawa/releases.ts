/**
 * 바탕화면 치이카와의 배포 이력. 상어 페이지의 releases.ts 와 같은 규칙이다.
 *
 * **최신 버전의 주소는 버전이 올라가도 그대로다** — `/downloads/DesktopChiikawa-mac.dmg`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 처음 나온 파일이 되어
 * 쌓이던 다운로드 평판이 0으로 돌아간다. 지난 버전은 `public/downloads/desktop-chiikawa/v<버전>/` 에.
 *
 * 맥 파일은 **이 맥에서 공증한 것**이라야 한다(desktop-chiikawa 의 `./mac/notarize.sh`).
 * CI 가 만든 맥 산출물은 임시 서명이라 Gatekeeper 가 막는다. 윈도우 파일은 CI 릴리스에서:
 *   gh release download v1.0.0 -R joowon-dev/desktop-chiikawa -p 'DesktopChiikawa-win*'
 */

export type Build = { href: string; size: string };

export type Release = {
  version: string;
  date: string;
  latest?: boolean;
  notes: string[];
  mac: Build;
  windows: Build;
  windowsZip: Build;
};

export const RELEASES: Release[] = [
  {
    version: "1.0.8",
    date: "2026-10-03",
    latest: true,
    notes: [
      "친구들 그림을 픽셀 아트 전의 둥근 찹쌀떡 그림으로 되돌렸습니다. 친구 코드를 안 넣었을 때 처음에 입력 창이 뜨는 건 그대로입니다.",
    ],
    mac: { href: "/downloads/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.7",
    date: "2026-10-03",
    notes: [
      "친구들이 픽셀 아트가 됐습니다. 일곱 친구를 칸 하나하나 새로 그렸고, 표정(눈물·> <·^ ^·놀람)도 픽셀로 바뀝니다. 크게 키워도 칸이 또렷합니다.",
      "친구 코드를 아직 안 넣었으면 앱을 켤 때 입력 창이 먼저 뜹니다. 한 번 넣고 나면 다시 뜨지 않습니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.7/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.7/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.7/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.6",
    date: "2026-10-03",
    notes: [
      "친구 코드 입력 칸에 붙여넣기(맥 ⌘V, 윈도우 Ctrl+V)가 됩니다. 코드를 복사해 둔 채로 창을 열면 미리 채워져 있습니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.6/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.6/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.6/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.5",
    date: "2026-10-03",
    notes: [
      "친구들을 새로 그렸습니다. 머리와 몸이 붙은 둥근 찹쌀떡 모양에 짧은 다리, 큰 눈과 빗금 볼터치로 원작 그림체에 더 가까워졌습니다.",
      "표정이 생겼습니다. 울 때는 눈물이 흐르고, 힘줄 때는 > <, 신날 때는 ^ ^, 놀라면 눈이 커집니다. 잘 때는 옆으로 눕습니다.",
      "랏코는 복슬털에 이마의 별 흉터와 하얀 망토, 쿠리만쥬는 귀 없는 밤만쥬, 모몽가는 하늘색 복슬 꼬리로 바로잡았습니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.5/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.5/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.5/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.3",
    date: "2026-10-03",
    notes: [
      "윈도우에서 켜 두면 화면 클릭과 키보드가 먹통이 되던 문제를 고쳤습니다. 이제 클릭과 타자가 밑의 창으로 그대로 갑니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.3/DesktopChiikawa-mac.dmg", size: "750KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.3/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.3/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.2",
    date: "2026-10-03",
    notes: [
      "친구 코드가 생겼습니다. 메뉴의 「친구 코드 입력…」에 받은 코드를 넣으면 주인이 올려 둔 그림으로 친구들이 나옵니다. 켤 때마다 최신 그림을 받아 옵니다.",
      "그림을 받아 오는데 인터넷이 끊겨 있으면 「인터넷 연결이 필요해요」라고 알려 줍니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.2/DesktopChiikawa-mac.dmg", size: "750KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.2/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.2/DesktopChiikawa-win-x64.zip", size: "680KB" },
  },
  {
    version: "1.0.1",
    date: "2026-10-03",
    notes: [
      "배터리를 덜 씁니다. 친구들이 가만히 있을 때는 덜 자주 그리고, 창이 안 움직일 때는 창 위치를 덜 자주 확인합니다. 이 맥에서 잰 CPU 사용량이 3분의 1쯤 줄었습니다.",
      "그림 폴더에 아주 큰 그림을 넣어도 켤 때 멈칫하지 않습니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.1/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.1/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.1/DesktopChiikawa-win-x64.zip", size: "675KB" },
  },
  {
    version: "1.0.0",
    date: "2026-10-03",
    notes: [
      "창을 열면 친구들이 화면 아래에서 뿅 튀어나와 그 창 위에 올라섭니다.",
      "창 위를 걷고, 앉고, 눕고, 옆 창으로 뛰어 건너갑니다. 창을 끌면 같이 실려 가고, 닫으면 떨어집니다.",
      "아이마다 특기가 있습니다 — 풀 뽑기, 노래, 춤, 포즈, 한 잔, 수련, 라멘.",
      "모니터가 여러 대면 모든 모니터에 삽니다. 윈도우에서 창을 최대화하면 작업 표시줄 위에 섭니다.",
      "크기는 아주 작게부터 아주 크게까지 다섯 단계. 캐릭터 그림을 직접 넣어 바꿀 수도 있습니다.",
      "새 버전이 나오면 메뉴가 알려 주고, 눌러야만 갈아 끼웁니다.",
    ],
    mac: { href: "/downloads/desktop-chiikawa/v1.0.0/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/desktop-chiikawa/v1.0.0/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/desktop-chiikawa/v1.0.0/DesktopChiikawa-win-x64.zip", size: "675KB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
