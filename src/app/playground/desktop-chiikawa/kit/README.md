# kit — desktop-chiikawa 게임 코드 사본

`game/` 과 `render/` 는 `~/desktop-app/desktop-chiikawa/src/` 에서 **그대로 복사**했다
(desktop-chiikawa `v1.0.9`). 한 줄도 고치지 않았다.

페이지 위의 데모는 앱과 **같은 월드·같은 그림**으로 돈다 — 데모가 앱과 다르면 데모가 아니다.
고칠 때는 desktop-chiikawa 쪽을 먼저 고치고 여기로 다시 복사한다.

그림은 여기에 넣지 않는다. 페이지가 열릴 때 `../sprites.ts` 가 앱의 「친구 코드」와 같은 곳
(Supabase 비공개 버킷 `chiikawa-sprites`)에서 사이트 전용 코드 `CHII-SITE` 로 받아 `setSprite` 로 입힌다.
받는 동안은 아무도 그리지 않고, 못 받으면(6초·코드 꺼짐) 앱의 도형 그림으로 돈다.
