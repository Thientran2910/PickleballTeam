import type { TeamData } from '../../data/schema';

type MemberRow = TeamData['members'][number];

const integerFormatter = new Intl.NumberFormat('vi-VN');
const rateFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export function formatCount(value: number): string {
  return integerFormatter.format(value);
}

/** A member without matches has no win rate; never present it as 0%. */
export function formatWinRate(member: MemberRow): string {
  return member.matches > 0 ? rateFormatter.format(member.winRate) : '—';
}
