// 붙여넣기 총의 규칙 전부. 순수 모듈이다 — 클립보드도 키보드도 시계도 모른다.
//
// 바깥(렌더러)이 「방아쇠를 당겼다」「복사했다」「시간이 dt 흘렀다」를 알려 주면,
// 엔진은 **일어난 일의 목록**(effects)을 쌓아 둔다. 바깥이 drain() 으로 가져가서
// 실제로 붙여넣고 소리를 내고 그림을 그린다.
//
//   { type: 'shot', text, after, how }  text 를 넣고, after 가 있으면 그 키를 누른다.
//                                       how 는 'type'(글자를 쳐 넣는다) 또는 'paste'(통째로 붙여넣는다)
//   { type: 'reload' }              다 쏜 탄창에서 당겼다 — 철컥, 처음부터 다시 쏜다
//   { type: 'pass' }                총이 쏠 일이 아니다 — 원래의 붙여넣기를 그대로 흘려보낸다
//   { type: 'empty' }               쏠 것이 아예 없다 — 틱
//   { type: 'switch' }              총이나 탄창을 바꿨다

import {
  FIRE, GUNS, LIVE_CAP, LIVE_NAME, MAGAZINE_MAX, NAME_MAX, ROUND_MAX,
  SEPARATORS, SNIPE_SLOTS, STEP,
} from './constants.js'
import { assign, cleanKeys, defaultKeys, isPaste } from './keys.js'
import { chamber, createMagazine, draw, drawAll, push, reload, remaining } from './magazine.js'

function cleanName(name, fallback) {
  const text = typeof name === 'string' ? name.trim().slice(0, NAME_MAX) : ''
  return text || fallback
}

function cleanRounds(rounds) {
  if (!Array.isArray(rounds)) return []
  return rounds
    .filter((round) => typeof round === 'string' && round.trim() !== '')
    .map((round) => round.slice(0, ROUND_MAX))
}

/**
 * @param platform 'mac' | 'win'. 단축키 기본값이 다르다(붙여넣기가 ⌘V 냐 Ctrl+V 냐).
 * @param saved 저장해 둔 것 (snapshot() 이 만든 모양). 무엇이 들어와도 죽지 않는다 —
 *              저장 파일은 사람이 고칠 수도, 옛 버전이 썼을 수도 있다.
 */
