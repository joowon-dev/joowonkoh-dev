// 활 — 장전하면 화면 아래 가운데에 나타난다. 누르고 뒤로 끌면 시위가 당겨지고, 놓으면 쏜다.
// 당긴 거리·방향 → 세기·각도는 src/game/aim.js 가 정한다. 여기는 그 모습과 손맛만.
import { aim, MAX_PULL } from '../game/aim.js'
import * as arrow from '../carriers/arrow.js'
import { h } from './dom.js'

const NS = 'http://www.w3.org/2000/svg'
/** 활 그림의 크기와 그 안에서 시위가 쉬는 점. 활은 이 점을 중심으로 돈다. */
const BOX = { w: 280, h: 280 }
const REST = { x: 140, y: 170 }
const HALF = 96 // 활 끝이 시위 쉬는 점에서 옆으로 얼마나
/** 시위는 당긴 거리의 이만큼만 뒤로 간다(손이 더 멀리 간다). */
const DRAW = 0.5
/** 촉 끝이 시위에서 얼마나 앞에 있나(화살 그림의 길이). */
const REACH = arrow.TIP.x - 6

export function createBow({ layer, onFire, onCancel, capture }) {
  let armed = null // { to, toName, body }
  let center = { x: 0, y: 0 }
  let start = null
  let shot = null

  const svg = document.createElementNS(NS, 'svg')
  svg.setAttribute('width', BOX.w)
  svg.setAttribute('height', BOX.h)
  svg.innerHTML = `
    <defs>
      <linearGradient id="bowwood" x1="0" x2="1">
        <stop offset="0" stop-color="#d4a24c"/><stop offset=".5" stop-color="#f7d98d"/><stop offset="1" stop-color="#d4a24c"/>
      </linearGradient>
    </defs>
    <path class="limb" d="M${REST.x - HALF} ${REST.y + 8} C ${REST.x - HALF + 6} ${REST.y - 70}, ${REST.x - 30} ${REST.y - 112}, ${REST.x} ${REST.y - 112}
             C ${REST.x + 30} ${REST.y - 112}, ${REST.x + HALF - 6} ${REST.y - 70}, ${REST.x + HALF} ${REST.y + 8}"
          fill="none" stroke="url(#bowwood)" stroke-width="9" stroke-linecap="round"/>
    <path class="limb-edge" d="M${REST.x - HALF} ${REST.y + 8} C ${REST.x - HALF + 6} ${REST.y - 70}, ${REST.x - 30} ${REST.y - 112}, ${REST.x} ${REST.y - 112}
             C ${REST.x + 30} ${REST.y - 112}, ${REST.x + HALF - 6} ${REST.y - 70}, ${REST.x + HALF} ${REST.y + 8}"
          fill="none" stroke="#9c6b1f" stroke-width="1.4" stroke-opacity=".6"/>
    <path class="grip-heart" d="M${REST.x} ${REST.y - 100} c-6-10-22-4-14 7 l14 13 l14-13 c8-11-8-17-14-7z" fill="#e0174f" stroke="#fff" stroke-width="1.5"/>
    <path class="string" fill="none" stroke="#fff3f7" stroke-width="2" stroke-linecap="round"/>`
  const string = svg.querySelector('.string')

  const nocked = arrow.element({ fromName: '' })
  nocked.querySelector('.arrow-grab').remove()
  nocked.classList.add('nocked')

  const meter = h('div', { class: 'bow-meter' })
  const label = h('div', { class: 'bow-label' })
  const cancel = h('button', { class: 'pill bow-cancel', dataset: { hit: '' }, onclick: () => onCancel(armed) }, '장전 풀기')
  const body = h('div', { class: 'bow-body', dataset: { hit: '' } }, svg, nocked)
  const root = h('div', { class: 'bow', hidden: true }, body, meter, label, cancel)
  layer.append(root)

  function draw(pullPx, rotDeg) {
    const back = Math.min(pullPx, MAX_PULL) * DRAW
    const nock = { x: REST.x, y: REST.y + back }
    string.setAttribute('d', `M${REST.x - HALF} ${REST.y + 8} L${nock.x} ${nock.y} L${REST.x + HALF} ${REST.y + 8}`)
    // 화살은 위를 본다(그림은 오른쪽을 보니 -90도). 촉 끝이 시위에서 REACH 만큼 앞.
    arrow.place(nocked, { x: nock.x, y: nock.y - REACH }, -90)
    body.style.transform = `rotate(${rotDeg}deg)`
    return back
  }

  function layout() {
    root.style.left = `${center.x - REST.x}px`
    root.style.top = `${center.y - REST.y}px`
  }

  body.addEventListener('pointerdown', (e) => {
    if (!armed || e.button !== 0) return
    e.preventDefault()
    body.setPointerCapture(e.pointerId)
    start = { x: e.clientX, y: e.clientY }
    shot = null
    root.classList.add('pulling')
    capture(true)
  })

  body.addEventListener('pointermove', (e) => {
    if (!start) return
    shot = aim(e.clientX - start.x, e.clientY - start.y)
    const pull = Math.hypot(e.clientX - start.x, e.clientY - start.y)
    const rot = shot ? 90 - (shot.angle * 180) / Math.PI : 0
    draw(shot ? pull : Math.min(pull, 20), rot)
    const pct = shot ? Math.round(shot.power * 100) : 0
    meter.style.setProperty('--p', shot ? shot.power : 0)
    label.textContent = shot ? `세기 ${pct}%` : '뒤로 당겨요'
    root.classList.toggle('strong', !!shot && shot.power > 0.85)
  })

  const release = (e) => {
    if (!start) return
    start = null
    capture(false)
    root.classList.remove('pulling', 'strong')
    try { body.releasePointerCapture(e.pointerId) } catch {}
    if (!shot) return spring()
    const fired = shot
    const back = Math.min(fired.pull, MAX_PULL) * DRAW
    // 촉 끝의 화면 자리: 활의 중심에서 쏘는 방향으로 (REACH - back) 만큼.
    const dir = { x: Math.cos(fired.angle), y: -Math.sin(fired.angle) }
    const tip = { x: center.x + dir.x * (REACH - back), y: center.y + dir.y * (REACH - back) }
    const note = armed
    shot = null
    nocked.hidden = true
    draw(0, 90 - (fired.angle * 180) / Math.PI)
    body.animate([{ transform: body.style.transform + ' scale(1.04)' }, { transform: body.style.transform }], { duration: 160 })
    onFire({ ...note, power: fired.power, angle: fired.angle, tip })
  }
  body.addEventListener('pointerup', release)
  body.addEventListener('pointercancel', release)
  body.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    if (armed) onCancel(armed)
  })

  function spring() {
    draw(0, 0)
    label.textContent = armed ? `${armed.toName}에게 — 뒤로 당겨서 쏘기` : ''
    meter.style.setProperty('--p', 0)
  }

  return {
    get armed() { return armed },
    setRoom(room) {
      center = { x: room.x + room.w / 2, y: room.y + room.h - 130 }
      layout()
    },
    arm(note) {
      armed = note
      nocked.hidden = false
      root.hidden = false
      spring()
      root.animate([{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1.3)' })
    },
    /** 쏘고 나서 — 다시 장전(못 보냄)하거나 내린다. */
    rearm() {
      nocked.hidden = false
      spring()
    },
    disarm() {
      armed = null
      start = null
      const a = root.animate([{ opacity: 1 }, { transform: 'translateY(60px)', opacity: 0 }], { duration: 240 })
      a.finished.then(() => { if (!armed) root.hidden = true }, () => {})
    },
    center: () => center,
  }
}
