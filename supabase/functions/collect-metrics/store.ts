/**
 * 스토어 공개 정보 — App Store(iTunes lookup·차트 RSS·리뷰 RSS)와 Google Play(상세 페이지·
 * batchexecute 차트·리뷰) → store_metrics / store_listing / store_reviews 행.
 *
 * 둘 다 공식 API 가 아니다. Play 는 페이지 안의 배열 위치를 읽으므로 구글이 모양을 바꾸면
 * 조용히 틀리지 않게 **못 읽으면 던진다**(collection_runs 에 남아 배너가 뜬다).
 * 나라는 한국(kr) 하나만 본다.
 *
 * ga4.ts 와 같은 이유로 외부 패키지를 쓰지 않는다.
 */

export type Store = "ios" | "android";

/** store_metrics 한 행. at 은 시 단위로 자른 수집 시각. */
export type StoreMetricRow = {
  at: string;
  app_slug: string;
  store: Store;
  metric_key: string;
  value: number;
};

/** store_listing 한 행 — 앱 × 스토어마다 최신 한 장. */
export type StoreListing = {
  app_slug: string;
  store: Store;
  at: string;
  title: string | null;
  version: string | null;
  updated: string | null; // 스토어가 보여 주는 대로(ISO 또는 「2026. 10. 25.」)
  genre: string | null; // 사람이 읽는 이름
  genre_key: string | null; // 차트를 부를 때 쓰는 값(App Store 장르 id, Play 카테고리)
};

export type ReviewRow = {
  store: Store;
  review_id: string;
  app_slug: string;
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  version: string | null;
  reviewed_at: string;
  replied: boolean;
};

/** 위치로만 읽는 Play 배열에서 안전하게 꺼낸다. 중간이 배열이 아니면 undefined. */
export function dig(value: unknown, ...path: number[]): unknown {
  let cur = value;
  for (const i of path) {
    if (!Array.isArray(cur)) return undefined;
    cur = cur[i];
  }
  return cur;
}

const str = (v: unknown) => (typeof v === "string" ? v : null);

