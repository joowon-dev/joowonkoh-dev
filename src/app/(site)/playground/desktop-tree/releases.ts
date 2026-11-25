/**
 * 바탕화면 트리의 배포 이력. 붙여넣기 총 페이지의 releases.ts 와 같은 규칙이다.
 *
 * **최신 버전의 주소는 버전이 올라가도 그대로다** — `/downloads/DesktopTree-mac.dmg`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 처음 나온 파일이 되어
 * 쌓이던 다운로드 평판이 0으로 돌아간다. 지난 버전은 `public/downloads/desktop-tree/v<버전>/` 에.
 *
 * 맥 파일은 **이 맥에서 공증한 것**이라야 한다(desktop-tree 의 `./mac/notarize.sh`).
 * CI 가 만든 맥 산출물은 임시 서명이라 Gatekeeper 가 막는다. 윈도우 파일은 CI 릴리스에서:
 *   gh release download v<버전> -R joowon-dev/desktop-tree -p 'DesktopTree-win*'
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
    date: "2026-11-25",
    latest: true,
    notes: [
      "떠 있는 창마다 빨강·노랑·초록 방울이 크리스마스 트리에 달립니다.",
      "빨강을 누르면 그 창이 닫히고 방울이 떨어집니다. 노랑은 접고, 초록은 화면에 꽉 차게 키웁니다.",
      "방울에 마우스를 올리면 같은 창의 셋이 같이 켜지고 어느 앱인지 이름표가 뜹니다.",
      "트리는 잡고 끌어서 옮깁니다. 크기는 메뉴에서 바꿉니다.",
      "새 버전이 나오면 메뉴가 알려 주고, 제거도 메뉴에서 한 번에 됩니다.",
    ],
    mac: { href: "/downloads/DesktopTree-mac.dmg", size: "861KB" },
    windows: { href: "/downloads/DesktopTree-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/DesktopTree-win-x64.zip", size: "642KB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
