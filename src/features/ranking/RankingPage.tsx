import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate } from '../../lib/format';
import '../activities.css';
import { toMatchView, type MatchView } from './adapters';

type RankingRow = TeamData['ranking'][number];

function displayValue(value: string | number): string {
  return typeof value === 'string' && value.trim() === '' ? '—' : String(value);
}

function rankCell(row: RankingRow) {
  if (row.matches === 0) return '—';
  const rank = displayValue(row.rank);
  const numericRank =
    typeof row.rank === 'number'
      ? row.rank
      : /^\d+$/.test(row.rank.trim())
        ? Number(row.rank)
        : Number.NaN;
  const isTop = Number.isInteger(numericRank) && numericRank >= 1 && numericRank <= 3;
  return <span className={isTop ? 'rank-badge is-top' : 'rank-badge'}>{rank}</span>;
}

const rankingColumns: Column<RankingRow>[] = [
  { id: 'rank', header: 'Hạng', render: rankCell },
  {
    id: 'member',
    header: 'Thành viên',
    render: (row) => (
      <span className="cell-stack">
        <span>{row.member}</span>
        {row.matches === 0 ? <small>Chưa thi đấu</small> : null}
      </span>
    ),
  },
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
    render: (row) => (row.matches === 0 ? '—' : displayValue(row.winRate)),
  },
];

const matchColumns: Column<MatchView>[] = [
  { id: 'date', header: 'Ngày', render: (row) => formatDate(row.date) },
  { id: 'team1', header: 'Đội 1', render: (row) => row.team1.join(' / ') },
  { id: 'score', header: 'Tỷ số', render: (row) => `${row.score1}–${row.score2}` },
  { id: 'team2', header: 'Đội 2', render: (row) => row.team2.join(' / ') },
  {
    id: 'session',
    header: 'Mã buổi',
    render: (row) => row.sessionId ?? '—',
  },
];

export function RankingPage({ data }: PageProps) {
  const matches: MatchView[] = [];
  let invalidMatches = 0;
  for (const row of data.matches) {
    const result = toMatchView(row);
    if (result.ok) matches.push(result.value);
    else invalidMatches += 1;
  }

  return (
    <div className="page">
      <header className="page-head">
        <h2>Thi đấu</h2>
        <p>Thứ hạng giữ nguyên theo dữ liệu do Sheet cung cấp.</p>
      </header>

      <section className="block" aria-labelledby="ranking-title">
        <h3 id="ranking-title">Bảng xếp hạng</h3>
        <DataTable
          caption="Bảng xếp hạng"
          rows={data.ranking}
          columns={rankingColumns}
          rowKey={(row) => row.member}
          emptyMessage="Chưa có dữ liệu xếp hạng"
        />
      </section>

      <section className="block" aria-labelledby="matches-title">
        <h3 id="matches-title">Lịch sử trận đấu</h3>
        {invalidMatches > 0 ? (
          <p className="data-warning" role="status">
            {invalidMatches} bản ghi trận đấu không đọc được và đã được bỏ qua.
          </p>
        ) : null}
        {data.matches.length > 0 && matches.length === 0 ? (
          <EmptyState title="Không có bản ghi trận đấu hợp lệ" />
        ) : (
          <DataTable
            caption="Lịch sử trận đấu"
            rows={matches}
            columns={matchColumns}
            rowKey={(row) =>
              `${row.date}-${row.team1.join('-')}-${row.team2.join('-')}`
            }
            emptyMessage="Chưa có dữ liệu trận đấu"
          />
        )}
      </section>
    </div>
  );
}
