import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatVnd } from '../../lib/format';

type Expense = TeamData['expenses'][number];

const MAX_MONTHS = 6;
const MAX_MISSING = 6;
const MAX_CATEGORIES = 6;
const MAX_RECENT = 5;

function monthKey(date: string): string | null {
  if (formatDate(date) === '—') return null;
  return date.trim().slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${month}/${year}`;
}

function compactVnd(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  return `${Math.round(value / 1000)}k`;
}

function monthlyExpenses(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    const key = monthKey(e.date);
    if (key) totals.set(key, (totals.get(key) ?? 0) + e.recordedExpense);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-MAX_MONTHS)
    .map(([key, total]) => ({ key, total }));
}

function categoryTotals(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) {
    const name = e.category.trim() || 'Chưa phân loại';
    totals.set(name, (totals.get(name) ?? 0) + e.recordedExpense);
  }
  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_CATEGORIES)
    .map(([name, total]) => ({ name, total }));
}

function recentExpenses(expenses: Expense[]) {
  return [...expenses]
    .sort((a, b) => {
      const ka = monthKey(a.date) ? a.date : '';
      const kb = monthKey(b.date) ? b.date : '';
      return kb.localeCompare(ka);
    })
    .slice(0, MAX_RECENT);
}

function MonthlyChart({ months }: { months: { key: string; total: number }[] }) {
  const width = 600;
  const height = 220;
  const top = 24;
  const bottom = 28;
  const max = Math.max(...months.map((m) => m.total), 0);
  const slot = width / months.length;
  const barWidth = Math.min(56, slot * 0.55);
  const plotHeight = height - top - bottom;
  const summary = months
    .map((m) => `${monthLabel(m.key)}: ${formatVnd(m.total)}`)
    .join('; ');
  return (
    <svg
      className="chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Chi phí ghi nhận theo tháng. ${summary}`}
    >
      <line x1="0" x2={width} y1={height - bottom} y2={height - bottom} stroke="#e0e3da" />
      {months.map((m, i) => {
        const barHeight = max > 0 ? (m.total / max) * plotHeight : 0;
        const x = i * slot + (slot - barWidth) / 2;
        const y = height - bottom - barHeight;
        return (
          <g key={m.key}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill="#c09c69">
              <title>{`${monthLabel(m.key)}: ${formatVnd(m.total)}`}</title>
            </rect>
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle">
              {compactVnd(m.total)}
            </text>
            <text x={x + barWidth / 2} y={height - 10} textAnchor="middle">
              {monthLabel(m.key)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function OverviewPage({ data }: PageProps) {
  const o = data.overview;
  const months = monthlyExpenses(data.expenses);
  const categories = categoryTotals(data.expenses);
  const categoryMax = Math.max(...categories.map((c) => c.total), 0);
  const recent = recentExpenses(data.expenses);
  const missing = data.income
    .filter((row) => row.period === o.fundPeriod && row.missing > 0)
    .sort((a, b) => b.missing - a.missing);
  const progress =
    o.periodRequired > 0
      ? Math.min(100, Math.max(0, (o.periodPaid / o.periodRequired) * 100))
      : 0;

  return (
    <div className="page">
      <section className="hero" aria-labelledby="ov-title">
        <div>
          <h2 className="eyebrow" id="ov-eyebrow">
            Tổng quan
          </h2>
          <h1 id="ov-title">
            Quỹ và hoạt động của <em>đội Pickleball</em>
          </h1>
          <p>Số liệu toàn đội lấy nguyên từ tab Tổng quan của Sheet.</p>
          <div className="hero-actions">
            <a className="solid" href="#finance">
              Xem quỹ đội
            </a>
            <a className="outline" href="#ranking">
              Xem bảng xếp hạng
            </a>
          </div>
        </div>

        <div className="hero-card" aria-labelledby="ov-balance">
          <p className="eyebrow" id="ov-balance">
            Số dư quỹ toàn đội
          </p>
          <p className="big">{formatVnd(o.balance)}</p>
          <p className="muted">Không đổi theo bộ lọc</p>
          <div
            className="progress"
            role="progressbar"
            aria-label={`Tiến độ đóng quỹ kỳ ${o.fundPeriod}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <i style={{ width: `${progress}%` }} />
          </div>
          <p className="eyebrow">Đóng quỹ kỳ {o.fundPeriod}</p>
          <div className="row">
            <span>Cần đóng</span>
            <strong>{formatVnd(o.periodRequired)}</strong>
          </div>
          <div className="row">
            <span>Đã đóng</span>
            <strong>{formatVnd(o.periodPaid)}</strong>
          </div>
          <div className="row">
            <span>Còn thiếu</span>
            <strong>{formatVnd(o.periodMissing)}</strong>
          </div>
          <div className="row">
            <span>Thành viên đã đóng đủ</span>
            <strong>{`${o.fullyPaidMembers}/${o.regularMembers}`}</strong>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Thu chi toàn đội">
        <div className="stat">
          <span className="stat-title">Tổng thu</span>
          <span className="money">{formatVnd(o.totalIncome)}</span>
        </div>
        <div className="stat">
          <span className="stat-title">Chi trực tiếp từ quỹ</span>
          <span className="money">{formatVnd(o.totalFundOutflow)}</span>
          <small>Chưa gồm khoản hoàn ứng</small>
        </div>
        <div className="stat">
          <span className="stat-title">Đã hoàn ứng</span>
          <span className="money">{formatVnd(o.totalRefunded)}</span>
          <small>Tính riêng</small>
        </div>
        <div className="stat">
          <span className="stat-title">Chi phí ghi nhận</span>
          <span className="money">{formatVnd(o.totalExpenses)}</span>
        </div>
      </section>

      <div className="grid2">
        <section className="panel" aria-labelledby="ov-monthly">
          <h3 id="ov-monthly">Chi phí ghi nhận theo tháng</h3>
          {months.length === 0 ? (
            <p className="muted">Chưa có khoản chi phí có ngày hợp lệ.</p>
          ) : (
            <>
              <MonthlyChart months={months} />
              <div className="legend">
                <span>
                  <i className="dot" aria-hidden="true" />
                  Chi phí ghi nhận
                </span>
              </div>
            </>
          )}
        </section>

        <section className="panel" aria-labelledby="ov-recent">
          <div className="row">
            <h3 id="ov-recent">Chi phí gần đây</h3>
            <a className="link-button" href="#finance">
              Xem quỹ đội
            </a>
          </div>
          {recent.length === 0 ? (
            <p className="muted">Chưa có khoản chi phí nào.</p>
          ) : (
            <ul className="activity-list">
              {recent.map((e) => (
                <li className="activity" key={e.id}>
                  <div className="row">
                    <span>{e.category.trim() || 'Chưa phân loại'}</span>
                    <strong className="amount-negative">
                      {formatVnd(e.recordedExpense)}
                    </strong>
                  </div>
                  <small>
                    {formatDate(e.date)}
                    {e.paidBy ? ` · ${e.paidBy}` : ''}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid2">
        <section className="panel" aria-labelledby="ov-missing">
          <div className="row">
            <h3 id="ov-missing">Còn thiếu kỳ {o.fundPeriod}</h3>
            <a className="link-button" href="#finance">
              Xem thu quỹ
            </a>
          </div>
          {missing.length === 0 ? (
            <p className="muted">
              Không có khoản còn thiếu nào trong dữ liệu thu quỹ kỳ {o.fundPeriod}.
            </p>
          ) : (
            <ul className="activity-list">
              {missing.slice(0, MAX_MISSING).map((row) => (
                <li className="activity" key={`${row.period}-${row.member}`}>
                  <div className="row">
                    <span>{row.member}</span>
                    <span>
                      <strong className="amount-negative">
                        {formatVnd(row.missing)}
                      </strong>{' '}
                      <span className="tag warn">{row.status}</span>
                    </span>
                  </div>
                </li>
              ))}
              {missing.length > MAX_MISSING ? (
                <li className="activity muted">
                  và {missing.length - MAX_MISSING} thành viên khác
                </li>
              ) : null}
            </ul>
          )}
        </section>

        <section className="panel" aria-labelledby="ov-categories">
          <h3 id="ov-categories">Chi phí theo hạng mục</h3>
          {categories.length === 0 ? (
            <p className="muted">Chưa có khoản chi phí nào.</p>
          ) : (
            <ul className="bars">
              {categories.map((c) => (
                <li className="bar-row" key={c.name}>
                  <div className="row">
                    <span>{c.name}</span>
                    <strong>{formatVnd(c.total)}</strong>
                  </div>
                  <div className="bar-track" aria-hidden="true">
                    <i
                      style={{
                        width: `${categoryMax > 0 ? (c.total / categoryMax) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
