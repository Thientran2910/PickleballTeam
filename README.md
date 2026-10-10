# Pickleball Hà Nội — website xem quỹ và hoạt động đội

Website tĩnh (React + Vite + TypeScript), chỉ đọc, công khai. Dữ liệu lấy từ Google Sheet của đội qua Apps Script hiện có; website chỉ gửi `GET`, không ghi gì lên Sheet/API.

## Chạy và kiểm tra

Yêu cầu Node 24 (`.nvmrc`) và npm.

```sh
npm ci
npm run dev          # phát triển
npm run typecheck && npm run lint && npm test
npm run build        # ra thư mục dist/
npm run preview
npx playwright install chromium   # lần đầu
npm run test:e2e     # build với /PickleballTeam/ rồi kiểm thử bản build bằng Chromium
```

Dữ liệu trong test là dữ liệu tổng hợp tự đặt; E2E mock URL `/exec`, không gọi API thật.

## Nguồn dữ liệu

- Google Sheet nguồn (đã duyệt): https://docs.google.com/spreadsheets/d/1wW3S32cDyxjmS7ZNCO6tvsniLIOwlcTtFMLQ44XVVP8/edit
- API Apps Script công khai: https://script.google.com/macros/s/AKfycbxusIn3XBgRcT2xKyvKZhDqrEKECzQNUzBvCitJ2u0Tuu05T0j0tPYhqifnHl6Do8uULw/exec

URL API công khai (không phải bí mật) nằm trong `src/config.ts`, có thể ghi đè bằng `VITE_APPS_SCRIPT_URL` (xem `.env.example`). Không có token/secret nào trong frontend.

## Cập nhật số liệu

1. Nhập/sửa dữ liệu trên Google Sheet như trước đây.
2. Mở website và bấm **Cập nhật** (website không tự tải lại, không polling). Trang hiển thị thời điểm đọc thành công gần nhất.

Nếu bấm Cập nhật bị lỗi, website giữ số liệu đã đọc, báo "chưa cập nhật được" và giữ mốc thời gian cũ. Nếu lỗi ngay lần đầu, trang báo lỗi tiếng Việt và có nút Thử lại; sẽ không hiện số 0 thay cho dữ liệu. Nguyên nhân thường gặp: mất mạng, Apps Script quá hạn mức/quá thời gian (20 giây), hoặc API bị đổi cấu trúc.

## noindex không phải đăng nhập

`index.html` có `<meta name="robots" content="noindex, nofollow">` để công cụ tìm kiếm không lập chỉ mục. Đây **không** hạn chế người truy cập: ai có link và có link API đều xem được dữ liệu. Không chặn bằng `robots.txt` (crawler cần đọc được thẻ noindex).

## Triển khai GitHub Pages

Workflow `.github/workflows/pages.yml` chạy thủ công (`workflow_dispatch`), không tự chạy khi push. Base path được tính từ tên repo (`/<repo>/`, hoặc `/` với repo `<owner>.github.io`). Điều kiện: repo public, Settings → Pages → Source: GitHub Actions. CI (`ci.yml`) chạy typecheck, lint, test và E2E.

Rollback phiên bản website: workflow Pages không cho chọn một commit SHA bất kỳ. Cách làm: `git revert` thay đổi lỗi trên nhánh release/mặc định, kiểm tra lại CI xanh, rồi chạy thủ công workflow Pages (Run workflow). Lưu ý: việc này chỉ khôi phục website. Dự án không sao lưu Google Sheet tự động và không thay đổi Apps Script/Sheet.

## Giới hạn

- Sheet không có "Nội dung khoản chi" và "Chứng từ" trong API nên website không hiển thị.
- Tính năng lịch/trận dùng khóa JSON đã xác minh từ mã Apps Script (`docs/api-source-evidence.md`), nhưng hiện Sheet chưa có bản ghi mẫu nên chưa kiểm chứng bằng dữ liệu thật.
- Kiểm tra CORS từ origin GitHub Pages thật chỉ làm được sau khi publish.

Chi tiết xem `docs/api-contract.md` và `docs/verification.md`.
