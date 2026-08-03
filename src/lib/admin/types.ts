export const SOURCES = ["ga4", "admob", "instagram"] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  ga4: "GA4",
  admob: "AdMob",
  instagram: "Instagram",
};

/** metrics_daily 한 행. 소스가 무엇이든 이 한 모양으로 눕힌다. */
export type MetricRow = {
  source: Source;
  metric_date: string; // YYYY-MM-DD
  entity: string;
  metric_key: string;
  value: number;
};

/** collection_runs 한 행. 소스별 마지막 수집 상태. */
export type CollectionRun = {
  source: Source;
  last_run_at: string | null;
  last_success: string | null;
  status: "ok" | "error";
  error: string | null;
};
