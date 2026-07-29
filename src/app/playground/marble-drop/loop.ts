import { allCircles, allSegments } from "./blocks";
import { BOMB_PENALTY, leadingBucket, stepWorld, winnerBucket, type Bucket } from "./physics";
import { spawnDue, type Game } from "./setup";

/**
 * 제한 시간. 이 시간을 넘기면 가장 많이 담은 양동이를 승자로 확정한다.
 * 실측상 여기에 걸리는 판은 없어야 하고, 이 값은 순전히 안전장치다 — 어떤 이유로든
 * 판이 끝나지 않으면 사용자는 영원히 결과를 못 본다.
 */
export const MAX_SECONDS = 45;

/** 캡처 연출을 화면에 남겨두는 시간(초) */
export const CAPTURE_FLASH_SECONDS = 0.5;

export interface Outcome {
  bucket: Bucket;
  /** 시간 초과로 강제 종료된 결과인지 */
  forced: boolean;
}

/**
 * 한 스텝 진행. React 상태를 건드리지 않으므로 rAF 루프와 테스트가 같은 코드를 쓴다.
 */
export function simulate(game: Game, dt: number): string | null {
  spawnDue(game);

  // 블록 도형은 스텝이 끝난 시각 기준으로 만든다. 구슬이 움직인 뒤의 위치와 맞물려야
  // 회전 팔이 구슬을 스치고 지나가는 일이 없다.
  const t = game.world.elapsed + dt;
  const before = game.world.captures.length;
  stepWorld(game.world, dt, allSegments(game.blocks, t), allCircles(game.blocks));

  // 이번 스텝에 터진 폭탄이 있으면 누구를 때렸는지 알린다
  let bombed: string | null = null;
  for (let i = before; i < game.world.captures.length; i++) {
    const c = game.world.captures[i];
    if (c.kind !== "bomb") continue;
    const bucket = game.world.buckets[c.bucketIndex];
    bombed = `💣 ${game.names[bucket.ownerIndex] ?? ""} −${BOMB_PENALTY}`;
  }

  // 캡처 연출 기록이 무한히 쌓이지 않게 오래된 것을 버린다
  const cutoff = game.world.elapsed - CAPTURE_FLASH_SECONDS;
  if (game.world.captures.length > 0 && game.world.captures[0].at < cutoff) {
    game.world.captures = game.world.captures.filter((c) => c.at >= cutoff);
  }

  return bombed;
}

/** 판이 끝났으면 결과를, 아직이면 null. */
export function outcomeOf(game: Game): Outcome | null {
  const won = winnerBucket(game.world);
  if (won) return { bucket: won, forced: false };
  if (game.world.elapsed >= MAX_SECONDS) {
    const leading = leadingBucket(game.world);
    if (leading) return { bucket: leading, forced: true };
  }
  return null;
}

/** 결과 양동이의 주인 이름 */
export function winnerName(game: Game, outcome: Outcome): string {
  return game.names[outcome.bucket.ownerIndex] ?? "";
}
