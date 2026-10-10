import { useMemo } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import '../activities.css';
import { toSessionView, type SessionView } from './adapters';

type SessionRow = SessionView & { courts: number | null; guests: number | null };

const EMPTY_SUBTITLE = 'Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet.';

// Unknown or unreadable counts stay null so they are never summed as zero.
function countOrNull(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function integer(value: number): string {
  return value.toLocaleString('vi-VN');
}

const countCell = (value: number | null) => (value === null ? '—' : integer(value));

const sessionColumns: Column<SessionRow>[] = [
  { id: 'date', header: 'Ngày', render: (row) => formatDate(row.date) },
  { id: 'activity', header: 'Hoạt động', render: (row) => row.activity },
  { id: 'court', header: 'Sân', render: (row) => row.court },
  {
    id: 'time',
    header: 'Giờ',
    render: (row) => `${row.start} – ${row.end}`,
  },
  { id: 'courts', header: 'Số sân', render: (row) => countCell(row.courts) },
  {
    id: 'attendance',
    header: 'Thành viên',
    render: (row) => countCell(row.attendanceCount),
  },
  { id: 'guests', header: 'Khách', render: (row) => countCell(row.guests) },
  {
    id: 'cost',
    header: 'Chi phí',
    render: (row) => (row.totalCost === null ? '—' : formatVnd(row.totalCost)),
  },
  {
    id: 'status',
    header: 'Trạng thái',
    render: (row) => <span className="tag">{row.status}</span>,
  },
];

function total(values: (number | null)[]): { sum: number; unknown: number } {
  let sum = 0;
  let unknown = 0;
  for (const value of values) {
    if (value === null) unknown += 1;
    else sum += value;
  }
  return { sum, unknown };
}

function Stat({
  value,
  unknown,
  label,
}: {
  value: string;
  unknown: number;
  label: string;
}) {
  return (
    <div className="stat">
      <span className="money">{value}</span>
      <small>
        {label}
        {unknown > 0 ? ` · ${unknown} buổi chưa ghi` : ''}
      </small>
    </div>
  );
}

export function SessionsPage({ data }: PageProps) {
  const { sessions, invalidCount } = useMemo(() => {
    const readable: SessionRow[] = [];
    let rejected = 0;
    for (const row of data.sessions) {
      const result = toSessionView(row);
      if (result.ok) {
        readable.push({
          ...result.value,
          courts: countOrNull(row.courts),
          guests: countOrNull(row.guests),
        });
      } else {
        rejected += 1;
      }
    }
    readable.sort((left, right) => right.date.localeCompare(left.date));
    return { sessions: readable, invalidCount: rejected };
  }, [data.sessions]);

  const members = total(sessions.map((row) => row.attendanceCount));
  const costs = total(sessions.map((row) => row.totalCost));
  const guests = total(sessions.map((row) => row.guests));

  return (
    <div className="page activity-page">
      <div className="page-title">
        <h2 className="eyebrow">
          <span aria-hidden="true">TEAM ATLAS · 05 / </span>Lịch chơi
        </h2>
        <h1>
          Hẹn nhau.
          <br />
          <em>Trên sân.</em>
        </h1>
        <p className="muted">Lịch buổi chơi, số người tham gia và chi phí theo buổi.</p>
      </div>

      <div className="stats">
        <Stat value={integer(sessions.length)} unknown={0} label="Buổi đã ghi nhận" />
        <Stat
          value={integer(members.sum)}
          unknown={members.unknown}
          label="Lượt thành viên tham gia"
        />
        <Stat
          value={formatVnd(costs.sum)}
          unknown={costs.unknown}
          label="Tổng chi theo buổi"
        />
        <Stat
          value={integer(guests.sum)}
          unknown={guests.unknown}
          label="Lượt khách tham gia"
        />
      </div>

      {invalidCount > 0 ? (
        <p className="data-warning" role="status">
          {invalidCount} bản ghi lịch chơi không đọc được và đã được bỏ qua.
        </p>
      ) : null}

      {sessions.length > 0 ? (
        <DataTable
          caption="Lịch chơi"
          rows={sessions}
          columns={sessionColumns}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title={
            data.sessions.length > 0 ? 'Không có bản ghi lịch chơi hợp lệ' : 'Chưa có dữ liệu'
          }
          description={data.sessions.length === 0 ? EMPTY_SUBTITLE : undefined}
        />
      )}
    </div>
  );
}
