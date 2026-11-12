// 튜닝 값 전부. 여기 말고 다른 곳에 숫자를 적지 않는다.

/** 총 네 자루. 순서가 곧 「총 바꾸기」로 도는 순서다. */
export const GUNS = ['pistol', 'machinegun', 'shotgun', 'sniper']

export const GUN_NAMES = {
  pistol: '권총',
  machinegun: '기관총',
  shotgun: '샷건',
  sniper: '저격총',
}

/** 고정 타임스텝. 프레임 시간을 그대로 쓰면 기계마다 연사 간격이 달라진다. */
export const STEP = 1 / 60

/**
 * **글자 하나가 총알 한 발이다.** 총마다 다른 것은 발 사이 간격과 한 발에 나가는 글자 수다.
 *
 *   권총    한 번 당기면 글 하나를 한 글자씩. 탕, 탕, 탕 — 셀 수 있는 빠르기
 *   기관총  탄창 전체를 한 글자씩. 고정 스텝 두 칸에 한 발(초당 30발)
 *   샷건    남은 것 전부를 여덟 글자씩 뭉텅이로
 *
 * 간격은 고정 스텝(1/60초)의 배수로 떨어진다. 기관총을 더 줄이면 셸이 글자를 넣는
 * 속도를 앞질러서 줄이 밀리기 시작한다 — 빨라지는 것이 아니라 늦게 끝난다.
 * 권총의 간격은 「글자가 날아가 꽂히는 시간」(화면 쪽 0.12초)보다 길어야 한다 — 그래야 꽂히는
 * 순간에 글이 찍히게 기다렸다 넣을 수 있다. 더 줄이면 기다림 없이 글자만 날리게 된다.
 * 저격총은 여기 없다. 글 하나를 통째로 한 방에 쏜다(붙여넣기).
 */
export const FIRE = {
  pistol: { interval: 9 / 60, per: 1 },
  machinegun: { interval: 2 / 60, per: 1 },
  shotgun: { interval: 14 / 60, per: 8 },
}

/** 현장 탄창에 쌓이는 최대 발 수. 넘치면 가장 오래된 것부터 버린다. */
export const LIVE_CAP = 30

/** 저격 단축키가 닿는 슬롯 수 (1~9). */
export const SNIPE_SLOTS = 9

/** 기관총이 발 사이에 눌러 주는 키. 폼 칸을 넘어갈 때는 tab, 줄을 바꿀 때는 enter. */
export const SEPARATORS = ['tab', 'enter', 'none']

/** 현장 탄창 — 복사한 것이 저절로 쌓이는 탄창. 저장하지 않고, 지울 수 없다. */
export const LIVE_NAME = '현장 탄창'

/** 탄창 이름·총알 하나의 길이 상한. 저장 파일이 한없이 커지는 것을 막는다. */
export const NAME_MAX = 24
export const ROUND_MAX = 20000
export const MAGAZINE_MAX = 20
