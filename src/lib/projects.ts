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
  | "code";

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
}

export const projects: Project[] = [
  {
    title: "똥 말랑",
    description: "고양이 배를 꾹 누르면 힘주기, 떼면 심호흡 🐱",
    tags: ["Interactive", "SVG", "Mobile"],
    href: "/playground/ddong-mallang",
    icon: "cat",
    tile: ["#fdf6ef", "#f2d9c6"],
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
    title: "구슬 폭포 추첨기",
    description: "양동이를 가장 먼저 채운 사람이 당첨 🫧",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/marble-drop",
    icon: "marble",
    tile: ["#eef6ff", "#c9e2ff"],
  },
  {
    title: "코인 밀기 추첨기",
    description: "코인을 쏟아붓고 먼저 떨어진 사람이 당첨 🪙",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/coin-pusher",
    icon: "coin",
    tile: ["#fff7e0", "#ffdf9e"],
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
