# 07 — Review

## Vòng 1

Phạm vi: `git diff feat/pickleball-dashboard...team/reference-ui-parity`, gồm commit 5ab7a0f (T3), c92df48 (T2) và 1a763f1 (fix heading). Đối chiếu với AC trong `02-spec.md` và mục "Global constraints" trong `docs/superpowers/plans/2026-10-10-reference-ui-parity.md`. Không có `04-data-model.md`, nên hợp đồng dữ liệu được lấy từ `src/data/schema.ts` và `docs/api-contract.md`. Vòng này chỉ đọc code, không chạy test.

Các điểm đã kiểm và đạt:
- Công thức tài chính (AC-2.3):
  - `summarizeIncome` và `summarizeExpenses` giữ nguyên.
  - Tab Chi quỹ hiển thị riêng "chi phí ghi nhận" và "chi từ quỹ", không cộng hai số này với nhau.
  - Công nợ cộng `remaining` theo từng dòng, không bù trừ thiếu/thừa giữa các đợt (đã có test `does not offset ...`).
  - Số tiền hoàn ứng không đọc được giữ `null`, hiển thị "—" và được đếm riêng là "dòng chưa có số tiền", không bị cộng như 0.
  - `countOrNull` của Lịch chơi cũng giữ số không xác định là `null`.
- Bộ lọc đợt mặc định là "Tất cả đợt quỹ" (`periodChoice = ''`). Khi refresh làm mất giá trị đang chọn thì quay về tất cả (AC-2.2). Có test `starts on all fund periods`.
- Không có fetch, endpoint, dependency hay dữ liệu giả mới. Trường `courts`/`guests` của sessions và các trường refunds đều có trong mapping đã xác minh ở `docs/api-contract.md`. Cột "Kiểm tra: Hợp lệ" đúng, vì adapter chỉ nhận dòng có `validation === 'Hợp lệ'`.
- Bảng cuộn ngang trên mobile: `.table-wrap` / `.table-scroll` có `overflow: auto` và ô `white-space: nowrap`, nên bảng cuộn bên trong khung, không làm cả trang cuộn ngang.
- MemberDialog đóng được bằng nút "Đóng hồ sơ" và bằng Escape (`onCancel` + `onKeyDown`). Hộp thoại có `aria-labelledby`, `showModal()` giữ focus bên trong. Có test đóng bằng cả hai cách.

## Critical

none

## Important

1. **`src/features/members/MemberDialog.tsx:19-30` — focus không quay về nút đã mở hộp thoại.**
   - Hiện tượng: khi bấm Đóng hoặc Escape, `onClose` đặt state về `null`, React gỡ thẻ `<dialog>` khỏi DOM trước. Hàm cleanup trong `useEffect` (passive effect) chạy sau đó mới gọi `dialog.close()`, lúc này trên một phần tử đã bị tách khỏi DOM.
   - Hậu quả: bước "khôi phục focus về phần tử trước đó" của trình duyệt không chạy, focus rơi về `<body>`. Người dùng bàn phím mất vị trí trên lưới thẻ hoặc trong bảng Quỹ. Spec yêu cầu "focus hợp lý".
   - Cách sửa (chọn một):
     - Lưu `document.activeElement` khi mở. Trong cleanup hoặc trong handler đóng, gọi `(saved as HTMLElement)?.focus()`.
     - Hoặc đóng dialog trước rồi mới gỡ: các handler gọi `ref.current?.close()`, và `onClose` chỉ được gọi trong sự kiện `close` của dialog (`onClose={onClose}` trên `<dialog>`). Khi đó trình duyệt tự trả focus.
   - Thêm test kiểm `document.activeElement` là nút thẻ sau khi đóng.

