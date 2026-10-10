import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { useBrowserLikeDialog } from '../members/dialogTestEnv';
import { FinancePage } from './FinancePage';

function withHistory() {
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
      status: 'Chưa đóng',
    },
  ];
  data.members = [
    ...data.members,
    { ...data.members[0], name: 'Bình Lịch Sử', missing: 300_000 },
  ];
  return data;
}

describe('FinancePage', () => {
  useBrowserLikeDialog();
  it('starts on all fund periods, including the historical one', () => {
    const data = withHistory();
    render(<FinancePage data={data} />);

    expect(screen.getByLabelText('Lọc đợt quỹ')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Tất cả đợt quỹ' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    expect(within(table).getByText('LS-2025-A')).toBeInTheDocument();
    expect(within(table).getByText('TEST-2026-10')).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain('2 dòng');
  });

  it('filters by a chosen period and scopes the totals', () => {
    render(<FinancePage data={withHistory()} />);
    fireEvent.change(screen.getByLabelText('Lọc đợt quỹ'), {
      target: { value: 'LS-2025-A' },
    });

    const table = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    expect(within(table).getByText('LS-2025-A')).toBeInTheDocument();
    expect(within(table).queryByText('TEST-2026-10')).not.toBeInTheDocument();
    const summary = screen.getByRole('status').textContent ?? '';
    expect(summary).toContain('1 dòng');
    expect(summary).toContain(`còn thiếu ${formatVnd(300_000)}`);
  });

  it('searches rows and tells filtered-empty apart from an empty source', () => {
    const data = withHistory();
    const { rerender } = render(<FinancePage data={data} />);
    fireEvent.change(screen.getByLabelText('Tìm giao dịch'), {
      target: { value: 'lịch sử' },
    });
    const table = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    expect(within(table).queryByText('An Thử Nghiệm')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm giao dịch'), {
      target: { value: 'không có ai tên vậy' },
    });
    expect(screen.getByText('Không có kết quả phù hợp')).toBeInTheDocument();

    rerender(<FinancePage data={makeTeamData({ income: [] })} />);
    fireEvent.change(screen.getByLabelText('Tìm giao dịch'), { target: { value: '' } });
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });

  it('switches between the four tabs with their own controls', () => {
    const data = makeTeamData();
    data.refunds = [
      { date: '2026-10-05', member: 'An Thử Nghiệm', expenseId: 'EXP-TEST-001', amount: 100_000, method: 'Chuyển khoản' },
      { date: '2026-10-06', member: 'An Thử Nghiệm', expenseId: 'EXP-TEST-002', amount: 'chưa rõ', method: '' },
    ];
    render(<FinancePage data={data} />);
    expect(screen.queryByLabelText('Lọc tháng')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Chi quỹ' }));
    expect(screen.queryByLabelText('Lọc đợt quỹ')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Lọc tháng')).toHaveValue('');
    const expenses = screen.getByRole('table', { name: 'Danh sách chi quỹ' });
    expect(within(expenses).getByText('Sân thử nghiệm')).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain(
      `Chi phí ghi nhận ${formatVnd(400_000)} · chi từ quỹ ${formatVnd(300_000)}`,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Công nợ' }));
    const advances = screen.getByRole('table', { name: 'Công nợ theo thành viên' });
    expect(within(advances).getByRole('columnheader', { name: 'Còn phải hoàn' })).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain(`Còn phải hoàn ${formatVnd(0)}`);

    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử hoàn ứng' }));
    const refunds = screen.getByRole('table', { name: 'Lịch sử hoàn ứng' });
    expect(within(refunds).getByText('EXP-TEST-001')).toBeInTheDocument();
    expect(screen.getByLabelText('Lọc tháng')).toBeInTheDocument();
    const summary = screen.getByRole('status').textContent ?? '';
    expect(summary).toContain(`Đã hoàn ${formatVnd(100_000)}`);
    expect(summary).toContain('1 dòng chưa có số tiền');
  });

  it('filters expenses by month', () => {
    const data = makeTeamData();
    data.expenses = [
      data.expenses[0],
      { ...data.expenses[0], id: 'EXP-OLD', date: '2026-08-12', category: 'Nước cũ' },
    ];
    render(<FinancePage data={data} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chi quỹ' }));
    fireEvent.change(screen.getByLabelText('Lọc tháng'), { target: { value: '2026-08' } });

    const table = screen.getByRole('table', { name: 'Danh sách chi quỹ' });
    expect(within(table).getByText('Nước cũ')).toBeInTheDocument();
    expect(within(table).queryByText('Sân thử nghiệm')).not.toBeInTheDocument();
  });

  it('opens the shared member dialog from a member link and closes it by button or Escape', () => {
    render(<FinancePage data={makeTeamData()} />);
    const table = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    fireEvent.click(within(table).getByRole('button', { name: 'An Thử Nghiệm' }));

    const dialog = screen.getByRole('dialog', { name: 'An Thử Nghiệm' });
    expect(within(dialog).getByText('Đóng quỹ theo đợt')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng hồ sơ' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(within(table).getByRole('button', { name: 'An Thử Nghiệm' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the top stats from the overview and does not expose absent fields', () => {
    const data = makeTeamData();
    data.advances = [
      { member: 'A', advanced: 3, refunded: 1, remaining: 2, status: 'Còn nợ' },
      { member: 'B', advanced: 4, refunded: 1, remaining: 3, status: 'Còn nợ' },
    ];
    render(<FinancePage data={data} />);

    const stats = document.querySelector('.stats') as HTMLElement;
    expect(stats.textContent).toContain(formatVnd(data.overview.balance));
    expect(stats.textContent).toContain(formatVnd(5));
    expect(screen.queryByText('Nội dung khoản chi')).not.toBeInTheDocument();
    expect(screen.queryByText('Chứng từ')).not.toBeInTheDocument();
  });

  it('filters the refund tab by months of the refund dates, not the expense dates', () => {
    const data = makeTeamData();
    data.expenses = [{ ...data.expenses[0], date: '2026-10-04' }];
    data.refunds = [
      { date: '2026-07-05', member: 'An Thử Nghiệm', expenseId: 'EXP-JUL', amount: 100_000, method: 'Tiền mặt' },
      { date: '2026-10-06', member: 'An Thử Nghiệm', expenseId: 'EXP-OCT', amount: 50_000, method: 'Tiền mặt' },
    ];
    render(<FinancePage data={data} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử hoàn ứng' }));

    const select = screen.getByLabelText('Lọc tháng');
    expect(within(select).getByRole('option', { name: '2026-07' })).toBeInTheDocument();
    fireEvent.change(select, { target: { value: '2026-07' } });
    const table = screen.getByRole('table', { name: 'Lịch sử hoàn ứng' });
    expect(within(table).getByText('EXP-JUL')).toBeInTheDocument();
    expect(within(table).queryByText('EXP-OCT')).not.toBeInTheDocument();
  });

  it('keeps the expense month list on the expense tab when refunds are in other months', () => {
    const data = makeTeamData();
    data.expenses = [{ ...data.expenses[0], date: '2026-10-04' }];
    data.refunds = [{ date: '2026-07-05', member: 'An Thử Nghiệm', expenseId: 'X', amount: 1, method: '' }];
    render(<FinancePage data={data} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chi quỹ' }));
    const select = screen.getByLabelText('Lọc tháng');
    expect(within(select).getByRole('option', { name: '2026-10' })).toBeInTheDocument();
    expect(within(select).queryByRole('option', { name: '2026-07' })).not.toBeInTheDocument();
  });

  it('renders names missing from the member list as plain text instead of dead buttons', () => {
    const data = makeTeamData();
    data.refunds = [
      { date: '2026-10-05', member: 'Người Lạ', expenseId: 'EXP-1', amount: 1, method: '' },
    ];
    data.advances = [
      { member: 'Người Lạ', advanced: 1, refunded: 0, remaining: 1, status: 'Còn nợ' },
    ];
    render(<FinancePage data={data} />);

    fireEvent.click(screen.getByRole('button', { name: 'Lịch sử hoàn ứng' }));
    let table = screen.getByRole('table', { name: 'Lịch sử hoàn ứng' });
    expect(within(table).getByText('Người Lạ')).toBeInTheDocument();
    expect(within(table).queryByRole('button', { name: 'Người Lạ' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Công nợ' }));
    table = screen.getByRole('table', { name: 'Công nợ theo thành viên' });
    expect(within(table).queryByRole('button', { name: 'Người Lạ' })).not.toBeInTheDocument();
  });

  it('returns focus to the member button after the dialog closes', () => {
    render(<FinancePage data={makeTeamData()} />);
    const table = screen.getByRole('table', { name: 'Danh sách thu quỹ' });
    const opener = within(table).getByRole('button', { name: 'An Thử Nghiệm' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', { name: 'Đóng hồ sơ' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
