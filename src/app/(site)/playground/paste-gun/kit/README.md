# kit — paste-gun 앱 코드 사본

`game/` 과 `render/` 는 `~/desktop-app/paste-gun/src/` 에서 **그대로 복사**했다(paste-gun `v1.0.0`).
한 줄도 고치지 않았다.

페이지 맨 위의 사격장은 앱과 **같은 엔진·같은 그림**으로 돈다 — 총마다 다른 연사 속도,
다 쏜 탄창에서 다시 당겼을 때의 규칙, 총이 커서로 날아와 글자를 쏘는 장면이 전부 앱의 것이다.
데모가 앱과 다르면 데모가 아니다. 고칠 때는 paste-gun 쪽을 먼저 고치고 여기로 다시 복사한다.

    cp -R ~/desktop-app/paste-gun/src/game ~/desktop-app/paste-gun/src/render kit/
