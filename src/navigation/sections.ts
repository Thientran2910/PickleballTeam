export type Section =
  | 'overview'
  | 'finance'
  | 'members'
  | 'ranking'
  | 'sessions'
  | 'assets';

export const SECTIONS: ReadonlyArray<{ id: Section; label: string }> = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'finance', label: 'Quỹ đội' },
  { id: 'members', label: 'Thành viên' },
  { id: 'ranking', label: 'Thi đấu' },
  { id: 'sessions', label: 'Lịch chơi' },
  { id: 'assets', label: 'Dụng cụ' },
];

export function parseSection(hash: string): Section {
  const id = hash.replace(/^#/, '');
  return SECTIONS.find((s) => s.id === id)?.id ?? 'overview';
}
