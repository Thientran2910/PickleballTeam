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
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function AppShell({ children, section, state, onRefresh }: AppShellProps) {
  const busy = state.status === 'loading' || state.status === 'refreshing';
  const label = busy
    ? 'Đang cập nhật…'
    : state.status === 'error'
      ? 'Thử lại'
      : 'Cập nhật';

  return (
    <>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <header className="site-header">
        <div className="container header-top">
          <div className="logo">
            <span className="logo-mark" aria-hidden="true">
              PB
            </span>
            <span className="logo-text">
              <span className="logo-title">Pickleball Hà Nội</span>
              <span className="logo-sub">Quỹ và hoạt động của đội</span>
            </span>
          </div>
          <div className="header-actions">
            <span className="read-at" aria-live="polite">
              {state.readAt
                ? `Đọc lúc ${readAtFormatter.format(state.readAt)}`
                : 'Chưa có dữ liệu'}
            </span>
            <button
              type="button"
              className="btn"
              onClick={onRefresh}
              disabled={busy}
              aria-busy={busy}
            >
              {label}
            </button>
          </div>
        </div>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <ul className="container">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={s.id === section ? 'page' : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main-content" className="main container" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="container">
          Dữ liệu đọc từ Google Sheet của đội, chỉ xem. Nhập và sửa trên Sheet.
        </div>
      </footer>
    </>
  );
}
