// 부캉이의 기록 화면. React는 뼈대 마크업만 그리고, 수로·상어·인파·기록판은 여기서
// 캔버스와 DOM을 직접 만진다 — 상어와 구경꾼이 매 프레임 움직여서 상태로 흘리면
// 매 프레임 리렌더가 된다. 짜임새는 KBO 순위 레이스(race.js)와 같다.
//
// mountLog(root, frames) 가 정리 함수를 돌려준다. root 안의 [data-k="…"] 자리를 찾아 쓴다.

/** KBO 기록실 구단 코드 → 화면 이름 / 전광판 약자 */
const TEAM = {
  LG: ["LG", "LG"], KT: ["KT", "KT"], SK: ["SSG", "SSG"], NC: ["NC", "NC"], OB: ["두산", "DS"],
  HT: ["KIA", "KIA"], LT: ["롯데", "LT"], SS: ["삼성", "SS"], HH: ["한화", "HH"], WO: ["키움", "KW"],
};
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 3x5 비트맵 글꼴 (전광판·그래프 눈금) ---------- */
const GL = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111",
  "4": "101101111001001", "5": "111100111001111", "6": "111100111101111", "7": "111001001001001",
  "8": "111101111101111", "9": "111101111001111", ".": "000000000000010", ":": "000010000010000",
  "-": "000000111000000", "+": "000010111010000", "?": "111001011000010", " ": "000000000000000",
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", K: "101101110101101", L: "100100100100111", M: "101111111101101",
  N: "110101101101101", O: "010101101101010", P: "110101110100100", R: "110101110101101",
  S: "011100010001110", T: "111010010010010", U: "101101101101111", W: "101101111111101", Y: "101101010010010",
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
const H = 180, SURFACE = 90, FLOOR = 172;
// 장면 폭은 화면에 따라 바꾼다. 폰에서는 가운데를 좁게 잘라 확대해서 상어가 작아지지 않게 한다.
const WIDE = 400, NARROW = 210, NARROW_BELOW = 640;
const DAY_MS = 3400, HOLD_MS = 7000;
const LAP_MS = 15000;          // 상어가 수로를 한 바퀴 도는 시간(재생 속도와 상관없이 늘 같다)
const MAX_CROWD = 136000;      // 가장 붐빈 날(추석) — 인파 그림이 꽉 차는 기준

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const pad = (n) => String(n).padStart(2, "0");
const man = (n) => (n >= 10000 ? `${(n / 10000).toFixed(n % 10000 ? 1 : 0).replace(/\.0$/, "")}만` : n.toLocaleString("ko-KR"));
const people = (n) => `${n.toLocaleString("ko-KR")}명`;

