import { setSprite } from "./kit/render/draw.js";

/**
 * 친구들 그림 — 앱의 「친구 코드」와 같은 곳(Supabase 비공개 버킷 chiikawa-sprites)에서 받는다.
 *
 * 그림은 저장소·사이트에 넣지 않는다. 페이지가 열릴 때마다 문지기 함수에 코드를 보내
 * 10분짜리 서명 주소를 받아 그때그때 불러온다. 이 코드는 페이지 JS 에 그대로 들어 있어
 * 사실상 공개다 — 사이트 전용 코드라서 `update chiikawa_codes set enabled = false
 * where code = 'CHII-SITE'` 한 줄로 따로 끊을 수 있다(끊으면 페이지는 도형 그림으로 돌아간다).
 *
 * 받는 동안은 아무도 그리지 않는다 — 도형이 먼저 나왔다가 그림으로 바뀌지 않게.
 */
const ENDPOINT = "https://xajmblrdkdnqoxfvsfrt.supabase.co/functions/v1/chiikawa-sprites";
const CODE = "CHII-SITE";
/** 이만큼 지나도 못 받으면 도형 그림으로 시작한다. */
const TIMEOUT_MS = 6000;

export type Loaded = {
  /** 그림이 생긴 아이 이름들(파일 이름). 비어 있으면 도형 그림. */
  kinds: string[];
  /** 아이 이름 → 여백을 잘라 낸 그림의 data URL(창 안 「스크린샷」에 쓴다). */
  urls: Map<string, string>;
};

let pending: Promise<Loaded> | null = null;

/** 한 번만 받는다. 위 데모와 「누가 사나」가 같이 기다린다. */
export function loadSprites(): Promise<Loaded> {
  if (!pending) {
    const empty: Loaded = { kinds: [], urls: new Map() };
    pending = Promise.race([
      fetchAll().catch(() => empty),
      new Promise<Loaded>((resolve) => setTimeout(() => resolve(empty), TIMEOUT_MS)),
    ]);
  }
  return pending;
}

async function fetchAll(): Promise<Loaded> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: CODE }),
  });
  if (!res.ok) throw new Error(`sprites ${res.status}`);
  const { files } = (await res.json()) as { files: { name: string; url: string }[] };
  const loaded = await Promise.all(
    files.map(async ({ name, url }) => {
      const image = new window.Image();
      // 서명 주소는 다른 출처다. 이게 없으면 캔버스가 더럽혀져 여백 자르기(getImageData)가 막힌다.
      image.crossOrigin = "anonymous";
      // decode() 는 탭이 뒤에 있으면 끝나지 않는다. onload 로 기다린다.
      const ok = await new Promise<boolean>((resolve) => {
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
      });
      return ok ? { kind: name.replace(/\.[^.]+$/, "").toLowerCase(), image: trimmed(image) } : null;
    }),
  );
  const out: Loaded = { kinds: [], urls: new Map() };
  for (const item of loaded) {
    if (!item) continue;
    setSprite(item.kind, item.image);
    out.kinds.push(item.kind);
    if (item.image instanceof HTMLCanvasElement) out.urls.set(item.kind, item.image.toDataURL());
  }
  return out;
}

/**
 * 그림 긴 변의 최대 길이. 화면에는 60px 남짓으로 그려지니 이보다 클 까닭이 없다 —
 * 4000px 사진을 그대로 두면 여백 자르기가 픽셀 1200만 개를 훑느라 페이지가 멈칫한다.
 */
const SPRITE_MAX = 512;

/** 줄이고(SPRITE_MAX) 둘레의 투명 여백을 잘라 낸다(앱 렌더러의 trimmed 와 같다). */
export function trimmed(image: HTMLImageElement): HTMLImageElement | HTMLCanvasElement {
  const k = Math.min(1, SPRITE_MAX / Math.max(image.naturalWidth, image.naturalHeight));
  const w = Math.max(1, Math.round(image.naturalWidth * k));
  const h = Math.max(1, Math.round(image.naturalHeight * k));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return image;
  g.drawImage(image, 0, 0, w, h);
  const data = g.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return image;
  const out = document.createElement("canvas");
  out.width = x1 - x0 + 1;
  out.height = y1 - y0 + 1;
  out.getContext("2d")?.drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}
