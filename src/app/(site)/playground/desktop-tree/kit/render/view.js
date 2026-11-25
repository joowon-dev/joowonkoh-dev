// 무대 — 트리를 그리고, 엔진이 낸 「일어난 일」을 방울의 상태(class)와 움직임으로 옮긴다.
// 움직임은 전부 transform·opacity 다. 규칙은 모른다. 가만히 있을 때 도는 것은 꼬마전구의 깜빡임뿐이다.

import { BOARD, CX, FLOOR, BALL, STAR, TIERS, TRUNK, bodyBands, halfWidthAt, tierPath } from '../game/tree.js'
import { KINDS, keyOf } from '../game/engine.js'
import { fall } from '../game/fall.js'

function el(tag, attrs = {}, html = '') {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  node.innerHTML = html
  return node
}

/** 방울 위에 마우스를 올리면 보이는 표시. 맥 창의 단추와 같다(초록은 화면을 채우는 쪽이라 +). */
const GLYPH = {
  red: '<svg viewBox="0 0 10 10"><path d="M2.6 2.6 7.4 7.4M7.4 2.6 2.6 7.4"/></svg>',
  yellow: '<svg viewBox="0 0 10 10"><path d="M2 5H8"/></svg>',
  green: '<svg viewBox="0 0 10 10"><path d="M2 5H8M5 2V8"/></svg>',
}

/** 줄처럼 늘어진 꼬마전구. 왼쪽 끝과 오른쪽 끝의 높이, 가운데가 처지는 깊이, 전구의 수. */
const GARLANDS = [
  { left: 178, right: 160, sag: 16, bulbs: 4 },
  { left: 270, right: 246, sag: 22, bulbs: 6 },
  { left: 362, right: 336, sag: 28, bulbs: 8 },
  { left: 450, right: 424, sag: 30, bulbs: 10 },
].map(({ left, right, sag, bulbs }) => ({
  // 끝은 잎 안쪽에 둔다 — 잎의 옆이 안으로 휘어 있어서 폭의 0.8 까지만 쓴다.
  from: [Math.round(CX - halfWidthAt(left) * 0.8), left],
  to: [Math.round(CX + halfWidthAt(right) * 0.8), right],
  sag: [CX, Math.max(left, right) + sag],
  bulbs,
}))

function garlandPoint({ from, sag, to }, t) {
  const u = 1 - t
  return [u * u * from[0] + 2 * u * t * sag[0] + t * t * to[0], u * u * from[1] + 2 * u * t * sag[1] + t * t * to[1]]
}

function starPoints(cx, cy, outer, inner) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius).toFixed(1)}`)
  }
  return points.join(' ')
}

/**
 * 꼬마전구. **트리 그림 밖에 따로 둔다** — 그림 안에 두면 깜빡일 때마다 그림자 필터가 걸린 트리를 통째로
 * 다시 그린다(재 보니 웹뷰가 코어의 32% 를 썼다). 세 무리로 나눠 무리째 투명도만 바꾼다.
 */
function lightsHtml() {
  const groups = ['', '', '']
  let index = 0
  for (const line of GARLANDS) {
    for (let i = 0; i < line.bulbs; i++) {
      const [x, y] = garlandPoint(line, (i + 0.5) / line.bulbs)
      groups[index++ % 3] += `<i style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px"></i>`
    }
  }
  return groups.map((bulbs, i) => `<div class="lights g${i}">${bulbs}</div>`).join('')
}

function treeSvg() {
  // 아래 층부터 그려야 위 층이 덮는다.
  const tiers = [...TIERS].reverse()
    .map((tier) => `<path d="${tierPath(tier)}" fill="url(#leaf)" stroke="#1d7a48" stroke-width="3" stroke-linejoin="round" filter="url(#shade)"/>`)
    .join('')
  const garlands = GARLANDS
    .map((line) => `<path d="M ${line.from} Q ${line.sag} ${line.to}" fill="none" stroke="rgba(255,236,170,.42)" stroke-width="1.2"/>`)
    .join('')
  return `<svg id="tree" viewBox="0 0 ${BOARD.w} ${BOARD.h}" width="${BOARD.w}" height="${BOARD.h}">
    <defs>
      <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#4dbb7d"/><stop offset=".5" stop-color="#25894f"/><stop offset="1" stop-color="#115a34"/>
      </linearGradient>
      <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6a3d22"/><stop offset=".5" stop-color="#93603a"/><stop offset="1" stop-color="#5d351d"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff3a6"/><stop offset="1" stop-color="#ffb300"/>
      </linearGradient>
      <radialGradient id="halo"><stop offset="0" stop-color="#fff2a8" stop-opacity=".85"/><stop offset="1" stop-color="#fff2a8" stop-opacity="0"/></radialGradient>
      <filter id="shade" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#052a18" flood-opacity=".55"/>
      </filter>
    </defs>
    <ellipse cx="${CX}" cy="${FLOOR + 14}" rx="150" ry="9" fill="rgba(0,0,0,.2)"/>
    <rect x="${TRUNK.x}" y="${TRUNK.y}" width="${TRUNK.w}" height="${TRUNK.h}" rx="5" fill="url(#bark)"/>
    <ellipse cx="${CX}" cy="${FLOOR + 6}" rx="158" ry="15" fill="#fff"/>
    <ellipse cx="${CX - 40}" cy="${FLOOR + 3}" rx="84" ry="10" fill="#eef4fb"/>
    <g id="leaves">${tiers}${garlands}</g>
    <circle cx="${STAR.x}" cy="${STAR.y}" r="44" fill="url(#halo)"/>
    <polygon points="${starPoints(STAR.x, STAR.y, STAR.r, 10.5)}" fill="url(#gold)" stroke="#fff8d0" stroke-width="1.2" stroke-linejoin="round"/>
  </svg>`
}

