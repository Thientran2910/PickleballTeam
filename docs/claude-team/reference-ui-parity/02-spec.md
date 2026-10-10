# 02 — Spec (rút từ plan đã duyệt)

Nguồn: `docs/superpowers/plans/2026-10-10-reference-ui-parity.md` (Acceptance + Global constraints), audit `docs/reference-ui-audit.md`. Tham chiếu: https://pickleball-hn-thien.thientran2910.chatgpt.site/#overview

## Acceptance criteria

- AC-1.1 Cả 6 route (Tổng quan, Quỹ, Thành viên, Thi đấu, Lịch chơi, Dụng cụ) dùng design system của trang mẫu: palette (#f8f7f3 nền, #223d34 chữ, #2d5b4c xanh, #798179 phụ, #e0e3da viền, #eaf0df sage), font Georgia cho heading, max width 1400/1330px, breakpoint 1100/700px, nav sticky có pill sage cho mục đang chọn.
- AC-1.2 Bố cục từng trang khớp cấu trúc trang mẫu ở desktop (1440px) và mobile (390px); không cuộn ngang toàn trang ở mobile (bảng cuộn ngang bên trong).
- AC-2.1 Quỹ có 4 tab nội bộ (thu quỹ, chi quỹ, công nợ/ứng, lịch sử hoàn ứng) hoạt động bằng chuột và bàn phím.
- AC-2.2 Bộ lọc đợt quỹ mặc định "Tất cả đợt" khi vào trang lần đầu; tìm kiếm và bộ lọc hoạt động; tổng/số dòng theo phạm vi lọc.
- AC-2.3 Không đổi công thức tài chính: không cộng trùng chi quỹ và chi ghi nhận; không bù trừ nợ giữa các đợt; số chưa biết vẫn hiển thị là chưa biết.
- AC-3.1 Thành viên hiển thị lưới thẻ (3 cột desktop, co lại theo breakpoint); ô tìm kiếm lọc thẻ.
- AC-3.2 Hộp thoại hồ sơ thành viên mở từ thẻ và các điểm vào như trang mẫu; đóng bằng nút và phím Escape; dùng được trên mobile; chỉ hiện số liệu có trong TeamData.
- AC-4.1 Thi đấu, Lịch chơi, Dụng cụ khớp heading/subtitle, hàng chỉ số, mật độ bảng, empty state của trang mẫu; chỉ hiển thị trường dữ liệu đã xác minh, không dữ liệu giả.
- AC-5.1 Trạng thái loading/error/empty vẫn đúng; không thêm fetch, API, dependency; không push/deploy.
- AC-5.2 Kiểm tra phạm vi (vitest features/components/App, typecheck, lint, build) pass; console không lỗi.
- AC-5.3 Có ảnh so sánh desktop/mobile với trang mẫu cho mọi route + 4 tab Quỹ + dialog; độ lệch còn lại được liệt kê rõ.
