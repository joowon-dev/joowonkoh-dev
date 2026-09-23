<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 배포 — `vercel` 버전을 **핀으로 박아 뒀다**

Cloudflare Pages 빌드는 `@cloudflare/next-on-pages` 가 하고, 그것이 속으로
`npx vercel build` 를 부른다. `npx` 는 **그때그때 최신**을 받아 오므로, 저장소를
한 줄도 안 고쳐도 어느 날 갑자기 빌드가 깨진다.

실제로 깨졌다(2026-09-23). 어제 성공했던 커밋을 그대로 다시 밀어도 실패했고,
증상은 「모든 라우트에 `runtime = 'edge'` 가 없다」였다 — 라우트는 하나도 안
바뀌었는데 그렇게 나온다. 새 Vercel CLI(59.25.2 / 59.25.4, 마지막 성공 뒤에 나옴)가
내놓는 산출물을 next-on-pages 1.13.16 이 못 읽어서다.

그래서 `vercel` 을 devDependency 로 **59.25.0 에 박아 뒀다.** npm ci 가 깔아 두면
`npx vercel` 이 그것을 쓴다. **지우지 말 것** — 지우면 다시 최신을 받아 와서 깨진다.
올릴 때는 `npm run pages:build` 로 **클라우드플레어와 같은 빌드**를 먼저 돌려 본다
(`npm run build` 는 통과해도 이건 깨질 수 있다. 그래서 못 보고 지나갔다).

