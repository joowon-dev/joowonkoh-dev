/**
 * 앱 아이콘 그림. 프로젝트 안에서 실제로 보이는 것을 그대로 줄인 것이라
 * 이름을 안 읽어도 뭔지 알아본다. 그림은 AppIcon.tsx에 있다.
 */
export type IconName =
  | "cat"
  | "hoop"
  | "doodle"
  | "dog"
  | "web"
  | "marble"
  | "coin"
  | "eye"
  | "plane"
  | "code"
  | "sauna"
  | "horse"
  | "imax"
  | "baseball"
  | "mitt";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
  icon: IconName;
  /** 아이콘 타일 배경(위→아래). 각 프로젝트가 실제로 쓰는 색에서 가져왔다 */
  tile: [string, string];
  /** 목록에서 감춘다. 페이지 자체는 그대로 살아 있고 링크로 접근할 수 있다. */
  hidden?: boolean;
  /**
   * 플레이그라운드 목록 아래에 붙는 설명. 한 줄짜리 description이
   * 무엇인지만 말한다면, 이쪽은 왜 만들었고 안에서 무엇이 돌아가는지를 적는다.
   * 아이콘 타일 밑에는 넣지 않는다 — 넣는 순간 앱 아이콘이 아니라 카드가 된다.
   */
  blurb?: string;
}

