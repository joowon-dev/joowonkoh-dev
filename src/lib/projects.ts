export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export const projects: Project[] = [
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
