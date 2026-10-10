import { useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatRatio, formatVnd } from '../../lib/format';
import { selectMembers } from './selectors';
import './members.css';

type MemberRow = TeamData['members'][number];

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

const memberColumns: Column<MemberRow>[] = [
  { id: 'name', header: 'Thành viên', render: (row) => row.name },
  { id: 'status', header: 'Trạng thái', render: (row) => row.status },
  { id: 'joinedAt', header: 'Tham gia từ', render: (row) => formatDate(row.joinedAt) },
  { id: 'required', header: 'Phải đóng', render: (row) => formatVnd(row.required) },
  { id: 'paid', header: 'Đã đóng', render: (row) => formatVnd(row.paid) },
  { id: 'missing', header: 'Còn thiếu', render: (row) => formatVnd(row.missing) },
  { id: 'currentPeriodStatus', header: 'Kỳ hiện tại', render: (row) => row.currentPeriodStatus },
  { id: 'sessions', header: 'Số buổi', render: (row) => row.sessions },
  {
    id: 'matches',
    header: 'Số trận',
    render: (row) => (row.matches === 0 ? 'Chưa thi đấu' : row.matches),
  },
  { id: 'wins', header: 'Thắng', render: (row) => row.wins },
  { id: 'losses', header: 'Thua', render: (row) => row.losses },
  {
    id: 'winRate',
    header: 'Tỷ lệ thắng',
    render: (row) => (row.matches === 0 ? '—' : formatRatio(row.winRate)),
  },
];

export function MembersPage({ data }: PageProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = selectMembers(data.members, query, status);
  const filterActive = Boolean(query.trim() || status);

  const clearFilters = () => {
    setQuery('');
    setStatus('');
  };

  return (
    <div className="page members-page">
      <header className="page-head">
        <h2>Thành viên</h2>
        <p>Tài chính và thành tích của từng thành viên theo số liệu API.</p>
      </header>

      <section className="block" aria-labelledby="members-list-title">
        <div>
          <h3 id="members-list-title">Danh sách thành viên</h3>
          <p className="block-note">Khoản còn thiếu được hiển thị nguyên từ Sheet, không tính bù giữa các kỳ.</p>
        </div>
        <div className="member-filters" aria-label="Bộ lọc thành viên">
          <label>
            Tìm thành viên
            <input
              type="search"
              value={query}
              placeholder="Nhập tên"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            Trạng thái thành viên
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {unique(data.members.map((row) => row.status)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        {data.members.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : rows.length === 0 && filterActive ? (
          <EmptyState
            title="Không có kết quả phù hợp"
            action={<button type="button" className="btn btn-ghost" onClick={clearFilters}>Xóa bộ lọc thành viên</button>}
          />
        ) : (
          <DataTable
            caption="Danh sách thành viên"
            rows={rows}
            columns={memberColumns}
            rowKey={(row) => row.name}
          />
        )}
      </section>
    </div>
  );
}
