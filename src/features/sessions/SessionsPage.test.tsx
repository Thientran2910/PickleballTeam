import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { useBrowserLikeDialog } from '../members/dialogTestEnv';
import { SessionsPage } from './SessionsPage';

const session = (overrides: Record<string, unknown> = {}) => ({
  id: 'SES-TEST-001',
  date: '2026-10-09T00:00:00+07:00',
  activity: 'Buổi chơi thử nghiệm',
  venue: 'Sân thử nghiệm',
  start: '1899-12-30T18:30:00+07:00',
  end: '1899-12-30T20:30:00+07:00',
  courts: '2',
  guests: 1,
  memberCount: 6,
  courtCost: 300_000,
  totalCost: 360_000,
  status: 'Đã hoàn thành',
  ...overrides,
});

describe('SessionsPage', () => {
  it('shows an empty calendar without invented sessions', () => {
    render(<SessionsPage data={makeTeamData({ sessions: [] })} />);
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });

  it('sorts readable sessions newest first without mutating the snapshot', () => {
    const sessions = [
      session(),
      session({ id: 'SES-TEST-002', date: '2026-10-10', activity: 'Buổi mới' }),
    ];
    const data = makeTeamData({ sessions });
    render(<SessionsPage data={data} />);

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Buổi mới');
    expect(rows[1]).toHaveTextContent('Buổi chơi thử nghiệm');
    expect(data.sessions).toEqual(sessions);
    expect(screen.getAllByText('18:30 – 20:30')).toHaveLength(2);
  });

  it('reports unreadable records instead of calling them empty data', () => {
    render(<SessionsPage data={makeTeamData({ sessions: [{ id: '' }] })} />);
    expect(screen.getByText(/1 bản ghi lịch chơi không đọc được/)).toBeInTheDocument();
    expect(screen.queryByText('Chưa có dữ liệu')).not.toBeInTheDocument();
  });

  it('summarises sessions without treating unknown counts as zero', () => {
    render(
      <SessionsPage
        data={makeTeamData({
          sessions: [
            session(),
            session({ id: 'SES-TEST-002', date: '2026-10-10', memberCount: '', guests: '' }),
          ],
        })}
      />,
    );
    expect(screen.getByText('Lượt thành viên tham gia · 1 buổi chưa ghi')).toBeInTheDocument();
    expect(screen.getByText('Lượt khách tham gia · 1 buổi chưa ghi')).toBeInTheDocument();
    const cells = within(screen.getByRole('table')).getAllByRole('row')[1];
    expect(cells).toHaveTextContent('—');
  });

  it('shows courts and guests next to the other source columns', () => {
    render(<SessionsPage data={makeTeamData({ sessions: [session()] })} />);
    const headers = within(screen.getByRole('table'))
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent);
    expect(headers).toEqual([
      'Ngày',
      'Hoạt động',
      'Sân',
      'Giờ',
      'Số sân',
      'Thành viên',
      'Khách',
      'Chi phí',
      'Trạng thái',
    ]);
  });

  describe('session detail', () => {
    useBrowserLikeDialog();

    it('opens the session detail with its expenses and matches from the date cell', () => {
      const data = makeTeamData({ sessions: [session()] });
      data.expenses = [
        { ...data.expenses[0], id: 'E-IN', sessionId: 'SES-TEST-001', category: 'Tiền sân', recordedExpense: 300_000 },
        { ...data.expenses[0], id: 'E-OUT', sessionId: 'SES-OTHER', category: 'Không liên quan' },
      ];
      data.matches = [
        {
          validation: 'Hợp lệ',
          date: '2026-10-09',
          team1Player1: 'An',
          team1Player2: 'Bình',
          team2Player1: 'Chi',
          team2Player2: 'Dũng',
          team1Score: 11,
          team2Score: 7,
          winner: 'Đội 1',
          sessionId: 'SES-TEST-001',
        },
      ];
      render(<SessionsPage data={data} />);
      const opener = screen.getByRole('button', { name: '9/10/2026' });
      fireEvent.click(opener);

      const dialog = screen.getByRole('dialog', { name: 'Thứ Sáu, 9/10/2026' });
      expect(within(dialog).getByText('CHI TIẾT BUỔI CHƠI')).toBeInTheDocument();
      expect(dialog).toHaveTextContent('18:30 – 20:30 · Sân thử nghiệm · Buổi chơi thử nghiệm');
      expect(within(dialog).getByText('Đã hoàn thành')).toBeInTheDocument();
      expect(within(dialog).getByText('Số sân').previousSibling).toHaveTextContent('2');
      expect(within(dialog).getByText('Tổng chi phí buổi').previousSibling).toHaveTextContent(
        formatVnd(360_000),
      );
      expect(within(dialog).getByText('Tiền sân')).toBeInTheDocument();
      expect(within(dialog).queryByText('Không liên quan')).not.toBeInTheDocument();
      expect(within(dialog).getByText('An & Bình')).toBeInTheDocument();
      expect(within(dialog).getByText('11 – 7')).toBeInTheDocument();

      fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng chi tiết buổi chơi' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(opener).toHaveFocus();
    });

    it('shows empty copy when a session has no linked expenses or matches', () => {
      render(<SessionsPage data={makeTeamData({ sessions: [session()] })} />);
      fireEvent.click(screen.getByRole('button', { name: '9/10/2026' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Chưa có khoản chi')).toBeInTheDocument();
      expect(within(dialog).getByText('Chưa có trận đấu')).toBeInTheDocument();
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
