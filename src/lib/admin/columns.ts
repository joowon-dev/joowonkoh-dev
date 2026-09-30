import { type Column, ratio } from "./breakdown";
import {
  adFormatName,
  channelName,
  countryName,
  deviceName,
  formatCompact,
  formatDuration,
  formatInt,
  formatPercent,
  formatUsd,
} from "./format";

/** 표 열 묶음. 클라이언트 표가 이름으로 골라 쓴다(서버→클라이언트로 함수를 넘길 수 없어서). */
export const COLUMN_SETS = {
  ga4: [
    { key: "screen_page_views", label: "조회수", format: formatCompact, primary: true },
    { key: "active_users", label: "방문자", format: formatCompact },
    { key: "sessions", label: "세션", format: formatCompact },
    {
      key: "engagement_rate",
      label: "참여율",
      derive: (m) => ratio(m.engaged_sessions, m.sessions),
      format: formatPercent,
    },
    {
      key: "avg_engagement",
      label: "평균 참여 시간",
      derive: (m) => ratio(m.user_engagement_duration, m.active_users),
      format: formatDuration,
    },
  ],
  admob: [
    { key: "estimated_earnings", label: "수익", format: formatUsd, primary: true },
    { key: "impressions", label: "노출", format: formatCompact },
    {
      key: "ecpm",
      label: "eCPM",
      derive: (m) => {
        const r = ratio(m.estimated_earnings, m.impressions);
        return r === null ? null : r * 1000;
      },
      format: formatUsd,
    },
    { key: "clicks", label: "클릭", format: formatInt },
    { key: "ctr", label: "CTR", derive: (m) => ratio(m.clicks, m.impressions), format: formatPercent },
    {
      key: "match_rate",
      label: "매치율",
      derive: (m) => ratio(m.matched_requests, m.ad_requests),
      format: formatPercent,
    },
  ],
  // 게시물 지표는 누적값이라 날짜별 스냅숏으로 쌓인다. 표는 마지막 날 하루치만 넘겨야 한다.
  instagram: [
    { key: "views", label: "조회", format: formatCompact, primary: true },
    { key: "reach", label: "도달", format: formatCompact },
    { key: "likes", label: "좋아요", format: formatInt },
    { key: "comments", label: "댓글", format: formatInt },
    { key: "saved", label: "저장", format: formatInt },
    { key: "shares", label: "공유", format: formatInt },
    {
      key: "engagement",
      label: "반응률",
      derive: (m) => ratio((m.likes ?? 0) + (m.comments ?? 0) + (m.saved ?? 0) + (m.shares ?? 0), m.reach),
      format: formatPercent,
    },
  ],
} satisfies Record<string, Column[]>;

export type ColumnSet = keyof typeof COLUMN_SETS;

/** 표 첫 열에 보일 이름. 차원마다 사람이 읽을 이름이 다르게 온다. */
export type LabelKind = "page" | "country" | "channel" | "device" | "format" | "plain";

export function lineName(kind: LabelKind, value: string, label: string | null): { title: string; sub: string | null } {
  switch (kind) {
    case "page":
      // 제목이 있으면 제목, 경로는 아래 작게
      return label && label !== "(not set)" ? { title: label, sub: value } : { title: value, sub: null };
    case "country":
      return { title: countryName(value), sub: null };
    case "channel":
      return { title: channelName(value), sub: null };
    case "device":
      return { title: deviceName(value), sub: null };
    case "format":
      return { title: adFormatName(value), sub: null };
    case "plain":
      return label ? { title: label, sub: value === label ? null : value } : { title: value, sub: null };
  }
}
