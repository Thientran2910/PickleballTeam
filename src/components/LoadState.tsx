import type { TeamDataState } from '../data/useTeamData';

export type LoadStateProps = { state: TeamDataState; onRetry(): void };

export function LoadState({ state, onRetry }: LoadStateProps) {
  if (state.status === 'loading') {
    return (
      <div className="load-state load-loading" role="status" aria-busy="true">
        <p>Đang đọc dữ liệu đội…</p>
        <span className="skeleton" aria-hidden="true" />
        <span className="skeleton" aria-hidden="true" />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="load-state load-error" role="alert">
        <p>{state.error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Thử lại
        </button>
      </div>
    );
  }
  if (state.status === 'stale') {
    return (
      <div className="load-state load-stale" role="alert">
        <p>
          Chưa cập nhật được dữ liệu mới, đang hiển thị dữ liệu đã đọc trước đó.{' '}
          {state.error}
        </p>
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Thử lại
        </button>
      </div>
    );
  }
  return null;
}
