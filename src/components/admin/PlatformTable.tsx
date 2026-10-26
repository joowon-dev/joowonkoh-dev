import { formatInt, formatUsd } from "@/lib/admin/format";
import type { AppCard } from "@/lib/admin/live";
import { PlatformBadge } from "./ui";

/** 앱 하나의 지금 — 합계 한 줄 + iOS · Android 한 줄씩. 열은 30분 사용자 · 오늘 수익 · 노출. */
export default function PlatformTable({ card, className = "mt-3" }: { card: AppCard; className?: string }) {
  const { app } = card;
  const isApp = app.kind === "app";
  const usersEmpty = app.ga4_property_id ? "–" : "미연결";
  const users = (v: number) => `${formatInt(v)}명`;
  return (
    <table className={`admin-num w-full text-right text-sm ${className}`}>
      <thead>
        <tr className="text-[11px] text-[var(--ink-faint)] [&>th]:pb-1 [&>th]:font-normal">
          <th scope="col" className="text-left">
            <span className="sr-only">플랫폼</span>
          </th>
          <th scope="col">30분</th>
          {isApp && <th scope="col">오늘 수익</th>}
          {isApp && <th scope="col">노출</th>}
        </tr>
      </thead>
      <tbody>
        <tr className="font-semibold">
          <th scope="row" className="text-left text-[12px] font-normal text-[var(--ink-soft)]">
            {isApp ? "합계" : "웹"}
          </th>
          <Num value={card.liveUsers} format={users} empty={usersEmpty} />
          {isApp && <Num value={card.earnings} format={formatUsd} />}
          {isApp && <Num value={card.impressions} format={formatInt} />}
        </tr>
        {card.platforms.map((p) => (
          <tr key={p.platform} className="border-t border-[var(--grid)] text-[var(--ink-soft)]">
            <th scope="row" className="py-1 text-left font-normal">
              <PlatformBadge platform={p.platform} />
            </th>
            <Num value={p.users} format={users} empty={usersEmpty} />
            <Num value={p.earnings} format={formatUsd} />
            <Num value={p.impressions} format={formatInt} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Num({ value, format, empty = "–" }: { value: number | null; format: (v: number) => string; empty?: string }) {
  return (
    <td className={`py-1 ${value === null ? "text-[11px] font-normal text-[var(--ink-faint)]" : ""}`}>
      {value === null ? empty : format(value)}
    </td>
  );
}
