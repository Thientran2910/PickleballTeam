import { render, screen, within } from '@testing-library/react';
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
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('01/01/1970')).not.toBeInTheDocument();
  });

  it('labels blank cells as not recorded and keeps the reference columns', () => {
    const data = makeTeamData();
    data.assets = [
      { ...data.assets[0], purchased: '', remaining: '', holder: '', status: '' },
    ];
    render(<AssetsPage data={data} />);
    const headers = within(screen.getByRole('table'))
      .getAllByRole('columnheader')
      .map((cell) => cell.textContent);
    expect(headers).toEqual([
      'Vật dụng',
      'SL mua',
      'SL hiện tại',
      'Đơn vị',
      'Giá trị mua',
      'Người giữ',
      'Tình trạng',
      'Ngày mua',
    ]);
    expect(screen.getAllByText('Chưa ghi')).toHaveLength(3);
    expect(screen.getByText('Chưa cập nhật')).toBeInTheDocument();
    expect(screen.getByText(/không được cộng thêm vào tổng chi quỹ/)).toBeInTheDocument();
  });

  it('shows a dedicated empty state when the API array is empty', () => {
    render(<AssetsPage data={makeTeamData({ assets: [] })} />);
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });
});
