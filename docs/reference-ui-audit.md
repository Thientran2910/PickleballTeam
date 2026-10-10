# Reference UI audit — 2026-10-10

Status: discussion/research only; no implementation changes or commit in this follow-up.

Reference: https://pickleball-hn-thien.thientran2910.chatgpt.site/#overview

The reference fully loaded in Chrome during this inspection. Earlier loading/asset limitations no longer apply. Inspected all six sections, all four finance tabs, and a member dialog. Read the original public stylesheet through browser pageAssets and the running public app.js through read-only Chrome Debugger.getScriptSource, then disabled Debugger. No source data or remote code was changed.

## Verified appearance

- Background #f8f7f3; ink #223d34; green #2d5b4c; muted #798179; borders #e0e3da; sage #eaf0df; amber #96651d; red #9d5343.
- Body system sans, 15px/1.65. Display headings Georgia/Times New Roman, weight 400, italic emphasis. Overview h1 clamps 36px–60px; section-page h1 46px desktop/38px mobile.
- Sticky shared header: brand at left, centered six-item navigation, outline refresh button. Active nav uses sage pill.
- Header max-width 1400px; main max-width 1330px with 36px desktop padding, 18px on small screens. Breakpoints 1100px and 700px.
- Original stylesheet saved outside Git at /tmp/pickleball-reference/style.css (8615 bytes); no external font/image dependency observed for this design.

## Gaps to close in the current React app

| Area | Reference behavior/appearance |
|---|---|
| Overview | Large two-column hero, fund balance/progress card, four inline stats, monthly recorded-expense bar chart, recent transactions, current-period missing-member list, expense-category bars |
| Navigation | Brand navigates home; multiple contextual links to finance/ranking; active pill and sticky header |
| Finance | Four local tabs: income, expenses, advances/debt, refund history. Search, fund-period selector, month selector; per-tab row counts and scoped totals. Numeric cells right aligned, status badges, row hover |
| Members | Searchable three-column member-card grid (two/one on smaller screens); full card opens profile dialog |
| Member dialog | Identity/status, match statistics, income by fund period, participation/points statistics; member buttons in overview and finance open the same dialog |
| Ranking | Upstream ranking and doubles results with player search and source validation status; no invented rank for members without matches |
| Sessions | Four inline summaries (sessions, member attendance, costs, guests); table with date, activity, venue, time, courts, member count, guests, cost, status |
| Assets | Compact source-style inventory table and missing-data labels |
| Responsive/states | Source breakpoints, independently scrolling tables, empty/loading/error states, keyboard-focus and dialog close behavior |

## Preserve data correctness

Reuse the existing typed GET client/provider and source contract evidence. Monthly/category charts aggregate recordedExpense, not outflow plus refunds. Member missing dues remain upstream values without offsetting overpayments. Do not reproduce numeric coercions that would convert unknown quantities into zero. Session/member/refund data already exists in the approved API contract; no Sheet or Apps Script changes needed for these UI interactions.

## User decision

On 2026-10-10 the user selected **all fund periods** as the default finance filter and directed the implementation to match the designated reference as closely as possible. This supersedes the earlier Q10 choice of current period for this UI-clone task. Implementation and matched-viewport visual review are the next steps; no new UI code has been changed yet.

## Acceptance approach

Compare reference and React at matched viewport dimensions/data and every visible route, finance tab and member-dialog state. Match palette, font sizes, spacing, widths, borders, table density and interactions. Declare visual parity only after comparison; do not treat passing data tests as visual acceptance. Public deployment remains separate.
