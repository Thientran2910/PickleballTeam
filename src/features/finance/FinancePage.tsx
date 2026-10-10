import { useEffect, useMemo, useRef, useState } from 'react';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { StatCard } from '../../components/StatCard';
import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';
import {
  selectExpenses,
  selectIncome,
  summarizeExpenses,
  summarizeIncome,
} from './selectors';
import './finance.css';

type IncomeRow = TeamData['income'][number];
type ExpenseRow = TeamData['expenses'][number];
type AdvanceRow = TeamData['advances'][number];

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

const incomeColumns: Column<IncomeRow>[] = [
  { id: 'period', header: 'Kỳ', render: (row) => row.period },
  { id: 'member', header: 'Thành viên', render: (row) => row.member },
  { id: 'required', header: 'Phải đóng', render: (row) => formatVnd(row.required) },
  { id: 'paid', header: 'Đã đóng', render: (row) => formatVnd(row.paid) },
  { id: 'missing', header: 'Còn thiếu', render: (row) => formatVnd(row.missing) },
  { id: 'status', header: 'Trạng thái', render: (row) => row.status },
  { id: 'receivedAt', header: 'Ngày nhận', render: (row) => formatDate(row.receivedAt) },
  { id: 'method', header: 'Hình thức', render: (row) => row.method || '—' },
];

const expenseColumns: Column<ExpenseRow>[] = [
  { id: 'date', header: 'Ngày', render: (row) => formatDate(row.date) },
  { id: 'category', header: 'Nhóm chi', render: (row) => row.category },
  { id: 'amount', header: 'Số tiền', render: (row) => formatVnd(row.amount) },
  { id: 'paidBy', header: 'Người thanh toán', render: (row) => row.paidBy },
  { id: 'source', header: 'Nguồn', render: (row) => row.source },
];

const advanceColumns: Column<AdvanceRow>[] = [
  { id: 'member', header: 'Thành viên', render: (row) => row.member },
  { id: 'advanced', header: 'Đã ứng', render: (row) => formatVnd(row.advanced) },
  { id: 'refunded', header: 'Đã hoàn', render: (row) => formatVnd(row.refunded) },
  { id: 'remaining', header: 'Còn lại', render: (row) => formatVnd(row.remaining) },
  { id: 'status', header: 'Trạng thái', render: (row) => row.status },
];

