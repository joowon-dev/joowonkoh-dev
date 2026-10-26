import { describe, expect, it } from "vitest";
import {
  appleChartUrl,
  hourFloor,
  parseAppleChart,
  parseAppleLookup,
  parseAppleReviews,
  parsePlayChart,
  parsePlayDetails,
  parsePlayReviews,
  playChartRequest,
  rankOf,
} from "./store";

const AT = "2026-10-26T14:00:00.000Z";

describe("hourFloor / rankOf", () => {
  it("시 단위로 자른다", () => {
    expect(hourFloor(new Date("2026-10-26T14:37:12.5Z"))).toBe(AT);
  });
  it("순위는 1부터, 없으면 null", () => {
    expect(rankOf(["a", "b"], "b")).toBe(2);
    expect(rankOf(["a"], "z")).toBeNull();
  });
});

// 2026-10-26 lookup?id=6795989020&country=kr 응답을 줄였다.
const LOOKUP = {
  resultCount: 1,
  results: [
    {
      trackId: 6795989020,
      trackName: "이게내연봉",
      averageUserRating: 3.95,
      userRatingCount: 40,
      version: "1.6.4",
      currentVersionReleaseDate: "2026-10-24T02:21:47Z",
      primaryGenreName: "Finance",
      primaryGenreId: 6015,
    },
  ],
};

describe("parseAppleLookup", () => {
  it("별점·평가 수, 장르 id 를 차트 키로", () => {
    const { metrics, listing } = parseAppleLookup(LOOKUP, "moneytick", AT);
    expect(metrics).toEqual([
      { at: AT, app_slug: "moneytick", store: "ios", metric_key: "rating", value: 3.95 },
      { at: AT, app_slug: "moneytick", store: "ios", metric_key: "rating_count", value: 40 },
    ]);
    expect(listing).toMatchObject({ version: "1.6.4", genre: "Finance", genre_key: "6015" });
  });

  it("결과가 없으면 던진다(앱이 내려갔거나 id 가 틀렸다)", () => {
    expect(() => parseAppleLookup({ results: [] }, "x", AT)).toThrow();
  });
});

describe("App Store 차트", () => {
  it("장르가 없으면 전체 차트", () => {
    expect(appleChartUrl(null)).toBe("https://itunes.apple.com/kr/rss/topfreeapplications/limit=200/json");
    expect(appleChartUrl("6015")).toContain("/genre=6015/json");
  });

  it("entry 순서가 순위", () => {
    const body = { feed: { entry: [{ id: { attributes: { "im:id": "1" } } }, { id: { attributes: { "im:id": "6795989020" } } }] } };
    expect(rankOf(parseAppleChart(body), "6795989020")).toBe(2);
  });

  it("모양이 바뀌면 던진다", () => {
    expect(() => parseAppleChart({ feed: {} })).toThrow(/feed.entry/);
  });
});

const APPLE_REVIEW = {
  author: { name: { label: "블랙퍼플냥" } },
  updated: { label: "2026-10-24T10:17:36-07:00" },
  "im:rating": { label: "4" },
  "im:version": { label: "1.6.4" },
  id: { label: "14706285618" },
  title: { label: "어플이 직관적이라 좋아요💙" },
  content: { label: "부수입도 따로 입력할 수 있으면 좋겠어요" },
};

describe("parseAppleReviews", () => {
  it("한 줄씩, 시각은 UTC 로", () => {
    const [r] = parseAppleReviews({ feed: { entry: [APPLE_REVIEW] } }, "moneytick");
    expect(r).toEqual({
      store: "ios",
      review_id: "14706285618",
      app_slug: "moneytick",
      rating: 4,
      title: "어플이 직관적이라 좋아요💙",
      body: "부수입도 따로 입력할 수 있으면 좋겠어요",
      author: "블랙퍼플냥",
      version: "1.6.4",
      reviewed_at: "2026-10-24T17:17:36.000Z",
      replied: false,
    });
  });

  it("리뷰가 하나면 객체, 없으면 entry 가 없다", () => {
    expect(parseAppleReviews({ feed: { entry: APPLE_REVIEW } }, "m")).toHaveLength(1);
    expect(parseAppleReviews({ feed: {} }, "m")).toEqual([]);
  });
});

