// 규칙 — 떠 있는 창의 목록이 오면, 창마다 빨강·노랑·초록 방울 셋을 트리의 **아무 데나** 단다.
// 창이 사라지면 그 창의 방울 셋이 떨어진다. 화면도 셸도 모른다. 일어난 일은 drain() 으로 나간다.

import { pickSpot } from './tree.js'

/** 창 하나에 달리는 방울 셋. 맥 창 왼쪽 위의 단추와 같은 순서다. */
export const KINDS = ['red', 'yellow', 'green']
/** 트리에 다는 창의 수. 넘으면 자리가 날 때까지 기다린다(방울 54개가 겹치지 않는 선). */
export const MAX_WINDOWS = 18

export function keyOf(id, kind) {
  return `${id}:${kind}`
}

/** "12:red" → { id: 12, kind: 'red' }. 꼴이 아니면 null. */
export function parseKey(key) {
  if (typeof key !== 'string') return null
  const [id, kind] = key.split(':')
  if (!KINDS.includes(kind) || !/^\d+$/.test(id)) return null
  return { id: Number(id), kind }
}

export function createEngine({ rng }) {
  /** @type {Map<number, {id:number, app:string, pid:number, min:boolean, big:boolean, spots:Record<string,{x:number,y:number}>}>} */
  const windows = new Map()
  let hovered = null
  let events = []

  function takenSpots() {
    const out = []
    for (const win of windows.values()) for (const kind of KINDS) out.push(win.spots[kind])
    return out
  }

  return {
    get windows() { return [...windows.values()] },

    /**
     * 지금 떠 있는 창의 목록. 없어진 것을 먼저 떼고(자리가 난다) 새것을 단다.
     * quiet 이면 떨어지고 튀어나오는 연출 없이 조용히 바뀐다(데스크탑을 옮겼을 때).
     * @param {{id:number, app?:string, pid?:number, min?:boolean, big?:boolean}[]} list
     */
    sync(list, { quiet = false } = {}) {
      const seen = new Set(list.map((item) => item.id))
      for (const [id, win] of [...windows]) {
        if (seen.has(id)) continue
        windows.delete(id)
        if (hovered && hovered.id === id) {
          hovered = null
          events.push({ type: 'hover', id: null, kind: null })
        }
        events.push({ type: 'drop', win, quiet: !!quiet })
      }
      for (const item of list) {
        const have = windows.get(item.id)
        if (!have) {
          if (windows.size >= MAX_WINDOWS) continue
          const taken = takenSpots()
          const spots = {}
          for (const kind of KINDS) {
            spots[kind] = pickSpot(taken, rng)
            taken.push(spots[kind])
          }
          const win = { id: item.id, app: item.app || '', pid: item.pid || 0, min: !!item.min, big: !!item.big, spots }
          windows.set(win.id, win)
          events.push({ type: 'hang', win, quiet: !!quiet })
          continue
        }
        if (have.min !== !!item.min) {
          have.min = !!item.min
          events.push({ type: have.min ? 'dim' : 'lit', id: have.id })
        }
        if (have.big !== !!item.big) {
          have.big = !!item.big
          events.push({ type: have.big ? 'grow' : 'shrink', id: have.id })
        }
      }
    },

    /** 마우스가 올라온 방울(키) 또는 null. 바뀐 순간에만 일이 일어난다. */
    hover(key) {
      const hit = parseKey(key)
      const next = hit && windows.has(hit.id) ? hit : null
      if ((next && hovered && next.id === hovered.id && next.kind === hovered.kind) || (!next && !hovered)) return
      hovered = next
      events.push({ type: 'hover', id: next ? next.id : null, kind: next ? next.kind : null })
    },

    /** 방울을 눌렀다. result: 'ok' 됐다 · 'denied' 권한이 없다 · 'fail' 그 창이 말을 안 듣는다. */
    press(key, result = 'ok') {
      const hit = parseKey(key)
      if (!hit || !windows.has(hit.id)) return
      events.push({ type: 'press', id: hit.id, kind: hit.kind, result })
    },

    drain() {
      const out = events
      events = []
      return out
    },
  }
}