export const projects: Project[] = [
  {
    title: "오늘의 찜질방",
    description: "오늘 날씨가 찜질방 어느 방인지 알려줍니다 ♨️",
    tags: ["Web", "Weather API", "Geolocation"],
    href: "/playground/jjimjilbang",
    icon: "sauna",
    tile: ["#f7e6cf", "#e3b881"],
    blurb:
      "기온만 보는 날씨 앱이 답답해서 만들었습니다. 체감온도와 습도를 같이 보고 오늘 바깥이 황토방인지 건식 사우나인지 습식 사우나인지 불가마인지로 판정합니다. 숫자보다 «오늘 나가면 어떤 느낌인지»가 먼저 와야 한다고 봤습니다. 위치를 허용하면 가장 가까운 도시로 맞추고, 거절해도 도시를 직접 고르면 됩니다.",
  },
  {
    title: "똥 말랑",
    description: "고양이 배를 꾹 누르면 힘주기, 떼면 심호흡 🐱",
    tags: ["Interactive", "SVG", "Mobile"],
    href: "/playground/ddong-mallang",
    icon: "cat",
    tile: ["#fdf6ef", "#f2d9c6"],
    blurb:
      "고양이 배를 누르면 5초가 거꾸로 흐르고, 손을 떼면 3초 심호흡으로 넘어갑니다. 힘주기와 쉬기의 리듬을 화면이 대신 세어 주는 장난감입니다. 힘주기마다 버틴 시간이 막대로 정리돼 나옵니다. 아무것도 저장하지 않습니다 — 서버로 보내는 것도, 브라우저에 남기는 것도 없습니다.",
  },
  {
    title: "타자 농구",
    description: "타자 속도가 그대로 슛 파워 🏀 가까우면 천천히, 멀면 빠르게",
    tags: ["Game", "Canvas", "Pixel Art"],
    href: "/playground/typing-hoop",
    icon: "hoop",
    tile: ["#232a45", "#141a2c"],
    hidden: true,
  },
  {
    title: "낙서 댄스",
    description: "커서를 움직이면 종이 위 낙서가 따라 춤춘다 💃",
    tags: ["Interactive", "Canvas", "Animation"],
    href: "/playground/doodle-dance",
    icon: "doodle",
    tile: ["#fffdf3", "#efe6cd"],
    hidden: true,
  },
  {
    title: "개바리 댄스",
    description: "타이핑하면 더 빨리 춤추는 맥 데스크톱 펫 🐶",
    tags: ["macOS", "Swift", "SpriteKit"],
    href: "/playground/gaebari-dance",
    icon: "dog",
    tile: ["#f4f8ff", "#dbe6fb"],
    hidden: true,
  },
  {
    title: "WebSwing",
    description: "창 사이를 날아다니고, 타자를 치면 거미줄을 타고 올라가는 데스크톱 펫 🕸",
    tags: ["macOS", "Swift", "SpriteKit"],
    href: "/playground/webswing",
    icon: "web",
    tile: ["#1a2138", "#0d1120"],
    hidden: true,
  },
  {
    title: "몰래 야구",
    description: "일하는 화면 위로 공이 날아갑니다. 담장을 넘기면 홈런 ⚾",
    tags: ["macOS", "Windows", "Canvas"],
    href: "/playground/sneaky-baseball",
    icon: "baseball",
    tile: ["#f6f6f2", "#dcdcd4"],
    hidden: true,
  },
  {
    title: "DeskTroy",
    description: "자리를 비우면 트로이 목마에서 병사가 쏟아져 창을 점령합니다 🐴",
    tags: ["macOS", "Swift", "SpriteKit"],
    href: "/playground/desktroy",
    icon: "horse",
    tile: ["#f3e2c7", "#d9b184"],
    hidden: true,
  },
  {
    title: "구슬 폭포 추첨기",
    description: "양동이를 가장 먼저 채운 사람이 당첨 🫧",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/marble-drop",
    icon: "marble",
    tile: ["#eef6ff", "#c9e2ff"],
    blurb:
      "사다리타기가 지겨워서 만든 추첨기입니다. 이름을 한 줄에 하나씩 넣으면 사람마다 양동이가 놓이고 구슬이 쏟아집니다. 회전 바와 범퍼, 물레방아에 얻어맞고 흩어지다가 자기 양동이를 먼저 채운 사람이 당첨입니다. 물리 엔진 없이 원과 선분 충돌만 직접 짰고, 고정 타임스텝이라 같은 시드·같은 이름이면 기기가 달라도 같은 결과가 나옵니다. 결과를 정해 두고 연출하는 게 아닙니다.",
  },
  {
    title: "코인 밀기 추첨기",
    description: "코인을 쏟아붓고 먼저 떨어진 사람이 당첨 🪙",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/coin-pusher",
    icon: "coin",
    tile: ["#fff7e0", "#ffdf9e"],
    blurb:
      "오락실 코인 밀기를 추첨기로 옮겼습니다. 이름 없는 중립 코인이 먼저 판을 깔고, 뜸을 들인 뒤 참가자 코인이 한꺼번에 쏟아집니다. 밀대가 밀어내다가 낙하선을 먼저 넘은 코인의 주인이 당첨입니다. 중립 코인을 계속 보충하는 이유는 판이 비면 늦게 떨어진 코인이 불리해지기 때문입니다. 코인이 수백 개까지 늘어나서, 매 프레임 전부를 비교하지 않고 격자로 나눠 이웃만 검사합니다.",
  },
  {
    title: "부장님 째려보기",
    description: "다른 사람이 다가오면 대신 째려봐 줍니다 👀",
    tags: ["Web", "MediaPipe", "Camera"],
    href: "/playground/gaebari-glare",
    icon: "eye",
    tile: ["#fff1f0", "#ffd5d2"],
    hidden: true,
  },
  {
    title: "포수 시점",
    description: "KBO 투수가 던지는 공을 포수 눈높이에서 받아 봅니다 ⚾",
    tags: ["WebGL", "Physics", "Baseball"],
    href: "/playground/catchers-view",
    icon: "mitt",
    tile: ["#131a26", "#080b12"],
    blurb:
      "홈플레이트 뒤 1.2m, 눈높이 1.05m — 쭈그려 앉은 포수의 머리 위치에 카메라를 두고 16.4m 앞에서 날아오는 공을 봅니다. 152km/h 포심이 미트에 박히기까지 0.41초입니다. 구종마다 곡선을 그려 두는 대신 중력·항력·마그누스를 1000분의 1초 간격으로 적분하기 때문에, 회전축을 바꾸면 궤적이 실제로 따라 바뀝니다. 좌투수를 고르면 슬라이더가 반대로 휘는 것도 그림이 아니라 계산 결과입니다. 구속과 구종 배합은 공개 기록이고 회전수는 구종별 통상값 추정치라고 화면에 적어 뒀습니다.",
  },
  {
    title: "아이맥스 1열",
    description: "내 얼굴이 22미터 스크린에 걸린다, 목 꺾이는 1열에서 🎞️",
    tags: ["Web", "WebGL", "Camera"],
    href: "/playground/imax-front-row",
    icon: "imax",
    tile: ["#1b2033", "#080a12"],
    blurb:
      "폭 22m·높이 16m 스크린을 세우고 그 앞 4.5m, 눈높이 1.4m에 앉힙니다. 실제 아이맥스 1열 거리입니다. 이 자리에서 스크린 꼭대기를 보려면 77도를 올려다봐야 하고, 그래서 화면이 아래는 거대하고 위는 좁아지는 사다리꼴이 됩니다. 왜곡을 그림으로 흉내내지 않고 곡면 스크린을 3D로 세워 그 자리에서 투영합니다. 카메라 화면이든 가진 사진이든 걸 수 있고, 어느 쪽도 브라우저 밖으로 나가지 않습니다.",
  },
  {
    title: "종이비행기 날리기",
    description: "입김으로 부는 종이비행기 게임 🐱🛩️",
    tags: ["Game", "Web Audio", "Supabase"],
    href: "/playground/paper-plane",
    icon: "plane",
    tile: ["#ecf8ff", "#c6e7fb"],
    hidden: true,
  },
  {
    title: "joowonkoh.com",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
    icon: "code",
    tile: ["#f6f6f8", "#e0e0e6"],
    hidden: true,
  },
];

/** 목록에 노출할 항목. 홈과 플레이그라운드가 같은 기준을 쓰도록 여기서 한 번만 거른다. */
export const visibleProjects = projects.filter((p) => !p.hidden);
