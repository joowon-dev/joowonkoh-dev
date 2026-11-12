// 단축키. 순수 모듈이다 — 키보드를 직접 듣지 않는다. 「어떤 키가 어떤 동작인가」만 안다.
//
// 키 하나는 { code, mods } 다. code 는 브라우저의 KeyboardEvent.code(자판의 **자리** 이름 —
// 'KeyV' 는 한글 자판에서도 'KeyV' 다), mods 는 'ctrl'·'alt'·'shift'·'meta' 중 눌린 것들.
// 셸에는 그 자리의 OS 키 번호로 바꿔서 넘긴다. 셸은 번호만 안다.

/** 정할 수 있는 동작. snipe 는 수식키만 정한다 — 숫자 1~9 는 슬롯 번호라 못 바꾼다. */
export const ACTIONS = ['trigger', 'nextGun', 'nextMagazine', 'panel', 'snipe']

export const ACTION_NAMES = {
  trigger: '발사',
  nextGun: '총 바꾸기',
  nextMagazine: '탄창 바꾸기',
  panel: '무기고',
  snipe: '저격',
}

/** 셸과 약속한 번호. 저격 슬롯 n 은 SNIPE_ID + n 이다. */
export const ACTION_IDS = { trigger: 0, nextGun: 1, nextMagazine: 2, panel: 3 }
export const SNIPE_ID = 10

const MODS = ['ctrl', 'alt', 'shift', 'meta']

/** 자리 이름 → [맥 키코드, 윈도우 가상 키]. 여기 없는 키는 단축키로 못 쓴다. */
const NATIVE = {
  KeyA: [0, 0x41], KeyB: [11, 0x42], KeyC: [8, 0x43], KeyD: [2, 0x44], KeyE: [14, 0x45],
  KeyF: [3, 0x46], KeyG: [5, 0x47], KeyH: [4, 0x48], KeyI: [34, 0x49], KeyJ: [38, 0x4a],
  KeyK: [40, 0x4b], KeyL: [37, 0x4c], KeyM: [46, 0x4d], KeyN: [45, 0x4e], KeyO: [31, 0x4f],
  KeyP: [35, 0x50], KeyQ: [12, 0x51], KeyR: [15, 0x52], KeyS: [1, 0x53], KeyT: [17, 0x54],
  KeyU: [32, 0x55], KeyV: [9, 0x56], KeyW: [13, 0x57], KeyX: [7, 0x58], KeyY: [16, 0x59],
  KeyZ: [6, 0x5a],
  // 맥의 숫자 키코드는 순서대로가 아니다(5 와 6 이 뒤바뀌어 있다).
  Digit0: [29, 0x30], Digit1: [18, 0x31], Digit2: [19, 0x32], Digit3: [20, 0x33], Digit4: [21, 0x34],
  Digit5: [23, 0x35], Digit6: [22, 0x36], Digit7: [26, 0x37], Digit8: [28, 0x38], Digit9: [25, 0x39],
  F1: [122, 0x70], F2: [120, 0x71], F3: [99, 0x72], F4: [118, 0x73], F5: [96, 0x74], F6: [97, 0x75],
  F7: [98, 0x76], F8: [100, 0x77], F9: [101, 0x78], F10: [109, 0x79], F11: [103, 0x7a], F12: [111, 0x7b],
  Space: [49, 0x20], Backquote: [50, 0xc0], Minus: [27, 0xbd], Equal: [24, 0xbb],
  BracketLeft: [33, 0xdb], BracketRight: [30, 0xdd], Backslash: [42, 0xdc], Semicolon: [41, 0xba],
  Quote: [39, 0xde], Comma: [43, 0xbc], Period: [47, 0xbe], Slash: [44, 0xbf],
}

const KEY_NAMES = {
  Space: 'Space', Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
  Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
}

const isDigit = (code) => /^Digit[1-9]$/.test(code)
const isFunctionKey = (code) => /^F\d+$/.test(code)

/**
 * 기본값. **발사는 그 OS 의 붙여넣기 키다** — 따로 외울 것이 없어야 손이 간다.
 * 나머지는 ⌥⇧ 다. ⌃⌥ 는 macOS 입력 소스 전환과 겹친다.
 */
export function defaultKeys(platform) {
  const paste = platform === 'win' ? 'ctrl' : 'meta'
  return {
    trigger: { code: 'KeyV', mods: [paste] },
    nextGun: { code: 'KeyG', mods: ['alt', 'shift'] },
    nextMagazine: { code: 'KeyM', mods: ['alt', 'shift'] },
    panel: { code: 'KeyA', mods: ['alt', 'shift'] },
    snipe: { code: 'Digit1', mods: ['alt', 'shift'] },
  }
}

/** 모양을 바로잡는다. 못 쓰는 것이면 null. */
export function cleanBinding(binding) {
  if (!binding || typeof binding !== 'object') return null
  if (typeof binding.code !== 'string' || !Object.hasOwn(NATIVE, binding.code)) return null
  if (!Array.isArray(binding.mods)) return null
  return { code: binding.code, mods: MODS.filter((mod) => binding.mods.includes(mod)) }
}

