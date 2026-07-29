import {
  applyFinalSpurt,
  applyScheduler,
  isFinalSpurt,
  tickCoinEvents,
  updateScheduler,
  type CoinEffect,
  type EventType,
  type Scheduler,
} from "./events";
import { stepWorld, type Coin } from "./physics";
import { allDropped, releaseDue, spawnNeutral, type Game } from "./setup";

/** 판 밖으로 떨어져 나가는 중인 코인. 물리에서 분리된 순수 연출. */
export interface FallingCoin {
  coin: Coin;
  /** 낙하 연출 경과 시간(초) */
  t: number;
}

/** 중립 코인 추가 투입 간격(초) */
export const NEUTRAL_INTERVAL = 0.5;
export const NEUTRAL_INTERVAL_SPURT = 0.16;
/** 판 밖으로 떨어지는 코인의 낙하 연출 지속 시간(초). render.ts의 페이드 계산도 이 값을 쓴다. */
export const FALL_ANIM_SECONDS = 0.9;
/** 폭발·순간이동 연출 지속 시간(초) */
export const EFFECT_SECONDS = 0.7;

/** simulate가 제자리에서 갱신하는 연출 상태 묶음 */
export interface Fx {
  falling: FallingCoin[];
  effects: CoinEffect[];
}

export function createFx(): Fx {
  return { falling: [], effects: [] };
}

/**
 * 한 스텝 진행. React 상태를 건드리지 않으므로 rAF 루프와 "결과 바로 보기"의
 * 빠른 시뮬레이션, 그리고 테스트가 모두 같은 코드를 쓴다. fx는 제자리에서 수정한다.
 */
export function simulate(
  game: Game,
  scheduler: Scheduler,
  fx: Fx,
  nextNeutralAt: { current: number },
  dt: number,
): EventType | null {
  releaseDue(game);

  const fired = updateScheduler(scheduler, game.world.elapsed, dt);
  applyScheduler(game.world, scheduler);
  applyFinalSpurt(game.world, game.world.elapsed);

  // 폭탄·순간이동 코인의 도화선을 진행시킨다
  fx.effects.push(...tickCoinEvents(game.world, game.rng, dt));

  // 코인이 전부 들어온 뒤부터 중립 코인을 계속 투입한다
  if (allDropped(game) && game.world.elapsed >= nextNeutralAt.current) {
    const spurt = isFinalSpurt(game.world.elapsed);
    spawnNeutral(game, spurt ? 3 : 1);
    nextNeutralAt.current =
      game.world.elapsed + (spurt ? NEUTRAL_INTERVAL_SPURT : NEUTRAL_INTERVAL);
  }

  const fallenBefore = game.world.fallen.length;
  stepWorld(game.world, dt);

  // 이번 스텝에 떨어진 코인을 낙하 연출 목록에 넣는다
  for (let i = fallenBefore; i < game.world.fallen.length; i++) {
    fx.falling.push({ coin: game.world.fallen[i].coin, t: 0 });
  }
  for (let i = fx.falling.length - 1; i >= 0; i--) {
    fx.falling[i].t += dt;
    if (fx.falling[i].t >= FALL_ANIM_SECONDS) fx.falling.splice(i, 1);
  }
  for (let i = fx.effects.length - 1; i >= 0; i--) {
    fx.effects[i].t += dt;
    if (fx.effects[i].t >= EFFECT_SECONDS) fx.effects.splice(i, 1);
  }

  return fired;
}