2. **`src/features/finance/FinancePage.tsx:113-120` và `MemberDialog.tsx:32` — link thành viên có thể bấm mà không có tác dụng gì.**
   - Hiện tượng: `memberLink` biến mọi tên trong thu quỹ, công nợ và hoàn ứng thành nút. Nếu tên không có trong `data.members` thì `MemberDialog` trả `null`: không mở gì, cũng không báo gì.
   - Rủi ro: dữ liệu hoàn ứng là bảng chưa xác minh (`unverifiedRows`), tên người nhận có thể lệch với danh sách thành viên.
   - Lỗi kéo theo: `selectedMember` vẫn giữ tên đó, nên bấm lại cùng tên sẽ không có phản ứng gì.
   - Cách sửa: chỉ render nút khi `data.members.some((m) => m.name === name)`, còn lại render text thường. Thêm test cho tên không có trong danh sách thành viên.

3. **`src/features/finance/FinancePage.tsx:101,104,170` — bộ lọc tháng ở tab "Lịch sử hoàn ứng" lấy danh sách tháng từ ngày chi (`data.expenses`), không phải từ ngày hoàn ứng.**
   - Hậu quả:
     - Tháng chỉ có hoàn ứng mà không có khoản chi thì không chọn được.
     - Tháng có khoản chi nhưng không có hoàn ứng lại xuất hiện trong danh sách và trả bảng rỗng.
   - Như vậy tab này không đạt AC-2.2 ("bộ lọc hoạt động").
   - Cách sửa: tính `refundMonths = listMonths(data.refunds.map((r) => readRefund(r).date))`. Chọn danh sách tháng và phần fallback-về-tất-cả theo `tab`. Thêm test lọc tháng cho tab hoàn ứng.

## Minor

1. **`src/features/finance/selectors.ts:125-133,157,170,180,223` — ô tìm kiếm khớp cả các trường số.**
   - `matchesQuery(Object.values(row))` gộp cả số tiền (ví dụ `1000000`). Gõ "1" hoặc "100" sẽ khớp gần như mọi dòng, trong khi placeholder ghi "Tìm thành viên, nhóm chi…".
   - Đề xuất: chỉ đưa vào các trường chữ (member, period, status, category, paidBy, source, method, expenseId).
2. **`src/features/members/MembersPage.tsx:53-84` — đặt khối nội dung bên trong `<button>`.**
   - Thẻ dùng `<button>` chứa `<h3>`, `<div>`, `<p>`. Theo HTML thì `button` chỉ được chứa phrasing content, và heading bên trong nút mất vai trò heading với một số trình đọc màn hình.
   - Đề xuất: dùng `<article>` có `<h3>`, và một nút/link "Xem hồ sơ" phủ toàn thẻ (kỹ thuật stretched link). Hoặc đổi các phần tử con sang `<span>`.
3. **`src/features/members/members.css:1-2` — Members phụ thuộc ngầm vào CSS của Finance.**
   - Các class `.filters`, `.table-wrap`, `.empty`, `.footnote` của trang Members lấy style từ `finance/finance.css`, nhưng `MembersPage` không import file này. Hiện vẫn chạy được vì mọi route đều được import tĩnh nên CSS gộp chung một bundle. Nếu sau này lazy-load route thì Members sẽ mất style.
   - Đề xuất: import `../finance/finance.css` trong `MembersPage` và `MemberDialog`, hoặc tách phần chrome dùng chung ra file riêng.
4. **`src/features/members/members.css:3-40` — một số class không có scope.**
   - `.members`, `.avatar`, `.mini-stats`, `.member-item` được khai báo global, dễ va chạm với class ở trang khác.
   - Đề xuất: scope dưới `.members-page` / `.member-dialog`.
5. **`src/features/ranking/RankingPage.tsx:177-179` — `rowKey` của bảng trận đấu có thể trùng.**
   - Hai trận cùng ngày, cùng 4 người chơi và không có `sessionId` (ví dụ đánh lại ván) sẽ có key trùng nhau, gây cảnh báo React và có thể render sai.
   - Đề xuất: thêm index hoặc tỷ số vào key.