/**
 * 단축키로 써도 되는가. 수식키 없는 글자 키나 Shift 만 붙은 글자 키는 안 된다 —
 * 전역 단축키는 키를 삼키므로, 그 글자를 어디서도 못 치게 된다. F 키는 혼자서도 된다.
 */
export function usable(binding) {
  return isFunctionKey(binding.code) || binding.mods.some((mod) => mod !== 'shift')
}

const same = (a, b) => a.code === b.code && a.mods.join() === b.mods.join()

/** 이 동작이 차지하는 키 전부. 저격은 숫자 아홉 개를 다 차지한다. */
function footprint(action, binding) {
  if (action !== 'snipe') return [binding]
  return Array.from({ length: 9 }, (_, i) => ({ code: `Digit${i + 1}`, mods: binding.mods }))
}

/** binding 을 action 에 주면 겹치는 다른 동작. 없으면 null. */
export function conflict(keys, action, binding) {
  const mine = footprint(action, binding)
  for (const other of ACTIONS) {
    if (other === action) continue
    const theirs = footprint(other, keys[other])
    if (mine.some((a) => theirs.some((b) => same(a, b)))) return other
  }
  return null
}

/**
 * action 에 binding 을 줘 본다. 되면 새 keys 를, 안 되면 까닭을 돌려준다.
 *   { ok: true, keys } | { ok: false, why: 'bad' | 'weak' | 'digit' | 'taken', with }
 */
export function assign(keys, action, binding) {
  const clean = cleanBinding(binding)
  if (!ACTIONS.includes(action) || !clean) return { ok: false, why: 'bad' }
  if (!usable(clean)) return { ok: false, why: 'weak' }
  if (action === 'snipe') {
    if (!isDigit(clean.code) || clean.mods.length === 0) return { ok: false, why: 'digit' }
    clean.code = 'Digit1'
  }
  const taken = conflict(keys, action, clean)
  if (taken) return { ok: false, why: 'taken', with: taken }
  return { ok: true, keys: { ...keys, [action]: clean } }
}

/** 저장해 둔 것을 바로잡는다. 하나라도 이상하면 그 동작만이 아니라 **전부** 기본값으로 — 반쯤 섞인 단축키는 서로 겹칠 수 있다. */
export function cleanKeys(saved, platform) {
  const base = defaultKeys(platform)
  if (!saved || typeof saved !== 'object') return base
  const next = {}
  for (const action of ACTIONS) {
    const clean = cleanBinding(saved[action])
    if (!clean || !usable(clean)) return base
    if (action === 'snipe' && (!isDigit(clean.code) || clean.mods.length === 0)) return base
    next[action] = action === 'snipe' ? { code: 'Digit1', mods: clean.mods } : clean
  }
  for (const action of ACTIONS) if (conflict(next, action, next[action])) return base
  return next
}

/** 발사 키가 그 OS 의 붙여넣기 키인가. 그렇다면 쏠 것이 없을 때 진짜 붙여넣기를 흘려보내야 한다. */
export function isPaste(binding, platform) {
  return same(binding, defaultKeys(platform).trigger)
}

/** 셸에 넘길 목록. [{ id, key(OS 키 번호), ctrl, alt, shift, meta }] */
export function hotkeys(keys, platform) {
  const column = platform === 'win' ? 1 : 0
  const entry = (id, binding) => ({
    id,
    key: NATIVE[binding.code][column],
    ctrl: binding.mods.includes('ctrl'),
    alt: binding.mods.includes('alt'),
    shift: binding.mods.includes('shift'),
    meta: binding.mods.includes('meta'),
  })
  return [
    ...Object.keys(ACTION_IDS).map((action) => entry(ACTION_IDS[action], keys[action])),
    ...footprint('snipe', keys.snipe).map((binding, i) => entry(SNIPE_ID + i + 1, binding)),
  ]
}

/** 사람이 읽는 이름. 맥은 ⌃⌥⇧⌘V, 윈도우는 Ctrl+Alt+Shift+Win+V. */
export function keyLabel(binding, platform, action) {
  const key = action === 'snipe' ? '1~9'
    : KEY_NAMES[binding.code] || binding.code.replace(/^Key|^Digit/, '')
  if (platform === 'win') {
    const names = { ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', meta: 'Win' }
    return [...binding.mods.map((mod) => names[mod]), key].join('+')
  }
  const signs = { ctrl: '⌃', alt: '⌥', shift: '⇧', meta: '⌘' }
  return binding.mods.map((mod) => signs[mod]).join('') + key
}

/** 브라우저의 keydown 을 binding 으로. 수식키만 누른 것이거나 못 쓰는 키면 null. */
export function fromEvent(event) {
  if (!Object.hasOwn(NATIVE, event.code)) return null
  const mods = []
  if (event.ctrlKey) mods.push('ctrl')
  if (event.altKey) mods.push('alt')
  if (event.shiftKey) mods.push('shift')
  if (event.metaKey) mods.push('meta')
  return { code: event.code, mods }
}
