# Verification — T5 (2026-10-10)

Không có số liệu tài chính thật trong tài liệu này.

## 1. Kiểm thử tự động (dữ liệu tổng hợp, mock)

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm test` | 15 files, 68 tests pass |
| `npm run build` | pass |
| `npm run test:e2e` (build với `/PickleballTeam/`, preview 127.0.0.1:4173, Chromium) | 17 pass |

E2E **mock** URL `/exec` bằng fixture tự đặt (kèm header CORS). Bao phủ: 6 route, Back/Forward, reload dưới subpath, không refetch khi đổi tab/bộ lọc, Cập nhật tạo request mới, chỉ GET, HTTP 500 / HTML / `ok=false` / lỗi mạng / timeout 20s không hiện số dư, refresh lỗi giữ số và mốc thời gian cũ (stale), retry phục hồi, noindex trong HTML build, văn bản độc hại hiển thị dạng text, 390px không tràn ngang, asset dưới `/PickleballTeam/`.

Kiểm tra bản build: `dist/index.html` có noindex; bundle không chứa chuỗi fixture; repo không có `.env` hay snapshot thật (chỉ URL API công khai).

## 2. Kiểm tra live (API thật, chỉ đọc)

- 2026-10-10 ~09:59 (Asia/Ho_Chi_Minh): Chromium mở bản preview local (`http://127.0.0.1:4173/PickleballTeam/`), gọi API thật; request `GET script.google.com` → redirect `GET script.googleusercontent.com`, không lỗi console/pageerror, 6 mục render, desktop 1280px và mobile 390px không tràn ngang. Chỉ 1 lượt tải cho cả 6 lần đổi hash.
- **Giới hạn:** origin là `127.0.0.1`, **chưa** chứng minh CORS từ origin GitHub Pages thật (cần sau khi publish).

## 3. Đối soát số liệu với Sheet

Điều phối viên ghi nhận (docs/implementation-progress.md): Chrome overview so với `TỔNG QUAN!B5:H9` qua Drive connector khớp các chỉ số số dư, tổng thu, chi trực tiếp, hoàn ứng, chi phí, thành viên chính thức, cần đóng/đã đóng/còn thiếu, số thành viên đóng đủ, khoảng 09:48 cùng ngày: **pass**. Worker T5 **không** tự đọc Sheet; chạy live ở mục 2 là xác nhận tải được, không phải đối soát số.

## 4. Nguồn API

Khóa JSON sessions/matches/refunds lấy từ Dashboard.gs (docs/api-source-evidence.md). Cổng hợp đồng cho sessions/matches **đã đạt** (tiêu chí 8 của spec): khóa JSON được xác minh từ Dashboard.gs và có test tổng hợp không rỗng. Việc API thật chưa có bản ghi sessions/matches không rỗng là giới hạn của kiểm chứng live, không phải tiêu chí spec chưa đạt. Các kiểm tra origin sau khi publish (CORS từ GitHub Pages) vẫn **chờ** đến khi được duyệt publish.

## 5. Sửa tích hợp trong T5

| Sửa | Kiểm thử |
|---|---|
| `fetch` ném TypeError → thông báo mạng tiếng Việt, vẫn giữ nguyên abort của caller (`src/data/client.ts`) | `client.test.ts`, E2E network failure |
| Skip link không đổi hash/route mà chỉ focus nội dung (`AppShell.tsx`) | `App.test.tsx`, E2E skip link |
| Căn giữa thanh điều hướng (`global.css`) | quan sát ảnh desktop |
| Bỏ từ ngữ "API/trường" khỏi phần giới thiệu Quỹ đội và Thành viên | không đổi hành vi |

## 6. Chưa hoàn tất

- Chưa publish; chưa kiểm tra trên origin GitHub Pages thật.
- Chưa có bản ghi lịch/trận thật để nghiệm thu mục 8 của spec.
- Ảnh chụp 6 mục desktop/mobile: `/tmp/pickleball-artifacts/` (ngoài repo, chứa số thật nên không commit).