6. **`src/features/sessions/SessionsPage.tsx`, `src/features/assets/AssetsPage.tsx` — đã bỏ các bộ lọc cũ.**
   - Lịch chơi mất bộ lọc ngày và trạng thái. Dụng cụ mất ô tìm kiếm và bộ lọc tình trạng.
   - Nếu trang mẫu cũng không có các bộ lọc này thì chấp nhận được, nhưng nên ghi vào danh sách "độ lệch / thay đổi hành vi" ở QA để user biết đây là chức năng bị gỡ.
7. **`src/features/finance/FinancePage.tsx:267` — dòng tóm tắt đọc lại quá nhiều.**
   - `role="status"` khiến dòng tóm tắt được đọc lại sau mỗi phím gõ trong ô tìm kiếm.
   - Đề xuất: chấp nhận được. Nếu thấy ồn thì thêm `aria-live="polite"` cùng debounce, hoặc bỏ `role`.

## Kết luận

CHANGES_REQUESTED

## Vòng 2

Phạm vi: các commit mới kể từ vòng 1 là 93ea5e7 (sửa lỗi review vòng 1) và 629e100 (parity: `format.ts`, AppShell, `global.css`, dựng lại Overview, mở MemberDialog từ Overview và Ranking). Đối chiếu với AC trong `02-spec.md`, mục "Global constraints" của plan, `src/data/schema.ts` và `docs/api-contract.md`. Vòng này chỉ đọc code, không chạy test.

Kiểm lại các lỗi vòng 1:
- Important 1 (focus) — **đã sửa**. `MemberDialog.tsx:23,31` lưu `document.activeElement` khi mount và gọi `focus()` lại trong cleanup nếu phần tử còn trong DOM. `dialogTestEnv.ts` mô phỏng đúng hành vi trình duyệt: `close()` trên dialog đã bị tách khỏi DOM thì không trả focus. Có test cho cả Finance và Members, trên cả hai đường đóng (Escape và nút Đóng).
- Important 2 (nút thành viên không có tác dụng) — **đã sửa ở Finance** (`knownMembers`, `FinancePage.tsx:119-130`, có test). Commit 629e100 lại thêm hai điểm vào mới chưa áp dụng cách sửa này, xem Important 2 bên dưới.
- Important 3 (tháng của tab hoàn ứng) — **đã sửa**. `refundMonths` lấy từ `readRefund(row).date`, bộ lọc chọn theo `tab`, có test cho hai chiều.
- Minor 1 (tìm kiếm khớp trường số) — đã sửa: chỉ khớp các trường chữ, có test.
- Minor 2 (khối nội dung trong `<button>`) — đã sửa: thẻ thành viên dùng `<article>` cùng nút tên trải rộng phủ toàn thẻ.
- Minor 5 (`rowKey` trùng) — đã sửa: key có thêm tỷ số.
- Minor 3, 4 (CSS phụ thuộc chéo, class không có scope) — chưa sửa và nay rộng hơn (Minor 1 bên dưới). Minor 6, 7 — không đổi, để QA ghi nhận.

Các điểm đã kiểm và đạt ở 629e100:
- `formatVnd`:
  - Kết quả đổi từ "100.000 ₫" sang "100.000đ". Dấu âm và độ chính xác vẫn giữ, có test so sánh chuỗi chính xác.
  - Mọi trường số trong `overviewSchema`, `members`, `income`, `advances` và `ranking` đều là `finite`, nên không có NaN hay null đi vào formatter.
  - Các số chưa xác định vẫn được chặn trước khi gọi formatter: refunds `amount === null ? '—'`, sessions `totalCost === null ? '—'`, và `Stat` có `unknown`.
  - e2e "không hiển thị số 0 khi lỗi" đã đổi regex sang `/0đ/`, vẫn đúng ý định.
