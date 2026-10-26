import Link from "next/link";
import { formatInt, formatUsd } from "@/lib/admin/format";
import {
  type AppCard,
  type LiveProblem,
  mergeMinutes,
  mergeRanked,
  type LiveDetailRow,
  type Ranked,
  storeLinks,
} from "@/lib/admin/live";
import AutoRefresh from "./AutoRefresh";
import { Notice, Panel } from "./ui";

const LIVE_LABELS: Record<LiveProblem["source"], string> = {
  ga4_live: "GA4 실시간",
  admob_today: "AdMob 오늘치",
};

/**
 * 「앱」 화면 맨 위 — 지금 몇 명이 쓰고 있나, 오늘 얼마 벌었나, 앱마다.
 * 1분마다 수집된 걸 60초마다 다시 그린다.
 */
export default function LiveHub({
  now,
  users,
  earnings,
  impressions,
  series,
  cards,
  details,
  problems,
}: {
  now: Date;
  users: { at: string | null; value: number | null };
  earnings: { at: string | null; value: number | null };
  impressions: number | null;
  series: { at: string; value: number }[];
  cards: AppCard[];
  details: LiveDetailRow[];
  problems: LiveProblem[];
}) {
  const minutes = mergeMinutes(details);
  const unlinked = cards.filter((c) => c.app.kind === "app" && !c.app.ga4_property_id);

  return (
    <section aria-label="지금">
      <AutoRefresh seconds={60} />

      {problems.length > 0 && (
        <Notice>
          <p className="font-semibold">실시간 수집이 밀렸어요</p>
          <ul className="mt-1 space-y-0.5">
            {problems.map((p) => (
              <li key={p.source}>
                {LIVE_LABELS[p.source]}:{" "}
                {p.minutesSince === null ? "아직 수집한 적이 없어요" : `마지막 성공 ${ago(p.minutesSince)}`}
                {p.error ? ` (${p.error})` : ""}
              </li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Big
          label="지금 쓰는 사람"
          value={users.value === null ? "–" : `${formatInt(users.value)}명`}
          note={`최근 30분 · 앱과 웹 GA4 합 · ${stamp(users.at, now)}`}
        >
          <MinuteBars minutes={minutes} />
        </Big>
        <Big
          label="오늘 AdMob 수익"
          value={earnings.value === null ? "–" : formatUsd(earnings.value)}
          note={`노출 ${impressions === null ? "–" : formatInt(impressions)} · AdMob 은 몇 시간 늦게 채워요 · ${stamp(earnings.at, now)}`}
        />
      </div>

      <Panel title="오늘 하루" aside="분마다 · 최근 30분 사용자 합">
        <DayLine series={series} />
      </Panel>

      <Panel title="내 앱" aside={unlinked.length > 0 ? `GA4 미연결 ${unlinked.length}개` : undefined}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <AppTile key={card.app.slug} card={card} />
          ))}
        </ul>
        {unlinked.length > 0 && (
          <p className="mt-3 text-xs text-[var(--ink-faint)]">
            GA4 미연결: 서비스 계정을 그 앱의 GA4 속성에 「뷰어」로 추가하면 다음 날 02:20 에 자동으로 붙어요.
          </p>
        )}
      </Panel>

      <div className="grid gap-x-8 sm:grid-cols-2">
        <Panel title="지금 보는 화면" aside="최근 30분">
          <RankList items={mergeRanked(details, "screens")} />
        </Panel>
        <Panel title="지금 어디서" aside="최근 30분">
          <RankList items={mergeRanked(details, "countries")} />
        </Panel>
      </div>
    </section>
  );
}

function Big({ label, value, note, children }: { label: string; value: string; note: string; children?: React.ReactNode }) {
  return (
    <div className="border-l-2 border-[var(--apps)] py-1 pl-4">
      <p className="text-[13px] text-[var(--ink-soft)]">{label}</p>
      <p className="admin-num mt-0.5 text-[40px] font-semibold leading-tight tracking-tight lg:text-[48px]">{value}</p>
      <p className="admin-num text-xs text-[var(--ink-faint)]">{note}</p>
      {children}
    </div>
  );
}

/** 30분을 막대 30개로. 오른쪽이 지금 — GA4 실시간 화면과 같은 방향. */
function MinuteBars({ minutes }: { minutes: number[] }) {
  const max = Math.max(1, ...minutes);
  const bars = [...minutes].reverse();
  return (
    <div className="mt-3 flex h-10 items-end gap-[2px]" role="img" aria-label="최근 30분 분별 사용자">
      {bars.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px] bg-[var(--apps)]"
          style={{ height: `${Math.max(4, (v / max) * 100)}%`, opacity: v === 0 ? 0.2 : 0.85 }}
          title={`${29 - i}분 전 ${v}명`}
        />
      ))}
    </div>
  );
}

