/**
 * 바탕화면 불꽃놀이의 배포 이력.
 *
 * **최신 버전의 주소만은 버전이 올라가도 그대로다** — `/downloads/DesktopFireworks-mac.zip`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온
 * 파일이 되고, 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
 * 지난 버전은 평판을 쌓을 일이 없으므로 버전 폴더에 그대로 둔다.
 *
 * 새 버전을 낼 때:
 *   1. 지금 최신본을 `public/downloads/desktop-fireworks/v<이전>/` 로 복사한다
 *   2. 그 항목의 mac/win 주소를 버전 폴더로 바꾸고 `latest` 를 지운다
 *   3. 새 zip 을 `public/downloads/` 의 고정 주소에 덮어쓰고 맨 위에 항목을 더한다
 *   4. `page.tsx` 와 `WindowsPanel.tsx` 에 적힌 용량도 같이 고친다 — 둘 다 `LATEST` 를 읽는다
 *
 * 맥 zip 은 반드시 `npm run release:mac`(서명 → 애플 공증 → 스테이플)으로 만든 것을 올린다.
 * CI 가 만드는 맥 zip 은 임시 서명이라 내려받으면 Gatekeeper 가 막는다.
 *
 * 용량은 실제 파일에서 잰다: `stat -f%z <파일>` 을 1024 로 나눠 버림.
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
    date: "2026-09-06",
    latest: true,
    notes: [
      "첫 배포입니다. 바탕화면 위에 얹혀 약 58초짜리 불꽃놀이 쇼가 돌고, 끝나면 처음부터 다시 시작합니다.",
      "발사대 아홉 대가 한 줄로 일제히 쏘아 올리는 것으로 시작해서, I → LOVE → YOU 를 한 낱말씩 띄우고, 하트, 그리고 사랑해 양옆에 하트 둘, 마지막은 다시 일제 발사로 끝납니다.",
      "마우스는 언제나 전부 밑의 앱으로 통과합니다. 불꽃이 떠 있는 채로 평소처럼 클릭하고 타이핑해도 아무 방해가 없습니다.",
      "소리는 음원 파일 없이 WebAudio 로 합성합니다. 발사음·터짐음·잔불 소리가 터지는 높이에 따라 조금씩 늦게 옵니다.",
      "문구는 소스의 script.js 한 곳에서 바꿉니다. 한글도 이모지도 폰트가 그릴 수 있으면 그대로 불꽃이 됩니다.",
    ],
    mac: { href: "/downloads/DesktopFireworks-mac.zip", size: "609KB" },
    windows: {
      href: "/downloads/DesktopFireworks-win-x64.zip",
      size: "614KB",
    },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
