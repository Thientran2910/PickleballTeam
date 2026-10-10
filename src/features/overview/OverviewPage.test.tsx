import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { OverviewPage } from './OverviewPage';

/** Value shown next to a label, in either the hero card or the stat strip. */
function valueOf(label: string): string {
  const container = screen
    .getAllByText(label)
    .map((el) => el.closest('.row, .stat'))
    .find((el): el is HTMLElement => el !== null);
  if (!container) throw new Error(`No stat labelled ${label}`);
  return within(container).getByText(/\d/).textContent ?? '';
}

describe('OverviewPage', () => {
  it('renders upstream balance separately from period payments', () => {
    const data = makeTeamData();
    data.overview.balance = 1_200_000;
    data.overview.periodPaid = 300_000;
    render(<OverviewPage data={data} />);
    expect(screen.getByText('Số dư quỹ toàn đội')).toBeInTheDocument();
    expect(document.querySelector('.big')?.textContent).toBe(formatVnd(1_200_000));
    expect(valueOf('Đã đóng')).toBe(formatVnd(300_000));
  });

  it('uses upstream values without recomputing and labels outflow correctly', () => {
    const data = makeTeamData();
    render(<OverviewPage data={data} />);
    const o = data.overview;
    expect(valueOf('Tổng thu')).toBe(formatVnd(o.totalIncome));
    expect(valueOf('Chi trực tiếp từ quỹ')).toBe(formatVnd(o.totalFundOutflow));
    expect(valueOf('Đã hoàn ứng')).toBe(formatVnd(o.totalRefunded));
    expect(valueOf('Chi phí ghi nhận')).toBe(formatVnd(o.totalExpenses));
    expect(valueOf('Còn thiếu')).toBe(formatVnd(o.periodMissing));
    expect(valueOf('Thành viên đã đóng đủ')).toBe('1/2');
  });

  it('keeps the Tổng quan heading and links contextual destinations', () => {
    render(<OverviewPage data={makeTeamData()} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tổng quan' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem bảng xếp hạng' })).toHaveAttribute(
      'href',
      '#ranking',
    );
    for (const link of screen.getAllByRole('link', { name: /Xem (quỹ đội|thu quỹ)/ })) {
      expect(link).toHaveAttribute('href', '#finance');
    }
  });

  it('sizes the progress bar from existing paid/required fields', () => {
    const data = makeTeamData();
    data.overview.periodRequired = 800_000;
    data.overview.periodPaid = 200_000;
    render(<OverviewPage data={data} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  it('charts and ranks recorded expenses, not outflow plus refunds', () => {
    const data = makeTeamData();
    const base = data.expenses[0];
    data.expenses = [
      { ...base, id: 'a', date: '2026-09-02', category: 'Sân', recordedExpense: 500_000, fundOutflow: 100_000, refunded: 50_000 },
      { ...base, id: 'b', date: '2026-09-20', category: 'Sân', recordedExpense: 250_000 },
      { ...base, id: 'c', date: '2026-10-04', category: 'Nước', recordedExpense: 100_000 },
      { ...base, id: 'd', date: 'không rõ', category: 'Bóng', recordedExpense: 40_000 },
    ];
    render(<OverviewPage data={data} />);
    const chart = screen.getByRole('img', { name: /Chi phí ghi nhận theo tháng/ });
    expect(chart.getAttribute('aria-label')).toContain(`09/2026: ${formatVnd(750_000)}`);
    expect(chart.getAttribute('aria-label')).toContain(`10/2026: ${formatVnd(100_000)}`);
    expect(chart.getAttribute('aria-label')).not.toContain(formatVnd(40_000));
    const categories = screen.getByRole('heading', { name: 'Chi phí theo hạng mục' })
      .closest('section') as HTMLElement;
    expect(
      within(categories).getByText('Sân').closest('.bar-row')?.textContent,
    ).toContain(formatVnd(750_000));
    expect(within(categories).getByText('Bóng')).toBeInTheDocument();
  });

  it('lists only current-period income rows that are still missing', () => {
    const data = makeTeamData();
    const base = data.income[0];
    data.income = [
      { ...base, member: 'Thiếu A', period: 'TEST-2026-10', missing: 200_000, status: 'Thiếu' },
      { ...base, member: 'Đủ B', period: 'TEST-2026-10', missing: 0, status: 'Đủ' },
      { ...base, member: 'Kỳ cũ C', period: 'TEST-2026-09', missing: 300_000, status: 'Thiếu' },
    ];
    render(<OverviewPage data={data} />);
    const section = screen.getByRole('heading', { name: /Còn thiếu kỳ/ })
      .closest('section') as HTMLElement;
    expect(within(section).getByText('Thiếu A')).toBeInTheDocument();
    expect(within(section).queryByText('Đủ B')).not.toBeInTheDocument();
    expect(within(section).queryByText('Kỳ cũ C')).not.toBeInTheDocument();
  });

  it('shows empty copy instead of invented figures when there are no expenses', () => {
    const data = makeTeamData({ expenses: [] });
    render(<OverviewPage data={data} />);
    expect(screen.queryByRole('img', { name: /Chi phí ghi nhận theo tháng/ })).toBeNull();
    expect(screen.getAllByText('Chưa có khoản chi phí nào.').length).toBe(2);
  });
});
