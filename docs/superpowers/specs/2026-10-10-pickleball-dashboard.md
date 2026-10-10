# Đặc tả website Pickleball Hà Nội

Trạng thái: user đã duyệt đặc tả và cho phép coding ngày 10/10/2026; đang thực hiện theo plan. Tiến độ và bằng chứng mới tại [implementation-progress.md](../../implementation-progress.md).

## Mục tiêu và các quyết định đã duyệt

Xây website React cho một đội, đọc dữ liệu từ Google Sheet qua Apps Script hiện tại. Giữ phong cách website mẫu, cải thiện bộ lọc và trải nghiệm điện thoại.

| Quyết định | Kết quả |
|---|---|
| Q1 | Công khai, ai có link cũng xem; không đăng nhập |
| Q2 | Website chỉ đọc; nhập/sửa dữ liệu trên Sheet |
| Q3 | Đủ 6 mục như mẫu |
| Q4 | Chỉ phục vụ một đội |
| Q5 | Chi phí vận hành 0 đồng; tên miền miễn phí |
| Q6 | GitHub Pages, repo public |
| Q7 | Giữ phong cách mẫu, cải thiện bảng/bộ lọc/mobile |
| Q8 | Giữ quy tắc tính của Sheet; kiểm tra nhất quán Sheet/API/web |
| Q9 | Tải khi mở trang hoặc bấm Cập nhật; không polling |
| Q10 | Mặc định kỳ quỹ hiện tại; xem được lịch sử |
| Q11 | Thêm noindex vào website mới |
| Q12 | Giữ nguyên API; không bổ sung nội dung chi/chứng từ |

## Nguồn dữ liệu

- Mẫu: https://pickleball-hn-thien.thientran2910.chatgpt.site/
- Sheet: https://docs.google.com/spreadsheets/d/1wW3S32cDyxjmS7ZNCO6tvsniLIOwlcTtFMLQ44XVVP8/edit
- API: https://script.google.com/macros/s/AKfycbxusIn3XBgRcT2xKyvKZhDqrEKECzQNUzBvCitJ2u0Tuu05T0j0tPYhqifnHl6Do8uULw/exec

Sheet là nơi vận hành dữ liệu, API là giao diện đọc duy nhất của website. Không đọc trực tiếp Sheet bằng CSV/Sheets API từ frontend; không thay đổi quyền chia sẻ của nguồn.

## Các trang và hành vi

| Hash | Trang | Nội dung và bộ lọc |
|---|---|---|
| #overview | Tổng quan | Số dư quỹ toàn đội, tổng thu, dòng tiền ra, chi phí ghi nhận; tiến độ đóng quỹ kỳ hiện tại; thành viên |
| #finance | Quỹ đội | Thu quỹ: kỳ/thành viên/trạng thái. Chi quỹ: khoảng ngày/nhóm/người thanh toán. Tổng ứng/hoàn ứng theo thành viên |
| #members | Thành viên | Tìm theo tên; lọc trạng thái; số phải đóng/đã đóng/còn thiếu; thống kê tham gia và thi đấu |
| #ranking | Thi đấu | Bảng xếp hạng theo Sheet, thành tích; kết quả trận khi hợp đồng dữ liệu được xác minh và API có bản ghi |
| #sessions | Lịch chơi | Ngày, sân, giờ, người tham gia, chi phí, trạng thái theo các trường API thực tế cung cấp |
| #assets | Dụng cụ | Tên, số lượng mua/còn lại/đã dùng hoặc mất, đơn vị, người giữ, tình trạng, giá trị |

- Không có hash hoặc hash không hợp lệ: về Tổng quan. Back/Forward và tải lại link có hash hoạt động.
- Số dư toàn đội không đổi khi lọc kỳ. Các tổng của danh sách đang lọc phải có nhãn phạm vi rõ ràng.
- Thu quỹ dùng `period` thực tế; không suy diễn kỳ từ ngày nhận tiền hoặc diễn giải mã lịch sử `LS-*` thành tháng lịch.
- Chi quỹ hiện không có trường kỳ. Lọc chi bằng ngày, không tự gán kỳ thu cho khoản chi.
- Khoản còn thiếu lấy từ API, không tính `required - paid` ở cấp toàn bộ thành viên: khoản đóng dư và khoản thiếu của các kỳ khác nhau không tự bù trừ.
- Phân biệt `amount`, `recordedExpense`, `fundOutflow`, `refunded`, `refundRemaining`; không cộng trùng tiền hoàn ứng vào chi phí.
- Không xây cách xếp hạng mới; không trao hạng/thành tích cho người chưa có trận.

## Giao diện

- Tên hiển thị chính: Pickleball Hà Nội. Phong cách mẫu: nền trắng ngà, xanh đậm, chữ rõ, bảng gọn, điều hướng 6 mục.
- Desktop có vùng nội dung giới hạn chiều rộng; điện thoại đọc được ở 360–390px. Bảng rộng chỉ cuộn trong vùng bảng.
- Một nút Cập nhật chung; hiển thị trạng thái tải và thời điểm đọc thành công gần nhất.
- Điều hướng, bộ lọc, nút dùng được bằng bàn phím; focus rõ; label cho input; heading/table semantic.
- Không thêm ảnh, font từ dịch vụ trả phí hoặc tài sản yêu cầu giấy phép chưa có. Có thể dùng system fonts và logo chữ tự dựng.

## Trạng thái dữ liệu

