import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTeamData } from '../../test/fixtures';
import { RankingPage } from './RankingPage';

describe('RankingPage', () => {
  it('leaves players with zero matches out of the ranking instead of awarding a rank', () => {
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
    expect(screen.queryByText('Bình Thử Nghiệm')).not.toBeInTheDocument();
    expect(screen.getByText('Chưa có trận đấu được ghi nhận')).toBeInTheDocument();
  });

  it('keeps the upstream ranking order', () => {
    const data = makeTeamData();
    data.ranking = [
      { ...data.ranking[0], member: 'Người đứng sau', rank: '2', matches: 2 },
      { ...data.ranking[0], member: 'Người đứng trước', rank: '1', matches: 3 },
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
    expect(screen.getByText('Người A & Người B')).toBeInTheDocument();
    expect(screen.getByText('11 : 8')).toBeInTheDocument();
    expect(screen.getByText('Hợp lệ')).toBeInTheDocument();
    expect(screen.getByText(/1 bản ghi trận đấu không đọc được/)).toBeInTheDocument();
  });

  it('searches match results by player name', () => {
    const match = (a: string, c: string) => ({
      date: '2026-10-09',
      team1Player1: a,
      team1Player2: 'Người B',
      team2Player1: c,
      team2Player2: 'Người D',
      team1Score: 11,
      team2Score: 8,
      winner: 'Đội 1',
      validation: 'Hợp lệ',
      sessionId: '',
    });
    render(
      <RankingPage
        data={makeTeamData({ matches: [match('Hùng', 'Lan'), match('Minh', 'Nga')] })}
      />,
    );
    fireEvent.change(screen.getByLabelText('Tìm trận đấu'), {
      target: { value: 'nga' },
    });
    expect(screen.getByText('Người D', { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(/Hùng/)).not.toBeInTheDocument();
    expect(screen.getByText(/Minh/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tìm trận đấu'), {
      target: { value: 'không có' },
    });
    expect(screen.getByText('Không có kết quả phù hợp')).toBeInTheDocument();
  });

  it('shows the reference empty state when there are no matches', () => {
    render(<RankingPage data={makeTeamData({ matches: [] })} />);
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });
});
