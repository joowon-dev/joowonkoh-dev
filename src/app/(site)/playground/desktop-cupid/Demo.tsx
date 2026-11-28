"use client";

import { useEffect, useRef, useState } from "react";

// 앱과 같은 코드. kit/README.md 참고.
import * as arrow from "./kit/carriers/arrow.js";
import { landing as kitLanding } from "./kit/game/landing.js";
import { createBow } from "./kit/renderer/bow.js";

/**
 * 페이지 맨 위 — **바탕화면 둘.** 왼쪽이 내 화면, 오른쪽이 친구 화면이다.
 *
 * 내 화면 아래의 활을 당겼다 놓으면 화살이 내 화면 밖으로 날아가고, 친구 화면 가장자리로 날아 들어와 꽂힌다
 * (오른쪽으로 쏘면 친구 화면 왼쪽에서). 세게 쏠수록 깊이 꽂힌다. 꽂힌 화살을 누르면 쪽지가 펼쳐진다.
 * 활·화살·꽂히는 자리는 전부 앱의 코드(kit/)라 앱에서와 똑같이 움직인다. 서버에는 붙지 않는다.
 */

/** 가상의 화면 크기. 이만한 화면을 그리고 통째로 줄인다 — 화살과 활이 앱과 같은 비율로 보인다. */
const W = 840;
const H = 540;
const MENU = 30;
const ROOM = { x: 0, y: MENU, w: W, h: H - MENU };
/** 친구 화면에 꽂혀 있는 화살의 수. 넘으면 오래된 것부터 뽑는다. */
const MAX_STUCK = 8;

const SAMPLES = ["오늘 저녁 같이 먹을래? 🍜", "보고 싶다 💘", "회의 끝나면 커피 ☕️", "이거 봤어? 대박이야", "퇴근 몇 시야?"];

type Point = { x: number; y: number };
/** kit 의 JS 는 taken 의 기본값([])에서 타입을 never[] 로 짐작한다. 받는 꼴을 적어 준다. */
const landing = kitLanding as (opts: {
  power: number;
  angle: number;
  seed: string;
  room: typeof ROOM;
  taken: Point[];
}) => ReturnType<typeof kitLanding>;

type Note = { body: string; x: number; y: number };
type Stuck = { id: string; el: HTMLElement; to: { x: number; y: number } };
type Bow = ReturnType<typeof createBow>;

function useScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScale(el.clientWidth / W));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return scale;
}