- Lần đầu tải: skeleton hoặc thông báo đang đọc dữ liệu; không hiện số 0 giả.
- Mảng rỗng hợp lệ: Chưa có dữ liệu. Danh sách bị lọc hết: Không có kết quả phù hợp, có cách xóa bộ lọc.
- Lỗi HTTP, HTML thay JSON, `{ok:false}`, schema sai, timeout: báo lỗi bằng tiếng Việt và cho thử lại.
- Refresh lỗi sau một lần tải thành công: giữ dữ liệu đã đọc trong bộ nhớ phiên, đánh dấu chưa cập nhật được và giữ timestamp cũ.
- Không lưu snapshot tài chính thật trong repo/build, không thêm service worker/offline mode, không lưu localStorage trong bản đầu.
- Thời gian hiển thị theo Asia/Ho_Chi_Minh, tiền VND theo vi-VN; ngày rỗng là dấu gạch, không phải 01/01/1970.

## Bằng chứng đã kiểm tra ngày 10/10/2026

- Thư mục workspace trống, chưa có Git repository hoặc package.json.
- Orca runtime ready; session có TERM_PROGRAM=Orca và process cha Orca Helper.
- API GET không đăng nhập trả JSON `{ok:true,data:{schemaVersion:1,...}}`.
- GET với Origin ngoài Google nhận redirect tới Googleusercontent và header Access-Control-Allow-Origin: *. Chưa chứng minh bằng browser fetch trên origin GitHub Pages thật.
- API có overview, members, income, expenses, sessions, refunds, advances, assets, ranking, matches.
- members/income/expenses/assets/ranking có bản ghi. sessions/refunds/matches đang rỗng.
- ranking.rank và ranking.winRate hiện là chuỗi; một số số lượng dụng cụ cũng là chuỗi. Không giả định mọi ô là number, không chuyển chuỗi rỗng thành 0.
- Sheet có cột Nội dung và Chứng từ, nhưng API không trả hai trường này. Chúng nằm ngoài phạm vi hiển thị bản đầu.
- Website mẫu xem được khung điều hướng và phong cách; trong lần kiểm tra vẫn ở trạng thái tải. Đọc app.js bằng browser bị ERR_BLOCKED_BY_CLIENT, nên chưa lấy được hợp đồng các mảng rỗng từ mã frontend mẫu.
- Chưa đọc mã Apps Script và chưa kiểm tra endpoint ghi. Website mới chỉ dùng GET; điều này không chứng minh endpoint ghi hiện tại được bảo vệ.

Cập nhật khi coding: đã đọc hợp lệ Dashboard.gs và xác minh khóa lịch/trận/hoàn ứng; xem [api-source-evidence.md](../../api-source-evidence.md). Các nhận xét “chưa đọc” ở trên ghi lại thời điểm khảo sát ban đầu.

## Hợp đồng dữ liệu chưa thể suy ra từ mảng rỗng

`sessions`, `matches`, `refunds` chưa có mẫu object. Tên cột trên Sheet không phải bằng chứng tên khóa JSON của API. Khi triển khai phải xác minh bằng mã Apps Script hiện có được đọc hợp lệ hoặc bản ghi API thực tế; không tạo dữ liệu trên Sheet thật để thử và không sửa API.

Nếu không đọc được mã nguồn, yêu cầu user cung cấp phần mã xuất JSON liên quan. Các phần khác vẫn làm được; chưa được kết luận hoàn thành khả năng hiển thị bản ghi lịch/trận chỉ từ fixture tự đặt khóa. Hiển thị tổng hợp ứng/hoàn ứng từ `advances` đã có hợp đồng, không cần hứa bảng lịch sử `refunds` chưa xác minh.

## Hosting và phạm vi bảo mật

- Build tĩnh lên GitHub Pages; mã nguồn public và dữ liệu vốn public theo lựa chọn của user.
- Meta robots noindex trong HTML gốc. Không chặn crawler bằng robots.txt khiến crawler không đọc được noindex.
- Không có mật khẩu/token/service-account key trong code, env frontend, artifact hoặc workflow. URL GET public không phải secret.
- Render nội dung Sheet dưới dạng text; không dùng dangerouslySetInnerHTML. Không tự mở URL chứng từ hoặc ghi log toàn bộ payload.
- Không chỉnh Google Sheet, Apps Script, quyền Drive, không POST/PUT/PATCH/DELETE tới API.
- Tạo repo/push/bật Pages/publish thực hiện ở bước triển khai sau khi đã có bản build và kết quả kiểm tra để user xem. User đã cho phép coding; bước publish vẫn tách riêng.

## Tiêu chí nghiệm thu

1. Đủ 6 hash routes, mở trực tiếp và reload trên project subpath của Pages hoạt động.
2. Đọc API không đăng nhập; cập nhật bằng nút; không fetch lại chỉ vì đổi tab/bộ lọc; không polling.
3. Tổng quan khớp API/Sheet tại cùng thời điểm đọc; bộ lọc không làm đổi số dư toàn đội.
4. Khoản đóng dư, kỳ lịch sử, ứng cá nhân và hoàn ứng không bị diễn giải hoặc cộng lại sai.
5. Lỗi/timeout/schema sai khác với mảng rỗng; không giả dữ liệu bằng số 0.
6. Chạy được trên desktop/mobile, không tràn ngang toàn trang; dùng bàn phím được.
7. Website có noindex trong HTML build; không có secret hoặc payload thật được đóng gói.
8. Lịch/trận rỗng hiển thị đúng; bản ghi có dữ liệu chỉ được nghiệm thu sau khi xác minh hợp đồng thật.
9. Có lockfile, lệnh chạy/build/test và tài liệu cập nhật Sheet/triển khai/khôi phục bản web.

## Tham chiếu kỹ thuật

- [Vite: static deploy và GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages): base path và workflow deploy.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages): hosting tĩnh, GitHub Free với repo public.
- [Apps Script Content Service](https://developers.google.com/apps-script/guides/content): client phải theo redirect, dùng URL /exec gốc.
- [Google noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing): yêu cầu crawler đọc được meta/header.
