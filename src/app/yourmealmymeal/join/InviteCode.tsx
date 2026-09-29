"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** 앱의 src/lib/groups/inviteCode.ts와 같은 알파벳·길이. 이상한 값은 화면에도 앱 주소에도 넣지 않는다. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 6;

function readCode(search: string): string | null {
  const raw = new URLSearchParams(search).get("code");
  if (!raw) return null;
  const code = raw.replace(/[\s-]/g, "").toUpperCase();
  if (code.length !== LENGTH || ![...code].every((c) => ALPHABET.includes(c))) return null;
  return code;
}

export default function InviteCode() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 주소창은 붙은 뒤에만 읽을 수 있다. 초기값으로 넣으면 서버 HTML과 어긋난다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(readCode(window.location.search));
  }, []);

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const pretty = code ? `${code.slice(0, 3)}-${code.slice(3)}` : null;

  return (
    <div className="mt-10 space-y-8 leading-[1.85] text-text-secondary">
      <section className="rounded-2xl border border-border bg-card-bg p-6 text-center shadow-ambient">
        <p className="text-sm text-text-muted">초대코드</p>
        <p className="mt-2 font-display text-4xl font-bold tracking-[0.12em] text-text-primary">
          {pretty ?? "———"}
        </p>
        {code ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={`yourmealmymeal://group/join?code=${code}`}
              className="w-full max-w-xs rounded-full bg-accent px-6 py-3 font-medium text-white"
            >
              앱에서 열기
            </a>
            <button
              type="button"
              onClick={copy}
              className="text-sm text-accent underline underline-offset-4"
            >
              {copied ? "복사했어요" : "코드 복사"}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm">
            링크에 초대코드가 없거나 잘렸어요. 초대한 사람에게 코드를 다시 받아 주세요.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
          앱에서 안 열리면
        </h2>
        <ol className="ml-5 list-decimal space-y-1.5">
          <li>네밥내밥을 열고 아래 <strong className="text-text-primary">모임</strong> 탭으로 갑니다.</li>
          <li>
            <strong className="text-text-primary">모임 추가 → 초대코드로 참여하기</strong>에 위 코드를 넣습니다.
          </li>
        </ol>
        <p className="mt-3">
          한 모임은 6명까지예요. 자리가 다 찼으면 참여할 수 없어요.
        </p>
      </section>

      <p className="text-sm">
        앱이 아직 없다면{" "}
        <Link href="/yourmealmymeal" className="text-accent underline underline-offset-4">
          네밥내밥 소개
        </Link>
        에서 설치 방법을 확인해 주세요.
      </p>
    </div>
  );
}
