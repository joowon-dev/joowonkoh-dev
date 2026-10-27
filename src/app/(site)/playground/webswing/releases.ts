/**
 * WebSwing 의 배포 이력.
 *
 * **최신 버전의 주소만은 버전이 올라가도 그대로다** — `/downloads/WebSwing.zip`.
 * 파일 이름에 버전을 달면 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온
 * 파일이 되고, 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
 * 지난 버전은 평판을 쌓을 일이 없으므로 버전 폴더에 그대로 둔다.
 *
 * 새 버전을 낼 때:
 *   1. 지금 최신본을 `public/downloads/webswing/v<이전>/` 로 복사한다
 *   2. 그 항목의 mac/win 주소를 버전 폴더로 바꾸고 `latest` 를 지운다
 *   3. 새 zip 을 `public/downloads/` 의 고정 주소에 덮어쓰고 맨 위에 항목을 더한다
 *   4. `page.tsx` 의 받기 버튼과 `WindowsPanel.tsx` 의 단계 안내에 적힌 용량도
 *      같이 고친다 — 그 두 곳은 `LATEST` 를 읽는다
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
    version: "1.2",
    date: "2026-08-30",
    latest: true,
    notes: [
      "캐릭터를 고를 수 있습니다 — Spider · Classic · Venom. 메뉴의 「Character」에서 누르면 그 자리에서 갈아입습니다. 매달려 있던 거미줄도, 하던 동작도 그대로입니다.",
      "셋의 움직임은 완전히 같습니다. 골격 치수와 색과 눈 모양만 다릅니다 — 다리 길이가 다른 만큼 걸음 속도만 각자 맞춰 뒀습니다.",
      "기본 크기가 한 단계 작아졌습니다. 예전의 Smaller 가 지금의 Normal 입니다. 데스크톱 위에 얹힌 것이 아니라 데스크톱에 사는 것처럼 보이라고 줄였습니다.",
      "그림만 줄인 게 아니라 물리도 같은 비율로 줄여서, 어느 크기에서도 창턱에 발이 제대로 닿습니다.",
    ],
    mac: { href: "/downloads/WebSwing.zip", size: "331KB" },
    windows: { href: "/downloads/WebSwing-win-x64.zip", size: "140KB" },
  },
  {
    version: "1.1",
    date: "2026-08-12",
    notes: [
      "키링 모드가 생겼습니다 (⌘⇧K · Ctrl+Shift+K). 창 모서리나 메뉴 막대 밑에 거꾸로 매달려 흔들립니다. 집어서 다른 곳에 걸 수 있고, 걸어둔 창이 사라지면 떨어졌다가 거미줄을 쏘아 다시 매답니다.",
      "흔들림은 타건, 창을 끄는 동작, 커서의 급가속에서 옵니다.",
      "펫 모드에서 창을 타고 오르지 못하고 제일 가까운 창턱에만 붙어 있던 것을 고쳤습니다.",
      "가까이 쏜 거미줄에서 매달렸다 놓기를 반복하던 것을 고쳤습니다.",
    ],
    mac: { href: "/downloads/webswing/v1.1/WebSwing.zip", size: "299KB" },
    windows: {
      href: "/downloads/webswing/v1.1/WebSwing-win-x64.zip",
      size: "126KB",
    },
  },
];

export const LATEST = RELEASES.find((r) => r.latest) ?? RELEASES[0];
