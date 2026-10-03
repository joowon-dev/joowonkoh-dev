"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { LATEST, RELEASES } from "./releases";

/**
 * 받기. 온 사람의 OS 탭을 먼저 열어 주고, 직접 누른 선택이 그다음부터 이긴다
 * (상어·야구 페이지의 PlatformTabs 와 같은 동작). 첫 화면의 「윈도우에서 받기」는
 * `#windows` 로 와서 윈도우 탭을 연다.
 */

type Platform = "mac" | "windows";

let detectedCache: Platform | null = null;
function detectPlatform(): Platform {
  if (detectedCache === null) {
    const hint = `${navigator.userAgent} ${navigator.platform ?? ""}`;
    detectedCache = /Win/i.test(hint) && !/Mac|iPhone|iPad|iPod/i.test(hint) ? "windows" : "mac";
  }
  return detectedCache;
}
const subscribeNever = () => () => {};

export function useDetectedPlatform() {
  return useSyncExternalStore(subscribeNever, detectPlatform, () => "mac" as Platform);
}

const MAC_STEPS = [
  {
    title: "dmg를 열고 Applications로 끌어 넣어요",
    body: "창이 하나 뜨고 Applications 폴더가 옆에 서 있어요. Chiikawa를 그 위로 끌어 놓으면 끝이에요.",
  },
  {
    title: "더블클릭해서 열어요",
    body: "애플 공증을 받은 앱이라 경고 없이 열려요. 창을 하나 열어 보면 친구들이 아래에서 튀어나와요.",
  },
  {
    title: "메뉴 막대에서 아이콘을 찾아요",
    body: "Dock에는 없어요. 숨기기, 몇 마리까지, 크기, 모니터, 그림 폴더, 종료가 전부 여기 있어요. ⌥⇧K로 숨겼다 다시 부를 수 있어요.",
  },
  {
    title: "권한은 하나도 안 물어봐요",
    body: "창이 어디 있는지만 봐요. 창 제목이나 화면 내용은 읽지 않아서 화면 기록 권한이 필요 없어요. 클릭은 전부 밑의 앱으로 통과해요.",
  },
];

const WIN_STEPS: { title: string; body: string; link?: { href: string; label: string; note: string; external?: boolean } }[] = [
  {
    title: ".NET 9 데스크톱 런타임을 먼저 깔아요",
    body: "앱을 작게 만들려고 런타임을 담지 않았어요. 없으면 실행해도 아무 일도 안 일어난 것처럼 보여요.",
    link: {
      href: "https://aka.ms/dotnet/9.0/windowsdesktop-runtime-win-x64.exe",
      label: ".NET 9 데스크톱 런타임 (x64)",
      note: "약 60MB · 마이크로소프트 공식 · 누르면 바로 받아져요",
      external: true,
    },
  },
  {
    title: "설치 파일을 받아서 실행해요",
    body: "서명이 없어서 SmartScreen이 한 번 막아요. 「추가 정보」 → 「실행」을 누르면 돼요. 관리자 권한은 안 물어봐요.",
    link: {
      href: LATEST.windows.href,
      label: "바탕화면 치이카와 설치 파일",
      note: `${LATEST.version} · ${LATEST.windows.size} · Windows 10 1809 이상 · 64비트`,
    },
  },
  {
    title: "알림 영역에서 아이콘을 찾아요",
    body: "윈도우 11은 새 아이콘을 숨겨 둬요. 시계 옆 ^ 를 눌러 꺼내 두세요. Alt+Shift+K로 숨겼다 다시 부를 수 있어요.",
  },
  {
    title: "창을 최대화하면 작업 표시줄 위에 서요",
    body: "최대화한 창은 윗변이 화면 맨 위라 설 자리가 없어요. 그때 친구들은 작업 표시줄로 내려와요.",
  },
];