- `formatDate` bỏ zero-pad nhưng vẫn giữ timezone `Asia/Ho_Chi_Minh` và vẫn trả "—" khi ngày không hợp lệ. `monthKey` của Overview dựa vào "—" nên không bị ảnh hưởng.
- Overview vẫn dùng `recordedExpense` cho biểu đồ tháng, cho thanh hạng mục và cho giao dịch gần đây. `totalFundOutflow` chỉ hiển thị riêng ở stat "Tổng tiền đã chi từ quỹ", không cộng với chi phí ghi nhận. Số dư lấy thẳng từ `overview.balance`, không tự tính lại. Danh sách còn thiếu lọc theo `o.fundPeriod` và cộng theo từng dòng, không bù trừ giữa các đợt. AC-2.3 vẫn đạt.
- Focus và Escape ở điểm vào mới: nút mở hộp thoại ở Overview (danh sách còn thiếu) và Ranking (`rankingColumns` đã memo hóa) không bị render lại khi dialog mở, nên `opener.isConnected` đúng và focus trở về được. Escape đi qua `onKeyDown`/`onCancel` của chính dialog, giống trang Members.
- Không thêm fetch, endpoint hay dependency mới.

## Critical

none

## Important

1. **`src/components/AppShell.tsx:24-28` — đang ở trạng thái `stale` mà header vẫn ghi "● Cập nhật thành công".**
   - Hiện tượng: khi lần làm mới thất bại, `state.readAt` vẫn giữ mốc cũ, nên dòng `.read-at` vẫn hiện "● Cập nhật thành công · <giờ cũ> · Giờ Việt Nam". Cùng lúc đó `LoadState` hiện alert "Chưa cập nhật được dữ liệu mới…". Hai thông báo mâu thuẫn ngay trên cùng màn hình. Dòng này lại có `aria-live`, nên trình đọc màn hình còn đọc to chữ "thành công".
   - Trước đây nhãn trung tính "Đọc lúc …" không gặp vấn đề này. AC-5.1 yêu cầu trạng thái error/stale vẫn đúng.
   - e2e `failed refresh keeps old numbers and timestamp and marks stale` hiện lại khóa luôn hành vi sai: test yêu cầu header giữ nguyên chữ "Cập nhật thành công" sau khi làm mới thất bại.
   - Cách sửa: tách theo `state.status`:
     - `ready` → "● Cập nhật thành công · {giờ} · Giờ Việt Nam".
     - `stale` → ví dụ "○ Đang hiển thị dữ liệu đọc lúc {giờ} · Giờ Việt Nam" (không có chữ "thành công").
   - Sửa e2e: chỉ kiểm mốc giờ không đổi (so phần thời gian, hoặc dùng `toContainText` với chuỗi giờ), đồng thời kiểm header không chứa "thành công". Thêm unit test cho AppShell ở trạng thái `stale`.

2. **`src/features/ranking/RankingPage.tsx:30-37` và `src/features/overview/OverviewPage.tsx:262-268` — điểm vào mới tái phát Important 2 của vòng 1.**
   - Hiện tượng: Ranking biến mọi `row.member` khác rỗng thành nút. Overview làm tương tự với mọi `row.member` trong danh sách còn thiếu. Cả hai đều không kiểm tên đó có trong `data.members` hay không.
   - Rủi ro: dữ liệu `ranking` lấy từ kết quả trận đấu và có thể chứa khách hoặc người đã rời đội, không có trong danh sách thành viên. Khi đó `MemberDialog` trả `null`: bấm không có tác dụng, và `selectedMember` bị giữ lại nên bấm lại cùng tên cũng không phản ứng.
   - Cách sửa: tách `memberLink`/`knownMembers` của `FinancePage.tsx:119-130` thành helper dùng chung, ví dụ `src/features/members/MemberLink.tsx` hoặc hook `useMemberLink(data, onOpen)`, rồi dùng ở cả Finance, Overview và Ranking. Thêm test "tên không có trong danh sách thành viên hiển thị dạng chữ thường" cho Ranking và Overview.

## Minor

