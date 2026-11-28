/**
 * 바탕화면 큐피트의 배포 이력. 바탕화면 트리 페이지의 releases.ts 와 같은 규칙이다.
 *
 * **최신 버전의 주소는 버전이 올라가도 그대로다** — `/downloads/DesktopCupid-mac.dmg`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 처음 나온 파일이 되어
 * 쌓이던 다운로드 평판이 0으로 돌아간다. 지난 버전은 `public/downloads/desktop-cupid/v<버전>/` 에.
 *
 * 맥 파일은 **이 맥에서 공증한 것**이라야 한다(desktop-cupid 의 `./mac/notarize.sh`).
 * CI 가 만든 맥 산출물은 임시 서명이라 Gatekeeper 가 막는다. 윈도우 파일은 CI 릴리스에서:
 *   gh release download v<버전> -R joowon-dev/desktop-cupid -p 'DesktopCupid-win*'
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
    date: "2026-11-28",
    latest: true,
    notes: [
      "쪽지를 쓰고 화면 아래 활을 당겨 쏘면, 친구 바탕화면 가장자리로 날아 들어와 꽂힙니다. 세게 쏠수록 깊이.",
      "꽂힌 화살을 누르면 쪽지가 펼쳐지고, 거기서 바로 답장을 쏩니다.",
      "친구는 코드 하나로 맺습니다. 회원가입은 없고, 복구 코드로 다른 컴퓨터에서도 이어 씁니다.",
      "컴퓨터가 꺼져 있던 사이에 온 화살은 켜면 차례로 날아 들어옵니다.",
    ],
    mac: { href: "/downloads/DesktopCupid-mac.dmg", size: "1.2MB" },
    windows: { href: "/downloads/DesktopCupid-win-Setup.exe", size: "2.4MB" },
    windowsZip: { href: "/downloads/DesktopCupid-win-x64.zip", size: "714KB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
