import { describe, expect, it } from "vitest";
import type { AppEntry } from "./live";
import { admobAppName, ga4Platform } from "./platform";

const moneytick: AppEntry = {
  slug: "moneytick",
  name: "이게내연봉",
  kind: "app",
  sort: 1,
  ios_bundle_id: null,
  android_package: null,
  app_store_id: null,
  play_listed: true,
  admob_app_ids: ["a~ios", "a~android"],
  admob_platforms: { "a~ios": "ios", "a~android": "android" },
  ga4_property_id: null,
};

describe("admobAppName", () => {
  it("등록부에 있으면 등록부 이름 + 플랫폼 — AdMob 이 붙인 긴 이름은 버린다", () => {
    expect(admobAppName([moneytick], "a~android", "이게내연봉: 실시간 연봉·월급 계산기")).toEqual({
      name: "이게내연봉",
      platform: "android",
      slug: "moneytick",
    });
  });

  it("등록부에 없으면 이름 꼬리의 (iOS)/(Android) 를 읽는다", () => {
    expect(admobAppName([moneytick], "p~1", "파스타 한 줌 (Android)")).toEqual({ name: "파스타 한 줌", platform: "android", slug: null });
    expect(admobAppName([], "p~2", "파스타 한 줌 (iOS)").platform).toBe("ios");
  });

  it("꼬리도 없으면 플랫폼은 모른다", () => {
    expect(admobAppName([], "z~1", "옛 앱")).toEqual({ name: "옛 앱", platform: null, slug: null });
    expect(admobAppName([], "z~1", null).name).toBe("z~1");
  });
});

describe("ga4Platform", () => {
  it("GA4 platform 차원값", () => {
    expect(ga4Platform("iOS")).toBe("ios");
    expect(ga4Platform("Android")).toBe("android");
    expect(ga4Platform("web")).toBe("web");
    expect(ga4Platform("(not set)")).toBeNull();
  });
});
