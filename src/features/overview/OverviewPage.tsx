import type { PageProps, TeamData } from '../../data/schema';
import { formatDate, formatDayWithWeekday, formatVnd } from '../../lib/format';
import { monthKey, vietnamDayKey } from '../finance/selectors';
import { useMemberProfile } from '../members/useMemberProfile';
import { toSessionView, type SessionView } from '../sessions/adapters';
import { useSessionDetail } from '../sessions/useSessionDetail';

type Expense = TeamData['expenses'][number];

const MAX_MONTHS = 8;
const MAX_CATEGORIES = 6;
const MAX_RECENT = 5;
const MAX_UPCOMING = 3;

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${month}/${year}`;
}

function shortMonthLabel(key: string): string {
  return `${key.slice(5)}/${key.slice(2, 4)}`;
}

function compactVnd(value: number): string {
  return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}tr`;
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
    .map((expense) => ({ expense, day: vietnamDayKey(expense.date) ?? '' }))
    .sort((a, b) => b.day.localeCompare(a.day))
    .map(({ expense }) => expense)
    .slice(0, MAX_RECENT);
}

const vietnamClockFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Ho_Chi_Minh',
});

/** Sessions that have not ended yet: later days, or today with an end time still ahead. */
function upcomingSessions(rows: TeamData['sessions'], now: Date) {
  const today = vietnamDayKey(now.toISOString()) ?? '';
  const clock = vietnamClockFormatter.format(now);
  const upcoming: { session: SessionView; day: string }[] = [];
  for (const row of rows) {
    const result = toSessionView(row);
    if (!result.ok) continue;
    const day = vietnamDayKey(result.value.date);
    if (!day || day < today) continue;
    const { end } = result.value;
    if (day === today && end !== '—' && end <= clock) continue;
    upcoming.push({ session: result.value, day });
  }
  return upcoming
    .sort((a, b) => a.day.localeCompare(b.day) || a.session.start.localeCompare(b.session.start))
    .slice(0, MAX_UPCOMING)
    .map(({ session }) => session);
}