1. **`src/features/overview/OverviewPage.tsx:300-305`, `src/features/ranking/RankingPage.tsx:210-215` — bọc `<div className="members-page">` để mượn CSS của dialog.**
   - Cách này chạy được ở thời điểm hiện tại, vì `finance.css` được bundle tĩnh qua `FinancePage`, và selector con cháu vẫn áp dụng cho `<dialog>` nằm trong top layer.
   - Nhưng đây là cách vá, không phải hợp đồng:
     - `MemberDialog` không tự import style của `.table-wrap`/`.empty`/`.footnote`. Khi tách route bằng lazy-load, dialog mở từ Overview/Ranking sẽ mất style bảng.
     - Wrapper vô tình áp toàn bộ rule `.members-page input/select/.page-title` lên cây con.
     - Ở Ranking, `.activity-page .footnote` và `.members-page .footnote` cùng khớp với footnote của dialog, có cùng specificity, nên rule nào thắng phụ thuộc vào thứ tự bundle.
   - Đề xuất: thêm `.member-dialog` vào các selector `:is(.finance-page, .members-page, .member-dialog)` trong `finance.css`, hoặc tách chrome bảng dùng chung ra `src/styles/tables.css` và import trực tiếp trong `MemberDialog.tsx`. Sau đó bỏ div bọc.
2. **`src/features/members/MemberDialog.tsx:23` — focus của opener lấy từ `document.activeElement` trong effect.**
   - Safari macOS không focus `<button>` khi bấm chuột, nên `opener` là `<body>` và sau khi đóng focus không quay về nút.
   - Đề xuất: truyền phần tử mở vào qua prop (`openerRef`, hoặc `event.currentTarget` lấy từ handler click), dùng `activeElement` làm phương án dự phòng.
3. **`src/components/AppShell.tsx:73` — tên truy cập của nút làm mới là "↻ Cập nhật".**
   - Trình đọc màn hình sẽ đọc cả ký tự mũi tên.
   - Đề xuất: `<span aria-hidden="true">↻</span> Cập nhật`.
   - Khi đang lỗi, nút cũng không còn nhãn "Thử lại", nhưng alert đã có nút "Thử lại" riêng nên chấp nhận được.
4. **`src/features/overview/OverviewPage.test.tsx:108-116`, `src/features/ranking/RankingPage.test.tsx:99-105` — test của điểm vào mới chỉ kiểm việc mở hộp thoại.**
   - Đề xuất: gọi `useBrowserLikeDialog()` và kiểm thêm Escape cùng `toHaveFocus()` trên nút mở, giống MembersPage.
5. **`src/features/overview/OverviewPage.tsx:12-15` — `monthKey` dùng `date.slice(0, 7)`, trong khi Finance dùng ngày theo giờ Việt Nam (`vietnamDayKey`).**
   - Với chuỗi ISO UTC như `2026-09-30T18:00:00Z`, Overview xếp khoản chi vào tháng 09 còn Finance lọc vào tháng 10.
   - Lỗi này đã có từ trước, không do branch này gây ra. Nhưng biểu đồ vừa được dựng lại, nên đây là lúc hợp lý để dùng chung `monthKey` từ `finance/selectors.ts`.
   - Cách sắp xếp giao dịch gần đây (`localeCompare` trên chuỗi thô) cũng nên dùng chung khóa ngày đó.
6. **`src/styles/global.css:165` và `src/features/finance/finance.css:29` — `.footnote` được khai báo hai lần (global và có scope).** Không gây lỗi, nhưng nên giữ một nơi định nghĩa.
7. Các Minor 3, 4, 6, 7 của vòng 1 vẫn mở. Minor 3 và 4 gộp vào Minor 1 ở trên. Minor 6 và 7 chuyển sang QA ghi nhận.

## Kết luận

CHANGES_REQUESTED

## Vòng 3

Phạm vi: commit ea0fa0e (merge a20d0df), so với vòng 2. Không có 04-data-model.md; hợp đồng đối chiếu là `src/data/schema.ts`, `docs/api-contract.md` và "Global constraints" trong plan. Reviewer chỉ đọc code, không chạy test.

