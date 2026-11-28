// 화살 — 첫 번째 탈것. 탈것은 셋을 낸다:
//   element(note)       꽂혀 있는 모양(DOM). 촉이 (0,0) 이 되도록 놓인다.
//   flyIn(el, land)     받는 쪽 — 화면 밖에서 날아와 꽂힌다. Animation 을 돌려준다.
//   flyOut(el, from, angle, screen)  쏘는 쪽 — 활에서 떠나 화면 밖으로.
// 쪽지 주고받기·친구·저장은 탈것을 모른다. 택시·버스는 이 꼴로 하나씩 붙인다.

const NS = 'http://www.w3.org/2000/svg'
/** 그림의 크기와, 그 안에서 촉 끝의 자리. 촉 끝이 꽂히는 점이다. */
export const SIZE = { w: 150, h: 44 }
export const TIP = { x: 140, y: 22 }

const SVG = `
<svg xmlns="${NS}" width="${SIZE.w}" height="${SIZE.h}" viewBox="0 0 ${SIZE.w} ${SIZE.h}">
  <defs>
    <linearGradient id="shaft" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#f6d58a"/><stop offset="1" stop-color="#c9973a"/>
    </linearGradient>
    <linearGradient id="heart" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ff7aa2"/><stop offset="1" stop-color="#e0174f"/>
    </linearGradient>
  </defs>
  <g class="fletch">
    <path d="M6 21 C8 14 11 9 14 8 L34 8 C32 12 34 17 40 21 Z" fill="#ffb3c8" stroke="#e8577f" stroke-width="1"/>
    <path d="M6 23 C8 30 11 35 14 36 L34 36 C32 32 34 27 40 23 Z" fill="#ff8fb0" stroke="#e8577f" stroke-width="1"/>
    <path d="M12 20 L20 11 M18 20 L26 11 M24 20 L31 11 M12 24 L20 33 M18 24 L26 33 M24 24 L31 33" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
  </g>
  <rect x="10" y="20.5" width="116" height="3" rx="1.5" fill="url(#shaft)"/>
  <g class="letter" transform="translate(56 9)">
    <rect x="0" y="0" width="30" height="20" rx="2.5" fill="#fffaf3" stroke="#e6c9b0" stroke-width="1"/>
    <path d="M0.8 1.5 L15 11 L29.2 1.5" fill="none" stroke="#e6c9b0" stroke-width="1"/>
    <path d="M15 8.6 c-1.6-2.6-5.2-1.2-3.6 1.4 l3.6 3.6 l3.6-3.6 c1.6-2.6-2-4-3.6-1.4z" fill="#e0174f"/>
  </g>
  <path class="head" d="M140 22 L124 11.5 C118 8 114 13.5 118 17 L121 22 L118 27 C114 30.5 118 36 124 32.5 Z"
        fill="url(#heart)" stroke="#b80f3e" stroke-width="1"/>
</svg>`

export function element(note) {
  const el = document.createElement('div')
  el.className = 'arrow'
  el.innerHTML = SVG
  el.style.width = `${SIZE.w}px`
  el.style.height = `${SIZE.h}px`
  el.style.transformOrigin = `${TIP.x}px ${TIP.y}px`
  // 누를 데는 편지 한 장만 하다. 화살 전체의 네모를 받으면 비스듬한 화살 둘레가 다 막힌다.
  const grab = document.createElement('button')
  grab.className = 'arrow-grab'
  grab.setAttribute('aria-label', `${note.fromName ?? '친구'}의 쪽지 열기`)
  el.append(grab)
  return el
}

/** 꽂혔다 — 이제부터 누를 수 있다(셸에 자리를 알린다). */
export function stick(el) {
  el.classList.add('stuck')
  const grab = el.querySelector('.arrow-grab')
  if (grab) grab.dataset.hit = ''
}

/** 꽂혀 있는 자리에 놓는다(촉 끝 = to). */
export function place(el, to, tilt) {
  el.style.left = `${to.x - TIP.x}px`
  el.style.top = `${to.y - TIP.y}px`
  el.style.transform = `rotate(${tilt}deg)`
}

export function flyIn(el, land) {
  place(el, land.to, land.tilt)
  const keys = land.frames.map((f) => ({
    transform: `translate(${f.x - land.to.x}px, ${f.y - land.to.y}px) rotate(${f.rot}deg)`,
  }))
  const flight = el.animate(keys, { duration: land.duration, easing: 'linear' })
  // 꽂힌 순간 부르르.
  flight.finished.then(() => {
    stick(el)
    el.animate(
      [0, 3.2, -2.6, 1.8, -1, 0.4, 0].map((d) => ({ transform: `rotate(${land.tilt + d}deg)` })),
      { duration: 420, easing: 'ease-out' },
    )
  }, () => {})
  return flight
}

/** 활에서 쏜 방향으로 곧게(조금 떨어지며) 화면 밖까지. from 은 촉 끝의 시작 자리, angle 은 수학 좌표 라디안. */
export function flyOut(el, from, angle, screen) {
  const far = Math.hypot(screen.w, screen.h) * 1.2
  const rot = (-angle * 180) / Math.PI
  const to = { x: from.x + Math.cos(angle) * far, y: from.y - Math.sin(angle) * far }
  place(el, from, rot)
  return el.animate(
    [
      { transform: `translate(0, 0) rotate(${rot}deg)` },
      { transform: `translate(${to.x - from.x}px, ${to.y - from.y + 60}px) rotate(${rot + 4}deg)` },
    ],
    { duration: 520, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
  )
}

/** 못 보냈을 때 — 활 앞에 툭 떨어진다. */
export function flop(el, from) {
  place(el, from, -90)
  return el.animate(
    [
      { transform: 'translate(0, 0) rotate(-90deg)', opacity: 1 },
      { transform: 'translate(24px, 70px) rotate(-170deg)', opacity: 1, offset: 0.6 },
      { transform: 'translate(30px, 76px) rotate(-178deg)', opacity: 0 },
    ],
    { duration: 900, easing: 'ease-in', fill: 'forwards' },
  )
}

export const id = 'arrow'
