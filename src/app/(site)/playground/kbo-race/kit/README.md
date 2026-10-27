# kit — sneaky-baseball 유니폼 렌더러 사본

`teams.js`·`glyphs.js`·`sprites.js`·`kit-bitmap.js`·`gear.js` 는
`~/desktop-app/sneaky-baseball/src/render/`(gear.js 는 `src/game/`)에서 **그대로 복사**했다
(sneaky-baseball `57f33d7`). 고친 곳은 `sprites.js` 의 gear 가져오는 경로 한 줄뿐이다.

유니폼을 고칠 때는 sneaky-baseball 쪽을 먼저 고치고 여기로 다시 복사한다 —
두 곳에서 따로 고치면 두 앱의 유니폼이 갈라진다.

`runPose.js` 만 이 레이스용으로 새로 쓴 것이다. 머리를 키운 꼬마 달리기 포즈 세 장과
KBO 기록실 구단 코드(LG·KT·SK…) → 키트 이름(lg-home…) 매핑이 들어 있다.
