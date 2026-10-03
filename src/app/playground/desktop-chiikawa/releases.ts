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
    version: "1.0.0",
    date: "2026-10-03",
    latest: true,
    notes: [
      "창을 열면 친구들이 화면 아래에서 뿅 튀어나와 그 창 위에 올라섭니다.",
      "창 위를 걷고, 앉고, 눕고, 옆 창으로 뛰어 건너갑니다. 창을 끌면 같이 실려 가고, 닫으면 떨어집니다.",
      "아이마다 특기가 있습니다 — 풀 뽑기, 노래, 춤, 포즈, 한 잔, 수련, 라멘.",
      "모니터가 여러 대면 모든 모니터에 삽니다. 윈도우에서 창을 최대화하면 작업 표시줄 위에 섭니다.",
      "크기는 아주 작게부터 아주 크게까지 다섯 단계. 캐릭터 그림을 직접 넣어 바꿀 수도 있습니다.",
      "새 버전이 나오면 메뉴가 알려 주고, 눌러야만 갈아 끼웁니다.",
    ],
    mac: { href: "/downloads/DesktopChiikawa-mac.dmg", size: "760KB" },
    windows: { href: "/downloads/DesktopChiikawa-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/DesktopChiikawa-win-x64.zip", size: "675KB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
