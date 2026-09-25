// 순위 레이스 화면. React는 뼈대 마크업만 그리고, 달리기·순위표·그래프는 여기서
// 캔버스와 DOM을 직접 만진다 — 프레임마다 열 명의 위치가 바뀌어서 상태로 흘리면
// 매 프레임 리렌더가 된다.
//
// mountRace(root, frames) 가 정리 함수를 돌려준다. root 안의 [data-k="…"] 자리를 찾아 쓴다.

import { drawFigure } from "./kit/sprites.js";
import { RUN as RUN_POSES, CYCLE, kitFor } from "./kit/runPose.js";

/** 구단 코드 → 화면 이름, 그래프 선 색(어두운 바탕에서 서로 갈리는 색). */
export const TEAM_META = {
  LG: { ko: "LG", ln: "#E0457B" },
  KT: { ko: "KT", ln: "#F2F2F2" },
  SK: { ko: "SSG", ln: "#FFD23F" },
  NC: { ko: "NC", ln: "#D9B26F" },
  OB: { ko: "두산", ln: "#8391FF" },
  HT: { ko: "KIA", ln: "#FF6B6B" },
  LT: { ko: "롯데", ln: "#38C6E8" },
  SS: { ko: "삼성", ln: "#3D8BFF" },
  HH: { ko: "한화", ln: "#FF9A3D" },
  WO: { ko: "키움", ln: "#C95A7E" },
};
const IDS = Object.keys(TEAM_META);
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 3x5 비트맵 글꼴 (전광판·광고판·그래프 눈금) ---------- */
const GL = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111",
  "4": "101101111001001", "5": "111100111001111", "6": "111100111101111", "7": "111001001001001",
  "8": "111101111101111", "9": "111101111001111", ".": "000000000000010", ":": "000010000010000",
  "-": "000000111000000", "#": "101111101111101", " ": "000000000000000",
  K: "101101110101101", B: "110101110101110", O: "010101101101010", D: "110101101101110",
  A: "010101111101101", Y: "101101010010010", N: "101111111101101", E: "111100110100111",
  W: "101101111111101", P: "111101111100100", F: "111100110100100", I: "111010010010111", L: "100100100100111",
};
function text(ctx, s, x, y, col, sc = 1) {
  ctx.fillStyle = col;
  let cx = x;
  for (const ch of s) {
    const g = GL[ch] || GL[" "];
    for (let i = 0; i < 15; i++) if (g[i] === "1") ctx.fillRect(cx + (i % 3) * sc, y + ((i / 3) | 0) * sc, sc, sc);
    cx += 4 * sc;
  }
}
const textW = (s, sc = 1) => s.length * 4 * sc - sc;

/* ---------- 장면 치수 (캔버스 단위 = 장면 픽셀) ---------- */
const W = 400, H = 180, GROUND = 150;
const LEAD_X = 374;   // 1위가 달리는 자리
const GAP = 20;       // 선수 한 명 폭 — 이보다 가까우면 바짝 붙어 달린다
const SCALE = 9.5;    // 1게임차 = 9.5 장면 픽셀
const HS = 32;        // 선수 키
const RUN_SPEED = 60, DAY_MS = 520, HOLD_MS = 6000;

const CROWD = ["#EFEFEF", "#CE0E2D", "#074CA1", "#FF6600", "#1D3A6B", "#EA0029", "#C30452", "#F1C49B", "#2A2A2A", "#6B0D22", "#FFB81C", "#EFEFEF"];
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const pad = (n) => String(n).padStart(2, "0");
const fmtPct = (w, l) => { const v = w + l ? w / (w + l) : 0; return v >= 1 ? "1.000" : v.toFixed(3).slice(1); };
const fmtGb = (g) => (g === 0 ? "-" : g % 1 ? g.toFixed(1) : String(g));

function layer(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  paint(c.getContext("2d"), w, h);
  return c;
}

