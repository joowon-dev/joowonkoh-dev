/**
 * 붙여넣기 총의 배포 이력. 상어·치이카와 페이지의 releases.ts 와 같은 규칙이다.
 *
 * **최신 버전의 주소는 버전이 올라가도 그대로다** — `/downloads/PasteGun-mac.dmg`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 처음 나온 파일이 되어
 * 쌓이던 다운로드 평판이 0으로 돌아간다. 지난 버전은 `public/downloads/paste-gun/v<버전>/` 에.
 *
 * 맥 파일은 **이 맥에서 공증한 것**이라야 한다(paste-gun 의 `./mac/notarize.sh`).
 * CI 가 만든 맥 산출물은 임시 서명이라 Gatekeeper 가 막는다. 윈도우 파일은 CI 릴리스에서:
 *   gh release download v1.0.0 -R joowon-dev/paste-gun -p 'PasteGun-win*'
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
    date: "2026-11-12",
    latest: true,
    notes: [
      "복사한 글자가 총알이 됩니다. ⌘V(윈도우는 Ctrl+V)를 누르면 총이 글자 커서로 날아와 한 글자씩 쏴서 붙여넣습니다.",
      "총은 네 자루 — 권총, 기관총, 샷건, 저격총. 총마다 쏘는 빠르기와 한 번에 나가는 양이 다릅니다.",
      "쏠 글이 없거나 그림·파일을 복사했을 때는 평소 붙여넣기 그대로입니다.",
      "자주 쓰는 글은 탄창으로 저장해 두고, 단축키는 무기고에서 바꿉니다.",
      "새 버전이 나오면 메뉴가 알려 주고, 제거도 메뉴에서 한 번에 됩니다.",
    ],
    mac: { href: "/downloads/PasteGun-mac.dmg", size: "1.4MB" },
    windows: { href: "/downloads/PasteGun-win-Setup.exe", size: "2.5MB" },
    windowsZip: { href: "/downloads/PasteGun-win-x64.zip", size: "710KB" },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
