import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { formatVnd } from '../../lib/format';
import { makeTeamData } from '../../test/fixtures';
import { MembersPage } from './MembersPage';

describe('MembersPage', () => {
  it('shows the reported missing amount rather than recomputing it', () => {
    const data = makeTeamData();
    data.members = [
      { ...data.members[0], name: 'An', required: 2_000_000, paid: 1_070_000, missing: 1_000_000 },
    ];
    render(<MembersPage data={data} />);

    const card = screen.getByRole('button', { name: /An/ });
    expect(card.textContent).toContain(`Còn thiếu mọi đợt: ${formatVnd(1_000_000)}`);
    expect(card.textContent).not.toContain(formatVnd(930_000));
  });

  it('searches names case-insensitively', () => {
    const data = makeTeamData();
    data.members = [
      { ...data.members[0], name: 'Ánh' },
      { ...data.members[0], name: 'Bình' },
    ];
    render(<MembersPage data={data} />);

    fireEvent.change(screen.getByLabelText('Tìm thành viên'), { target: { value: 'áNH' } });
    expect(screen.getByRole('heading', { name: 'Ánh' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Bình' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tìm thành viên'), { target: { value: 'zzz' } });
    expect(screen.getByText('Không tìm thấy thành viên')).toBeInTheDocument();
  });

  it('does not award a win rate to a member without matches', () => {
    const data = makeTeamData();
    data.members = [{ ...data.members[0], matches: 0, wins: 0, losses: 0, winRate: 0 }];
    render(<MembersPage data={data} />);

    const card = screen.getByRole('button', { name: /An Thử Nghiệm/ });
    expect(within(card).getByText('—')).toBeInTheDocument();
    expect(within(card).queryByText('0%')).not.toBeInTheDocument();
  });

  it('opens the profile dialog with supported statistics and closes it', () => {
    const data = makeTeamData();
    render(<MembersPage data={data} />);
    fireEvent.click(screen.getByRole('button', { name: /An Thử Nghiệm/ }));

    const dialog = screen.getByRole('dialog', { name: 'An Thử Nghiệm' });
    expect(within(dialog).getByText('Trận thắng')).toBeInTheDocument();
    expect(within(dialog).getByText('TEST-2026-10')).toBeInTheDocument();
    expect(dialog.textContent).toContain('Điểm ghi: 31');
    expect(dialog.textContent).toContain('Hiệu số: 7');

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /An Thử Nghiệm/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Đóng hồ sơ' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('distinguishes an empty source', () => {
    render(<MembersPage data={makeTeamData({ members: [] })} />);
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });
});