function MonthlyChart({ months }: { months: { key: string; total: number }[] }) {
  const width = 600;
  const height = 220;
  const max = Math.max(...months.map((m) => m.total), 1);
  const step = 530 / months.length;
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
      <line x1="45" y1="180" x2="585" y2="180" stroke="#dfe3d7" />
      {months.map((m, i) => {
        const barHeight = (m.total / max) * 140;
        const x = 45 + i * step + step * 0.16;
        const mid = x + step * 0.27;
        return (
          <g key={m.key}>
            <rect x={x} y={180 - barHeight} width={step * 0.55} height={barHeight} rx="5" fill="#749177">
              <title>{`${monthLabel(m.key)}: ${formatVnd(m.total)}`}</title>
            </rect>
            <text x={mid} y={170 - barHeight} textAnchor="middle">
              {compactVnd(m.total)}
            </text>
            <text x={mid} y="202" textAnchor="middle">
              {shortMonthLabel(m.key)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function OverviewPage({ data }: PageProps) {
  const { memberLink, dialog } = useMemberProfile(data);
  const { sessionLink, dialog: sessionDialog } = useSessionDetail(data);
  const o = data.overview;
  const months = monthlyExpenses(data.expenses);
  const categories = categoryTotals(data.expenses);
  const categoryMax = Math.max(...categories.map((c) => c.total), 1);
  const recent = recentExpenses(data.expenses);
  const upcoming = upcomingSessions(data.sessions, new Date());
  const missing = data.income.filter(
    (row) => row.period === o.fundPeriod && row.missing > 0,
  );
  const progress =
    o.periodRequired > 0
      ? Math.min(100, Math.max(0, (o.periodPaid / o.periodRequired) * 100))
      : 0;

  return (
    <div className="page overview-page">
      <section className="hero" aria-labelledby="ov-title">
        <div>
          <h2 className="eyebrow" id="ov-eyebrow">
            <span aria-hidden="true">01 / CÙNG CHƠI · CÙNG TIẾN BỘ</span>
            <span className="sr-only">Tổng quan</span>
          </h2>
          <h1 id="ov-title">
            Một đội chơi.
            <br />
            <em>Mọi con số rõ ràng.</em>
          </h1>
          <p>
            Quỹ đội, lịch chơi và thành tích — cùng nhìn lại những buổi ra sân, cùng chuẩn bị
            cho những trận tiếp theo.
          </p>
          <div className="hero-actions">
            <a className="solid" href="#finance">
              Xem quỹ đội ↗
            </a>
            <a className="outline" href="#ranking">
              Thành tích thi đấu →
            </a>
          </div>
        </div>

        <div className="hero-side">
          <section className="panel upcoming" aria-labelledby="ov-upcoming">
            <div className="row">
              <h3 id="ov-upcoming">Lịch thi đấu sắp tới</h3>
              <a href="#sessions">Xem lịch →</a>
            </div>
            {upcoming.length === 0 ? (
              <p className="muted">Chưa có buổi chơi nào sắp tới.</p>
            ) : (
              <ul className="activity-list">
                {upcoming.map((s) => (
                  <li className="activity row" key={s.id}>
                    <div>
                      {sessionLink(
                        s.id,
                        `${formatDayWithWeekday(s.date)} · ${s.start} – ${s.end}`,
                      )}
                      <small>
                        {s.court} · {s.activity}
                      </small>
                    </div>
                    <span className="tag">{s.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="hero-card" aria-labelledby="ov-balance">
            <div className="row">
              <span className="eyebrow" id="ov-balance">
                Quỹ đội hiện có
              </span>
              <span className="tag">{o.fundPeriod}</span>
            </div>
            <div className="big">{formatVnd(o.balance)}</div>
            <p>Tiến độ đóng quỹ đợt {o.fundPeriod}</p>
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
            <div className="row">
              <span>
                {formatVnd(o.periodPaid)} / {formatVnd(o.periodRequired)}
              </span>
              <strong>{Math.round(progress)}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="Thu chi toàn đội">
        <div className="stat">
          <span className="money">{formatVnd(o.totalIncome)}</span>
          <small>Tổng thu quỹ từ khi theo dõi</small>
        </div>
        <div className="stat">
          <span className="money">{formatVnd(o.totalFundOutflow)}</span>
          <small>Tổng tiền đã chi từ quỹ</small>
        </div>
        <div className="stat">
          <span className="money">{o.regularMembers.toLocaleString('vi-VN')}</span>
          <small>Thành viên thường trực</small>
        </div>
        <div className="stat">
          <span className="money">{`${o.fullyPaidMembers}/${o.regularMembers}`}</span>
          <small>Đã đóng đủ đợt hiện tại</small>
        </div>
      </section>

      <div className="section-head">
        <div>
          <h2>Bức tranh của đội</h2>
          <p>Thu–chi và tiến độ quỹ, cập nhật từ sổ chung.</p>
        </div>
        <a className="outline" href="#finance">
          Chi tiết thu–chi →
        </a>
      </div>

      <div className="grid2">
        <div>
          <section className="panel" aria-labelledby="ov-monthly">
            <div className="eyebrow">Chi phí theo tháng</div>
            <h3 id="ov-monthly" style={{ marginTop: 12 }}>
              Mỗi buổi chơi, một phần đóng góp.
            </h3>
            {months.length === 0 ? (
              <p className="muted">Chưa có khoản chi phí có ngày hợp lệ.</p>
            ) : (
              <MonthlyChart months={months} />
            )}
            <div className="footnote">
              Chi phí ghi nhận · gồm chi từ quỹ và các khoản ứng cá nhân.
            </div>
          </section>

          <section className="panel" aria-labelledby="ov-recent">
            <div className="row">
              <h3 id="ov-recent">Giao dịch chi gần đây</h3>
              <a href="#finance">Xem tất cả →</a>
            </div>
            {recent.length === 0 ? (
              <p className="muted">Chưa có khoản chi phí nào.</p>
            ) : (
              <ul className="activity-list">
                {recent.map((e) => (
                  <li className="activity row" key={e.id}>
                    <div>
                      {e.category.trim() || 'Chưa phân loại'}
                      <small>
                        {formatDate(e.date)} · {e.paidBy || 'Chưa ghi người trả'}
                      </small>
                    </div>
                    <strong>{formatVnd(e.recordedExpense)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div>
          <section className="panel dark" aria-labelledby="ov-period">
            <div className="eyebrow">Đợt {o.fundPeriod}</div>
            <h3 id="ov-period" style={{ marginTop: 14 }}>
              Cùng hoàn thành quỹ đội.
            </h3>
            <div className="big metric">{formatVnd(o.periodMissing)}</div>
            <p className="muted">{missing.length} người còn thiếu trong đợt hiện tại.</p>
          </section>

          <section className="panel" aria-labelledby="ov-missing">
            <h3 id="ov-missing">Tiến độ đóng quỹ</h3>
            {missing.length === 0 ? (
              <p className="muted">Mọi người đã hoàn thành đợt quỹ này.</p>
            ) : (
              <ul className="activity-list">
                {missing.map((row) => (
                  <li className="activity row" key={`${row.period}-${row.member}`}>
                    <span>{memberLink(row.member)}</span>
                    <strong className="amount-negative">{formatVnd(row.missing)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="ov-categories">
            <h3 id="ov-categories">Quỹ được dùng vào đâu?</h3>
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
                      <i style={{ width: `${(c.total / categoryMax) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {dialog}
      {sessionDialog}
    </div>
  );
}