/** 배경 판. 시드가 고정이라 열 때마다 같은 관중석이 나온다. */
function buildBackdrop(season) {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const standPx = [];
  const towers = layer(400, 44, (g) => {
    for (const tx of [60, 270]) {
      g.fillStyle = "#28304F"; g.fillRect(tx + 5, 10, 2, 34);
      g.fillStyle = "#FFF4C2"; g.fillRect(tx, 3, 12, 6);
      g.fillStyle = "#FFE08A"; for (let i = 0; i < 12; i += 3) g.fillRect(tx + i, 5, 2, 2);
    }
  });
  const stands = layer(400, 70, (g, w, h) => {
    g.fillStyle = "#2A3358"; g.fillRect(0, 0, w, 3);
    for (let y = 3; y < h; y++) for (let x = 0; x < w; x++) {
      if (y >= 32 && y < 37) continue;   // 가운데 띠 전광판
      if (y % 2 === 1 && rnd() < 0.66) { g.fillStyle = CROWD[(rnd() * CROWD.length) | 0]; standPx.push([x, y]); }
      else g.fillStyle = y % 2 ? "#141B34" : "#1A2242";
      g.fillRect(x, y, 1, 1);
    }
    g.fillStyle = "#05070F"; g.fillRect(0, 32, w, 5);
    for (let x = 0; x < w; x += 8) { g.fillStyle = (x / 8) % 3 ? "#1B3F8F" : "#FFC24A"; g.fillRect(x + 1, 33, 6, 3); }
  });
  const fence = layer(400, 24, (g, w) => {
    g.fillStyle = "#1E4D34"; g.fillRect(0, 0, w, 24);
    g.fillStyle = "#FFC24A"; g.fillRect(0, 0, w, 1);
    const ads = [["KBO", "#0B2B6B", "#FFFFFF"], [String(season), "#B3122E", "#FFFFFF"], ["PLAY BALL", "#11182E", "#FFC24A"], ["KBO", "#1E6B3A", "#FFFFFF"]];
    ads.forEach(([s, bg, fg], i) => {
      const x = 6 + i * 100;
      g.fillStyle = bg; g.fillRect(x, 5, 88, 14);
      text(g, s, x + 44 - textW(s) / 2, 10, fg);
    });
  });
  const track = layer(400, 40, (g, w, h) => {
    g.fillStyle = "#8E5B3A"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { g.fillStyle = rnd() < 0.5 ? "#7E4F32" : "#A06A45"; g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1, 1); }
    g.fillStyle = "#F2EDE0"; g.globalAlpha = 0.55; g.fillRect(0, 31, w, 1); g.globalAlpha = 1;
  });
  const grass = layer(400, 20, (g, w, h) => {
    for (let x = 0; x < w; x++) { g.fillStyle = ((x / 16) | 0) % 2 ? "#2F7D3B" : "#37893F"; g.fillRect(x, 0, 1, h); }
  });
  return { towers, stands, fence, track, grass, standPx };
}

/**
 * @param {HTMLElement} root
 * @param {import("./standings.mjs").Frame[]} F
 * @returns {() => void} 정리 함수
 */
