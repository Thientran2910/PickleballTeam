import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { MembersPage } from './MembersPage';

describe('MembersPage', () => {
  it('shows reported missing amount rather than recomputing it', () => {
    const data = makeTeamData();
    data.members = [
      {
        ...data.members[0],
        name: 'An',
        required: 2_000_000,
        paid: 1_070_000,
        missing: 1_000_000,
      },
    ];
    render(<MembersPage data={data} />);

    const table = screen.getByRole('table', { name: 'Danh sách thành viên' });
    expect(table.textContent).toContain(formatVnd(1_000_000));
    expect(table.textContent).not.toContain(formatVnd(930_000));
  });

  it('searches names case-insensitively and filters status', () => {
    const data = makeTeamData();
    data.members = [
      { ...data.members[0], name: 'Ánh', status: 'Đang hoạt động' },
      { ...data.members[0], name: 'Bình', status: 'Tạm nghỉ' },
    ];
    render(<MembersPage data={data} />);

    fireEvent.change(screen.getByLabelText('Tìm thành viên'), {
      target: { value: 'áNH' },
    });
    expect(screen.getByText('Ánh')).toBeInTheDocument();
    expect(screen.queryByText('Bình')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm thành viên'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Trạng thái thành viên'), {
      target: { value: 'Tạm nghỉ' },
    });
    expect(screen.getByText('Bình')).toBeInTheDocument();
    expect(screen.queryByText('Ánh')).not.toBeInTheDocument();
  });

  it('does not award a rate to a member without matches', () => {
    const data = makeTeamData();
    data.members = [
      {
        ...data.members[0],
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
      },
    ];
    render(<MembersPage data={data} />);

    const table = screen.getByRole('table', { name: 'Danh sách thành viên' });
    expect(within(table).getByText('Chưa thi đấu')).toBeInTheDocument();
    expect(within(table).getByText('—')).toBeInTheDocument();
    expect(within(table).queryByText('0%')).not.toBeInTheDocument();
  });
});