Kiểm lại các lỗi vòng 2:
- Important 1 (stale vẫn ghi "thành công") — **đã sửa**.
  - `AppShell.tsx:24-30` tách nhánh `stale` sang "○ Đang hiển thị dữ liệu đọc lúc {giờ} · Giờ Việt Nam".
  - Kiểu `TeamDataState` (`src/data/context.ts:9`) bảo đảm `readAt: Date` ở trạng thái `stale`, nên không có lỗi format null.
  - e2e `errors.spec.ts:49-58` nay kiểm mốc giờ không đổi và không còn chữ "thành công". Có thêm unit test `AppShell.test.tsx` cho `ready` và `stale`.
- Important 2 (tên không có hồ sơ vẫn thành nút) — **đã sửa**.
  - Hook dùng chung `useMemberProfile` (`src/features/members/useMemberProfile.tsx`) chỉ biến các tên có trong `data.members` thành nút. Finance, Overview và Ranking đều dùng hook này.
  - Có test "plain text" cho Overview và Ranking.
  - `rankingColumns` memo hóa theo `memberLink`, mà `memberLink` chỉ đổi khi `data.members` đổi, nên nút mở không bị remount khi dialog đang mở.
- Minor 1 (div `members-page` bọc dialog) — **đã sửa**.
  - Chrome bảng được tách sang `src/styles/tables.css` với scope `:is(.finance-page, .members-page, .member-dialog)`, và `MemberDialog.tsx` import trực tiếp file này. Đã bỏ wrapper ở Overview và Ranking.
  - Các giá trị CSS được chép nguyên văn, nên giao diện bảng không đổi.
- Minor 2 (focus trả về trên Safari) — **đã sửa**. Có prop `opener` lấy từ `event.currentTarget`, dự phòng bằng `activeElement`. Có test cho trường hợp click không làm nút nhận focus, ở Members, Overview và Ranking.
- Minor 3 (tên truy cập có mũi tên) — **đã sửa** bằng `<span aria-hidden="true">↻</span>`, có test.
- Minor 4 (test điểm vào mới thiếu kiểm Escape và focus) — **đã sửa**. Overview và Ranking dùng `useBrowserLikeDialog()` và kiểm cả Escape lẫn nút đóng.
- Minor 5 (`monthKey` lệch múi giờ) — **đã sửa**.
  - Overview dùng chung `monthKey` và `vietnamDayKey` từ `finance/selectors.ts`.
  - Giao dịch gần đây được sắp theo khóa ngày giờ Việt Nam; ngày không đọc được xếp cuối.
  - Có test cho `2026-09-30T18:00:00Z` → 10/2026.
- Minor 6 (`.footnote` khai báo hai lần) — **đã sửa**.
  - Đã bỏ bản ở `finance.css` và `activities.css`, chỉ giữ `global.css:165`.
  - Bản global có cùng giá trị 11px / muted / 15px 0, nên giao diện không đổi.

Không phát hiện lỗi mới:
- Không có rò rỉ: dialog vẫn đóng và trả focus trong cleanup.
- Không thêm fetch, endpoint hay dependency.
- Không đổi hợp đồng dữ liệu.

## Critical

none

## Important

none

## Minor

1. **`src/features/members/MembersPage.tsx:7-8` — Members import `../finance/finance.css` để lấy chrome trang (`.page-title`, `.filters`).**
   - Phụ thuộc chéo giữa hai feature nay đã được khai báo rõ (trước đây chỉ dựa vào thứ tự bundle), nên chấp nhận được.
   - Về lâu dài nên đưa chrome trang dùng chung sang `src/styles/`, giống `tables.css`.
2. **`e2e/errors.spec.ts:49` — `split(' · ')[1]` phụ thuộc vào định dạng dòng trạng thái.**
   - Nếu đổi dấu phân cách, test sẽ hỏng với thông báo khó hiểu (`undefined`).
   - Có thể thêm `expect(readTime).toBeTruthy()`, hoặc lấy giờ bằng regex.
3. Minor 6 và 7 của vòng 1 vẫn chuyển sang QA ghi nhận như đã nêu ở vòng 2.

## Kết luận

APPROVED
