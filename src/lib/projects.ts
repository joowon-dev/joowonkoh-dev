export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export const projects: Project[] = [
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
  },
  {
    title: "joowonkoh.com",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
  },
];
