# Archive: 토스 앱인토스 (Toss Apps-in-Toss) 버전

> 2026-06-22 Vercel 전환 시점에 보존. git history 그대로 유지.

## 복원 방법

```bash
# 1. archive에서 root로 복원 (git mv로 history 유지)
git mv archive/toss-app/src .
git mv archive/toss-app/scripts .
git mv archive/toss-app/granite.config.ts .
git mv archive/toss-app/app.json .
git mv archive/toss-app/index.js .
[ -d archive/toss-app/assets ] && git mv archive/toss-app/assets . || true

# 2. 옛 package.json 복원 (이전 커밋에서)
git log --all --oneline -- package.json | head -5
git checkout <commit-hash> -- package.json

# 3. 의존성 설치
yarn install
```

## 아카이브 사유

- 토스 앱인토스 Granite 1.x + React Native 0.72의 운영 마찰 (DevTools standalone 포트 충돌 등)
- Vercel 전환 결정 (2026-06-22 챌린지 300만원 포기)
- 다음 세션이 Vercel 버전으로 이어가도록 의도적 백업

## 기술 스택 (당시)

- `@apps-in-toss/framework` 1.5.2
- `@granite-js/react-native` 0.1.28
- `@toss/tds-react-native` 1.3.8
- `react-native` 0.72.6
- `react-native-gifted-charts` 1.4.43

## 다음 단계 (Vercel 버전)

- 1:1 기능 동등성 — `docs/superpowers/specs/2026-06-22-vercel-web-migration-design.md` 참고
- 7 Phase 구현 계획 — `docs/superpowers/plans/2026-06-22-vercel-web-migration.md`
