import { useMemo, useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import '../activities.css';

type AssetRow = TeamData['assets'][number];

const quantityText = (value: string | number) =>
  typeof value === 'string' && value.trim() === '' ? '—' : String(value);

const assetColumns: Column<AssetRow>[] = [
  { id: 'name', header: 'Dụng cụ', render: (row) => row.name },
  { id: 'purchased', header: 'Đã mua', render: (row) => quantityText(row.purchased) },
  { id: 'remaining', header: 'Còn lại', render: (row) => quantityText(row.remaining) },
  {
    id: 'used',
    header: 'Đã dùng / mất',
    render: (row) => quantityText(row.usedOrLost),
  },
  { id: 'unit', header: 'Đơn vị', render: (row) => row.unit || '—' },
  { id: 'date', header: 'Ngày mua', render: (row) => formatDate(row.purchasedAt) },
  { id: 'holder', header: 'Người giữ', render: (row) => row.holder || '—' },
  { id: 'status', header: 'Tình trạng', render: (row) => row.status || '—' },
  { id: 'value', header: 'Giá trị', render: (row) => formatVnd(row.value) },
];

export function AssetsPage({ data }: PageProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('vi');
  const statuses = useMemo(
    () =>
      [...new Set(data.assets.map((row) => row.status))]
        .filter((status) => status.trim() !== '')
        .sort((left, right) => left.localeCompare(right, 'vi')),
    [data.assets],
  );
  const filtered = data.assets.filter(
    (row) =>
      (!normalizedQuery ||
        row.name.toLocaleLowerCase('vi').includes(normalizedQuery)) &&
      (!statusFilter || row.status === statusFilter),
  );
  const hasFilters = normalizedQuery !== '' || statusFilter !== '';
  const resetFilters = () => {
    setQuery('');
    setStatusFilter('');
  };

  return (
    <div className="page">
      <header className="page-head">
        <h2>Dụng cụ</h2>
        <p>Số lượng và tình trạng được hiển thị nguyên theo dữ liệu của đội.</p>
      </header>

      <section className="block" aria-labelledby="assets-title">
        <div className="section-heading">
          <h3 id="assets-title">Danh sách dụng cụ</h3>
          <div className="filters" aria-label="Bộ lọc dụng cụ">
            <label>
              <span>Tìm dụng cụ</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nhập tên dụng cụ"
              />
            </label>
            <label>
              <span>Tình trạng</span>
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

        {filtered.length === 0 && hasFilters ? (
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
            caption="Danh sách dụng cụ"
            rows={filtered}
            columns={assetColumns}
            rowKey={(row) => row.id}
            emptyMessage="Chưa có dữ liệu dụng cụ"
          />
        )}
      </section>
    </div>
  );
}
