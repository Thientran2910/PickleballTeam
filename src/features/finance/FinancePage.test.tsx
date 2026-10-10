import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { FinancePage } from './FinancePage';

describe('FinancePage', () => {
  it('selects a historical period and updates visible totals', () => {
    const data = makeTeamData();
    const base = data.income[0];
    data.income = [
      base,
      {
        ...base,
        period: 'LS-2025-A',
        member: 'Bình Lịch Sử',
        required: 1_000_000,
        paid: 700_000,
        missing: 300_000,
      },
    ];
    render(<FinancePage data={data} />);

    fireEvent.change(screen.getByLabelText('Kỳ đóng quỹ'), {
      target: { value: 'LS-2025-A' },
    });

    const incomeTable = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    expect(within(incomeTable).getByText('Bình Lịch Sử')).toBeInTheDocument();
    expect(
      within(incomeTable).queryByText('An Thử Nghiệm'),
    ).not.toBeInTheDocument();
    const missingCard = screen
      .getByText('Còn thiếu (đang lọc)')
      .closest('.stat-card') as HTMLElement;
    expect(missingCard.textContent).toContain(formatVnd(300_000));
  });

  it('follows a refreshed current period unless a valid history choice is active', () => {
    const initial = makeTeamData();
    const oldCurrent = initial.income[0];
    const historical = { ...oldCurrent, period: 'LS-2025-A' };
    initial.income = [oldCurrent, historical];
    const { rerender } = render(<FinancePage data={initial} />);

    const periodSelect = screen.getByLabelText('Kỳ đóng quỹ');
    const refreshed = makeTeamData();
    refreshed.overview.fundPeriod = 'TEST-2026-11';
    refreshed.income = [
      { ...oldCurrent, period: 'TEST-2026-11' },
      historical,
    ];
    rerender(<FinancePage data={refreshed} />);
    expect(periodSelect).toHaveValue('TEST-2026-11');

    fireEvent.change(periodSelect, { target: { value: 'LS-2025-A' } });
    const nextRefresh = makeTeamData();
    nextRefresh.overview.fundPeriod = 'TEST-2026-12';
    nextRefresh.income = [
      { ...oldCurrent, period: 'TEST-2026-12' },
      historical,
    ];
    rerender(<FinancePage data={nextRefresh} />);
    expect(periodSelect).toHaveValue('LS-2025-A');
  });

  it('does not expose fields that are absent from the API', () => {
    render(<FinancePage data={makeTeamData()} />);

    expect(screen.queryByText('Nội dung khoản chi')).not.toBeInTheDocument();
    expect(screen.queryByText('Chứng từ')).not.toBeInTheDocument();
  });

  it('distinguishes filtered empty results from an empty source', () => {
    const data = makeTeamData();
    data.income = [
      data.income[0],
      {
        ...data.income[0],
        member: 'Bình Thử Nghiệm',
        status: 'Còn thiếu',
      },
    ];
    const { rerender } = render(<FinancePage data={data} />);
    fireEvent.change(screen.getByLabelText('Thành viên đóng'), {
      target: { value: 'An Thử Nghiệm' },
    });
    fireEvent.change(screen.getByLabelText('Trạng thái đóng'), {
      target: { value: 'Còn thiếu' },
    });

    expect(screen.getByText('Không có kết quả phù hợp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Xóa bộ lọc thu quỹ' }),
    ).toBeInTheDocument();

    const emptyData = makeTeamData({ income: [] });
    rerender(<FinancePage data={emptyData} />);
    expect(screen.getAllByText('Chưa có dữ liệu').length).toBeGreaterThan(0);
  });
});
