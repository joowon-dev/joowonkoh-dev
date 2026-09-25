@AGENTS.md

## Obsidian Blog Seeds

세션에서 블로그 글감이 될 만한 작업을 했을 때, 요약을 아래 경로에 저장:
`/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/`
- 파일명: `YYYY-MM-DD-주제.md`
- 내용: 작업 요약, 핵심 포인트, 블로그 키워드
- 사용자가 "Obsidian에 정리해줘" 또는 "블로그 글 써줘" 요청 시 활용

## KBO 순위 레이스 유지보수 (`/playground/kbo-race`)

"KBO 레이스 유지보수 해줘" / "순위 레이스 오늘까지 채워줘" 같은 요청이면:

1. feature 브랜치를 따고 `npm run kbo:update` — `src/app/playground/kbo-race/data/games.json` 의
   `through`(마지막으로 받은 날)부터 **오늘(KST)**까지 KBO 기록실 API로 받아 붙인다.
   끝난 정규시즌 경기만 남기고, 아직 안 끝난 오늘 경기는 다음 실행 때 다시 받는다.
2. 스크립트가 찍는 마지막 날 순위를 공식 순위표(koreabaseball.com › 기록실 › 팀 순위)와 대조한다.
3. `npx vitest run src/app/playground/kbo-race` → 커밋 → PR. 머지는 사용자가 말할 때만.

새 시즌은 `npm run kbo:update -- --season 2027` 로 처음부터 받는다. 이때 `standings.test.ts` 의
"공식 순위표와 같다" 테스트는 2026년 날짜를 보므로 새 시즌의 날짜·순위로 바꿔야 한다.
선수 유니폼은 `kit/` 가 sneaky-baseball 렌더러 사본이다 — 고칠 땐 `kit/README.md` 를 볼 것.
