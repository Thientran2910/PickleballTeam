import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTeamData } from '../../test/fixtures';
import { AssetsPage } from './AssetsPage';

describe('AssetsPage', () => {
  it('preserves unknown asset quantities instead of converting them to zero', () => {
    const data = makeTeamData();
    data.assets = [
      {
        ...data.assets[0],
        name: 'Bóng thử nghiệm',
        remaining: '—',
        purchasedAt: '',
      },
    ];
    render(<AssetsPage data={data} />);
    expect(screen.getByText('Bóng thử nghiệm')).toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText('01/01/1970')).not.toBeInTheDocument();
  });

  it('searches by name and filters by statuses present in the snapshot', () => {
    const data = makeTeamData();
    data.assets = [
      data.assets[0],
      {
        ...data.assets[0],
        id: 'AST-TEST-002',
        name: 'Vợt dự phòng',
        status: 'Cất kho',
      },
    ];
    render(<AssetsPage data={data} />);

    expect(screen.getByRole('option', { name: 'Cất kho' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tìm dụng cụ'), {
      target: { value: 'không tồn tại' },
    });
    expect(screen.getByText('Không có kết quả phù hợp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    expect(screen.getByText('Vợt dự phòng')).toBeInTheDocument();
  });

  it('shows a dedicated empty state when the API array is empty', () => {
    render(<AssetsPage data={makeTeamData({ assets: [] })} />);
    expect(screen.getByText('Chưa có dữ liệu dụng cụ')).toBeInTheDocument();
  });
});
