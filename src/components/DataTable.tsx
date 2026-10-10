import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export type Column<Row> = {
  id: string;
  header: string;
  render(row: Row): ReactNode;
};

export type DataTableProps<Row> = {
  caption: string;
  rows: Row[];
  columns: Column<Row>[];
  rowKey(row: Row): string;
  emptyMessage?: string;
};

export function DataTable<Row>({
  caption,
  rows,
  columns,
  rowKey,
  emptyMessage = 'Chưa có dữ liệu',
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }
  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.id} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.id}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
