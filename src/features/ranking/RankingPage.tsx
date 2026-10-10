import { useMemo, useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate } from '../../lib/format';
import '../activities.css';
import { toMatchView, type MatchView } from './adapters';

type RankingRow = TeamData['ranking'][number];

const EMPTY_SUBTITLE = 'Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet.';

function displayValue(value: string | number): string {
  return typeof value === 'string' && value.trim() === '' ? '—' : String(value);
}

function winRateText(value: string | number): string {
  if (typeof value === 'number') {
    return `${(value * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
  }
  return displayValue(value);
}

const rankingColumns: Column<RankingRow>[] = [
  { id: 'rank', header: 'Hạng', render: (row) => displayValue(row.rank) },
  { id: 'member', header: 'Thành viên', render: (row) => row.member },
  { id: 'matches', header: 'Trận', render: (row) => row.matches },
  { id: 'wins', header: 'Thắng', render: (row) => row.wins },
  { id: 'losses', header: 'Thua', render: (row) => row.losses },
  { id: 'pointsFor', header: 'Điểm ghi', render: (row) => row.pointsFor },
  {
    id: 'pointsAgainst',
    header: 'Điểm thua',
    render: (row) => row.pointsAgainst,
  },
  {
    id: 'difference',
    header: 'Hiệu số',
    render: (row) => row.pointDifference,
  },
  {
    id: 'winRate',
    header: 'Tỷ lệ thắng',
    render: (row) => winRateText(row.winRate),
  },
];

const matchColumns: Column<MatchView>[] = [
  { id: 'date', header: 'Ngày', render: (row) => formatDate(row.date) },
  { id: 'team1', header: 'Đội 1', render: (row) => row.team1.join(' & ') },
  {
    id: 'score',
    header: 'Tỷ số',
    render: (row) => `${row.score1} : ${row.score2}`,
  },
  { id: 'team2', header: 'Đội 2', render: (row) => row.team2.join(' & ') },
  {
    id: 'winner',
    header: 'Đội thắng',
    render: (row) => (row.score1 > row.score2 ? 'Đội 1' : 'Đội 2'),
  },
  {
    id: 'validation',
    header: 'Kiểm tra',
    render: () => <span className="tag">Hợp lệ</span>,
  },
];

function integer(value: number): string {
  return value.toLocaleString('vi-VN');
}

export function RankingPage({ data }: PageProps) {
  const [query, setQuery] = useState('');

  const { matches, invalidMatches } = useMemo(() => {
    const readable: MatchView[] = [];
    let rejected = 0;
    for (const row of data.matches) {
      const result = toMatchView(row);
      if (result.ok) readable.push(result.value);
      else rejected += 1;
    }
    return { matches: readable, invalidMatches: rejected };
  }, [data.matches]);

  // A member without matches has no rank; the reference leaves them out.
  const ranked = data.ranking.filter((row) => row.matches > 0);
  const pointsFor = ranked.reduce((total, row) => total + row.pointsFor, 0);

  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  const visibleMatches = normalizedQuery
    ? matches.filter((row) =>
        [...row.team1, ...row.team2]
          .join(' ')
          .toLocaleLowerCase('vi')
          .includes(normalizedQuery),
      )
    : matches;

  return (
    <div className="page activity-page">
      <div className="page-title">
        <h2 className="eyebrow">
          <span aria-hidden="true">TEAM ATLAS · 04 / </span>Thi đấu
        </h2>
        <h1>
          Từng trận đấu.
          <br />
          <em>Từng bước tiến bộ.</em>
        </h1>
        <p className="muted">Bảng xếp hạng theo kết quả được Google Sheet tính toán.</p>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="money">{integer(matches.length)}</span>
          <small>Trận hợp lệ</small>
        </div>
        <div className="stat">
          <span className="money">{integer(ranked.length)}</span>
          <small>Thành viên đã thi đấu</small>
        </div>
        <div className="stat">
          <span className="money">{integer(pointsFor)}</span>
          <small>Điểm cá nhân ghi được</small>
        </div>
        <div className="stat">
          <span className="money">Đánh đôi</span>
          <small>Thể thức theo dõi</small>
        </div>
      </div>

      <section className="panel" aria-labelledby="ranking-title">
        <h3 id="ranking-title">Bảng xếp hạng</h3>
        {ranked.length > 0 ? (
          <DataTable
            caption="Bảng xếp hạng"
            rows={ranked}
            columns={rankingColumns}
            rowKey={(row) => row.member}
          />
        ) : (
          <EmptyState
            title="Chưa có trận đấu được ghi nhận"
            description="Đội sẽ có thứ hạng khi nhập kết quả đánh đôi hợp lệ vào Sheet."
          />
        )}
      </section>

      <div className="section-head">
        <div>
          <h2 id="matches-title">Kết quả trận đôi</h2>
          <p>Hiển thị cả trạng thái kiểm tra; chỉ trận hợp lệ được tính thành tích.</p>
        </div>
      </div>
      <div className="filters">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm người chơi…"
          aria-label="Tìm trận đấu"
        />
      </div>

      {invalidMatches > 0 ? (
        <p className="data-warning" role="status">
          {invalidMatches} bản ghi trận đấu không đọc được và đã được bỏ qua.
        </p>
      ) : null}
      {visibleMatches.length > 0 ? (
        <DataTable
          caption="Kết quả trận đôi"
          rows={visibleMatches}
          columns={matchColumns}
          rowKey={(row) =>
            `${row.date}-${row.team1.join('-')}-${row.team2.join('-')}-${row.sessionId ?? ''}-${row.score1}-${row.score2}`
          }
        />
      ) : (
        <EmptyState
          title={
            data.matches.length > 0 && matches.length === 0
              ? 'Không có bản ghi trận đấu hợp lệ'
              : matches.length > 0
                ? 'Không có kết quả phù hợp'
                : 'Chưa có dữ liệu'
          }
          description={matches.length === 0 && data.matches.length === 0 ? EMPTY_SUBTITLE : undefined}
        />
      )}
    </div>
  );
}
