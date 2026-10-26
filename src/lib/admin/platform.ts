import type { AppEntry } from "./live";

/**
 * 앱이 도는 곳. AdMob 은 플랫폼마다 앱을 따로 만들고, GA4 는 한 속성 안에서 platform 차원으로 나눈다.
 * 웹은 앱의 웹 버전(치비아쿠처럼 같은 GA4 속성에 웹 스트림이 있는 앱)이다.
 */
export type Platform = "ios" | "android" | "web";

/** 앱 카드에 늘 보이는 줄. 웹은 사용자가 있을 때만 붙인다. */
export const APP_PLATFORMS: readonly Platform[] = ["ios", "android"];

export const PLATFORM_LABELS: Record<Platform, string> = { ios: "iOS", android: "Android", web: "웹" };

/** GA4 platform 차원값("iOS" · "Android" · "web") → 플랫폼. */
export function ga4Platform(label: string): Platform | null {
  const l = label.toLowerCase();
  if (l === "ios" || l === "android" || l === "web") return l;
  return null;
}

const LABEL_SUFFIX = /\s*\((iOS|Android)\)\s*$/i;

export type AdmobAppName = { name: string; platform: Platform | null; slug: string | null };

/**
 * AdMob 앱 id(+AdMob 이 붙인 이름) → 사람이 읽을 이름과 플랫폼.
 * 등록부에 있으면 등록부 이름과 플랫폼을 쓴다. 없으면(옛 앱) 「… (Android)」 같은 꼬리를 읽는다.
 */
export function admobAppName(apps: readonly AppEntry[], appId: string, label: string | null): AdmobAppName {
  for (const app of apps) {
    if (!app.admob_app_ids.includes(appId)) continue;
    return { name: app.name, platform: app.admob_platforms[appId] ?? null, slug: app.slug };
  }
  const raw = label ?? appId;
  const m = raw.match(LABEL_SUFFIX);
  return {
    name: m ? raw.replace(LABEL_SUFFIX, "") : raw,
    platform: m ? (m[1].toLowerCase() as "ios" | "android") : null,
    slug: null,
  };
}