export function mountRace(root, F) {
  const N = F.length;
  const q = (k) => root.querySelector(`[data-k="${k}"]`);
  const season = F[0].d.slice(0, 4);
  const KITS = Object.fromEntries(IDS.map((id) => [id, kitFor(id)]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off = [];   // 정리할 이벤트
  const on = (el, type, fn) => { el.addEventListener(type, fn); off.push(() => el.removeEventListener(type, fn)); };

  /* ---------- 캔버스 ---------- */
  const park = q("park");
  const ctx = park.getContext("2d");
  let K = 1;
  const fit = () => {
    const w = park.clientWidth || W;
    K = Math.max(1, Math.round(w * (window.devicePixelRatio || 1)) / W);
    park.width = Math.round(W * K);
    park.height = Math.round(H * K);
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(park);
  const bg = buildBackdrop(season);
  const tile = (img, x, y) => {
    const x0 = Math.round(-(((x % img.width) + img.width) % img.width));
    ctx.drawImage(img, x0, y);
    ctx.drawImage(img, x0 + img.width, y);
  };

  /* ---------- 상태 ---------- */
  let pos = reduce ? N - 1 : 0, playing = !reduce, speed = 1, hold = 0;
  let world = 0, clock = 0, cur = -1, dayT = 1, flash = 0, focus = null;
  const gbFrom = {}, gbTo = {}, rankOf = {}, rx = {};
  for (const id of IDS) { gbFrom[id] = gbTo[id] = 0; rx[id] = null; }

  /* ---------- 선수 머리 위 이름표 ---------- */
  const tagsEl = q("tags");
  const tagEls = {};
  for (const id of IDS) {
    const s = document.createElement("span");
    s.className = "tag";
    s.style.setProperty("--tc", TEAM_META[id].ln);
    tagsEl.appendChild(s);
    tagEls[id] = s;
  }

  /* ---------- 순위표 ---------- */
  const rowsEl = q("rows");
  const rowEls = {};
  const $note = q("chart-note");
  const syncFocus = () => {
    for (const id of IDS) {
      rowEls[id].setAttribute("aria-pressed", String(focus === id));
      tagEls[id].classList.toggle("on", focus === id);
    }
    $note.textContent = focus
      ? `${TEAM_META[focus].ko} 줄을 강조하는 중 · 한 번 더 누르면 해제`
      : "순위표에서 팀을 누르면 그 팀 줄을 따라 볼 수 있다";
  };
  for (const id of IDS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "row";
    b.setAttribute("aria-pressed", "false");
    b.style.setProperty("--tc", TEAM_META[id].ln);
    b.innerHTML = `<span class="rk"></span><canvas class="mini" width="32" height="52"></canvas><span class="nm">${TEAM_META[id].ko}</span><span class="num wl"></span><span class="num pct"></span><span class="num gb"></span><span class="mv"></span>`;
    drawFigure(b.querySelector("canvas").getContext("2d"), RUN_POSES[1], 16, 51, 46, -1, 0, KITS[id]);
    on(b, "click", () => { focus = focus === id ? null : id; syncFocus(); drawBump(); });
    rowsEl.appendChild(b);
    rowEls[id] = b;
  }

  const $date = q("date"), $dow = q("dow"), $games = q("games"), $count = q("count");
  const $scrub = q("scrub"), $banner = q("banner"), $play = q("play");
  $scrub.max = String(N - 1);

  function toast(html) {
    $banner.hidden = true;
    $banner.innerHTML = `<span class="crown"></span>${html}`;
    void $banner.offsetWidth;   // 애니메이션을 처음부터 다시 틀기 위해
    $banner.hidden = false;
  }

  function setDay(i) {
    const fr = F[i], prev = i > 0 ? F[i - 1] : null;
    const prevRank = {};
    if (prev) prev.s.forEach((r) => (prevRank[r[0]] = r[1]));
    const oldLeader = cur >= 0 ? F[cur].s[0][0] : null;
    fr.s.forEach(([id, rk, w, l, dr, gb], idx) => {
      const el = rowEls[id];
      el.style.transform = `translateY(calc(var(--row) * ${idx}))`;
      el.classList.toggle("lead", rk === 1);
      el.querySelector(".rk").textContent = rk;
      el.querySelector(".wl").textContent = `${w}-${l}-${dr}`;
      el.querySelector(".pct").textContent = fmtPct(w, l);
      el.querySelector(".gb").textContent = fmtGb(gb);
      const mv = el.querySelector(".mv");
      const delta = prev ? prevRank[id] - rk : 0;
      mv.textContent = delta > 0 ? `▲${delta}` : delta < 0 ? `▼${-delta}` : "";
      mv.className = "mv" + (delta > 0 ? " up" : delta < 0 ? " down" : "");
      gbFrom[id] = gbFrom[id] + (gbTo[id] - gbFrom[id]) * ease(Math.min(1, dayT));
      gbTo[id] = gb;
      rankOf[id] = rk;
      tagEls[id].innerHTML = `<b>${rk}위</b>${TEAM_META[id].ko}`;
      tagEls[id].classList.toggle("lead", rk === 1);
    });
    const y = +fr.d.slice(0, 4), m = +fr.d.slice(4, 6), d = +fr.d.slice(6, 8);
    $date.textContent = `${pad(m)}.${pad(d)}`;
    $dow.textContent = `${DOW[new Date(y, m - 1, d).getDay()]}요일 · ${i + 1}번째 경기일`;
    $games.innerHTML = fr.g.map(([a, sa, h, sh]) => {
      const ca = sa > sh ? "w" : sa < sh ? "l" : "", ch = sh > sa ? "w" : sh < sa ? "l" : "";
      return `<li><span class="${ca}">${TEAM_META[a].ko} ${sa}</span> : <span class="${ch}">${sh} ${TEAM_META[h].ko}</span></li>`;
    }).join("");
    $count.textContent = `${i + 1} / ${N}일`;
    $scrub.value = String(i);
    const leader = fr.s[0][0];
    if (i === N - 1) { toast(`${m}월 ${d}일 현재 1위 <b>${TEAM_META[leader].ko}</b>`); flash = 0; }
    else if (oldLeader && leader !== oldLeader && Math.abs(i - cur) === 1) {
      toast(`새 1위 <b>${TEAM_META[leader].ko}</b> <span class="was">· 전날 1위 ${TEAM_META[oldLeader].ko}</span>`);
      flash = 2200;
    } else if (flash <= 0) $banner.hidden = true;
    cur = i;
    dayT = 0;
    drawBump();
  }

  /* ---------- 날짜별 순위 그래프 ---------- */
  const bump = q("bump");
  const BX0 = 14, STEP = 2;
  bump.width = BX0 + STEP * (N - 1) + 6;
  const bctx = bump.getContext("2d");
  const BY = (r) => 6 + (r - 1) * 10;
  const bx = (i) => BX0 + i * STEP;
  const series = Object.fromEntries(IDS.map((id) => [id, F.map((f) => f.s.find((r) => r[0] === id)[1])]));
  const monthsEl = q("months");
  let lastMonth = "";
  F.forEach((f, i) => {
    const m = f.d.slice(4, 6);
    if (m === lastMonth) return;
    lastMonth = m;
    const nextMonth = F.findIndex((x) => x.d.slice(4, 6) > m);
    if (nextMonth !== -1 && nextMonth - i < 8) return;   // 개막한 3월처럼 며칠 안 되는 달은 이름을 건너뛴다
    const s = document.createElement("span");
    s.style.left = `${(bx(i) / bump.width) * 100}%`;
    s.textContent = `${+m}월`;
    monthsEl.appendChild(s);
  });
  function drawBump() {
    const g = bctx;
    g.fillStyle = "#0B1122"; g.fillRect(0, 0, bump.width, bump.height);
    for (let r = 1; r <= 10; r++) {
      g.fillStyle = r % 2 ? "#10182E" : "#0D1428"; g.fillRect(BX0 - 2, BY(r) - 4, bump.width - BX0 + 2, 10);
      text(g, String(r), r === 10 ? 1 : 5, BY(r) - 2, r === 1 ? "#FFC24A" : "#5E6890");
    }
    const upto = Math.max(0, cur);
    const hi = focus || F[upto].s[0][0];
    const line = (id, w, alpha) => {
      const s = series[id];
      g.globalAlpha = alpha;
      g.fillStyle = TEAM_META[id].ln;
      for (let i = 0; i <= upto; i++) {
        const y = BY(s[i]);
        g.fillRect(bx(i) - (i ? 1 : 0), y, i ? 2 : 1, w);
        if (i && s[i] !== s[i - 1]) { const y0 = BY(s[i - 1]); g.fillRect(bx(i) - 1, Math.min(y, y0), w, Math.abs(y - y0) + w); }
      }
      g.globalAlpha = 1;
    };
    for (const id of IDS) if (id !== hi) line(id, 1, 0.38);
    line(hi, 2, 1);
    g.fillStyle = "#FFC24A"; g.globalAlpha = 0.5; g.fillRect(bx(upto), 0, 1, bump.height); g.globalAlpha = 1;
    for (const r of F[upto].s) { g.fillStyle = TEAM_META[r[0]].ln; g.fillRect(bx(upto) - 1, BY(r[1]) - 1, 3, 3); }
  }

  /* ---------- 조작 ---------- */
  const syncPlay = () => ($play.textContent = playing ? "일시정지" : "재생");
  on($play, "click", () => {
    playing = !playing;
    if (playing && pos >= N - 1) { pos = 0; hold = 0; }
    syncPlay();
  });
  on($scrub, "input", () => { pos = +$scrub.value; hold = 0; setDay(pos); });
  const speedBtns = [...root.querySelectorAll("[data-speed]")];
  for (const b of speedBtns) on(b, "click", () => {
    speed = +b.dataset.speed;
    for (const o of speedBtns) o.setAttribute("aria-pressed", String(o === b));
  });
  syncPlay();

  /* ---------- 그리기 ---------- */
  function frame(dt) {
    if (playing) {
      if (pos < N - 1) pos = Math.min(N - 1, pos + (dt * speed) / DAY_MS);
      else if ((hold += dt) > HOLD_MS) { pos = 0; hold = 0; for (const id of IDS) gbTo[id] = 0; }
    }
    const di = Math.floor(pos);
    if (di !== cur) setDay(di);
    dayT = Math.min(1, dayT + (dt * speed) / (DAY_MS * 0.7));
    if (flash > 0 && (flash -= dt) <= 0 && cur !== N - 1) $banner.hidden = true;
    if (!reduce) { world += (RUN_SPEED * dt) / 1000; clock += dt; }

    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#060A18"; ctx.fillRect(0, 0, W, 12);
    ctx.fillStyle = "#0A1024"; ctx.fillRect(0, 12, W, 12);
    ctx.fillStyle = "#0E1530"; ctx.fillRect(0, 24, W, 6);
    tile(bg.towers, world * 0.08, 0);
    tile(bg.stands, world * 0.3, 26);
    const flashes = cur === N - 1 ? 16 : 5;   // 관중석 카메라 플래시
    for (let k = 0; k < flashes; k++) {
      const p = bg.standPx[(Math.random() * bg.standPx.length) | 0];
      const x = (((p[0] - world * 0.3) % 400) + 400) % 400;
      ctx.fillStyle = "#FFFFFF"; ctx.fillRect(Math.round(x), 26 + p[1], 1, 1);
    }
    tile(bg.fence, world * 0.6, 96);
    tile(bg.track, world, 120);
    tile(bg.grass, world * 1.25, 160);

    const f = F[cur], mm = f.d.slice(4, 6), dd = f.d.slice(6, 8);
    ctx.fillStyle = "#2A3358"; ctx.fillRect(162, 1, 76, 27);
    ctx.fillStyle = "#05070F"; ctx.fillRect(164, 3, 72, 23);
    text(ctx, `KBO ${season}`, 200 - textW(`KBO ${season}`) / 2, 5, "#8C96BA");
    text(ctx, `${mm}.${dd}`, 200 - textW(`${mm}.${dd}`, 2) / 2, 13, "#FFC24A", 2);

    // 선수 자리: 1위와의 게임차만큼 뒤. 한 명 폭보다 가까우면 바로 뒤에 붙는다.
    const e = ease(dayT), g = {};
    for (const id of IDS) g[id] = gbFrom[id] + (gbTo[id] - gbFrom[id]) * e;
    const order = IDS.slice().sort((a, b) => g[a] - g[b] || rankOf[a] - rankOf[b]);
    let prevX = Infinity;
    for (const id of order) {
      const x = Math.max(10, Math.min(LEAD_X - g[id] * SCALE, prevX - GAP));
      prevX = x;
      rx[id] = rx[id] === null ? x : rx[id] + (x - rx[id]) * Math.min(1, dt / 160);
    }
    IDS.slice().sort((a, b) => rx[a] - rx[b]).forEach((id, k) => {
      const fi = reduce ? 0 : (((clock / 110) | 0) + k) % 4;
      const bob = fi % 2 ? 1 : 0;
      const x = rx[id];
      ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.fillRect(Math.round(x) - 6, GROUND, 13, 2);
      if (!reduce && fi === 0) { ctx.fillStyle = "#B98A62"; ctx.fillRect(Math.round(x) - 10, GROUND - 2, 2, 2); ctx.fillRect(Math.round(x) - 13, GROUND - 4, 1, 1); }
      drawFigure(ctx, RUN_POSES[CYCLE[fi]], x, GROUND - bob, HS, -1, 0, KITS[id]);
      ctx.setTransform(K, 0, 0, K, 0, 0);
      ctx.imageSmoothingEnabled = false;
      if (rankOf[id] === 1) {
        ctx.fillStyle = "#FFC24A";
        const cx = Math.round(x) - 3, cy = GROUND - HS - 5 - bob;
        ctx.fillRect(cx, cy + 1, 7, 3); ctx.fillRect(cx, cy - 1, 1, 2); ctx.fillRect(cx + 3, cy - 2, 1, 3); ctx.fillRect(cx + 6, cy - 1, 1, 2);
      }
      const tag = tagEls[id];
      tag.style.left = `${(x / W) * 100}%`;
      tag.style.setProperty("--lift", `${(k % 2) * 20}px`);
      tag.style.zIndex = String(10 + k);
    });
  }

  let raf = 0;
  let last = performance.now();
  const loop = (now) => {
    // 첫 rAF 시각은 마운트한 시각보다 앞설 수 있다 — 음수면 날짜가 -1로 거꾸로 간다.
    const dt = Math.max(0, Math.min(64, now - last));
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  setDay(Math.floor(pos));
  dayT = 1;
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    for (const f of off) f();
    tagsEl.replaceChildren();
    rowsEl.replaceChildren();
    monthsEl.replaceChildren();
  };
}
