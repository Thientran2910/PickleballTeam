# Hợp đồng API đọc dữ liệu đội

Tài liệu này ghi nhận hợp đồng từ một lần `GET` chỉ đọc tới Apps Script `/exec` ngày 10/10/2026. Tài liệu chỉ lưu tên khóa và kiểu, không lưu payload, tên thành viên hoặc số liệu tài chính thật.

## Giao thức

- Endpoint: URL Apps Script `/exec` công khai trong `VITE_APPS_SCRIPT_URL`, với URL trong `src/config.ts` làm mặc định.
- Phương thức duy nhất của frontend: `GET`; `credentials: omit`; theo redirect; không custom header, JSONP hoặc `no-cors`.
- Envelope thành công: `{ ok: true, data: TeamData }`. `{ ok: false }`, HTTP không thành công, HTML, JSON lỗi và schema sai đều là lỗi tải.
- `schemaVersion` được hỗ trợ: literal `1`. Phiên bản khác bị từ chối.
- `updatedAt`: `string`, timestamp do API cung cấp.
- `timezone`: literal `Asia/Ho_Chi_Minh`. Ngày hiển thị theo timezone này.
- Object có thể có khóa mới chưa biết; parser bỏ các khóa đó. Các object/mảng bắt buộc không được tự mặc định thành `{}`, `[]` hay `0` nếu bị thiếu.

## `overview`

| Trường | Kiểu |
|---|---|
| `fundPeriod` | string |
| `normalFee`, `studentFee` | finite number |
| `openingBalance`, `balance` | finite number |
| `totalIncome`, `totalFundOutflow`, `totalRefunded`, `totalExpenses` | finite number |
| `regularMembers`, `fullyPaidMembers` | finite number |
| `periodRequired`, `periodPaid`, `periodMissing` | finite number |

Các tổng này có ý nghĩa riêng từ Sheet/API. Client không tính lại `balance`, không lấy `totalExpenses` thay cho `totalFundOutflow`, và không cộng `totalRefunded` lần thứ hai.

## Các mảng đã có bản ghi để xác minh

| Mảng | Trường string | Trường finite number | Trường number hoặc string |
|---|---|---|---|
| `members` | `name`, `status`, `joinedAt`, `currentPeriodStatus` | `sessions`, `matches`, `wins`, `losses`, `winRate`, `pointsFor`, `pointsAgainst`, `pointDifference`, `required`, `paid`, `missing`, `missingPeriods` | — |
| `income` | `period`, `member`, `status`, `receivedAt`, `method` | `required`, `paid`, `missing` | — |
| `expenses` | `id`, `date`, `category`, `paidBy`, `source`, `sessionId` | `amount`, `fundOutflow`, `refunded`, `refundRemaining`, `recordedExpense` | — |
| `advances` | `member`, `status` | `advanced`, `refunded`, `remaining` | — |
| `assets` | `id`, `name`, `purchasedAt`, `holder`, `status`, `unit` | `value` | `purchased`, `remaining`, `usedOrLost` |
| `ranking` | `member` | `matches`, `wins`, `losses`, `pointsFor`, `pointsAgainst`, `pointDifference` | `rank`, `winRate` |

`number | string` là kiểu truyền qua, không phải yêu cầu ép kiểu. Chuỗi số, chuỗi rỗng hoặc dấu gạch không được chuyển thành số `0`. Ngày rỗng vẫn là string ở boundary và được view hiển thị bằng dấu gạch.

## Mảng API đang rỗng và bằng chứng từ mã nguồn

`sessions`, `refunds` và `matches` đều rỗng trong lần GET quan sát, nên response thật chưa chứng minh kiểu scalar của từng giá trị. Ngày 10/10/2026, coordinator đọc read-only mã `Dashboard.gs` trong Apps Script gắn với Sheet và xác minh các mapping xuất JSON sau (không chạy hoặc sửa script):

| Mảng | Khóa được mapping trong source |
|---|---|
| `sessions` | `id`, `date`, `activity`, `venue`, `start`, `end`, `courts`, `guests`, `memberCount`, `courtCost`, `totalCost`, `status` |
| `refunds` | `date`, `expenseId`, `member`, `amount`, `method` |
| `matches` | `date`, `team1Player1`, `team1Player2`, `team2Player1`, `team2Player2`, `team1Score`, `team2Score`, `winner`, `validation`, `sessionId` |

Helper `pbDashboardRows_` dùng `getValues()`, nhận các dòng có key cell khác rỗng và không lọc theo `validation`. Giá trị `Date` được serialize thành `yyyy-MM-ddTHH:mm:ss+07:00`; giá trị còn lại được truyền nguyên trạng nên có thể là number, string hoặc boolean. Giá trị giờ có thể mang mốc ngày năm 1899 và không được làm hỏng cả payload.

Boundary Task 1 vẫn nhận mỗi phần tử của ba mảng dưới dạng record khóa string/giá trị unknown. Task 4 phải dùng mapping đã xác minh cùng test cho bản ghi không rỗng để tạo adapter; không ép scalar chưa có mẫu, không suy diễn từ mảng rỗng và không tự lọc `validation`.

## Trường Sheet không có trong API

Sheet có cột **Nội dung khoản chi** và **Chứng từ**, nhưng API quan sát không trả hai trường này. Frontend không lấy chúng từ nguồn khác, không phỏng đoán URL chứng từ và không thêm chúng vào giao diện.

## Chính sách tương thích

- Mọi field tiền và thống kê đã xác minh phải là finite number; thiếu field, `NaN`, vô cực, chuỗi số hoặc chuỗi rỗng đều bị từ chối.
- Các field ngày/tên/trạng thái đã xác minh giữ nguyên là string; boundary không dùng `z.coerce.number()` hoặc phép fallback.
- Unknown extra keys trong object bị bỏ qua để không vô tình đưa dữ liệu mới ra UI.
- Thay đổi `schemaVersion` hoặc kiểu field cần cập nhật schema, fixture tổng hợp và kiểm thử trước khi phát hành.
