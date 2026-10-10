import { useModalDialog } from '../../components/useModalDialog';
import type { TeamData } from '../../data/schema';
import { formatDate, formatDayWithWeekday, formatVnd } from '../../lib/format';
import { toMatchView } from '../ranking/adapters';
import { countOrNull, toSessionView } from './adapters';
import '../../styles/tables.css';
import '../members/members.css';

function countText(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('vi-VN');
}

function moneyText(value: number | null): string {
  return value === null ? '—' : formatVnd(value);
}

export function SessionDialog({
  data,
  id,
  opener,
  onClose,
}: {
  data: TeamData;
  id: string;
  /** Element that opened the dialog; Safari does not focus a clicked button. */
  opener?: HTMLElement | null;
  onClose(): void;
}) {
  const ref = useModalDialog(opener);
  const row = data.sessions.find((candidate) => candidate.id === id);
  const result = row ? toSessionView(row) : null;
  if (!row || !result?.ok) return null;

  const session = result.value;
  const expenses = data.expenses.filter((expense) => expense.sessionId === id);
  const matches = data.matches.flatMap((match) => {
    const view = toMatchView(match);
    return view.ok && view.value.sessionId === id ? [view.value] : [];
  });
  const courtCost = countOrNull(row.courtCost);

  return (
    <dialog
      ref={ref}
      className="member-dialog"
      aria-labelledby="session-dialog-title"
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
      <button type="button" className="outline close" aria-label="Đóng chi tiết buổi chơi" onClick={onClose}>
        × Đóng
      </button>
      <div className="eyebrow">CHI TIẾT BUỔI CHƠI</div>
      <h2 id="session-dialog-title">{formatDayWithWeekday(session.date)}</h2>
      <p className="muted">
        {session.start} – {session.end} · {session.court} · {session.activity}{' '}
        <span className="tag">{session.status}</span>
      </p>
      <div className="stats">
        <div className="stat">
          <span className="money">{countText(countOrNull(row.courts))}</span>
          <small>Số sân</small>
        </div>
        <div className="stat">
          <span className="money">{countText(session.attendanceCount)}</span>
          <small>Thành viên</small>
        </div>
        <div className="stat">
          <span className="money">{countText(countOrNull(row.guests))}</span>
          <small>Khách</small>
        </div>
        <div className="stat">
          <span className="money">{moneyText(session.totalCost)}</span>
          <small>Tổng chi phí buổi</small>
        </div>
      </div>

      <h3>Chi phí của buổi</h3>
      {expenses.length === 0 ? (
        <div className="empty">
          <strong>Chưa có khoản chi</strong>
          Chưa có khoản chi nào gắn với buổi này.
        </div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Chi phí của buổi" tabIndex={0}>
          <table aria-label="Các khoản chi của buổi chơi">
            <thead>
              <tr>
                <th scope="col">Ngày</th>
                <th scope="col">Hạng mục</th>
                <th scope="col">Số tiền</th>
                <th scope="col">Người trả</th>
                <th scope="col">Nguồn</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatDate(expense.date)}</td>
                  <td>{expense.category.trim() || 'Chưa phân loại'}</td>
                  <td>{formatVnd(expense.recordedExpense)}</td>
                  <td>{expense.paidBy || '—'}</td>
                  <td>{expense.source || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Trận đấu trong buổi</h3>
      {matches.length === 0 ? (
        <div className="empty">
          <strong>Chưa có trận đấu</strong>
          Kết quả sẽ xuất hiện khi đội ghi trận vào Google Sheet.
        </div>
      ) : (
        <div className="table-wrap" role="region" aria-label="Trận đấu trong buổi" tabIndex={0}>
          <table aria-label="Các trận đấu của buổi chơi">
            <thead>
              <tr>
                <th scope="col">Đội 1</th>
                <th scope="col">Tỉ số</th>
                <th scope="col">Đội 2</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index}>
                  <td>{match.team1.join(' & ')}</td>
                  <td>
                    {match.score1} – {match.score2}
                  </td>
                  <td>{match.team2.join(' & ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="footnote">
        Mã buổi: {session.id}
        {courtCost === null ? '' : ` · Tiền sân: ${formatVnd(courtCost)}`}
      </p>
    </dialog>
  );
}
