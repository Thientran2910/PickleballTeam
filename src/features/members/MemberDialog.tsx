import { useEffect, useRef } from 'react';
import type { TeamData } from '../../data/schema';
import { formatVnd } from '../../lib/format';
import { formatCount, formatWinRate } from './memberFormat';
import '../../styles/tables.css';
import './members.css';

export function MemberDialog({
  data,
  name,
  opener,
  onClose,
}: {
  data: TeamData;
  name: string;
  /** Element that opened the dialog; Safari does not focus a clicked button, so activeElement alone is unreliable. */
  opener?: HTMLElement | null;
  onClose(): void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const member = data.members.find((row) => row.name === name);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    // React detaches the <dialog> before this cleanup runs, so the browser cannot restore focus itself.
    const returnTo = opener ?? document.activeElement;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    return () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus();
    };
  }, [opener]);

  if (!member) return null;
  const income = data.income.filter((row) => row.member === name);

  return (
    <dialog
      ref={ref}
      className="member-dialog"
      aria-labelledby="member-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <button type="button" className="outline close" aria-label="Đóng hồ sơ" onClick={onClose}>
        × Đóng
      </button>
      <div className="eyebrow">HỒ SƠ THÀNH VIÊN</div>
      <h2 id="member-dialog-title">{member.name}</h2>
      <p className="muted">
        {[member.status, member.currentPeriodStatus].filter(Boolean).join(' · ')}
      </p>
      <div className="stats">
        <div className="stat">
          <span className="money">{formatCount(member.matches)}</span>
          <small>Trận đấu</small>
        </div>
        <div className="stat">
          <span className="money">{formatCount(member.wins)}</span>
          <small>Trận thắng</small>
        </div>
        <div className="stat">
          <span className="money">{formatCount(member.losses)}</span>
          <small>Trận thua</small>
        </div>
        <div className="stat">
          <span className="money">{formatWinRate(member)}</span>
          <small>Tỷ lệ thắng</small>
        </div>
      </div>
      <h3>Đóng quỹ theo đợt</h3>
      {income.length === 0 ? (
        <div className="empty">
          <strong>Chưa có dữ liệu</strong>
          Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet.
        </div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Đóng quỹ theo đợt" tabIndex={0}>
          <table aria-label="Đóng quỹ theo đợt của thành viên">
            <thead>
              <tr>
                <th scope="col">Đợt</th>
                <th scope="col">Phải đóng</th>
                <th scope="col">Đã đóng</th>
                <th scope="col">Còn thiếu</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {income.map((row, index) => (
                <tr key={`${row.period}-${index}`}>
                  <td>{row.period}</td>
                  <td>{formatVnd(row.required)}</td>
                  <td>{formatVnd(row.paid)}</td>
                  <td>{formatVnd(row.missing)}</td>
                  <td>
                    <span className={row.missing > 0 ? 'tag warn' : 'tag'}>{row.status || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="footnote">
        Số buổi chơi: {formatCount(member.sessions)} · Điểm ghi: {formatCount(member.pointsFor)} · Điểm thua:{' '}
        {formatCount(member.pointsAgainst)} · Hiệu số: {formatCount(member.pointDifference)}
      </p>
    </dialog>
  );
}