const W = 800;
const H = 140;

/** 오늘 0시부터 지금까지. 수집이 빈 분(5분 넘게)은 선을 끊는다. */
function DayLine({ series }: { series: { at: string; value: number }[] }) {
  if (series.length < 2) {
    return <p className="text-sm text-[var(--ink-faint)]">오늘 모은 실시간 기록이 아직 없어요.</p>;
  }
  const t0 = Date.parse(series[0].at);
  const t1 = Math.max(Date.parse(series.at(-1)!.at), t0 + 60_000);
  const max = Math.max(1, ...series.map((p) => p.value));
  const x = (t: number) => ((t - t0) / (t1 - t0)) * W;
  const y = (v: number) => H - 6 - (v / max) * (H - 18);

  let d = "";
  let prev = 0;
  for (const p of series) {
    const t = Date.parse(p.at);
    d += `${d === "" || t - prev > 5 * 60_000 ? "M" : "L"}${x(t).toFixed(1)},${y(p.value).toFixed(1)}`;
    prev = t;
  }
  const peak = series.reduce((a, b) => (b.value > a.value ? b : a));

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full" preserveAspectRatio="none" role="img" aria-label="오늘 분별 사용자 추이">
        <line x1={0} x2={W} y1={H - 6} y2={H - 6} stroke="var(--rule)" />
        <path d={d} fill="none" stroke="var(--apps)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="admin-num mt-1 flex justify-between text-xs text-[var(--ink-faint)]">
        <span>{clock(series[0].at)}</span>
        <span>
          최고 {formatInt(peak.value)}명 · {clock(peak.at)}
        </span>
        <span>{clock(series.at(-1)!.at)}</span>
      </figcaption>
    </figure>
  );
}

function AppTile({ card }: { card: AppCard }) {
  const { app } = card;
  const links = storeLinks(app);
  return (
    <li className="rounded-xl border border-[var(--rule)] bg-[var(--paper-raised)] p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate font-semibold">{app.name}</p>
        <p className="flex shrink-0 gap-2 text-xs">
          {links.appStore && (
            <a href={links.appStore} target="_blank" rel="noreferrer" className="text-[var(--ink-soft)] underline-offset-2 hover:underline">
              App Store
            </a>
          )}
          {links.play && (
            <a href={links.play} target="_blank" rel="noreferrer" className="text-[var(--ink-soft)] underline-offset-2 hover:underline">
              Play
            </a>
          )}
          {app.kind === "web" && (
            <Link href="/" className="text-[var(--ink-soft)] underline-offset-2 hover:underline">
              사이트
            </Link>
          )}
        </p>
      </div>
      <dl className="admin-num mt-3 grid grid-cols-3 gap-2 text-sm">
        <Cell label="30분" value={card.liveUsers === null ? null : `${formatInt(card.liveUsers)}명`} empty={app.ga4_property_id ? "–" : "GA4 미연결"} />
        <Cell label="오늘 수익" value={card.earnings === null ? null : formatUsd(card.earnings)} empty={app.kind === "web" ? "" : "–"} />
        <Cell label="노출" value={card.impressions === null ? null : formatInt(card.impressions)} empty={app.kind === "web" ? "" : "–"} />
      </dl>
    </li>
  );
}

function Cell({ label, value, empty }: { label: string; value: string | null; empty: string }) {
  return (
    <div>
      <dt className="text-[11px] text-[var(--ink-faint)]">{label}</dt>
      <dd className={value === null ? "text-xs text-[var(--ink-faint)]" : "font-semibold"}>{value ?? empty}</dd>
    </div>
  );
}

function RankList({ items }: { items: Ranked[] }) {
  if (items.length === 0) return <p className="text-sm text-[var(--ink-faint)]">지금은 아무도 없어요.</p>;
  const max = items[0].users;
  return (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="relative overflow-hidden rounded-md px-2 py-1 text-sm">
          <span className="absolute inset-y-0 left-0 bg-[var(--apps)] opacity-15" style={{ width: `${(item.users / max) * 100}%` }} />
          <span className="relative flex justify-between gap-3">
            <span className="truncate">{item.label}</span>
            <span className="admin-num shrink-0 text-[var(--ink-soft)]">{formatInt(item.users)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const CLOCK = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false });

function clock(iso: string) {
  return CLOCK.format(new Date(iso));
}

function stamp(at: string | null, now: Date) {
  if (at === null) return "수집 전";
  return `${clock(at)} 기준 (${ago((now.getTime() - Date.parse(at)) / 60_000)})`;
}

function ago(minutes: number) {
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${Math.floor(minutes)}분 전`;
  return `${Math.floor(minutes / 60)}시간 전`;
}