function layer(w, h, paint) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  paint(c.getContext("2d"), w, h);
  return c;
}
function seeded(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

/* ---------- 상어 ---------- */
// 옆에서 본 무태상어. 몸통 윤곽을 식으로 잡고 픽셀마다 칠해서, 꼬리를 흔드는 프레임과
// 돌아서는(몸이 짧아 보이는) 프레임을 같은 코드로 뽑는다. 오른쪽을 본다.
const SHARK = { back: "#6F6A5C", mid: "#8A8472", belly: "#DCD5C0", line: "#2B2924", fin: "#5C584C", eye: "#0B0B0B" };

function inTri(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

/**
 * @param {number} L 몸통 길이(꼬리 빼고). 돌아설 때는 짧게.
 * @param {number} tail 꼬리지느러미 가로 폭 배율(꼬리 흔들기)
 * @param {number} bend 몸 뒤쪽이 위아래로 휘는 정도
 */
function paintShark(L, tail, bend) {
  const TL = 12, PADY = 10, HALF = 6.5;
  const w = Math.ceil(L + TL * tail) + 2, h = 30;
  const ox = Math.ceil(TL * tail) + 1, my = PADY + 8;   // 몸통 뒤끝 x, 몸 가운데 y
  const c = layer(w, h, (g) => {
    const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
    const prof = (u) => (u < 0.62 ? 1.3 + (HALF - 1.3) * Math.sin(((u / 0.62) * Math.PI) / 2) : HALF * Math.sqrt(Math.max(0, 1 - ((u - 0.62) / 0.4) ** 2)));
    const bodyTop = [], bodyBot = [];
    for (let i = 0; i <= L; i++) {
      const u = i / L;
      const hh = Math.max(0.8, prof(u));
      const off = bend * (1 - u) ** 2;
      bodyTop[i] = Math.round(my - hh + off);
      bodyBot[i] = Math.round(my + hh * 0.78 + off);
    }
    const X = (u) => ox + Math.round(u * L);
    const fins = [];
    // 등지느러미 — 뒤로 누운 세모
    fins.push([[X(0.57), bodyTop[Math.round(L * 0.57)] + 1], [X(0.42), bodyTop[Math.round(L * 0.42)] + 1], [X(0.44) - 1, bodyTop[Math.round(L * 0.5)] - 8]]);
    // 가슴지느러미
    fins.push([[X(0.7), bodyBot[Math.round(L * 0.7)] - 1], [X(0.62), bodyBot[Math.round(L * 0.62)] - 1], [X(0.55), bodyBot[Math.round(L * 0.62)] + 5]]);
    // 둘째 등지느러미·뒷지느러미
    fins.push([[X(0.2), bodyTop[Math.round(L * 0.2)] + 1], [X(0.13), bodyTop[Math.round(L * 0.13)] + 1], [X(0.12), bodyTop[Math.round(L * 0.16)] - 2]]);
    fins.push([[X(0.18), bodyBot[Math.round(L * 0.18)] - 1], [X(0.12), bodyBot[Math.round(L * 0.12)] - 1], [X(0.1), bodyBot[Math.round(L * 0.14)] + 2]]);
    // 꼬리지느러미 — 위 잎이 길다(상어 꼬리 모양)
    const ty = my + bend;
    fins.push([[ox + 1, ty - 2], [ox + 1, ty + 1], [ox - Math.round(TL * tail), ty - 10]]);
    fins.push([[ox + 1, ty - 1], [ox + 1, ty + 1], [ox - Math.round(TL * tail * 0.62), ty + 6]]);

    // 지느러미 먼저, 몸통을 위에 덮는다
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (fins.some((t) => inTri(x + 0.5, y + 0.5, ...t))) px(x, y, SHARK.fin);
    }
    // 지느러미 테두리: 빈칸과 닿은 칸만 어둡게
    const img = g.getImageData(0, 0, w, h).data;
    const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && img[(y * w + x) * 4 + 3] > 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (filled(x, y) && (!filled(x, y - 1) || !filled(x - 1, y) || !filled(x + 1, y))) px(x, y, SHARK.line);
    }
    for (let i = 0; i <= L; i++) {
      const x = ox + i, t0 = bodyTop[i], t1 = bodyBot[i];
      for (let y = t0; y <= t1; y++) {
        const t = (y - t0) / Math.max(1, t1 - t0);
        px(x, y, y === t0 ? SHARK.line : t < 0.5 ? SHARK.back : t < 0.6 ? SHARK.mid : y === t1 ? "#B7AF98" : SHARK.belly);
      }
    }
    if (L > 20) {
      // 눈·아가미·입
      const ex = X(0.88);
      px(ex, Math.round(my - 2), SHARK.eye);
      px(ex, Math.round(my - 3), "#F4F1E6");
      for (const u of [0.72, 0.75, 0.78]) for (let y = -1; y <= 2; y++) px(X(u), Math.round(my + y), "#57534A");
      for (let u = 0.84; u < 0.95; u += 0.03) px(X(u), bodyBot[Math.round(u * L)] - 1, "#57534A");
    } else {
      px(X(0.8), Math.round(my - 2), SHARK.eye);
    }
  });
  return { c, ax: ox + Math.round(L * 0.55), ay: my, finX: ox + Math.round(L * 0.44), finTop: my - HALF - 9 };
}

/** 물속 깊이 빛깔을 덮어 멀리 있는 것처럼 */
function tint(src, col, a) {
  return layer(src.width, src.height, (g) => {
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-atop";
    g.globalAlpha = a;
    g.fillStyle = col;
    g.fillRect(0, 0, src.width, src.height);
  });
}

function buildShark() {
  const swim = [[1, 0], [0.7, 1], [0.35, 0], [0.7, -1]].map(([t, b]) => paintShark(40, t, b));
  const turn = [paintShark(22, 0.45, 0), paintShark(12, 0.25, 0)];
  const all = [...swim, ...turn];
  return { swim, turn, far: new Map(all.map((s) => [s, tint(s.c, "#0E3A4A", 0.42)])) };
}

