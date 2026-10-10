import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { TeamDataProvider } from './data/TeamDataProvider';
import { makePayload } from './test/fixtures';

function renderApp() {
  return render(
    <TeamDataProvider>
      <App />
    </TeamDataProvider>,
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(makePayload()))),
      ),
    );
  });
  afterEach(() => {
    window.location.hash = '';
  });

  it.each([
    ['overview', 'Tổng quan'],
    ['finance', 'Quỹ đội'],
    ['members', 'Thành viên'],
    ['ranking', 'Thi đấu'],
    ['sessions', 'Lịch chơi'],
    ['assets', 'Dụng cụ'],
  ])('renders the %s page without extra fetches', async (id, heading) => {
    window.location.hash = `#${id}`;
    renderApp();
    expect(
      await screen.findByRole('heading', { level: 2, name: heading }),
    ).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the current route when using the skip link', async () => {
    window.location.hash = '#finance';
    renderApp();
    await screen.findByRole('heading', { level: 2, name: 'Quỹ đội' });
    fireEvent.click(screen.getByText('Bỏ qua điều hướng'));
    expect(window.location.hash).toBe('#finance');
    expect(document.getElementById('main-content')).toHaveFocus();
  });
});
