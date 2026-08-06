/**
 * Cloudflare에 올라간 환경변수를 읽는다.
 *
 * 이 저장소는 `@cloudflare/next-on-pages`로 배포하는데, 거기서 대시보드에
 * 넣은 값은 `process.env`가 아니라 **요청 컨텍스트**에 실려 온다.
 * `process.env`가 자동으로 채워지는 건 compatibility date 2025-04-01
 * 이상에서인데, 이 프로젝트의 `wrangler.toml`은 빌드가 아예 무시한다
 * (빌드 로그: "does not appear to be valid ... Skipping file").
 *
 * 그래서 로컬(`next dev`, `.env.local` → `process.env`)은 되는데 배포판만
 * 값이 비어 500을 냈다. 두 곳을 다 봐야 양쪽에서 산다.
 *
 * next-on-pages의 `getRequestContext()`를 쓰지 않고 그것이 읽는 심볼을
 * 직접 본다. 그 패키지는 peer로 `next@<=15.5.2`를 요구하는데 이 프로젝트는
 * next 16이라, 의존성으로 넣으면 `npm ci`가 실패해 배포 자체가 죽는다.
 * 실제로 그렇게 확인했다.
 */

/** next-on-pages 라우터가 요청마다 여기에 { env, cf, ctx }를 꽂는다 */
const REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__");

type EnvRecord = Record<string, string | undefined>;

interface RequestContext {
  env?: EnvRecord;
}

/** 요청 컨텍스트의 env. edge 런타임 밖(로컬 next dev)에서는 undefined다 */
export function cloudflareEnv(): EnvRecord | undefined {
  const context = (globalThis as unknown as Record<symbol, RequestContext | undefined>)[
    REQUEST_CONTEXT
  ];
  return context?.env;
}

/**
 * 두 곳에서 값을 찾는다. Cloudflare 컨텍스트가 먼저다 — 배포판에서 값이
 * 있는 쪽이 거기이고, 로컬에는 애초에 컨텍스트가 없어 자연히 넘어간다.
 *
 * 빈 문자열은 없는 것으로 본다. 대시보드에서 값을 지우면 키가 사라지는 게
 * 아니라 빈 문자열로 남는데, 그걸 그대로 들고 가면 기상청이 인증 오류를
 * 돌려줘서 원인이 한 겹 멀어진다.
 */
export function readEnv(name: string, fallback: EnvRecord = {}): string | undefined {
  return cloudflareEnv()?.[name] || fallback[name] || undefined;
}
