import { render, screen, within } from '@testing-library/react';
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
});
