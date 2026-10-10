import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTeamData } from '../../test/fixtures';
import { RankingPage } from './RankingPage';

describe('RankingPage', () => {
  it('does not award a rank to a player with zero matches', () => {
    const data = makeTeamData();
    data.ranking = [
      {
        ...data.ranking[0],
        member: 'Bình Thử Nghiệm',
        matches: 0,
        rank: '—',
        winRate: '—',
      },
    ];
    render(<RankingPage data={data} />);
    const row = screen.getByText('Bình Thử Nghiệm').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('Chưa thi đấu')).toBeInTheDocument();
    expect(row?.querySelector('.is-top')).toBeNull();
  });

  it('keeps the upstream ranking order', () => {
    const data = makeTeamData();
    data.ranking = [
      { ...data.ranking[0], member: 'Người đứng sau', rank: '2' },
      { ...data.ranking[0], member: 'Người đứng trước', rank: '1' },
    ];
    render(<RankingPage data={data} />);

    const rows = within(screen.getByRole('table', { name: 'Bảng xếp hạng' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows[0]).toHaveTextContent('Người đứng sau');
    expect(rows[1]).toHaveTextContent('Người đứng trước');
  });

  it('renders only matches accepted by the verified adapter and reports rejected rows', () => {
    const valid = {
      date: '2026-10-09',
      team1Player1: 'Người A',
      team1Player2: 'Người B',
      team2Player1: 'Người C',
      team2Player2: 'Người D',
      team1Score: 11,
      team2Score: 8,
      winner: 'Đội 1',
      validation: 'Hợp lệ',
      sessionId: '',
    };
    render(
      <RankingPage
        data={makeTeamData({
          matches: [valid, { ...valid, validation: 'Không hợp lệ' }],
        })}
      />,
    );
    expect(screen.getByText('Người A / Người B')).toBeInTheDocument();
    expect(screen.getByText('11–8')).toBeInTheDocument();
    expect(screen.getByText(/1 bản ghi trận đấu không đọc được/)).toBeInTheDocument();
  });
});
