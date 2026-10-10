import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTeamData } from '../../test/fixtures';
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
    expect(screen.getByText('Chưa có dữ liệu lịch chơi')).toBeInTheDocument();
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
    expect(screen.getAllByText('18:30–20:30')).toHaveLength(2);
  });

  it('reports unreadable records instead of calling them empty data', () => {
    render(<SessionsPage data={makeTeamData({ sessions: [{ id: '' }] })} />);
    expect(screen.getByText(/1 bản ghi lịch chơi không đọc được/)).toBeInTheDocument();
    expect(screen.queryByText('Chưa có dữ liệu lịch chơi')).not.toBeInTheDocument();
  });

  it('filters by date and status and distinguishes no matching results', () => {
    render(
      <SessionsPage
        data={makeTeamData({
          sessions: [
            session(),
            session({ id: 'SES-TEST-002', date: '2026-10-10', status: 'Đã hủy' }),
          ],
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText('Ngày chơi'), {
      target: { value: '2026-10-08' },
    });
    expect(screen.getByText('Không có kết quả phù hợp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    expect(screen.getAllByText('Buổi chơi thử nghiệm')).toHaveLength(2);
  });
});