export function FinancePage({ data }: PageProps) {
  const periodOptions = useMemo(() => {
    const historical = unique(data.income.map((row) => row.period)).filter(
      (value) => value !== data.overview.fundPeriod,
    );
    return [data.overview.fundPeriod, ...historical];
  }, [data.income, data.overview.fundPeriod]);
  const [period, setPeriod] = useState(data.overview.fundPeriod);
  const [member, setMember] = useState('');
  const [incomeStatus, setIncomeStatus] = useState('');
  const previousFundPeriod = useRef(data.overview.fundPeriod);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState('');

  useEffect(() => {
    const previousDefault = previousFundPeriod.current;
    previousFundPeriod.current = data.overview.fundPeriod;
    setPeriod((selected) => {
      if (selected === previousDefault) return data.overview.fundPeriod;
      if (selected && !periodOptions.includes(selected)) {
        return data.overview.fundPeriod;
      }
      return selected;
    });
  }, [data.overview.fundPeriod, periodOptions]);

  const incomeRows = selectIncome(data.income, {
    period,
    member,
    status: incomeStatus,
  });
  const incomeTotals = summarizeIncome(incomeRows);
  const expenseRows = selectExpenses(data.expenses, {
    from,
    to,
    category,
    paidBy,
  });
  const expenseTotals = summarizeExpenses(expenseRows);
  const incomeFilterActive = Boolean(period || member || incomeStatus);
  const expenseFilterActive = Boolean(from || to || category || paidBy);

  const clearIncomeFilters = () => {
    setPeriod('');
    setMember('');
    setIncomeStatus('');
  };
  const clearExpenseFilters = () => {
    setFrom('');
    setTo('');
    setCategory('');
    setPaidBy('');
  };

  return (
    <div className="page finance-page">
      <header className="page-head">
        <h2>Quỹ đội</h2>
        <p>Thu, chi và ứng/hoàn ứng theo sổ quỹ trên Sheet; các khoản được tách riêng, không cộng trùng.</p>
      </header>

      <section className="block" aria-labelledby="finance-income-title">
        <div className="section-heading">
          <div>
            <h3 id="finance-income-title">Thu quỹ</h3>
            <p className="block-note">Tổng bên dưới áp dụng cho danh sách đang lọc.</p>
          </div>
        </div>
        <div className="filter-grid" aria-label="Bộ lọc thu quỹ">
          <label>
            Kỳ đóng quỹ
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="">Tất cả kỳ</option>
              {periodOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Thành viên đóng
            <select value={member} onChange={(event) => setMember(event.target.value)}>
              <option value="">Tất cả thành viên</option>
              {unique(data.income.map((row) => row.member)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái đóng
            <select value={incomeStatus} onChange={(event) => setIncomeStatus(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {unique(data.income.map((row) => row.status)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="stat-grid finance-totals">
          <StatCard label="Phải đóng (đang lọc)" value={formatVnd(incomeTotals.required)} />
          <StatCard label="Đã đóng (đang lọc)" value={formatVnd(incomeTotals.paid)} />
          <StatCard label="Còn thiếu (đang lọc)" value={formatVnd(incomeTotals.missing)} />
        </div>
        {data.income.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : incomeRows.length === 0 && incomeFilterActive ? (
          <EmptyState
            title="Không có kết quả phù hợp"
            action={<button type="button" className="btn btn-ghost" onClick={clearIncomeFilters}>Xóa bộ lọc thu quỹ</button>}
          />
        ) : (
          <DataTable
            caption="Danh sách thu quỹ"
            rows={incomeRows}
            columns={incomeColumns}
            rowKey={(row) => `${row.period}-${row.member}-${row.receivedAt}-${row.method}`}
          />
        )}
      </section>

      <section className="block" aria-labelledby="finance-expense-title">
        <div className="section-heading">
          <div>
            <h3 id="finance-expense-title">Chi quỹ</h3>
            <p className="block-note">Lọc theo ngày chi, không gán khoản chi vào kỳ thu.</p>
          </div>
        </div>
        <div className="filter-grid" aria-label="Bộ lọc chi quỹ">
          <label>
            Từ ngày
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            Đến ngày
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
          <label>
            Nhóm chi
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Tất cả nhóm</option>
              {unique(data.expenses.map((row) => row.category)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Người thanh toán
            <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)}>
              <option value="">Tất cả người thanh toán</option>
              {unique(data.expenses.map((row) => row.paidBy)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="stat-grid finance-totals">
          <StatCard label="Số tiền (đang lọc)" value={formatVnd(expenseTotals.amount)} />
          <StatCard label="Chi phí ghi nhận (đang lọc)" value={formatVnd(expenseTotals.recordedExpense)} />
          <StatCard label="Tiền ra khỏi quỹ (đang lọc)" value={formatVnd(expenseTotals.fundOutflow)} />
          <StatCard label="Đã hoàn ứng (đang lọc)" value={formatVnd(expenseTotals.refunded)} />
          <StatCard label="Còn phải hoàn (đang lọc)" value={formatVnd(expenseTotals.refundRemaining)} />
        </div>
        {data.expenses.length === 0 ? (
          <EmptyState title="Chưa có dữ liệu" />
        ) : expenseRows.length === 0 && expenseFilterActive ? (
          <EmptyState
            title="Không có kết quả phù hợp"
            action={<button type="button" className="btn btn-ghost" onClick={clearExpenseFilters}>Xóa bộ lọc chi quỹ</button>}
          />
        ) : (
          <DataTable
            caption="Danh sách chi quỹ"
            rows={expenseRows}
            columns={expenseColumns}
            rowKey={(row) => row.id}
          />
        )}
      </section>

      <section className="block" aria-labelledby="finance-advance-title">
        <div>
          <h3 id="finance-advance-title">Ứng và hoàn ứng</h3>
          <p className="block-note">Tổng hợp theo thành viên từ dữ liệu ứng hiện có.</p>
        </div>
        <DataTable
          caption="Ứng và hoàn ứng theo thành viên"
          rows={data.advances}
          columns={advanceColumns}
          rowKey={(row) => row.member}
        />
      </section>
    </div>
  );
}
