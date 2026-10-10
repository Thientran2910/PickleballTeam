import { useMemo, useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import '../activities.css';
import { toSessionView, type SessionView } from './adapters';

const sessionColumns: Column<SessionView>[] = [
  { id: 'date', header: 'Ngày', render: (row) => formatDate(row.date) },
  { id: 'activity', header: 'Hoạt động', render: (row) => row.activity },
  { id: 'court', header: 'Sân', render: (row) => row.court },
  {
    id: 'time',
    header: 'Giờ',
    render: (row) => `${row.start}–${row.end}`,
  },
  {
    id: 'attendance',
    header: 'Số người',
    render: (row) => row.attendanceCount ?? '—',
  },
  {
    id: 'cost',
    header: 'Tổng chi phí',
    render: (row) => (row.totalCost === null ? '—' : formatVnd(row.totalCost)),
  },
  { id: 'status', header: 'Trạng thái', render: (row) => row.status },
];

export function SessionsPage({ data }: PageProps) {
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { sessions, invalidCount } = useMemo(() => {
    const readable: SessionView[] = [];
    let rejected = 0;
    for (const row of data.sessions) {
      const result = toSessionView(row);
      if (result.ok) readable.push(result.value);
      else rejected += 1;
    }
    readable.sort((left, right) => right.date.localeCompare(left.date));
    return { sessions: readable, invalidCount: rejected };
  }, [data.sessions]);

  const statuses = useMemo(
    () =>
      [...new Set(sessions.map((row) => row.status))]
        .filter((status) => status !== '—')
        .sort((left, right) => left.localeCompare(right, 'vi')),
    [sessions],
  );
  const filtered = sessions.filter(
    (row) =>
      (!dateFilter || row.date.slice(0, 10) === dateFilter) &&
      (!statusFilter || row.status === statusFilter),
  );
  const hasFilters = dateFilter !== '' || statusFilter !== '';
  const resetFilters = () => {
    setDateFilter('');
    setStatusFilter('');
  };

  return (
    <div className="page">
      <header className="page-head">
        <h2>Lịch chơi</h2>
        <p>Lịch được sắp theo ngày mới nhất; thời gian giữ theo giờ địa phương.</p>
      </header>

      <section className="block" aria-labelledby="sessions-title">
        <div className="section-heading">
          <h3 id="sessions-title">Các buổi chơi</h3>
          <div className="filters" aria-label="Bộ lọc lịch chơi">
            <label>
              <span>Ngày chơi</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
            </label>
            <label>
              <span>Trạng thái</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Tất cả</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {invalidCount > 0 ? (
          <p className="data-warning" role="status">
            {invalidCount} bản ghi lịch chơi không đọc được và đã được bỏ qua.
          </p>
        ) : null}

        {data.sessions.length > 0 && sessions.length === 0 ? (
          <EmptyState title="Không có bản ghi lịch chơi hợp lệ" />
        ) : filtered.length === 0 && hasFilters ? (
          <EmptyState
            title="Không có kết quả phù hợp"
            action={
              <button type="button" className="btn btn-ghost" onClick={resetFilters}>
                Xóa bộ lọc
              </button>
            }
          />
        ) : (
          <DataTable
            caption="Lịch chơi"
            rows={filtered}
            columns={sessionColumns}
            rowKey={(row) => row.id}
            emptyMessage="Chưa có dữ liệu lịch chơi"
          />
        )}
      </section>
    </div>
  );
}