/* ---------- 배경 (시드 고정이라 열 때마다 같은 항구가 나온다) ---------- */
export function buildBackdrop() {
  const rnd = seeded(18);
  const skyline = layer(400, 44, (g) => {
    // 먼 도심
    for (let x = 0; x < 400; ) {
      const bw = 6 + ((rnd() * 12) | 0), bh = 8 + ((rnd() * 22) | 0);
      g.fillStyle = rnd() < 0.5 ? "#141A36" : "#181F40";
      g.fillRect(x, 44 - bh, bw, bh);
      for (let yy = 44 - bh + 2; yy < 42; yy += 3) for (let xx = x + 1; xx < x + bw - 1; xx += 2) {
        if (rnd() < 0.28) { g.fillStyle = rnd() < 0.8 ? "#F6D680" : "#9FD8FF"; g.fillRect(xx, yy, 1, 1); }
      }
      x += bw + ((rnd() * 2) | 0);
    }
    // 부산항대교 — 주탑 둘, 사선 케이블, 상판 불빛
    g.fillStyle = "#2B3563";
    for (const tx of [150, 250]) {
      for (let y = 2; y < 36; y++) {
        const spread = Math.round((y - 2) * 0.12);
        g.fillRect(tx - spread, y, 1, 1); g.fillRect(tx + spread, y, 1, 1);
      }
      g.fillRect(tx - 1, 2, 3, 2);
      g.fillStyle = "#39447A";
      for (let k = 1; k <= 7; k++) for (const s of [-1, 1]) {
        const x1 = tx + s * k * 7;
        for (let t = 0; t <= 1; t += 0.04) g.fillRect(Math.round(tx + (x1 - tx) * t), Math.round(4 + k + (25 - k) * t), 1, 1);
      }
      g.fillStyle = "#2B3563";
    }
    g.fillStyle = "#222B52"; g.fillRect(80, 29, 240, 2);
    for (let x = 82; x < 320; x += 4) { g.fillStyle = (x / 4) % 2 ? "#FFC24A" : "#FF8A5C"; g.fillRect(x, 28, 1, 1); }
    // 컨테이너 크레인
    for (const cx of [336, 366]) {
      g.fillStyle = "#8C2A33"; g.fillRect(cx, 12, 2, 32); g.fillRect(cx + 12, 12, 2, 32);
      g.fillStyle = "#C83A44"; g.fillRect(cx - 10, 10, 34, 3);
      g.fillStyle = "#E8E6E0"; g.fillRect(cx + 2, 20, 10, 1); g.fillRect(cx + 2, 30, 10, 1);
      g.fillStyle = "#FF4040"; g.fillRect(cx + 23, 9, 1, 1);
    }
  });
  const stars = Array.from({ length: 40 }, () => [(rnd() * 400) | 0, (rnd() * 26) | 0, rnd() * 6]);
  // 친수공원 데크 + 난간 + 수로 벽
  const deck = layer(400, 32, (g) => {
    g.fillStyle = "#223023"; g.fillRect(0, 0, 400, 5);   // 뒤쪽 산책로 수풀
    for (let x = 0; x < 400; x++) if (rnd() < 0.4) { g.fillStyle = "#2F4430"; g.fillRect(x, (rnd() * 4) | 0, 1, 1); }
    for (let y = 5; y < 22; y++) { g.fillStyle = y % 3 ? "#6B4A33" : "#5A3D2A"; g.fillRect(0, y, 400, 1); }
    for (let x = 0; x < 400; x += 17) { g.fillStyle = "#4E3524"; g.fillRect(x, 5, 1, 17); }
    g.fillStyle = "#8F97A8"; g.fillRect(0, 22, 400, 2);          // 수로 가장자리 돌
    g.fillStyle = "#5E6576"; g.fillRect(0, 24, 400, 8);
    for (let x = 0; x < 400; x += 11) { g.fillStyle = "#4B5162"; g.fillRect(x, 24, 1, 8); }
    g.fillStyle = "#454B5A"; g.fillRect(0, 28, 400, 1);
  });
  const rail = layer(400, 8, (g) => {
    g.fillStyle = "#C9CED8"; g.fillRect(0, 0, 400, 1);
    g.fillStyle = "#7A8294"; g.fillRect(0, 4, 400, 1);
    for (let x = 0; x < 400; x += 9) { g.fillStyle = "#9AA1B2"; g.fillRect(x, 0, 1, 8); }
  });
  const bed = layer(400, H - FLOOR, (g, w, h) => {
    g.fillStyle = "#1C2A2A"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = rnd() < 0.5 ? "#26383A" : "#152022"; g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 2, 1); }
    for (let x = 6; x < w; x += 23 + ((rnd() * 20) | 0)) {
      g.fillStyle = "#33484A"; g.fillRect(x, 0, 5, 2); g.fillRect(x + 1, -1, 3, 1);
    }
  });
  const weeds = Array.from({ length: 16 }, () => [(rnd() * 400) | 0, 5 + ((rnd() * 9) | 0), rnd() * 6]);
  // 구경꾼 자리. 우선순위가 낮은 자리부터 채워서, 인파가 늘면 사람이 «더해지기만» 한다.
  const spots = [];
  for (let i = 0; i < 240; i++) {
    const row = (rnd() * 3) | 0;
    spots.push({
      x: (rnd() * 396 + 2) | 0, row, pri: rnd(), ph: rnd() * 6,
      shirt: ["#E8E4DA", "#D94452", "#3A6FD8", "#F2A541", "#2B2B30", "#6CC08B", "#A884E0", "#F07CA8", "#1F3B73"][(rnd() * 9) | 0],
      hair: rnd() < 0.8 ? "#1B1510" : "#6B4A2E",
      phone: rnd() < 0.45, bag: rnd(), umb: ["#E84A5F", "#3FA7D6", "#F7C548", "#6B5CA5", "#EFEFEF", "#2E3440"][(rnd() * 6) | 0],
    });
  }
  spots.sort((a, b) => a.pri - b.pri);
  const fish = Array.from({ length: 9 }, () => [rnd() * 26 - 13, rnd() * 10 - 5, rnd() * 6]);
  return { skyline, stars, deck, rail, bed, weeds, spots, fish };
}

