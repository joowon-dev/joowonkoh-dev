# kit — desktop-cupid 앱 코드 사본

`~/desktop-app/desktop-cupid/src/` 에서 **그대로 복사**했다(desktop-cupid `v1.0.0`). 한 줄도 고치지 않았다.

- `game/aim.js` · `game/landing.js` · `game/rng.js` — 당긴 만큼의 세기·각도, 친구 화면에서 들어오는 쪽과 꽂히는 자리
- `carriers/arrow.js` — 화살의 그림과 날아가는·꽂히는 움직임
- `renderer/bow.js` · `renderer/dom.js` — 활의 모습과 손맛

페이지 맨 위의 데모는 앱과 **같은 코드**로 돈다 — 당기는 손맛, 세기에 따라 꽂히는 깊이, 날아 들어오는 길이 전부
앱의 것이다. 서버에는 붙지 않는다(쪽지는 옆의 「친구 바탕화면」으로만 간다). `../cupid.css` 의 아래쪽은 앱의
`src/renderer/style.css` 에서 화살·활 부분을 가져와 데모 안에 가뒀다.
고칠 때는 desktop-cupid 쪽을 먼저 고치고 여기로 다시 복사한다.

    S=~/desktop-app/desktop-cupid/src
    cp $S/game/{aim,landing,rng}.js kit/game/ && cp $S/carriers/arrow.js kit/carriers/ && cp $S/renderer/{bow,dom}.js kit/renderer/
