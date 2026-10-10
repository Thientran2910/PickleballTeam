import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TeamDataState } from '../data/useTeamData';
import { makeTeamData } from '../test/fixtures';
import { AppShell } from './AppShell';

const readAt = new Date('2026-10-10T03:04:05Z');

function renderShell(state: TeamDataState) {
  render(
    <AppShell section="overview" state={state} onRefresh={() => undefined}>
      <p>nội dung</p>
    </AppShell>,
  );
  return document.querySelector('.read-at') as HTMLElement;
}

describe('AppShell status line', () => {
  it('reports a successful read in the reference wording once data is ready', () => {
    const status = renderShell({ status: 'ready', data: makeTeamData(), readAt, error: null });
    expect(status.textContent).toBe('● Cập nhật thành công · 10:04:05 10/10/2026 · Giờ Việt Nam');
  });

  it('does not claim success while stale, but keeps the last read time', () => {
    const status = renderShell({ status: 'stale', data: makeTeamData(), readAt, error: 'boom' });
    expect(status.textContent).not.toContain('thành công');
    expect(status.textContent).toContain('10:04:05 10/10/2026');
    expect(status.textContent).toContain('Giờ Việt Nam');
  });

  it('hides the refresh arrow from the accessible name', () => {
    renderShell({ status: 'ready', data: makeTeamData(), readAt, error: null });
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeInTheDocument();
  });
});