export default function Download() {
  const detected = useDetectedPlatform();
  const [chosen, setChosen] = useState<Platform | null>(null);
  const platform = chosen ?? detected;

  // 첫 화면에서 「윈도우에서 받기」를 누르고 왔다.
  useEffect(() => {
    const read = () => {
      if (window.location.hash === "#windows") setChosen("windows");
      if (window.location.hash === "#mac") setChosen("mac");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="운영체제" className="inline-flex gap-1 rounded-full bg-[#f3eef1] p-1">
        {(["mac", "windows"] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={platform === p}
            aria-controls={`ck-panel-${p}`}
            onClick={() => setChosen(p)}
            className={`rounded-full px-5 py-2 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8fab] ${
              platform === p ? "bg-white text-[#4b3a35] shadow-[0_2px_8px_-2px_rgba(75,58,53,0.25)]" : "text-[#4b3a35]/55 hover:text-[#4b3a35]"
            }`}
          >
            {p === "mac" ? "macOS" : "Windows"}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="ck-panel-mac" hidden={platform !== "mac"} className="mt-6">
        <a
          href={LATEST.mac.href}
          download
          className="group flex items-center justify-between gap-4 rounded-[24px] bg-[#ff8fab] px-6 py-5 text-white shadow-[0_14px_30px_-12px_rgba(255,111,150,0.8)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff8fab]"
        >
          <span>
            <span className="ck-display block text-[22px] leading-tight">맥에서 받기</span>
            <span className="mt-1 block text-[13px] text-white/85">
              {LATEST.version}, {LATEST.mac.size}. macOS 13 이상, Apple Silicon과 Intel 모두. 애플 공증.
            </span>
          </span>
          <span aria-hidden className="ck-display shrink-0 rounded-full bg-white/25 px-4 py-2 text-[15px] transition group-hover:bg-white/35">
            dmg
          </span>
        </a>
        <Steps steps={MAC_STEPS} />
      </div>

      <div role="tabpanel" id="ck-panel-windows" hidden={platform !== "windows"} className="mt-6">
        <p className="text-[14px] leading-relaxed text-[#4b3a35]/70">
          순서가 중요해요. 런타임을 먼저 깔아야 설치 파일이 실행돼요.
        </p>
        <Steps steps={WIN_STEPS} />
        <p className="mt-6 text-[13px] leading-relaxed text-[#4b3a35]/60">
          설치 없이 폴더째 쓰고 싶으면{" "}
          <a href={LATEST.windowsZip.href} download className="font-semibold text-[#4b3a35] underline underline-offset-4">
            압축본({LATEST.windowsZip.size})
          </a>
          을 받아도 돼요. 대신 자동 업데이트는 설치본만 돼요.
        </p>
      </div>

      <History />
    </div>
  );
}

function Steps({ steps }: { steps: typeof WIN_STEPS }) {
  return (
    <ol className="mt-6 space-y-5">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span className="ck-display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff0f4] text-[15px] text-[#ff6f96]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-[#4b3a35]">{s.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#4b3a35]/70 break-keep">{s.body}</p>
            {s.link && (
              <a
                href={s.link.href}
                {...(s.link.external ? { target: "_blank", rel: "noreferrer noopener" } : { download: true })}
                className="mt-3 flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_0_0_1px_rgba(75,58,53,0.1)] transition hover:shadow-[0_0_0_2px_#ff8fab] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8fab]"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-[#4b3a35]">{s.link.label}</span>
                  <span className="mt-0.5 block text-[12px] text-[#4b3a35]/55">{s.link.note}</span>
                </span>
                <span className="shrink-0 rounded-full bg-[#fff0f4] px-3 py-1.5 text-[12px] font-semibold text-[#ff6f96]">
                  받기
                </span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 지난 버전. 기본은 접어 둔다 — 대부분은 최신만 받으면 된다. */
function History() {
  return (
    <details className="group mt-10 rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(75,58,53,0.08)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-[#4b3a35]">달라진 것 보기</span>
        <span aria-hidden className="text-[#4b3a35]/50 transition group-open:rotate-180">▾</span>
      </summary>
      <ul className="border-t border-[#4b3a35]/10">
        {RELEASES.map((r) => (
          <li key={r.version} className="px-5 py-4">
            <p className="text-[15px] font-semibold text-[#4b3a35]">
              {r.version}{" "}
              <time dateTime={r.date} className="ml-1 text-[13px] font-normal text-[#4b3a35]/55">
                {r.date}
              </time>
            </p>
            <ul className="mt-2 space-y-1.5">
              {r.notes.map((n) => (
                <li key={n} className="text-[14px] leading-relaxed text-[#4b3a35]/70 break-keep">
                  {n}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
              <a href={r.mac.href} download className="rounded-full bg-[#f3eef1] px-3 py-1.5 font-semibold text-[#4b3a35]">
                macOS {r.mac.size}
              </a>
              <a href={r.windows.href} download className="rounded-full bg-[#f3eef1] px-3 py-1.5 font-semibold text-[#4b3a35]">
                Windows {r.windows.size}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