export default function Demo() {
  const mineBox = useRef<HTMLDivElement>(null);
  const friendBox = useRef<HTMLDivElement>(null);
  const mineScreen = useRef<HTMLDivElement>(null);
  const friendScreen = useRef<HTMLDivElement>(null);
  const scale = useScale(mineBox);

  const [text, setText] = useState(SAMPLES[0]);
  const textRef = useRef(text);
  const [note, setNote] = useState<Note | null>(null);
  const [lastPower, setLastPower] = useState<number | null>(null);
  const bowRef = useRef<Bow | null>(null);
  const stuck = useRef<Stuck[]>([]);
  const shots = useRef(0);

  useEffect(() => {
    textRef.current = text;
    const bow = bowRef.current;
    // 장전돼 있으면 새 글로 다시 장전한다.
    if (bow?.armed) bow.arm({ to: "friend", toName: "친구", body: text.trim() || "💘" });
  }, [text]);

  useEffect(() => {
    const mine = mineScreen.current;
    const friend = friendScreen.current;
    if (!mine || !friend) return;
    const timers: number[] = [];
    const later = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));

    const pluck = (id: string) => {
      const at = stuck.current.findIndex((s) => s.id === id);
      if (at < 0) return;
      const [gone] = stuck.current.splice(at, 1);
      gone.el.animate([{ opacity: 1 }, { opacity: 0, translate: "0 -18px" }], { duration: 260, easing: "ease-in" })
        .finished.then(() => gone.el.remove(), () => gone.el.remove());
    };

    /** 친구 화면에 꽂는다. 날아오는 길·자리·흔들림이 앱과 같다. */
    const land = (id: string, body: string, power: number, angle: number, quiet = false) => {
      while (stuck.current.length >= MAX_STUCK) pluck(stuck.current[0].id);
      const where = landing({ power, angle, seed: id, room: ROOM, taken: stuck.current.map((s) => s.to) });
      const el = arrow.element({ fromName: "나" });
      el.querySelector(".arrow-grab")?.addEventListener("click", () => {
        setNote({ body, x: where.to.x, y: where.to.y });
        pluck(id);
      });
      friend.append(el);
      stuck.current.push({ id, el, to: where.to });
      if (quiet) {
        arrow.place(el, where.to, where.tilt);
        arrow.stick(el);
      } else {
        arrow.flyIn(el, where);
      }
    };

    const bow = createBow({
      layer: mine,
      capture: () => {},
      onCancel: () => {},
      onFire(shot: { body: string; power: number; angle: number; tip: { x: number; y: number } }) {
        const id = `demo-${++shots.current}`;
        setLastPower(Math.round(shot.power * 100));
        const el = arrow.element({ fromName: "나" });
        el.querySelector(".arrow-grab")?.remove();
        mine.append(el);
        arrow.flyOut(el, shot.tip, shot.angle, { w: W, h: H }).finished.then(() => el.remove(), () => el.remove());
        // 내 화면을 떠난 화살이 조금 뒤 친구 화면에 들어온다.
        later(380, () => land(id, shot.body, shot.power, shot.angle));
        later(650, () => {
          const next = textRef.current.trim() || "💘";
          bow.arm({ to: "friend", toName: "친구", body: next });
        });
      },
    });
    bowRef.current = bow;
    bow.setRoom(ROOM);
    bow.arm({ to: "friend", toName: "친구", body: textRef.current });
    // 처음부터 하나는 꽂혀 있다 — 눌러 보라고.
    land("demo-hello", "안녕! 이렇게 화살로 쪽지가 와요. 눌러서 열고, 왼쪽 활로 답장을 쏴 봐요 💌", 0.55, 0.7, true);

    return () => {
      timers.forEach(clearTimeout);
      mine.replaceChildren();
      friend.replaceChildren();
      stuck.current = [];
      bowRef.current = null;
    };
  }, []);

  const deskHeight = H * scale;

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        <figure>
          <div ref={mineBox} className="cp-desk cp-desk-mine" style={{ height: deskHeight }}>
            <div className="cp-screen" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              <div className="cp-menubar">
                <span>내 바탕화면</span>
                <span>💘 친구에게</span>
              </div>
              <div className="cp-window" style={{ left: 50, top: 70, width: 360, height: 220 }}>
                <i style={{ top: 56, width: "60%" }} />
                <i style={{ top: 86 }} />
                <i style={{ top: 116, width: "70%" }} />
              </div>
              <div ref={mineScreen} className="absolute inset-0" />
            </div>
          </div>
          <figcaption className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="cp-text">쪽지</label>
            <input
              id="cp-text"
              value={text}
              maxLength={200}
              onChange={(e) => setText(e.target.value)}
              className="min-w-0 flex-1 rounded-[12px] border border-[#f1d6df] bg-white px-3 py-2 text-[15px] outline-none focus:border-[#ff9bb8] focus:shadow-[0_0_0_3px_rgba(255,120,160,0.18)]"
            />
            <button
              type="button"
              onClick={() => setText(SAMPLES[(SAMPLES.indexOf(text) + 1) % SAMPLES.length])}
              className="rounded-full border border-[#f1d6df] bg-white px-3 py-2 text-[13px] font-semibold transition hover:bg-[#ffe3ec]"
            >
              다른 쪽지
            </button>
          </figcaption>
        </figure>

        <figure>
          <div ref={friendBox} className="cp-desk cp-desk-friend" style={{ height: deskHeight }}>
            <div className="cp-screen" style={{ width: W, height: H, transform: `scale(${scale})` }}>
              <div className="cp-menubar">
                <span>친구 바탕화면</span>
                <span>🏹 {lastPower === null ? "" : `방금 ${lastPower}%`}</span>
              </div>
              <div className="cp-window" style={{ left: 400, top: 120, width: 380, height: 260 }}>
                <i style={{ top: 56, width: "50%" }} />
                <i style={{ top: 86 }} />
                <i style={{ top: 116, width: "75%" }} />
                <i style={{ top: 146, width: "40%" }} />
              </div>
              <div ref={friendScreen} className="absolute inset-0" />
              {note && (
                <div
                  className="cp-note"
                  style={{
                    left: Math.min(Math.max(note.x - 160, 16), W - 336),
                    top: note.y + 230 > H ? note.y - 200 : note.y + 26,
                  }}
                >
                  <p className="text-[14px] font-bold text-[#3b2430]">
                    나 <span className="ml-1 font-normal text-[#8f7480]">방금</span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words">{note.body}</p>
                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={() => setNote(null)}
                      className="rounded-full border border-[#f1d6df] bg-white px-4 py-1.5 text-[14px] font-semibold hover:bg-[#ffe3ec]"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <figcaption className="mt-3 text-[13px] leading-relaxed text-[#3b2430]/60 break-keep">
            왼쪽 활을 잡고 뒤로 당겼다 놓아요. 오른쪽으로 쏘면 친구 화면 왼쪽에서 날아 들어와요. 꽂힌 화살을 누르면 쪽지가 펼쳐져요.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