/**
 * @param {HTMLElement} root
 * @param {import("./log.mjs").Frame[]} F
 * @returns {() => void} 정리 함수
 */
export function mountLog(root, F) {
  const N = F.length;
  const q = (k) => root.querySelector(`[data-k="${k}"]`);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off = [];
  const on = (el, type, fn) => { el.addEventListener(type, fn); off.push(() => el.removeEventListener(type, fn)); };

  /* ---------- 캔버스 ---------- */
  const park = q("park");
  const ctx = park.getContext("2d");
  let K = 1, W = WIDE, OX = 0;
  const fit = () => {
    const w = park.clientWidth || WIDE;
    W = w < NARROW_BELOW ? NARROW : WIDE;
    OX = Math.round((WIDE - W) / 2);   // 좁은 장면은 항구 가운데를 자른다
    park.style.aspectRatio = `${W} / ${H}`;
    K = Math.max(1, Math.round(w * (window.devicePixelRatio || 1)) / W);
    park.width = Math.round(W * K);
    park.height = Math.round(H * K);
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(park);
  const bg = buildBackdrop();
  const shark = buildShark();

  /* ---------- 상태 ---------- */
  // ?d=20260925 로 열면 그날부터 튼다 — 특정한 날을 링크로 건넬 수 있게.
  const want = new URLSearchParams(location.search).get("d");
  const start = F.findIndex((f) => f.d === want);
  let pos = start >= 0 ? start : reduce ? N - 1 : 0, playing = !reduce, speed = 1, hold = 0;
  let clock = 0, cur = -1, dayT = 1;
  let crowdFrom = 0, crowdTo = 0, rainFrom = 0, rainTo = 0, moonFrom = 0, moonTo = 0;
  const drops = Array.from({ length: 90 }, (_, i) => [(i * 97) % 400, (i * 53) % 180, 3 + (i % 3)]);

  const tag = q("tag");
  const $date = q("date"), $dow = q("dow"), $events = q("events"), $count = q("count");
  const $visit = q("visit"), $cum = q("cum"), $lotte = q("lotte"), $rank = q("rank");
  const $scrub = q("scrub"), $banner = q("banner"), $play = q("play");
  $scrub.max = String(N - 1);

  function toast(html) {
    $banner.hidden = true;
    $banner.innerHTML = `<span class="fin"></span>${html}`;
    void $banner.offsetWidth;   // 애니메이션을 처음부터 다시 틀기 위해
    $banner.hidden = false;
  }
  let toastLeft = 0;

  const crowdLevel = (v) => Math.min(1, Math.sqrt(v / MAX_CROWD));

  function setDay(i) {
    const fr = F[i];
    const now = Math.min(1, dayT);
    crowdFrom = crowdFrom + (crowdTo - crowdFrom) * ease(now); crowdTo = crowdLevel(fr.crowd);
    rainFrom = rainFrom + (rainTo - rainFrom) * ease(now); rainTo = fr.rain ? 1 : 0;
    moonFrom = moonFrom + (moonTo - moonFrom) * ease(now); moonTo = fr.moon ? 1 : 0;

    const y = +fr.d.slice(0, 4), m = +fr.d.slice(4, 6), d = +fr.d.slice(6, 8);
    $date.textContent = `${pad(m)}.${pad(d)}`;
    $dow.textContent = `${DOW[new Date(y, m - 1, d).getDay()]}요일 · 수로에서 ${fr.stay}일째`;
    $visit.textContent = fr.v != null ? people(fr.v) : i === 0 ? "집계 전" : "집계 중";
    $cum.textContent = fr.cum ? `${man(fr.cum)} 명` : "-";
    if (!fr.played) $lotte.innerHTML = `<span class="mute">경기 기록 대기</span>`;
    else if (!fr.game) $lotte.innerHTML = `<span class="mute">경기 없음</span>`;
    else {
      const g = fr.game;
      $lotte.innerHTML = `<b class="${g.res}">${g.res === "W" ? "승" : g.res === "L" ? "패" : "무"}</b> ${g.us}:${g.them} ${TEAM[g.opp][0]}`;
    }
    $rank.innerHTML = fr.rank
      ? `${fr.rank}위${fr.streak >= 2 ? ` <b class="W">${fr.streak}연승</b>` : fr.streak <= -2 ? ` <span class="mute">${-fr.streak}연패</span>` : ""}`
      : `<span class="mute">-</span>`;
    $events.innerHTML = fr.ev.map((e) => `<li>${e}</li>`).join("");
    $count.textContent = `${i + 1} / ${N}일`;
    $scrub.value = String(i);
    const step = Math.abs(i - cur) === 1 || (cur === N - 1 && i === 0);
    if (i === N - 1) {
      toast(`${m}월 ${d}일 현재 <b>${fr.stay}일째</b> 수로에 있다`);
      toastLeft = 5000;
    } else if (step && fr.toast) { toast(fr.toast); toastLeft = 2600; }
    else if (step && fr.game?.res === "W" && fr.streak >= 5) { toast(`롯데 <b>${fr.streak}연승</b>`); toastLeft = 2600; }
    else if (toastLeft <= 0 || !step) { $banner.hidden = true; toastLeft = 0; }
    cur = i;
    dayT = 0;
    drawChart();
  }

  /* ---------- 날짜별 방문객 그래프 ---------- */
  const chart = q("chart");
  const CW = 12 + N * 22, CH = 70;
  chart.width = CW; chart.height = CH;
  const cctx = chart.getContext("2d");
  const maxV = Math.max(...F.map((f) => f.v || 0));
  function drawChart() {
    const g = cctx;
    g.fillStyle = "#0B1426"; g.fillRect(0, 0, CW, CH);
    const base = 50;
    F.forEach((f, i) => {
      const x = 8 + i * 22, now = i === cur, past = i <= cur;
      if (f.v == null) {
        // 집계 없는 날은 빈 칸에 빗금
        g.fillStyle = past ? "#2B3F63" : "#18233C";
        for (let y = base - 6; y < base; y++) for (let k = 0; k < 14; k++) if ((k + y) % 3 === 0) g.fillRect(x + k, y, 1, 1);
        text(g, "?", x + 5, base - 13, past ? "#8C96BA" : "#3A4666");
      } else {
        const bh = Math.max(1, Math.round((f.v / maxV) * 36));
        g.fillStyle = now ? "#FFC24A" : past ? "#3FB6D9" : "#1C3350";
        g.fillRect(x, base - bh, 14, bh);
        const lab = f.v >= 100000 ? String(Math.round(f.v / 1000)) : (f.v / 1000).toFixed(f.v % 1000 ? 1 : 0);
        text(g, lab, x + 7 - textW(lab) / 2, base - bh - 7, now ? "#FFC24A" : past ? "#8C96BA" : "#3A4666");
      }
      text(g, f.d.slice(6), x + 7 - textW(f.d.slice(6)) / 2, base + 4, now ? "#FFC24A" : "#5E6890");
      // 그날 롯데: 승 초록, 패 빨강, 경기 없음 회색 점
      const col = !f.played ? "#18233C" : !f.game ? "#3A4666" : f.game.res === "W" ? "#5BE38A" : f.game.res === "L" ? "#FF6B6B" : "#8C96BA";
      g.fillStyle = past ? col : "#18233C";
      g.fillRect(x + 5, base + 13, 4, 4);
    });
  }

  /* ---------- 조작 ---------- */
  const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2 L14 8 L4 14 Z"/></svg>';
  const syncPlay = () => {
    $play.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    $play.setAttribute("aria-label", playing ? "일시정지" : "재생");
    $play.title = playing ? "일시정지" : "재생";
  };
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
  function sky(rain, moon) {
    const clear = ["#0A0F2A", "#141A44", "#241F52", "#3A2A5E", "#5A3560"];
    const wet = ["#141922", "#1B212D", "#222A38", "#2A3342", "#333C4C"];
    for (let b = 0; b < 5; b++) {
      ctx.fillStyle = clear[b]; ctx.fillRect(0, b * 11, W, 11);
      if (rain > 0) { ctx.globalAlpha = rain; ctx.fillStyle = wet[b]; ctx.fillRect(0, b * 11, W, 11); ctx.globalAlpha = 1; }
    }
    // 별은 비 오는 날 사라진다
    if (rain < 1) for (const [x, y, ph] of bg.stars) {
      const sx = x - OX;
      if (sx < 0 || sx >= W) continue;
      ctx.globalAlpha = (1 - rain) * (0.35 + 0.65 * ((Math.sin(clock / 700 + ph) + 1) / 2));
      ctx.fillStyle = "#DDE4FF"; ctx.fillRect(sx, y, 1, 1);
    }
    ctx.globalAlpha = 1;
    // 추석 보름달
    if (moon > 0) {
      const mx = W - 34, my = 12;
      ctx.globalAlpha = moon * 0.18; ctx.fillStyle = "#FFE9A8";
      for (let y = -11; y <= 11; y++) for (let x = -11; x <= 11; x++) if (x * x + y * y <= 121) ctx.fillRect(mx + x, my + y, 1, 1);
      ctx.globalAlpha = moon;
      for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 38) {
        ctx.fillStyle = (x - 2) ** 2 + (y + 1) ** 2 < 4 || (x + 3) ** 2 + (y - 2) ** 2 < 3 ? "#EAD9A0" : "#FFF3C8";
        ctx.fillRect(mx + x, my + y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
  }

  function scoreboard(fr) {
    const cx = Math.round(W / 2);
    ctx.fillStyle = "#2A3358"; ctx.fillRect(cx - 38, 1, 76, 27);
    ctx.fillStyle = "#05070F"; ctx.fillRect(cx - 36, 3, 72, 23);
    const top = `BUKANGI D+${fr.stay - 1}`;
    text(ctx, top, cx - textW(top) / 2, 5, "#8C96BA");
    const md = `${fr.d.slice(4, 6)}.${fr.d.slice(6, 8)}`;
    text(ctx, md, cx - textW(md, 2) / 2, 13, "#FFC24A", 2);
  }

  // 롯데 전광판 — 데크 오른쪽. 그날 경기와 연승.
  function lotteBoard(fr) {
    const x = W - 52, y = 32;
    ctx.fillStyle = "#3A4252"; ctx.fillRect(x + 21, y + 24, 2, 16);
    ctx.fillStyle = "#D00F31"; ctx.fillRect(x - 1, y - 1, 46, 25);
    ctx.fillStyle = "#061233"; ctx.fillRect(x, y, 44, 23);
    text(ctx, "LOTTE", x + 22 - textW("LOTTE") / 2, y + 2, "#FFFFFF");
    let l2 = "", l3 = "", c2 = "#FFC24A";
    if (!fr.played) { l2 = "TODAY"; l3 = "- : -"; c2 = "#8C96BA"; }
    else if (!fr.game) { l2 = "NO GAME"; c2 = "#8C96BA"; }
    else {
      const g = fr.game;
      l2 = `${g.res} ${g.us}:${g.them}`;
      c2 = g.res === "W" ? "#5BE38A" : g.res === "L" ? "#FF6B6B" : "#8C96BA";
      l3 = TEAM[g.opp][1];
    }
    if (fr.streak >= 2) l3 = `${l3 ? l3 + " " : ""}W${fr.streak}`;
    text(ctx, l2, x + 22 - textW(l2) / 2, y + 9, c2);
    if (l3) text(ctx, l3, x + 22 - textW(l3) / 2, y + 16, fr.streak >= 2 ? "#FFC24A" : "#8C96BA");
  }

  function crowd(level, rain, fr, finX, finUp) {
    const n = Math.round(level * bg.spots.length);
    const orange = fr.streak >= 2 ? Math.min(0.35, 0.05 * fr.streak) : 0;   // 연승 중이면 주황 봉다리
    const list = bg.spots.slice(0, n).sort((a, b) => a.row - b.row);
    for (const s of list) {
      const x = s.x - OX;
      if (x < -2 || x > W + 2) continue;
      const base = 66 + s.row * 4;
      const near = finUp && Math.abs(x - finX) < 34;
      const hop = near && ((clock / 180 + s.ph) | 0) % 2 ? 1 : 0;
      const y = base - hop;
      ctx.fillStyle = "#1B130E"; ctx.fillRect(x, y - 1, 1, 2); ctx.fillRect(x + 2, y - 1, 1, 2);   // 다리
      ctx.fillStyle = s.shirt; ctx.fillRect(x, y - 5, 3, 4);
      ctx.fillStyle = "#F0C8A0"; ctx.fillRect(x, y - 7, 3, 2);
      ctx.fillStyle = s.hair; ctx.fillRect(x, y - 8, 3, 1);
      if (rain > 0.5) {
        ctx.fillStyle = s.umb; ctx.fillRect(x - 2, y - 11, 7, 1); ctx.fillRect(x - 1, y - 12, 5, 1);
        ctx.fillStyle = "#3A3A3A"; ctx.fillRect(x + 1, y - 10, 1, 3);
      } else if (s.bag < orange) {
        // 사직 응원 주황 비닐봉지를 머리에
        ctx.fillStyle = "#FF7A1A"; ctx.fillRect(x, y - 9, 3, 2); ctx.fillRect(x - 1, y - 10, 1, 1); ctx.fillRect(x + 3, y - 10, 1, 1);
      } else if (s.phone || near) {
        // 휴대폰을 들어 찍는다. 지느러미가 올라오면 플래시가 터진다
        ctx.fillStyle = s.shirt; ctx.fillRect(x + 3, y - 9, 1, 3);
        const flash = near ? Math.random() < 0.12 : Math.random() < 0.004;
        ctx.fillStyle = flash ? "#FFFFFF" : "#1E2433"; ctx.fillRect(x + 3, y - 11, 2, 2);
      }
      if (near && s.pri < 0.2 && x > 2) text(ctx, "!", x, y - 16, "#FFC24A");
    }
  }

  function water(rain) {
    const bands = ["#1B6A80", "#175C72", "#134D63", "#104055", "#0D3447", "#0A293A", "#08202F"];
    const bh = (FLOOR - SURFACE) / bands.length;
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, SURFACE + Math.round(i * bh), W, Math.ceil(bh) + 1); });
    // 수면 위로 스며드는 빛줄기
    if (!reduce) {
      ctx.globalAlpha = 0.07 * (1 - rain * 0.7);
      ctx.fillStyle = "#BDEBFF";
      for (let k = 0; k < 5; k++) {
        const bx = ((k * 97 + clock / 90) % (W + 60)) - 30;
        for (let y = SURFACE; y < FLOOR; y += 2) ctx.fillRect(Math.round(bx + (y - SURFACE) * 0.35), y, 6, 2);
      }
      ctx.globalAlpha = 1;
    }
    // 수면: 반짝이는 물결
    ctx.fillStyle = "#4FB3CF"; ctx.fillRect(0, SURFACE, W, 1);
    ctx.fillStyle = "#A8E6F5";
    for (let x = 0; x < W; x += 1) if (Math.sin(x * 0.7 + clock / 260) + Math.sin(x * 0.23 - clock / 410) > 1.4) ctx.fillRect(x, SURFACE, 1, 1);
    // 바닥
    ctx.drawImage(bg.bed, OX, 0, W, H - FLOOR, 0, FLOOR, W, H - FLOOR);
    for (const [x, h, ph] of bg.weeds) {
      const sx = x - OX;
      if (sx < 0 || sx >= W) continue;
      ctx.fillStyle = "#2E6B4E";
      for (let k = 0; k < h; k++) ctx.fillRect(sx + Math.round(Math.sin(clock / 600 + ph + k * 0.4) * (k / h) * 2), FLOOR - k, 1, 1);
    }
  }

  function frame(dt) {
    if (playing) {
      if (pos < N - 1) pos = Math.min(N - 1, pos + (dt * speed) / DAY_MS);
      else if ((hold += dt) > HOLD_MS) { pos = 0; hold = 0; }
    }
    const di = Math.floor(pos);
    if (di !== cur) setDay(di);
    dayT = Math.min(1, dayT + dt / 900);
    if (toastLeft > 0 && (toastLeft -= dt * (cur === N - 1 ? 1 : speed)) <= 0) $banner.hidden = true;
    if (!reduce) clock += dt;

    const fr = F[cur], e = ease(dayT);
    const rain = rainFrom + (rainTo - rainFrom) * e;
    const moon = moonFrom + (moonTo - moonFrom) * e;
    const level = crowdFrom + (crowdTo - crowdFrom) * e;

    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.imageSmoothingEnabled = false;
    sky(rain, moon);
    ctx.drawImage(bg.skyline, OX, 0, W, 44, 0, 14, W, 44);
    scoreboard(fr);

    // 상어 자리: 수로를 옆에서 본 타원을 돈다. 오른쪽으로 갈 땐 앞(깊은 곳), 왼쪽으로 올 땐 뒤(수면 가까이).
    const th = reduce ? Math.PI * 0.8 : (clock / LAP_MS) * Math.PI * 2;
    const A = W * 0.34, cx = W / 2;
    const sx = cx + A * Math.sin(th), cs = Math.cos(th);
    const sy = 120 + 20 * cs;
    const right = cs > 0;
    const turning = Math.abs(cs) < 0.22;
    const fi = reduce ? 0 : ((clock / 130) | 0) % 4;
    const spr = turning ? shark.turn[Math.abs(cs) < 0.1 ? 1 : 0] : shark.swim[fi];
    const finUp = !right && !turning && sy - (spr.ay - spr.finTop) < SURFACE;
    const finX = sx;

    // 데크·구경꾼·난간
    ctx.drawImage(bg.deck, OX, 0, W, 32, 0, 58, W, 32);
    lotteBoard(fr);
    crowd(level, rain, fr, finX, finUp);
    ctx.drawImage(bg.rail, OX, 0, W, 8, 0, 72, W, 8);

    water(rain);

    // 숭어 떼 — 늘 상어 반대편에서 몰려 다닌다
    const fx = cx + A * 0.85 * Math.sin(th + Math.PI), fy = 132 - 14 * Math.cos(th + Math.PI);
    const fishRight = Math.cos(th + Math.PI) > 0;
    for (const [dx, dy, ph] of bg.fish) {
      const x = Math.round(fx + dx + Math.sin(clock / 400 + ph) * 2), y = Math.round(fy + dy + Math.sin(clock / 300 + ph));
      ctx.fillStyle = "#9FB8C0"; ctx.fillRect(x, y, 4, 1);
      ctx.fillStyle = "#6E8A94"; ctx.fillRect(x + (fishRight ? -1 : 4), y, 1, 1);
    }

    // 상어
    const img = spr.c;
    const drawAt = (source, clipTop, clipBot) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, clipTop, W, clipBot - clipTop); ctx.clip();
      ctx.translate(Math.round(sx), Math.round(sy));
      if (!right) ctx.scale(-1, 1);
      ctx.drawImage(source, -spr.ax, -spr.ay);
      ctx.restore();
    };
    const far = !right || turning;
    // 수면 위로 나온 등지느러미는 물빛 없이, 물속은 깊이만큼 흐리게
    drawAt(img, 0, SURFACE);
    drawAt(far ? shark.far.get(spr) : img, SURFACE, H);
    if (finUp) {
      // 지느러미가 가르는 물살
      const fxp = Math.round(sx + (right ? 1 : -1) * (spr.finX - spr.ax));
      ctx.fillStyle = "#E4F7FF";
      for (let k = 0; k < 6; k++) if (((clock / 90 + k) | 0) % 3) ctx.fillRect(fxp + (right ? -k * 3 - 4 : k * 3 + 4), SURFACE - (k < 2 ? 1 : 0), 2, 1);
    }
    // 가끔 물방울
    if (!reduce) {
      ctx.fillStyle = "#A8E6F5";
      for (let k = 0; k < 3; k++) {
        const t = ((clock / 1400 + k / 3) % 1);
        const by = Math.round(sy - 4 - t * (sy - SURFACE - 4));
        if (by > SURFACE + 1) ctx.fillRect(Math.round(sx + (right ? 12 : -12) + Math.sin(t * 9 + k) * 2), by, 1, 1);
      }
    }

    // 비
    if (rain > 0.02) {
      ctx.globalAlpha = rain * 0.55;
      ctx.fillStyle = "#AFC3DD";
      for (const d of drops) {
        const x = (((d[0] - clock * 0.03) % W) + W) % W, y = (d[1] + clock * 0.16 * (d[2] / 4)) % SURFACE;
        ctx.fillRect(Math.round(x), Math.round(y), 1, d[2]);
      }
      ctx.globalAlpha = rain;
      ctx.fillStyle = "#CFE9F5";
      for (let k = 0; k < 8; k++) { const rx = ((k * 53 + ((clock / 120) | 0) * 29) % W); ctx.fillRect(rx, SURFACE - 1, 3, 1); }
      ctx.globalAlpha = 1;
    }

    // 이름표는 상어 머리 위를 따라다닌다
    tag.style.left = `${(sx / W) * 100}%`;
    tag.style.top = `${((sy - 14) / H) * 100}%`;
  }

  let raf = 0;
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.max(0, Math.min(64, now - last));
    last = now;
    frame(dt);
    raf = requestAnimationFrame(loop);
  };
  setDay(Math.floor(pos));
  dayT = 1;
  crowdFrom = crowdTo; rainFrom = rainTo; moonFrom = moonTo;
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    for (const f of off) f();
  };
}
