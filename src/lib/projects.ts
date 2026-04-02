export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export const projects: Project[] = [
  {
    title: "joowonkoh.com",
    description: "이 사이트! Next.js + MDX 블로그",
    tags: ["Next.js", "TypeScript"],
    href: "https://github.com/joowonkoh",
  },
];
