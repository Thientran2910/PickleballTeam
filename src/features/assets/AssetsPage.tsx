import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import '../activities.css';

type AssetRow = TeamData['assets'][number];

const MISSING = 'Chưa ghi';

// Blank source cells stay "missing"; they are never shown as zero.
const quantityText = (value: string | number) =>
  typeof value === 'string' && value.trim() === '' ? MISSING : String(value);

const assetColumns: Column<AssetRow>[] = [
  { id: 'name', header: 'Vật dụng', render: (row) => row.name },
  { id: 'purchased', header: 'SL mua', render: (row) => quantityText(row.purchased) },
  {
    id: 'remaining',
    header: 'SL hiện tại',
    render: (row) => quantityText(row.remaining),
  },
  { id: 'unit', header: 'Đơn vị', render: (row) => row.unit || '—' },
  { id: 'value', header: 'Giá trị mua', render: (row) => formatVnd(row.value) },
  { id: 'holder', header: 'Người giữ', render: (row) => row.holder || MISSING },
  {
    id: 'status',
    header: 'Tình trạng',
    render: (row) => <span className="tag">{row.status || 'Chưa cập nhật'}</span>,
  },
  { id: 'date', header: 'Ngày mua', render: (row) => formatDate(row.purchasedAt) },
];

export function AssetsPage({ data }: PageProps) {
  return (
    <div className="page activity-page">
      <div className="page-title">
        <h2 className="eyebrow">
          <span aria-hidden="true">TEAM ATLAS · 06 / </span>Dụng cụ
        </h2>
        <h1>
          Đồ dùng chung.
          <br />
          <em>Giữ gìn cùng nhau.</em>
        </h1>
        <p className="muted">Số lượng hiện có, tình trạng và người giữ tài sản của đội.</p>
      </div>

      {data.assets.length > 0 ? (
        <DataTable
          caption="Danh sách dụng cụ"
          rows={data.assets}
          columns={assetColumns}
          rowKey={(row) => row.id}
        />
      ) : (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet."
        />
      )}

      <p className="footnote">
        Ô chưa ghi được giữ nguyên trạng thái thiếu dữ liệu. Giá trị tài sản không được
        cộng thêm vào tổng chi quỹ.
      </p>
    </div>
  );
}
