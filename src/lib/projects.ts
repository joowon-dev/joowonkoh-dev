export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
  /** 목록에서 감춘다. 페이지 자체는 그대로 살아 있고 링크로 접근할 수 있다. */
  hidden?: boolean;
}

export const projects: Project[] = [
  {
    title: "낙서 댄스",
    description: "커서를 움직이면 종이 위 낙서가 따라 춤춘다 💃",
    tags: ["Interactive", "Canvas", "Animation"],
    href: "/playground/doodle-dance",
  },
  {
    title: "구슬 폭포 추첨기",
    description: "양동이를 가장 먼저 채운 사람이 당첨 🫧",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/marble-drop",
  },
  {
    title: "코인 밀기 추첨기",
    description: "코인을 쏟아붓고 먼저 떨어진 사람이 당첨 🪙",
    tags: ["Game", "Canvas", "Physics"],
    href: "/playground/coin-pusher",
  },
  {
    title: "종이비행기 날리기",
    description: "입김으로 부는 종이비행기 게임 🐱🛩️",
    tags: ["Game", "Web Audio", "Supabase"],
    href: "/playground/paper-plane",
    hidden: true,
  },
  {
    title: "joowonkoh.com",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
    hidden: true,
  },
];

/** 목록에 노출할 항목. 홈과 플레이그라운드가 같은 기준을 쓰도록 여기서 한 번만 거른다. */
export const visibleProjects = projects.filter((p) => !p.hidden);
