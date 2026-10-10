import type { TeamData } from '../../data/schema';

export function selectMembers(
  rows: TeamData['members'],
  query: string,
  status: string,
): TeamData['members'] {
  const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
  return rows.filter(
    (row) =>
      (!normalizedQuery ||
        row.name.toLocaleLowerCase('vi-VN').includes(normalizedQuery)) &&
      (!status || row.status === status),
  );
}
