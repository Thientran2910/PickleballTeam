# Pickleball reference UI parity

**Goal:** Update the existing React dashboard to closely reproduce the observed public reference at `https://pickleball-hn-thien.thientran2910.chatgpt.site/#overview`, including the six main sections, finance tabs, member detail dialog, responsive layouts, and interactive navigation.

**User decisions:** Default finance fund-period filter is **Tất cả đợt**. The user explicitly asked to make the interface match the reference. Keep the already approved public read-only API/data contract and finance calculations.

**Reference evidence:** `docs/reference-ui-audit.md`; original observed stylesheet is available read-only at `/tmp/pickleball-reference/style.css` in the coordinator environment. The target styles use `#f8f7f3` background, `#223d34` ink, `#2d5b4c` green, `#798179` muted text, `#e0e3da` borders, `#eaf0df` sage, system sans body, Georgia display headings, max widths 1400/1330px, and 1100/700px breakpoints.

## Executor assignment

| Task | Scope | Executor | Model | Worktree |
|---|---|---|---|---|
| T1 | Shared shell, design tokens, Overview | Claude | claude-sonnet-5-5 | `pb-ui-shell` |
| T2 | Finance tabs/filters/tables, member grid/dialog | Codex | gpt-5.6-sol, high | `pb-ui-finance-members` |
| T3 | Ranking, sessions, assets, activity layouts | Codex | gpt-5.6-sol, high | `pb-ui-activities` |
| T4 | Integrate, compare at matching desktop/mobile sizes, close visual and behavior gaps | Claude | claude-sonnet-5-5 | `pb-ui-review` |

This reuses the user-approved mixed Claude/Codex allocation for this project. T1 is a prerequisite to T2 and T3. T2 and T3 own separate feature directories. T4 starts after both branches are integrated.

## Global constraints

- All page data continues to come from the existing typed React data provider; do not add page-level fetches, API endpoints, schema guesses, local snapshots, or hard-coded production data.
- Do not modify the Google Sheet, Apps Script, its permissions, deploy configuration, or external hosting.
- Preserve the existing correctness rules: recorded expenses power expense charts; never double count fund outflow and recorded expense; never offset member debt across periods; unknown numeric values remain unknown; do not introduce unavailable expense-description or receipt fields.
- Implement finance fund period default as all periods, with option label matching the reference (`Tất cả đợt` where consistent with existing localized UI).
- Keep controls functional and keyboard accessible. Search, selectors, finance sub-tabs, cross-links, member dialog close behavior, sticky navigation, refresh, and responsive scrolling must work.
- Copy the reference design structure, density, palette, font treatment, widths, radii, borders, focus/hover states and breakpoints. Preserve the live data and verified source-derived labels if the public reference has changed since audit.
- Do not add chart/UI dependencies. Reuse native React/SVG/CSS and existing components.
- No public deployment or push.
- Each worker changes only its listed ownership and runs scoped tests plus `npm run typecheck`, `npm run lint`, and `npm run build` before one meaningful commit. T4 runs the full unit suite, build and Playwright suite and reviews the final diff.

## T1 — Shared shell and Overview

**Executor:** Claude (`claude-sonnet-5-5`)

**Depends on:** none.

**Owns:** `src/components/AppShell.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/features/overview/OverviewPage.tsx`, and directly corresponding tests only.

Match the sticky centered header/nav, linked brand, outline refresh control, active sage pill, 1400px header and 1330px main widths, page typography, footer, common panel/table primitives, focus states, and breakpoints. Rebuild Overview into the observed large two-column hero, fund balance/progress card, four inline stats, monthly expense SVG bars, recent expenses, current-period missing member list, and category bars. Contextual links must navigate to the same destinations as the reference. The month/category totals must use existing valid selectors/fields and recordedExpense.

## T2 — Finance and Members

**Executor:** Codex (`gpt-5.6-sol`, high)

**Depends on:** T1 merged.

**Owns:** `src/features/finance/FinancePage.tsx`, `src/features/finance/finance.css`, `src/features/finance/selectors.ts` only if behavior requires it, and finance tests; `src/features/members/MembersPage.tsx`, `src/features/members/members.css`, member selectors only if needed, and member tests.

Finance becomes four reference-style internal tabs: thu quỹ, chi quỹ, công nợ/ứng, lịch sử hoàn ứng. Match controls per tab, scoped totals/row counts, source column labels, numeric alignment, status styles and table density. All periods is selected on first render. Rows or member links open the shared member detail dialog when the reference does. Member cards become the reference three-column responsive card grid; search filters the visible members. Dialog contains only statistics supported by existing `TeamData`, with an accessible close button and Escape behavior. Do not change calculations or manufacture details to fill visual gaps.

## T3 — Ranking, Sessions, Assets

**Executor:** Codex (`gpt-5.6-sol`, high)

**Depends on:** T1 merged.

**Owns:** `src/features/ranking/RankingPage.tsx`, `src/features/ranking/adapters.ts` only if presentation adaptation is needed, ranking CSS/tests; `src/features/sessions/SessionsPage.tsx`, sessions CSS/tests; `src/features/assets/AssetsPage.tsx`, activities CSS, assets tests. Do not modify shared shell, Finance, Members, app routing, or data provider.

Match reference section heading/subtitle, inline stat row, table widths/density, player search and validation labels, compact inventory layout, empty states, and responsive horizontal scrolling. Render only the existing verified source fields. Do not create rankings or mock sessions/matches/assets to imitate nonempty production states.

## T4 — Integration and visual comparison

**Executor:** Claude (`claude-sonnet-5-5`)

**Depends on:** T2 and T3 merged after T1.

Review all six routes and four finance tabs plus member dialog at the same desktop viewport as the reference and at mobile width. Compare screenshots directly to the live reference and close visible differences in layout, typography, colors, spacing, table density, controls, responsive behavior, empty/error/loading states, hover/focus and navigation. Confirm the all-period default. Fix only integration issues and visual parity gaps; no data-contract/API/deploy changes. Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`; inspect console and mobile overflow. Save screenshots under `/tmp/pickleball-reference-parity/`, outside the repository.

## Acceptance

- All six routes visually use the reference design system and page structures.
- Finance has four working local tabs, all periods selected by default, functioning search and filters, and matching table/summary interactions.
- Member cards and shared profile dialog work from each reference entry point, close by button/Escape, and remain usable on mobile.
- Ranking, sessions, assets, loading/error/empty states preserve source correctness while matching the reference hierarchy and density.
- Desktop and mobile screenshots were compared against the live reference; remaining deviations, if any, are explicitly listed rather than claiming pixel-perfect parity.
- Full required checks pass; no push/deploy or source writes occurred.
