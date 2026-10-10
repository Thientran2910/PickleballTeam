Bạn là Implementer trong team claude-team (vòng sửa review r2). Worktree hiện tại đang ở branch tạo từ team/reference-ui-parity.
Việc: sửa Important 1, 2 và Minor 1, 2, 3, 4, 5, 6 trong /Users/thientv/Workspace/PickleballTeam/docs/claude-team/reference-ui-parity/07-review.md mục "## Vòng 2" (đọc kỹ mục đó trước, làm đúng cách sửa đề xuất).
- Important 1: AppShell stale không ghi "thành công"; sửa cả e2e/dashboard.spec.ts (chỉ test đó) và thêm unit test AppShell stale. Trạng thái ready giữ đúng chữ trang mẫu "● Cập nhật thành công · {giờ} · Giờ Việt Nam".
- Important 2: tách helper link thành viên dùng chung (chỉ render nút khi tên có trong data.members) và dùng ở Finance, Overview, Ranking; test tên lạ ra text thường cho Ranking + Overview.
- Minor 1: MemberDialog có style riêng (thêm .member-dialog vào selector hoặc tách tables.css dùng chung, import trong MemberDialog), bỏ div.members-page bọc ở Overview/Ranking.
- Giao diện phải giữ nguyên như hiện tại (đang khớp trang mẫu). Không đổi công thức tài chính, không thêm dependency/fetch/dữ liệu giả.
- Phạm vi được sửa: src/components/*, src/styles/*, src/features/**, e2e/dashboard.spec.ts. Không sửa data provider/API/deploy.
- TDD: test fail trước rồi sửa.
- Kiểm chứng (chỉ phạm vi, KHÔNG chạy toàn bộ suite): npx vitest run src/features src/components src/lib src/App.test.tsx ; npm run typecheck ; npm run lint ; npm run build ; và riêng test e2e đã sửa: npx playwright test e2e/dashboard.spec.ts -g "failed refresh". Chạy npm ci nếu thiếu node_modules.
- Commit trên branch hiện tại, message "fix(reference-ui-parity): <mô tả>", dòng cuối "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>". Không push.
- Không hỏi lại trừ khi bị chặn thật sự.
- Khi xong: ghi .team-done ở gốc worktree, đúng một dòng "pass <tóm tắt>" hoặc "fail <lý do>". Không commit file này.
