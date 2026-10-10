import type { ReactNode } from 'react';
import type { TeamDataState } from '../data/useTeamData';
import { SECTIONS, type Section } from '../navigation/sections';

export type AppShellProps = {
  children: ReactNode;
  section: Section;
  state: TeamDataState;
  onRefresh(): void;
};

const readAtFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function AppShell({ children, section, state, onRefresh }: AppShellProps) {
  const busy = state.status === 'loading' || state.status === 'refreshing';
  const statusText = busy
    ? 'Đang đọc dữ liệu mới nhất từ Sheet…'
    : state.readAt
      ? `● Cập nhật thành công · ${readAtFormatter.format(state.readAt)} · Giờ Việt Nam`
      : 'Chưa có dữ liệu';

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          // Giữ nguyên hash của mục đang mở; chỉ chuyển focus vào nội dung.
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Bỏ qua điều hướng
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#overview" aria-label="Pickleball Hà Nội, về trang tổng quan">
            <span className="mark" aria-hidden="true">
              p·
            </span>
            <span>
              pickleball
              <small>HÀ NỘI · TEAM ATLAS</small>
            </span>
          </a>
          <nav className="site-nav" aria-label="Điều hướng chính">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={s.id === section ? 'active' : undefined}
                aria-current={s.id === section ? 'page' : undefined}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="outline refresh"
            onClick={onRefresh}
            disabled={busy}
            aria-busy={busy}
          >
            ↻ Cập nhật
          </button>
        </div>
      </header>
      <main id="main-content" className="main" tabIndex={-1}>
        <p className="read-at" aria-live="polite">
          {statusText}
        </p>
        {children}
      </main>
      <footer className="site-footer">
        <span>Pickleball Hà Nội</span>
        <span>Cùng chơi. Cùng tiến bộ.</span>
        <span>Thống kê chỉ đọc · Google Sheet là nguồn dữ liệu</span>
      </footer>
    </>
  );
}