export function hourFloor(now: Date): string {
  const d = new Date(now);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

/** 순위는 1부터. 차트에 없으면 null(차트 길이 밖). */
export function rankOf(ids: readonly string[], id: string): number | null {
  const i = ids.indexOf(id);
  return i < 0 ? null : i + 1;
}

// ---------------------------------------------------------------- App Store

type AppleLookup = {
  results?: {
    trackId: number;
    trackName?: string;
    averageUserRating?: number;
    userRatingCount?: number;
    version?: string;
    currentVersionReleaseDate?: string;
    primaryGenreName?: string;
    primaryGenreId?: number;
  }[];
};

export function parseAppleLookup(body: AppleLookup, slug: string, at: string) {
  const app = body.results?.[0];
  if (!app) throw new Error(`App Store lookup 결과가 없다(${slug})`);

  const metrics: StoreMetricRow[] = [];
  const push = (metric_key: string, v: number | undefined) => {
    if (typeof v === "number" && Number.isFinite(v)) metrics.push({ at, app_slug: slug, store: "ios", metric_key, value: v });
  };
  push("rating", app.averageUserRating);
  push("rating_count", app.userRatingCount);

  const listing: StoreListing = {
    app_slug: slug,
    store: "ios",
    at,
    title: app.trackName ?? null,
    version: app.version ?? null,
    updated: app.currentVersionReleaseDate ?? null,
    genre: app.primaryGenreName ?? null,
    genre_key: app.primaryGenreId ? String(app.primaryGenreId) : null,
  };
  return { metrics, listing };
}

/** 차트 RSS(JSON). 지금은 limit=200 을 줘도 100개까지만 온다. genre 를 빼면 전체 차트. */
export function appleChartUrl(genreId: string | null): string {
  const genre = genreId ? `/genre=${genreId}` : "";
  return `https://itunes.apple.com/kr/rss/topfreeapplications/limit=200${genre}/json`;
}

export function parseAppleChart(body: { feed?: { entry?: { id: { attributes: { "im:id": string } } }[] } }): string[] {
  const entries = body.feed?.entry;
  if (!Array.isArray(entries)) throw new Error("App Store 차트 RSS 모양이 바뀌었다(feed.entry 없음)");
  return entries.map((e) => e.id.attributes["im:id"]);
}

export function appleReviewsUrl(appStoreId: number): string {
  return `https://itunes.apple.com/kr/rss/customerreviews/page=1/id=${appStoreId}/sortby=mostrecent/json`;
}

type AppleReviewEntry = {
  id: { label: string };
  author?: { name?: { label: string } };
  updated: { label: string };
  "im:rating": { label: string };
  "im:version"?: { label: string };
  title?: { label: string };
  content?: { label: string };
};

/** 리뷰가 하나면 entry 가 배열이 아니라 객체로 온다. 없으면 entry 가 없다. */
export function parseAppleReviews(
  body: { feed?: { entry?: AppleReviewEntry | AppleReviewEntry[] } },
  slug: string,
): ReviewRow[] {
  const raw = body.feed?.entry;
  const entries = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  return entries
    .filter((e) => e["im:rating"]) // 옛 피드는 첫 entry 가 앱 정보였다
    .map((e) => ({
      store: "ios" as const,
      review_id: e.id.label,
      app_slug: slug,
      rating: Number(e["im:rating"].label),
      title: e.title?.label ?? null,
      body: e.content?.label ?? "",
      author: e.author?.name?.label ?? null,
      version: e["im:version"]?.label ?? null,
      reviewed_at: new Date(e.updated.label).toISOString(),
      replied: false, // RSS 는 개발자 답변을 주지 않는다
    }));
}

// ---------------------------------------------------------------- Google Play

export function playDetailsUrl(pkg: string): string {
  return `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=ko&gl=KR`;
}

/** 상세 페이지의 AF_initDataCallback 블록 중 ds:5 가 앱 정보다. */
export function parsePlayDetails(html: string, slug: string, at: string) {
  const m = html.match(/AF_initDataCallback\(\{key: 'ds:5', hash: '[^']*', data:([\s\S]*?), sideChannel: \{\}\}\);/);
  if (!m) throw new Error(`Play 상세 페이지에 ds:5 가 없다(${slug}) — 페이지 모양이 바뀌었거나 막혔다`);
  const d = dig(JSON.parse(m[1]), 1, 2);
  const title = str(dig(d, 0, 0));
  if (title === null) throw new Error(`Play ds:5 에서 앱 제목을 못 읽었다(${slug})`);

  const metrics: StoreMetricRow[] = [];
  const push = (metric_key: string, v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) metrics.push({ at, app_slug: slug, store: "android", metric_key, value: v });
  };
  // 평가가 몇 개 안 되면 Play 는 별점을 안 보여 준다(d[51] 이 null).
  push("rating", dig(d, 51, 0, 1));
  push("rating_count", dig(d, 51, 2, 1));
  // d[13] = ["1,000+", 1000, 2071, "2천+"] — 세 번째가 정확한 설치 수
  push("installs", dig(d, 13, 2));

  const listing: StoreListing = {
    app_slug: slug,
    store: "android",
    at,
    title,
    version: str(dig(d, 140, 0, 0, 0)),
    updated: str(dig(d, 145, 0, 0)),
    genre: str(dig(d, 79, 0, 0, 0)),
    genre_key: str(dig(d, 79, 0, 0, 2)),
  };
  return { metrics, listing };
}

const BATCH_URL = "https://play.google.com/_/PlayStoreUi/data/batchexecute?hl=ko&gl=kr";

function batchBody(rpc: string, inner: unknown): string {
  return "f.req=" + encodeURIComponent(JSON.stringify([[[rpc, JSON.stringify(inner), null, "generic"]]]));
}

/** batchexecute 응답 첫 줄은 `)]}'`. 그 뒤 `[["wrb.fr", rpc, "<JSON 문자열>", ...]]`. */
function batchPayload(text: string, rpc: string): unknown {
  const line = text.split("\n").find((l) => l.startsWith('[["wrb.fr"'));
  if (!line) throw new Error(`Play ${rpc} 응답에 wrb.fr 이 없다`);
  const inner = JSON.parse(line)[0]?.[2];
  if (typeof inner !== "string") throw new Error(`Play ${rpc} 응답이 비었다`);
  return JSON.parse(inner);
}

/** 카테고리 인기 무료 200. 전체 차트는 category = "APPLICATION". */
export function playChartRequest(category: string) {
  return {
    url: BATCH_URL,
    body: batchBody("vyAe2", [[null, [[null, [null, 200]], null, null, [113]], [2, "topselling_free", category]]]),
  };
}

export function parsePlayChart(text: string): string[] {
  const items = dig(batchPayload(text, "vyAe2"), 0, 1, 0, 28, 0);
  if (!Array.isArray(items)) throw new Error("Play 차트 응답 모양이 바뀌었다");
  return items.map((it) => str(dig(it, 0, 0, 0))).filter((id): id is string => id !== null);
}

/** 최신순 40개. */
export function playReviewsRequest(pkg: string) {
  return { url: BATCH_URL, body: batchBody("UsvDTd", [null, null, [2, 2, [40, null, null]], [pkg, 7]]) };
}

export function parsePlayReviews(text: string, slug: string): ReviewRow[] {
  const list = dig(batchPayload(text, "UsvDTd"), 0);
  if (list == null) return []; // 리뷰가 없는 앱
  if (!Array.isArray(list)) throw new Error("Play 리뷰 응답 모양이 바뀌었다");
  return list.map((v) => ({
    store: "android" as const,
    review_id: String(dig(v, 0)),
    app_slug: slug,
    rating: Number(dig(v, 2)),
    title: null,
    body: str(dig(v, 4)) ?? "",
    author: str(dig(v, 1, 0)),
    version: str(dig(v, 10)),
    reviewed_at: new Date(Number(dig(v, 5, 0)) * 1000).toISOString(),
    replied: Boolean(dig(v, 7, 1)),
  }));
}
