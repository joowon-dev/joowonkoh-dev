# kit — desktop-tree 앱 코드 사본

`game/` 과 `render/` 는 `~/desktop-app/desktop-tree/src/` 에서 **그대로 복사**했다(desktop-tree `v1.0.0`).
한 줄도 고치지 않았다. `../tree.css` 의 아래쪽 절반도 앱의 `src/renderer/style.css` 그대로다(html·body 규칙만 뺐다).

페이지 맨 위의 데모는 앱과 **같은 엔진·같은 그림**으로 돈다 — 방울이 흩어져 달리는 자리, 같은 창의 셋이 같이
켜지는 것, 창이 닫히면 방울이 떨어져 튀는 길이 전부 앱의 것이다. 데모가 앱과 다르면 데모가 아니다.
고칠 때는 desktop-tree 쪽을 먼저 고치고 여기로 다시 복사한다.

    cp -R ~/desktop-app/desktop-tree/src/game ~/desktop-app/desktop-tree/src/render kit/
