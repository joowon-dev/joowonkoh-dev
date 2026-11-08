"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { COUNTDOWN, freshInput, type Input, type SideKey } from "./rules";

/**
 * 방 하나 = Supabase Realtime 채널 하나. 표(DB)는 안 쓴다.
 * - presence: 누가 들어와 있나, 이름, 몇 판째 준비됐나
 * - broadcast: 입력(누른·뗀 시각), 시작 신호, 핑
 * 먼저 들어온 사람이 왼쪽이고, 왼쪽이 「둘 다 준비됐다」를 보고 시작 신호를 보낸다.
 */

export interface Peer {
  id: string;
  name: string;
  joinedAt: number;
  /** 「준비!」를 누른 표(누른 시각). 0 = 아직. 시작에 쓰인 표는 다시 안 쓴다. */
  ready: number;
}

export type RoomStatus = "connecting" | "open" | "error";

interface Presence {
  name: string;
  joinedAt: number;
  ready: number;
}

interface InputMsg extends Input {
  round: number;
  side: SideKey;
}

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** 먼저 들어온 순서. 시계가 달라도 둘이 같은 값을 보고 정렬하니 결과는 같다. */
const byJoin = (a: Peer, b: Peer) => a.joinedAt - b.joinedAt || (a.id < b.id ? -1 : 1);

export function useRoom(code: string, name: string) {
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [peers, setPeers] = useState<Peer[]>([]);
  const [go, setGo] = useState<{ round: number; startAt: number } | null>(null);
  const [me] = useState(randomId);

  const channel = useRef<RealtimeChannel | null>(null);
  const presence = useRef<Presence>({ name, joinedAt: 0, ready: 0 });
  const inputs = useRef(new Map<string, Input>());
  const rtt = useRef<number[]>([]);
  /** 시작에 이미 쓴 준비 표 */
  const used = useRef(new Set<number>());

  useEffect(() => {
    let alive = true;
    let ch: RealtimeChannel;
    try {
      ch = createClient().channel(`pepero:${code}`, {
        config: { broadcast: { self: false }, presence: { key: me } },
      });
    } catch {
      queueMicrotask(() => alive && setStatus("error"));
      return;
    }
    channel.current = ch;

    const ping = () => ch.send({ type: "broadcast", event: "ping", payload: { from: me, t: performance.now() } });

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<Presence>();
      const list: Peer[] = Object.entries(state)
        .map(([id, metas]) => {
          const m = metas[metas.length - 1];
          return { id, name: m.name, joinedAt: m.joinedAt, ready: m.ready };
        })
        .sort(byJoin);
      setPeers(list);

      // 왼쪽(방장)만: 둘 다 같은 판을 준비했으면 시작 신호
      const [l, r] = list;
      if (!l || !r || l.id !== me) return;
      if (rtt.current.length < 3) ping();
      if (l.ready && r.ready && !used.current.has(l.ready) && !used.current.has(r.ready)) {
        used.current.add(l.ready);
        used.current.add(r.ready);
        // 판 번호 = 시작 시각. 사람이 바뀌어도 겹치지 않는다.
        const round = Date.now();
        ch.send({ type: "broadcast", event: "go", payload: { round } });
        // 상대에게 신호가 닿는 동안(왕복의 절반)만큼 늦게 시작해 둘의 「시작!」을 맞춘다
        const half = median(rtt.current) / 2;
        setGo({ round, startAt: performance.now() + COUNTDOWN * 1000 + half });
      }
    });

    ch.on("broadcast", { event: "go" }, ({ payload }) => {
      setGo({ round: payload.round as number, startAt: performance.now() + COUNTDOWN * 1000 });
    });

    ch.on("broadcast", { event: "in" }, ({ payload }) => {
      const m = payload as InputMsg;
      const key = `${m.round}:${m.side}`;
      const cur = inputs.current.get(key) ?? freshInput();
      inputs.current.set(key, {
        press: m.press ?? cur.press,
        release: m.release ?? cur.release,
        until: Math.max(cur.until, m.until),
      });
    });

    ch.on("broadcast", { event: "ping" }, ({ payload }) => {
      ch.send({ type: "broadcast", event: "pong", payload });
    });
    ch.on("broadcast", { event: "pong" }, ({ payload }) => {
      if (payload.from !== me) return;
      rtt.current = [...rtt.current.slice(-4), performance.now() - (payload.t as number)];
      if (rtt.current.length < 3) window.setTimeout(ping, 150);
    });

    ch.subscribe((s) => {
      if (!alive) return;
      if (s === "SUBSCRIBED") {
        setStatus("open");
        if (!presence.current.joinedAt) presence.current.joinedAt = Date.now();
        void ch.track({ ...presence.current });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
        setStatus("error");
      }
    });

    return () => {
      alive = false;
      channel.current = null;
      void ch.unsubscribe();
    };
  }, [code, me]);

  const update = useCallback((patch: Partial<Presence>) => {
    presence.current = { ...presence.current, ...patch };
    void channel.current?.track({ ...presence.current });
  }, []);

  /** 「준비!」 — 다음 판을 하고 싶다 */
  const ready = useCallback(() => update({ ready: Date.now() }), [update]);
  /** 판이 시작되면 내 준비 표를 내린다 */
  const unready = useCallback(() => update({ ready: 0 }), [update]);

  useEffect(() => {
    if (presence.current.name === name) return;
    update({ name });
  }, [name, update]);

  const sendInput = useCallback((round: number, side: SideKey, input: Input) => {
    const payload: InputMsg = { round, side, ...input };
    void channel.current?.send({ type: "broadcast", event: "in", payload });
  }, []);

  const inputOf = useCallback(
    (round: number, side: SideKey): Input => inputs.current.get(`${round}:${side}`) ?? freshInput(),
    [],
  );

  const [left, right] = peers;
  const side: SideKey | "watch" | null = left?.id === me ? "left" : right?.id === me ? "right" : peers.some((p) => p.id === me) ? "watch" : null;

  return { status, peers, left, right, me, side, go, ready, unready, sendInput, inputOf };
}

function median(xs: number[]) {
  if (!xs.length) return 120;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
