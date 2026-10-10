# 05 — Plan

Plan gốc (đã duyệt): `docs/superpowers/plans/2026-10-10-reference-ui-parity.md`. Executor: toàn Claude (claude-team).

## Bảng chia đợt

| Đợt | Task | File sở hữu |
|---|---|---|
| 1 | T1 shell/tokens/Overview | AppShell.tsx, styles/tokens.css, styles/global.css, features/overview/* |
| 2 | T2 Finance/Members | features/finance/*, features/members/* |
| 2 | T3 Ranking/Sessions/Assets | features/ranking/*, features/sessions/*, features/assets/*, features/activities.css |

T4 của plan gốc = giai đoạn 7 (review) + 8 (QA so sánh trực quan) của claude-team.

## Lệnh test toàn bộ

Theo rule user (chỉ chạy đúng phạm vi): 

```
npx vitest run src/features src/components src/App.test.tsx && npm run typecheck && npm run lint && npm run build
```

Không chạy `npm test` toàn bộ / `npm run test:e2e` trừ khi user yêu cầu. So sánh trực quan bằng Playwright script (screenshot), lưu ở `qa-evidence/`.
