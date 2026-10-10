import { StatCard } from '../../components/StatCard';
import type { PageProps } from '../../data/schema';
import { formatVnd } from '../../lib/format';

export function OverviewPage({ data }: PageProps) {
  const o = data.overview;
  return (
    <div className="page">
      <header className="page-head">
        <h2>Tổng quan</h2>
        <p>Số liệu toàn đội lấy nguyên từ tab Tổng quan của Sheet.</p>
      </header>

      <section className="block" aria-labelledby="ov-team">
        <h3 id="ov-team">Quỹ toàn đội</h3>
        <div className="stat-grid">
          <StatCard
            primary
            label="Số dư quỹ toàn đội"
            value={formatVnd(o.balance)}
            note="Không đổi theo bộ lọc"
          />
          <StatCard label="Tổng thu" value={formatVnd(o.totalIncome)} />
          <StatCard
            label="Chi trực tiếp từ quỹ"
            value={formatVnd(o.totalFundOutflow)}
            note="Chưa gồm khoản hoàn ứng"
          />
          <StatCard
            label="Đã hoàn ứng"
            value={formatVnd(o.totalRefunded)}
            note="Tính riêng"
          />
          <StatCard
            label="Chi phí ghi nhận"
            value={formatVnd(o.totalExpenses)}
          />
        </div>
      </section>

      <section className="block" aria-labelledby="ov-period">
        <h3 id="ov-period">Đóng quỹ kỳ {o.fundPeriod}</h3>
        <div className="panel panel-period">
          <div className="stat-grid">
            <StatCard label="Cần đóng" value={formatVnd(o.periodRequired)} />
            <StatCard label="Đã đóng" value={formatVnd(o.periodPaid)} />
            <StatCard label="Còn thiếu" value={formatVnd(o.periodMissing)} />
            <StatCard
              label="Thành viên đã đóng đủ"
              value={`${o.fullyPaidMembers}/${o.regularMembers}`}
              note="Thành viên chính thức"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
