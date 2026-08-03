"use client";

import type { Outcome } from "./game";
import { meterPct, meterSegments } from "./meter";

export const BAND_COLOR: Record<Outcome, string> = {
  short: "#39415f",
  frontRim: "#a9682a",
  clean: "#3fae6a",
  backRim: "#c07f36",
  bank: "#c9a227",
  long: "#39415f",
};

/**
 * 어두운 배경 위 글자용 색.
 *
 * 게이지 칸 색을 그대로 글자에 쓰면 실패 칸(#39415f)이 배경과 거의 같아서
 * 숫자가 안 보인다. 칸을 칠할 때와 글자를 쓸 때 필요한 명도가 다르다.
 */
export const BAND_TEXT: Record<Outcome, string> = {
  short: "#a3abcc",
  frontRim: "#e5a566",
  clean: "#6fe09a",
  backRim: "#efb570",
  bank: "#e8d060",
  long: "#a3abcc",
};

export const BAND_NAME: Record<Outcome, string> = {
  short: "짧음",
  frontRim: "앞 링",
  clean: "클린",
  backRim: "뒤 링",
  bank: "백보드",
  long: "오버",
};

interface Props {
  /** 이 거리에서 클린샷이 나오는 파워 */
  required: number;
  /** 지금 바늘 위치. 아직 안 쳤으면 null */
  value: number | null;
  /** 결과를 보여주는 중이면 바늘을 굵게 남긴다 */
  locked?: boolean;
}

/**
 * 파워 게이지.
 *
 * 왼쪽이 느림, 오른쪽이 빠름이다. 바늘은 첫 글자를 친 순간 오른쪽 끝에서
 * 출발해 시간이 갈수록 왼쪽으로 내려온다 — 늦게 끝낼수록 평균 속도가 느려지니까.
 * 그래서 가까운 슛은 바늘이 초록 칸에 들어올 때까지 기다렸다 마지막 글자를
 * 완성하는 게 정석이고, 먼 슛은 바늘이 내려오기 전에 끝내야 한다.
 */
export default function PowerMeter({ required, value, locked }: Props) {
  const segments = meterSegments(required);

  return (
    <div className="w-full">
      <div className="relative h-8 w-full overflow-hidden rounded border-2 border-[#39415f] bg-[#0c1020]">
        {segments.map((s) => (
          <div
            key={s.outcome}
            className="absolute inset-y-0"
            style={{
              left: `${s.leftPct}%`,
              width: `${s.widthPct}%`,
              background: BAND_COLOR[s.outcome],
            }}
          />
        ))}

        {/* 목표 눈금. 클린 칸 한가운데다 */}
        <div
          aria-hidden
          className="absolute inset-y-0 w-px bg-white/60"
          style={{ left: `${meterPct(required)}%` }}
        />

        {value !== null && (
          <div
            aria-hidden
            className="absolute inset-y-0 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
            style={{ left: `${meterPct(value)}%`, width: locked ? 4 : 3, marginLeft: -1.5 }}
          />
        )}
      </div>

      <div className="mt-1 flex justify-between text-[10px] tracking-wide text-[#8b93b5]">
        <span>천천히</span>
        <span>빠르게</span>
      </div>
    </div>
  );
}

/** 어떤 칸이 무슨 뜻인지 한 번만 보여주는 범례 */
export function BandLegend() {
  const order: Outcome[] = ["short", "frontRim", "clean", "backRim", "bank", "long"];
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
      {order.map((o) => (
        <span key={o} className="flex items-center gap-1.5 text-[11px] text-[#a8b0d0]">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ background: BAND_COLOR[o] }}
          />
          {BAND_NAME[o]}
        </span>
      ))}
    </div>
  );
}
