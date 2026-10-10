Bạn là Implementer trong team claude-team (vòng sửa review r1). Worktree hiện tại đang ở branch tạo từ team/reference-ui-parity.
Việc: sửa mọi lỗi **Important** (1, 2, 3) và Minor 1, 2, 5 trong /Users/thientv/Workspace/PickleballTeam/docs/claude-team/reference-ui-parity/07-review.md mục "Vòng 1". Đọc file đó trước.
- Chỉ sửa: src/features/finance/*, src/features/members/*, src/features/ranking/RankingPage.tsx (chỉ rowKey của Minor 5). Không sửa file ngoài phạm vi.
- TDD: viết test fail trước (focus quay về nút mở sau khi đóng dialog; tên không có trong data.members render text thường; bộ lọc tháng tab hoàn ứng lấy tháng từ ngày hoàn ứng; search không khớp trường số), rồi sửa.
- Không đổi công thức tài chính, không thêm dependency/fetch/dữ liệu giả. Giữ nguyên giao diện (đang khớp trang mẫu https://pickleball-hn-thien.thientran2910.chatgpt.site/).
- Kiểm chứng (chỉ phạm vi, KHÔNG chạy toàn bộ suite/e2e): npx vitest run src/features src/App.test.tsx ; npm run typecheck ; npm run lint ; npm run build. Chạy npm ci nếu thiếu node_modules.
- Commit trên branch hiện tại, message "fix(reference-ui-parity): <mô tả>", dòng cuối "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>". Không push.
- Không hỏi lại trừ khi bị chặn thật sự.
- Khi xong: ghi file .team-done ở gốc worktree, đúng một dòng "pass <tóm tắt 1 câu>" hoặc "fail <lý do>". Không commit file này.