const VERB = { red: '닫기', yellow: '접기', green: '키우기' }

export function createView(root, { rng }) {
  const board = el('div', { id: 'board', class: 'twinkle' }, treeSvg() + `<div id="lights">${lightsHtml()}</div>`)
  const balls = el('div', { id: 'balls' })
  const tag = el('div', { id: 'tag' }, '<img alt=""><span></span>')
  board.append(balls, tag)
  root.append(board)

  /** key("12:red") → 방울 */
  const nodes = new Map()
  /** 창 id → 창(엔진이 준 것 그대로) */
  const wins = new Map()
  let place = { x: 0, y: 0, scale: 1 }
  let hovered = null
  let burst = 0 // 한꺼번에 달리는 방울들이 차례로 튀어나오게 세는 수
  let tagTimer = null

  function trio(id) {
    return KINDS.map((kind) => nodes.get(keyOf(id, kind))).filter(Boolean)
  }

  function replay(node, name, seconds) {
    node.classList.remove(name)
    void node.offsetWidth
    node.classList.add(name)
    setTimeout(() => node.classList.remove(name), seconds * 1000)
  }

  function hang(win, quiet) {
    wins.set(win.id, win)
    if (burst === 0) setTimeout(() => { burst = 0 }, 0)
    for (const kind of KINDS) {
      const spot = win.spots[kind]
      const node = el('div', { class: 'orn', 'data-kind': kind },
        `<div class="hang"><i class="string"></i><i class="cap"></i><div class="ball">${GLYPH[kind]}</div></div>`)
      node.style.left = `${spot.x}px`
      node.style.top = `${spot.y}px`
      node.classList.toggle('min', win.min)
      node.classList.toggle('big', win.big)
      if (quiet) {
        node.classList.add('fade-in')
        setTimeout(() => node.classList.remove('fade-in'), 400)
      } else {
        const delay = burst++ * 0.045
        node.style.setProperty('--d', `${delay}s`)
        node.classList.add('in')
        setTimeout(() => node.classList.remove('in'), (delay + 0.8) * 1000)
      }
      nodes.set(keyOf(win.id, kind), node)
      balls.append(node)
    }
  }

  /** 줄이 끊어진 자리에 튀는 반짝이. */
  function sparkle(spot, kind) {
    const puff = el('div', { class: 'puff', 'data-kind': kind })
    puff.style.left = `${spot.x}px`
    puff.style.top = `${spot.y - BALL - 4}px`
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + rng() * 0.8
      const reach = 14 + rng() * 16
      const bit = el('i')
      bit.style.setProperty('--dx', `${(Math.cos(angle) * reach).toFixed(1)}px`)
      bit.style.setProperty('--dy', `${(Math.sin(angle) * reach).toFixed(1)}px`)
      puff.append(bit)
    }
    balls.append(puff)
    setTimeout(() => puff.remove(), 700)
  }

  /** 방울 하나를 떼어 떨어뜨린다. 길은 미리 다 계산해서 애니메이션 하나로 넘긴다. */
  function loosen(node, spot, kind, delay) {
    setTimeout(() => {
      node.classList.remove('in', 'on', 'me', 'press', 'no')
      node.classList.add('loose')
      sparkle(spot, kind)
      const away = spot.x >= CX ? 1 : -1
      const path = fall({ x: spot.x, y: spot.y, vx: away * (40 + rng() * 150), floor: FLOOR, radius: BALL })
      const frames = path.frames.map((frame) => ({
        offset: frame.t / path.duration,
        transform: `translate(${(frame.x - spot.x).toFixed(1)}px, ${(frame.y - spot.y).toFixed(1)}px) rotate(${frame.rot.toFixed(3)}rad)`,
      }))
      const ms = path.duration * 1000
      node.querySelector('.hang').animate(frames, { duration: ms, fill: 'forwards', easing: 'linear' })
      const fade = node.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
        { duration: ms + 500, fill: 'forwards', easing: 'linear' })
      fade.onfinish = () => node.remove()
    }, delay * 1000)
  }

  function drop(win, quiet) {
    wins.delete(win.id)
    KINDS.forEach((kind, i) => {
      const key = keyOf(win.id, kind)
      const node = nodes.get(key)
      if (!node) return
      nodes.delete(key)
      if (quiet) {
        node.classList.add('fade-out')
        setTimeout(() => node.remove(), 320)
      } else {
        loosen(node, win.spots[kind], kind, i * 0.13)
      }
    })
    if (!quiet) replay(board, 'shiver', 0.5)
  }

  function ripple(node) {
    const ring = el('i', { class: 'ring' })
    node.append(ring)
    setTimeout(() => ring.remove(), 600)
  }

  function showTag(win, kind, text, forSeconds = 0) {
    clearTimeout(tagTimer)
    const spot = win.spots[kind]
    const icon = tag.querySelector('img')
    if (win.pid) {
      icon.hidden = false
      icon.onerror = () => { icon.hidden = true }
      const src = `/icon/${win.pid}`
      if (icon.getAttribute('src') !== src) icon.setAttribute('src', src)
    } else {
      icon.hidden = true
    }
    tag.querySelector('span').textContent = text
    // 방울 위에 띄우고, 판 밖으로 나가지 않게 가운데로 당긴다.
    tag.style.left = `${Math.min(BOARD.w - 96, Math.max(96, spot.x))}px`
    tag.style.top = `${spot.y - 38}px`
    tag.classList.add('show')
    if (forSeconds) tagTimer = setTimeout(hideTag, forSeconds * 1000)
  }

  function hideTag() {
    clearTimeout(tagTimer)
    tag.classList.remove('show')
  }

  function verbFor(win, kind) {
    if (kind === 'yellow' && win.min) return '펼치기'
    if (kind === 'green' && win.big) return '되돌리기'
    return VERB[kind]
  }

  function hover(id, kind) {
    for (const node of board.querySelectorAll('.orn.on')) node.classList.remove('on', 'me')
    hovered = id == null ? null : { id, kind }
    board.classList.toggle('focus', !!hovered)
    if (!hovered) return hideTag()
    for (const node of trio(id)) node.classList.add('on')
    nodes.get(keyOf(id, kind))?.classList.add('me')
    const win = wins.get(id)
    if (win) showTag(win, kind, `${win.app || '창'} · ${verbFor(win, kind)}`)
  }

  function press(id, kind, result) {
    const node = nodes.get(keyOf(id, kind))
    const win = wins.get(id)
    if (!node || !win) return
    if (result === 'ok') {
      replay(node, 'press', 0.4)
      ripple(node)
      return
    }
    replay(node, 'no', 0.45)
    showTag(win, kind, result === 'denied' ? '손쉬운 사용 권한을 켜 주세요' : '이 창은 말을 안 들어요', 2.4)
  }

  function mark(id, name, on) {
    const win = wins.get(id)
    if (win) win[name] = on
    for (const node of trio(id)) {
      node.classList.toggle(name, on)
      if (name === 'min' && !on) ripple(node) // 다시 켜질 때 한 번 번쩍
    }
    if (hovered && hovered.id === id && win) showTag(win, hovered.kind, `${win.app || '창'} · ${verbFor(win, hovered.kind)}`)
  }

  return {
    /** 일어난 일 하나를 화면에 옮긴다. */
    apply(event) {
      if (event.type === 'hang') hang(event.win, event.quiet)
      else if (event.type === 'drop') drop(event.win, event.quiet)
      else if (event.type === 'hover') hover(event.id, event.kind)
      else if (event.type === 'press') press(event.id, event.kind, event.result)
      else if (event.type === 'dim') mark(event.id, 'min', true)
      else if (event.type === 'lit') mark(event.id, 'min', false)
      else if (event.type === 'grow') mark(event.id, 'big', true)
      else if (event.type === 'shrink') mark(event.id, 'big', false)
    },

    /** 판을 놓을 자리(왼쪽 위)와 배율. */
    setLayout(next) {
      place = next
      board.style.transform = `translate(${next.x}px, ${next.y}px) scale(${next.scale})`
    },

    /** 트리를 옮겨 놓았다 — 내려놓은 자리에서 잎이 떨리고 방울이 흔들리다 선다. */
    settle() {
      replay(board, 'shiver', 0.5)
      for (const node of nodes.values()) replay(node, 'sway', 1.1)
    },

    /** 잡고 끌 수 있는 데(화면 px). 방울이 아닌 트리의 몸통이다. */
    body() {
      return bodyBands().map((band) => ({
        x: place.x + band.x * place.scale, y: place.y + band.y * place.scale,
        w: band.w * place.scale, h: band.h * place.scale,
      }))
    },

    setTwinkle(on) { board.classList.toggle('twinkle', !!on) },
    setHidden(on) { board.classList.toggle('hidden', !!on) },

    /** 누를 수 있는 동그라미들(화면 px). 셸이 마우스가 이 위에 있는지 본다. */
    hits() {
      const out = []
      for (const win of wins.values()) {
        for (const kind of KINDS) {
          const spot = win.spots[kind]
          out.push({
            key: keyOf(win.id, kind),
            x: place.x + spot.x * place.scale,
            y: place.y + spot.y * place.scale,
            r: (BALL + 4) * place.scale,
          })
        }
      }
      return out
    },
  }
}
