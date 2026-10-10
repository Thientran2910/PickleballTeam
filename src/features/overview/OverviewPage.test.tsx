import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { OverviewPage } from './OverviewPage';

function valueOf(label: string): string {
  const card = screen.getByText(label).closest('.stat-card') as HTMLElement;
  return within(card).getByText(/\d/).textContent ?? '';
}

describe('OverviewPage', () => {
  it('renders upstream balance separately from period payments', () => {
    const data = makeTeamData();
    data.overview.balance = 1_200_000;
    data.overview.periodPaid = 300_000;
    render(<OverviewPage data={data} />);
    expect(screen.getByText('Số dư quỹ toàn đội')).toBeInTheDocument();
    expect(valueOf('Số dư quỹ toàn đội')).toBe(formatVnd(1_200_000));
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
});
