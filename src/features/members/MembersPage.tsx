import { useState } from 'react';
import type { PageProps } from '../../data/schema';
import { formatVnd } from '../../lib/format';
import { MemberDialog } from './MemberDialog';
import { formatCount, formatWinRate } from './memberFormat';
import { selectMembers } from './selectors';
import './members.css';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => [...part][0] ?? '')
    .slice(-2)
    .join('');
}

export function MembersPage({ data }: PageProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const rows = selectMembers(data.members, query, '');

  return (
    <div className="page members-page">
      <div className="page-title">
        <h2 className="eyebrow">
          <span aria-hidden="true">TEAM ATLAS · 03 / </span>Thành viên
        </h2>
        <h1>Những người cùng đội.</h1>
        <p className="muted">Mỗi thành viên, một hồ sơ đóng góp và thành tích.</p>
      </div>

      <div className="filters">
        <input
          type="search"
          aria-label="Tìm thành viên"
          placeholder="Tìm tên thành viên…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <strong>{data.members.length === 0 ? 'Chưa có dữ liệu' : 'Không tìm thấy thành viên'}</strong>
          {data.members.length === 0
            ? 'Dữ liệu sẽ xuất hiện khi đội cập nhật Google Sheet.'
            : 'Thử một tên khác.'}
        </div>
      ) : (
        <div className="members" role="list" aria-label="Danh sách thành viên">
          {rows.map((member, index) => (
            <div role="listitem" key={`${member.name}-${index}`} className="member-item">
              <article className="member-card">
                <div className="row">
                  <span className="avatar" aria-hidden="true">{initials(member.name)}</span>
                  <span className={member.missing > 0 ? 'tag warn' : 'tag'}>
                    {member.currentPeriodStatus || '—'}
                  </span>
                </div>
                <h3>
                  <button
                    type="button"
                    className="member-open"
                    aria-haspopup="dialog"
                    onClick={() => setSelected(member.name)}
                  >
                    {member.name}
                  </button>
                </h3>
                <small className="muted">{member.status}</small>
                <div className="mini-stats">
                  <div>
                    <strong>{formatCount(member.sessions)}</strong>
                    <small>Buổi chơi</small>
                  </div>
                  <div>
                    <strong>{formatCount(member.matches)}</strong>
                    <small>Trận đấu</small>
                  </div>
                  <div>
                    <strong>{formatWinRate(member)}</strong>
                    <small>Tỷ lệ thắng</small>
                  </div>
                </div>
                <p className="footnote">
                  Còn thiếu mọi đợt: {formatVnd(member.missing)} · Xem hồ sơ →
                </p>
              </article>
            </div>
          ))}
        </div>
      )}

      {selected ? (
        <MemberDialog data={data} name={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
