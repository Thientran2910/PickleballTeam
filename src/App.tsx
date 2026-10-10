import { useTeamData } from './data/useTeamData';

export function App() {
  const state = useTeamData();

  if (state.status === 'loading') {
    return <main aria-busy="true">Đang đọc dữ liệu đội…</main>;
  }

  if (state.status === 'error') {
    return (
      <main>
        <h1>Pickleball Hà Nội</h1>
        <p role="alert">{state.error}</p>
        <button type="button" onClick={state.refresh}>
          Thử lại
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Pickleball Hà Nội</h1>
      <p>Dữ liệu đã sẵn sàng.</p>
      {state.status === 'stale' && <p role="alert">{state.error}</p>}
      <button
        type="button"
        onClick={state.refresh}
        disabled={state.status === 'refreshing'}
      >
        {state.status === 'refreshing' ? 'Đang cập nhật…' : 'Cập nhật'}
      </button>
    </main>
  );
}