export function createEngine(saved, platform = 'mac') {
  const data = saved && typeof saved === 'object' ? saved : {}

  const savedMags = (Array.isArray(data.magazines) ? data.magazines : [])
    .filter((mag) => mag && typeof mag === 'object')
    .slice(0, MAGAZINE_MAX)
    .map((mag, i) => createMagazine(cleanName(mag.name, `탄창 ${i + 1}`), cleanRounds(mag.rounds)))

  const state = {
    gun: GUNS.includes(data.gun) ? data.gun : 'pistol',
    /** 0 번은 언제나 현장 탄창이다. */
    mags: [createMagazine(LIVE_NAME), ...savedMags],
    magIndex: 0,
    /** 저격총이 겨누고 있는 슬롯 (0 부터). */
    aim: 0,
    /**
     * 쏘는 중이면 그 내용. 아니면 null.
     * { chars: 남은 글자들, wait: 다음 발까지 남은 시간, gun: 쏘기 시작한 총, chain: 글이 끝나면 다음 글로 }
     */
    firing: null,
    separator: SEPARATORS.includes(data.separator) ? data.separator : 'tab',
    sound: data.sound === true,
    /** 단축키. keys.js 가 모양을 안다. */
    keys: cleanKeys(data.keys, platform),
    /**
     * 마지막으로 복사한 것이 **총알이 못 되는 것**(그림·파일·비밀번호)인가.
     * 그렇다면 현장 탄창을 든 채 붙여넣기 키를 눌렀을 때 총이 끼어들면 안 된다.
     */
    foreign: false,
  }
  /** 방아쇠가 그 OS 의 붙여넣기 키 그대로인가. */
  const pasteTrigger = () => isPaste(state.keys.trigger, platform)

  // **붙여넣기 키가 방아쇠면 언제나 현장 탄창으로 시작한다.** 켜자마자의 ⌘V 가 지난번에
  // 끼워 둔 탄창의 글을 쏟아내면, 그건 붙여넣기가 고장 난 것으로 보인다. 현장 탄창은
  // 비어 있으니 무언가 복사하기 전까지 ⌘V 는 평소 그대로다.
  if (!pasteTrigger() && Number.isInteger(data.magIndex) && data.magIndex >= 0 && data.magIndex < state.mags.length) {
    state.magIndex = data.magIndex
  }

  let effects = []
  let carry = 0

  const mag = () => state.mags[state.magIndex]
  const shot = (text, after, how) => effects.push({ type: 'shot', text, after, how })

  /**
   * 글을 「사람이 글자 하나로 보는 단위」로 자른다. 코드 단위로 자르면 이모지와 받침 없는
   * 조합형이 반으로 쪼개져 깨진 글자가 찍힌다.
   */
  const splitter = typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
  const split = (text) => (splitter ? Array.from(splitter.segment(text), (s) => s.segment) : Array.from(text))

  /** 한 발. 쏘는 중인 글에서 글자를 떼어 내보낸다. */
  function release() {
    const { firing } = state
    const { interval, per } = FIRE[firing.gun]
    const text = firing.chars.splice(0, per).join('')
    const roundDone = firing.chars.length === 0
    const more = roundDone && firing.chain && remaining(mag()) > 0

    // 구분 키는 글과 글 사이에만 누른다. 마지막 글 뒤에는 안 누른다 — 다 채운 폼에서
    // 한 칸 더 넘어가지 않게.
    shot(text, more && state.separator !== 'none' ? state.separator : null, 'type')

    if (more) firing.chars = split(draw(mag()))
    if (roundDone && !more) state.firing = null
    else firing.wait = interval
  }

  function start(text, chain) {
    state.firing = { chars: split(text), wait: 0, gun: state.gun, chain }
    release() // 첫 발은 당기는 순간에 나간다
  }

  /** 쏘던 것을 멈춘다. **쏘다 만 글의 나머지는 버린다** — 그 글은 이미 탄창에서 나왔다. */
  function stopFiring() {
    state.firing = null
  }

  /**
   * 방아쇠.
   *
   * passable 은 「방아쇠가 그 OS 의 붙여넣기 키다」라는 뜻이다. 그럴 때 총이 쏠 것이 없으면
   * 키를 삼킨 채 헛방을 내지 않고 **원래의 붙여넣기를 흘려보낸다** — 그림을 복사해서
   * 붙여넣으려는 사람의 ⌘V 를 총이 먹어 버리면 안 된다.
   *
   * **다 쏜 탄창에서 당기면 그 자리에서 다시 쏜다.** 장전만 하고 한 번 쉬면, 같은 것을 두 번
   * 붙여넣으려는 사람은 두 번째 ⌘V 마다 아무 일도 안 일어난다.
   *   현장 탄창 + 권총   방금 쏜 것(= 마지막에 복사한 것)을 다시. 보통의 붙여넣기와 같다
   *   그 밖             처음부터 다시
   */
  function trigger(passable = false) {
    if (state.firing !== null) {
      stopFiring() // 쏘는 중에 다시 당기면 멈춘다
      return
    }
    const live = state.magIndex === 0
    if (passable && (mag().rounds.length === 0 || (live && state.foreign))) {
      effects.push({ type: 'pass' })
      return
    }
    if (state.gun === 'sniper') {
      snipe(state.aim + 1)
      return
    }
    if (mag().rounds.length === 0) {
      effects.push({ type: 'empty' })
      return
    }
    if (remaining(mag()) === 0) {
      if (live && state.gun === 'pistol') {
        mag().next = mag().rounds.length - 1
      } else {
        reload(mag())
        effects.push({ type: 'reload' })
      }
    }
    if (state.gun === 'shotgun') start(drawAll(mag()).join('\n'), false)
    else start(draw(mag()), state.gun === 'machinegun')
  }

  /** n 번 슬롯(1 부터)을 쏜다. 탄창은 줄지 않는다 — 저격은 「그것만 골라」 쏘는 것이다. */
  function snipe(n) {
    stopFiring()
    const index = n - 1
    if (!Number.isInteger(index) || index < 0 || index >= SNIPE_SLOTS) return
    const text = mag().rounds[index]
    if (text === undefined) {
      effects.push({ type: 'empty' })
      return
    }
    state.aim = index
    shot(text, null, 'paste') // 통째로 한 방. 한 글자씩 쏘지 않는다
  }

  function setGun(gun) {
    if (!GUNS.includes(gun) || gun === state.gun) return
    stopFiring()
    state.gun = gun
    effects.push({ type: 'switch' })
  }

  function selectMagazine(index) {
    if (!Number.isInteger(index) || index < 0 || index >= state.mags.length) return
    if (index === state.magIndex) return
    stopFiring()
    state.magIndex = index
    state.aim = 0
    effects.push({ type: 'switch' })
  }

  /**
   * 붙여넣기 키가 방아쇠일 때는 **방금 복사한 것이 이긴다.** 저장한 탄창을 끼워 둔 채로
   * 무언가 복사했다면, 그다음 ⌘V 로 나와야 하는 것은 그 복사한 것이다.
   */
  function backToLive() {
    if (pasteTrigger() && state.magIndex !== 0) selectMagazine(0)
  }

  /**
   * 무언가 복사됐다. 현장 탄창 맨 뒤에 넣는다 — **복사한 순서가 쏘는 순서다.**
   * 같은 것을 연달아 복사한 것은 한 발로 친다(⌘C 를 습관처럼 두 번 누르는 사람이 많다).
   */
  function copied(text) {
    if (typeof text !== 'string' || text.trim() === '') return
    state.foreign = false
    backToLive()
    const live = state.mags[0]
    const round = text.slice(0, ROUND_MAX)
    if (live.rounds[live.rounds.length - 1] === round) return
    push(live, round, LIVE_CAP)
  }

  /** 글이 아닌 것(그림·파일)이나 총알로 안 받는 것(비밀번호)이 복사됐다. */
  function copiedOther() {
    state.foreign = true
    backToLive()
  }

  /** 단축키를 바꿔 본다. 결과는 keys.js 의 assign 과 같다. 되면 그 자리에서 바뀐다. */
  function setKey(action, binding) {
    const result = assign(state.keys, action, binding)
    if (result.ok) state.keys = result.keys
    return result
  }

  /** 시간이 dt 흘렀다. 고정 스텝으로 잘라서 센다. */
  function step(dt) {
    carry += dt
    while (carry >= STEP) {
      carry -= STEP
      if (state.firing === null) continue
      state.firing.wait -= STEP
      if (state.firing.wait <= 1e-9) release()
    }
  }

  // ── 무기고 (탄창 편집) ───────────────────────────────────────────────────

  function addMagazine(name, rounds = []) {
    if (state.mags.length - 1 >= MAGAZINE_MAX) return -1
    state.mags.push(createMagazine(cleanName(name, `탄창 ${state.mags.length}`), cleanRounds(rounds)))
    return state.mags.length - 1
  }

  /** 현장 탄창에 모은 것을 이름 붙여 남긴다. */
  function saveLiveAs(name) {
    return addMagazine(name, state.mags[0].rounds)
  }

  function renameMagazine(index, name) {
    if (index <= 0 || index >= state.mags.length) return
    state.mags[index].name = cleanName(name, state.mags[index].name)
  }

  function setRounds(index, rounds) {
    if (index < 0 || index >= state.mags.length) return
    if (index === state.magIndex) stopFiring()
    state.mags[index].rounds = cleanRounds(rounds)
    state.mags[index].next = 0
  }

  /** 현장 탄창(0)은 못 지운다. 비우기만 된다(setRounds(0, [])). */
  function removeMagazine(index) {
    if (index <= 0 || index >= state.mags.length) return
    stopFiring()
    state.mags.splice(index, 1)
    if (state.magIndex === index) state.magIndex = 0
    else if (state.magIndex > index) state.magIndex -= 1
    state.aim = 0
  }

  return {
    state,
    trigger,
    snipe,
    setGun,
    nextGun: () => setGun(GUNS[(GUNS.indexOf(state.gun) + 1) % GUNS.length]),
    selectMagazine,
    nextMagazine: () => selectMagazine((state.magIndex + 1) % state.mags.length),
    copied,
    copiedOther,
    setKey,
    resetKeys: () => { state.keys = defaultKeys(platform) },
    step,
    addMagazine,
    saveLiveAs,
    renameMagazine,
    setRounds,
    removeMagazine,
    setSeparator: (key) => { if (SEPARATORS.includes(key)) state.separator = key },
    setSound: (on) => { state.sound = on === true },
    /** 지금 탄창에서 다음에 나갈 것. */
    chamber: () => (state.gun === 'sniper' ? mag().rounds[state.aim] ?? null : chamber(mag())),
    remaining: () => remaining(mag()),
    /** 쏘는 중인 글에서 아직 안 나간 부분. 안 쏘는 중이면 null. */
    firingRest: () => (state.firing ? state.firing.chars.join('') : null),
    magazine: mag,
    /** 쌓인 일을 가져가고 비운다. */
    drain() {
      const out = effects
      effects = []
      return out
    },
    /**
     * 저장할 것. **현장 탄창은 안 들어간다** — 복사한 것(비밀번호일 수도 있다)을
     * 디스크에 남기지 않는다. 남기고 싶으면 이름을 붙여 저장한 탄창으로 만든다.
     */
    snapshot: () => ({
      gun: state.gun,
      magIndex: state.magIndex,
      separator: state.separator,
      sound: state.sound,
      keys: state.keys,
      magazines: state.mags.slice(1).map((m) => ({ name: m.name, rounds: [...m.rounds] })),
    }),
  }
}
