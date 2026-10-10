import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { useBrowserLikeDialog } from '../members/dialogTestEnv';
import { OverviewPage } from './OverviewPage';

/** Value shown in the stat strip or hero card next to a label. */
function valueOf(label: string): string {
  const container = screen
    .getAllByText(label)
    .map((el) => el.closest('.row, .stat'))
    .find((el): el is HTMLElement => el !== null);
  if (!container) throw new Error(`No stat labelled ${label}`);
  return within(container).getByText(/\d/).textContent ?? '';
}

describe('OverviewPage', () => {
  useBrowserLikeDialog();
  it('renders upstream balance separately from period payments', () => {
    const data = makeTeamData();
    data.overview.balance = 1_200_000;
    data.overview.periodRequired = 750_000;
    data.overview.periodPaid = 300_000;
    render(<OverviewPage data={data} />);
    expect(screen.getByText('Quỹ đội hiện có')).toBeInTheDocument();
    expect(document.querySelector('.big')?.textContent).toBe(formatVnd(1_200_000));
    expect(
      screen.getByText(`${formatVnd(300_000)} / ${formatVnd(750_000)}`),
    ).toBeInTheDocument();
  });

  it('uses upstream values without recomputing', () => {
    const data = makeTeamData();
    render(<OverviewPage data={data} />);
    const o = data.overview;
    expect(valueOf('Tổng thu quỹ từ khi theo dõi')).toBe(formatVnd(o.totalIncome));
    expect(valueOf('Tổng tiền đã chi từ quỹ')).toBe(formatVnd(o.totalFundOutflow));
    expect(valueOf('Đã đóng đủ đợt hiện tại')).toBe('1/2');
    expect(document.querySelector('.metric')?.textContent).toBe(formatVnd(o.periodMissing));
  });

  it('keeps the Tổng quan heading and links contextual destinations', () => {
    render(<OverviewPage data={makeTeamData()} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Tổng quan' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thành tích thi đấu →' })).toHaveAttribute(
      'href',
      '#ranking',
    );
    for (const link of screen.getAllByRole('link', { name: /Xem (quỹ đội|tất cả|thu quỹ)|Chi tiết thu–chi/ })) {
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
    const categories = screen.getByRole('heading', { name: 'Quỹ được dùng vào đâu?' })
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
    const section = screen.getByRole('heading', { name: 'Tiến độ đóng quỹ' })
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

  it('opens the member profile from the missing-dues list', () => {
    const data = makeTeamData();
    data.income[0].missing = 100_000;
    render(<OverviewPage data={data} />);
    fireEvent.click(screen.getByRole('button', { name: 'An Thử Nghiệm' }));
    expect(screen.getByText('HỒ SƠ THÀNH VIÊN')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng hồ sơ' }));
    expect(screen.queryByText('HỒ SƠ THÀNH VIÊN')).not.toBeInTheDocument();
  });

  it('returns focus to the opener after Escape or the close button', () => {
    const data = makeTeamData();
    data.income[0].missing = 100_000;
    render(<OverviewPage data={data} />);
    const opener = screen.getByRole('button', { name: 'An Thử Nghiệm' });
    // Safari does not focus a button on click, so focus is not set before clicking.
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();

    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng hồ sơ' }));
    expect(opener).toHaveFocus();
  });

  it('shows names without a member profile as plain text', () => {
    const data = makeTeamData();
    data.income = [
      { ...data.income[0], member: 'Khách lạ', missing: 100_000 },
    ];
    render(<OverviewPage data={data} />);
    const section = screen.getByRole('heading', { name: 'Tiến độ đóng quỹ' })
      .closest('section') as HTMLElement;
    expect(within(section).getByText('Khách lạ')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Khách lạ' })).toBeNull();
  });

  it('puts an expense paid late on 30/09 UTC into October, like Finance', () => {
    const data = makeTeamData();
    data.expenses = [
      { ...data.expenses[0], id: 'E1', date: '2026-09-30T18:00:00Z', recordedExpense: 500_000 },
    ];
    render(<OverviewPage data={data} />);
    expect(
      screen.getByRole('img', { name: /Chi phí ghi nhận theo tháng\. 10\/2026/ }),
    ).toBeInTheDocument();
  });
});
