import { useMemo, useState, type ReactNode } from 'react';
import type { PageProps } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import { useMemberProfile } from '../members/useMemberProfile';
import {
  listMonths,
  readRefund,
  searchAdvances,
  searchExpenses,
  searchIncome,
  searchRefunds,
  sumAdvanceRemaining,
  summarizeExpenses,
  summarizeIncome,
  summarizeRefunds,
  type FinanceTab,
} from './selectors';
import '../../styles/tables.css';
import './finance.css';

const TABS: ReadonlyArray<{ id: FinanceTab; label: string }> = [
  { id: 'income', label: 'Thu quỹ' },
  { id: 'expenses', label: 'Chi quỹ' },
  { id: 'advances', label: 'Công nợ' },
  { id: 'refunds', label: 'Lịch sử hoàn ứng' },
];

const TABLE_LABELS: Record<FinanceTab, string> = {
  income: 'Danh sách thu quỹ',
  expenses: 'Danh sách chi quỹ',
  advances: 'Công nợ theo thành viên',
  refunds: 'Lịch sử hoàn ứng',
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function Tag({ warn, children }: { warn?: boolean; children: ReactNode }) {
  return <span className={warn ? 'tag warn' : 'tag'}>{children}</span>;
}

function Empty({ title, note }: { title: string; note: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {note}
    </div>
  );
}

function FinanceTable({
  label,
  heads,
  rows,
  sourceEmpty,
}: {
  label: string;
  heads: string[];
  rows: ReactNode[][];
  sourceEmpty: boolean;
}) {
  if (rows.length === 0) {
    return sourceEmpty ? (
      <Empty title="Chưa có dữ liệu" note="Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet." />
    ) : (
      <Empty title="Không có kết quả phù hợp" note="Thử đổi từ khóa hoặc bộ lọc." />
    );
  }
  return (
    <div className="table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table aria-label={label}>
        <thead>
          <tr>
            {heads.map((head) => (
              <th key={head} scope="col">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index}>
              {cells.map((cell, cellIndex) => (
                <td key={heads[cellIndex]}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FinancePage({ data }: PageProps) {
  const [tab, setTab] = useState<FinanceTab>('income');
  const [query, setQuery] = useState('');
  // '' is "Tất cả đợt quỹ": the finance period filter starts on all periods.
  const [periodChoice, setPeriodChoice] = useState('');
  const [monthChoice, setMonthChoice] = useState('');

  const periods = useMemo(() => unique(data.income.map((row) => row.period)), [data.income]);
  const expenseMonths = useMemo(() => listMonths(data.expenses.map((row) => row.date)), [data.expenses]);
  const refundMonths = useMemo(
    () => listMonths(data.refunds.map((row) => readRefund(row).date)),
    [data.refunds],
  );
  const months = tab === 'refunds' ? refundMonths : expenseMonths;
  // A choice that vanished after a refresh falls back to "all" instead of an empty table.
  const period = periods.includes(periodChoice) ? periodChoice : '';
  const month = months.includes(monthChoice) ? monthChoice : '';

  const selectTab = (next: FinanceTab) => {
    setTab(next);
    setQuery('');
    setPeriodChoice('');
    setMonthChoice('');
  };

  const { memberLink, dialog } = useMemberProfile(data);

  let heads: string[];
  let rows: ReactNode[][];
  let sourceEmpty: boolean;
  let summary: string;

  if (tab === 'income') {
    const found = searchIncome(data.income, { period, query });
    const totals = summarizeIncome(found);
    heads = ['Đợt quỹ', 'Thành viên', 'Phải đóng', 'Đã đóng', 'Còn thiếu', 'Trạng thái', 'Ngày nhận'];
    rows = found.map((row) => [
      row.period,
      memberLink(row.member),
      formatVnd(row.required),
      formatVnd(row.paid),
      formatVnd(row.missing),
      <Tag warn={row.missing > 0}>{row.status || '—'}</Tag>,
      formatDate(row.receivedAt),
    ]);
    sourceEmpty = data.income.length === 0;
    summary = `${found.length} dòng · Đã thu ${formatVnd(totals.paid)} · còn thiếu ${formatVnd(totals.missing)}`;
  } else if (tab === 'expenses') {
    const found = searchExpenses(data.expenses, { month, query });
    const totals = summarizeExpenses(found);
    heads = ['Ngày chi', 'Nhóm chi', 'Số tiền', 'Người trả', 'Nguồn', 'Quỹ đã chi', 'Cần hoàn'];
    rows = found.map((row) => [
      formatDate(row.date),
      row.category,
      formatVnd(row.amount),
      row.paidBy || '—',
      <Tag>{row.source || '—'}</Tag>,
      formatVnd(row.fundOutflow),
      formatVnd(row.refundRemaining),
    ]);
    sourceEmpty = data.expenses.length === 0;
    summary = `${found.length} dòng · Chi phí ghi nhận ${formatVnd(totals.recordedExpense)} · chi từ quỹ ${formatVnd(totals.fundOutflow)}`;
  } else if (tab === 'advances') {
    const found = searchAdvances(data.advances, query);
    heads = ['Thành viên', 'Đã ứng', 'Đã hoàn', 'Còn phải hoàn', 'Trạng thái'];
    rows = found.map((row) => [
      memberLink(row.member),
      formatVnd(row.advanced),
      formatVnd(row.refunded),
      formatVnd(row.remaining),
      <Tag warn={row.remaining > 0}>{row.status || '—'}</Tag>,
    ]);
    sourceEmpty = data.advances.length === 0;
    summary = `${found.length} dòng · Còn phải hoàn ${formatVnd(sumAdvanceRemaining(found))}`;
  } else {
    const found = searchRefunds(data.refunds, { month, query });
    const totals = summarizeRefunds(found);
    heads = ['Ngày hoàn', 'Người nhận', 'Mã chi', 'Số tiền', 'Phương thức'];
    rows = found.map((row) => [
      formatDate(row.date),
      memberLink(row.member),
      row.expenseId || '—',
      row.amount === null ? '—' : formatVnd(row.amount),
      row.method || '—',
    ]);
    sourceEmpty = data.refunds.length === 0;
    summary = `${found.length} dòng · Đã hoàn ${formatVnd(totals.amount)}${
      totals.unknown > 0 ? ` · ${totals.unknown} dòng chưa có số tiền` : ''
    }`;
  }

  return (
    <div className="page finance-page">
      <div className="page-title">
        <h2 className="eyebrow">
          <span aria-hidden="true">TEAM ATLAS · 02 / </span>Quỹ đội
        </h2>
        <h1>
          Đóng góp chung.
          <br />
          <em>Thu–chi minh bạch.</em>
        </h1>
        <p className="muted">Theo dõi từng đợt đóng quỹ, các khoản chi và hoàn ứng.</p>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="money">{formatVnd(data.overview.balance)}</span>
          <small>Số dư quỹ</small>
        </div>
        <div className="stat">
          <span className="money">{formatVnd(data.overview.totalIncome)}</span>
          <small>Tổng thu</small>
        </div>
        <div className="stat">
          <span className="money">{formatVnd(data.overview.totalFundOutflow)}</span>
          <small>Đã chi từ quỹ</small>
        </div>
        <div className="stat">
          <span className="money">{formatVnd(sumAdvanceRemaining(data.advances))}</span>
          <small>Còn phải hoàn ứng</small>
        </div>
      </div>

      <div className="switcher" role="group" aria-label="Chế độ xem quỹ">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'selected' : undefined}
            aria-pressed={tab === item.id}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="Tìm thành viên, nhóm chi…"
          aria-label="Tìm giao dịch"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {tab === 'income' ? (
          <select
            aria-label="Lọc đợt quỹ"
            value={period}
            onChange={(event) => setPeriodChoice(event.target.value)}
          >
            <option value="">Tất cả đợt quỹ</option>
            {periods.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        ) : null}
        {tab === 'expenses' || tab === 'refunds' ? (
          <select
            aria-label="Lọc tháng"
            value={month}
            onChange={(event) => setMonthChoice(event.target.value)}
          >
            <option value="">Tất cả tháng</option>
            {months.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="footnote" role="status">{summary}</div>
      <FinanceTable label={TABLE_LABELS[tab]} heads={heads} rows={rows} sourceEmpty={sourceEmpty} />
      <p className="footnote">
        Thu quỹ được cộng dồn theo người và đợt; không phải danh sách từng lần chuyển tiền. Chi phí ứng cá nhân và
        tiền đã chi từ quỹ được theo dõi riêng.
      </p>

      {dialog}
    </div>
  );
}