/** Play 상세 페이지에서 ds:5 블록만 흉내 낸다. 배열 위치는 2026-10-26 실제 페이지에서 확인. */
function playHtml(d: Record<number, unknown>) {
  const arr: unknown[] = [];
  for (const [k, v] of Object.entries(d)) arr[Number(k)] = v;
  const data = JSON.stringify([[[[]]], [null, null, arr]]);
  return `<script nonce="x">AF_initDataCallback({key: 'ds:4', hash: '1', data:[1], sideChannel: {}});</script>` +
    `<script nonce="x">AF_initDataCallback({key: 'ds:5', hash: '11', data:${data}, sideChannel: {}});</script>`;
}

describe("parsePlayDetails", () => {
  it("별점·평가 수·정확한 설치 수·버전·카테고리", () => {
    const html = playHtml({
      0: ["이게내연봉: 실시간 연봉·월급 계산기"],
      13: ["1,000+", 1000, 2071, "2천+"],
      51: [[null, 4.714286], null, [null, 7]],
      79: [[["금융", null, "FINANCE"]]],
      140: [[["1.6.5"]]],
      145: [["2026. 10. 25."]],
    });
    const { metrics, listing } = parsePlayDetails(html, "moneytick", AT);
    expect(Object.fromEntries(metrics.map((m) => [m.metric_key, m.value]))).toEqual({
      rating: 4.714286,
      rating_count: 7,
      installs: 2071,
    });
    expect(listing).toMatchObject({ version: "1.6.5", updated: "2026. 10. 25.", genre: "금융", genre_key: "FINANCE" });
  });

  it("평가가 적어 별점이 없으면 설치 수만", () => {
    const html = playHtml({ 0: ["네밥내밥"], 13: ["10+", 10, 29, "10+"], 51: null, 79: [[["식음료", null, "FOOD_AND_DRINK"]]] });
    const { metrics, listing } = parsePlayDetails(html, "yourmealmymeal", AT);
    expect(metrics.map((m) => m.metric_key)).toEqual(["installs"]);
    expect(listing.version).toBeNull();
  });

  it("ds:5 가 없으면(막혔거나 모양이 바뀜) 던진다", () => {
    expect(() => parsePlayDetails("<html>consent</html>", "x", AT)).toThrow(/ds:5/);
  });
});

/** batchexecute 응답 모양. */
function batch(rpc: string, payload: unknown) {
  return `)]}'\n\n123\n${JSON.stringify([["wrb.fr", rpc, JSON.stringify(payload), null, null, null, "generic"]])}\n25\n[["e",4]]`;
}

describe("Play 차트", () => {
  it("요청 본문에 카테고리가 들어간다", () => {
    expect(decodeURIComponent(playChartRequest("FINANCE").body)).toContain('\\"topselling_free\\",\\"FINANCE\\"');
  });

  it("items[i][0][0][0] 이 패키지명, 순서가 순위", () => {
    const item = (pkg: string) => [[[pkg, 7]]];
    const payload = [[null, [Object.assign([], { 28: [[item("com.a"), item("dev.joowon.moneytick")]] })]]];
    const ids = parsePlayChart(batch("vyAe2", payload));
    expect(ids).toEqual(["com.a", "dev.joowon.moneytick"]);
  });

  it("모양이 바뀌면 던진다", () => {
    expect(() => parsePlayChart(batch("vyAe2", [[null, []]]))).toThrow(/모양/);
    expect(() => parsePlayChart("<html>")).toThrow(/wrb.fr/);
  });
});

describe("parsePlayReviews", () => {
  it("별점·본문·작성 시각·답변 여부", () => {
    const review = [
      "9634fd57-8bb",
      ["연봉러"],
      5,
      null,
      "연차,유급휴가도 추가해주세요!",
      [1760946523, 0],
      0,
      [null, "다음 버전에 넣을게요", [1760950000]],
      null,
      null,
      "1.6.5",
    ];
    const [r] = parsePlayReviews(batch("UsvDTd", [[review], null]), "moneytick");
    expect(r).toEqual({
      store: "android",
      review_id: "9634fd57-8bb",
      app_slug: "moneytick",
      rating: 5,
      title: null,
      body: "연차,유급휴가도 추가해주세요!",
      author: "연봉러",
      version: "1.6.5",
      reviewed_at: new Date(1760946523 * 1000).toISOString(),
      replied: true,
    });
  });

  it("리뷰가 없으면 빈 배열", () => {
    expect(parsePlayReviews(batch("UsvDTd", [null, null]), "x")).toEqual([]);
  });
});
