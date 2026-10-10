export type InvalidRecord = { ok: false; reason: string };

export type SessionView = {
  id: string;
  date: string;
  activity: string;
  court: string;
  start: string;
  end: string;
  attendees: string[] | null;
  attendanceCount: number | null;
  totalCost: number | null;
  status: string;
};

type SessionResult = { ok: true; value: SessionView } | InvalidRecord;

function textCell(value: unknown, field: string): string | InvalidRecord {
  if (typeof value !== 'string') {
    return { ok: false, reason: `${field} must be a string` };
  }
  return value.trim() === '' ? '—' : value;
}

function nullableNumber(
  value: unknown,
  field: string,
): number | null | InvalidRecord {
  if (value === '' || value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, reason: `${field} must be a finite number or empty` };
  }
  return value;
}

function isInvalid(value: unknown): value is InvalidRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    value.ok === false
  );
}

function isValidCalendarDate(value: string): boolean {
  const datePart = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
  if (!datePart) return false;
  const parsed = new Date(`${datePart}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(datePart)
  );
}

function clockText(value: unknown, field: string): string | InvalidRecord {
  const text = textCell(value, field);
  if (isInvalid(text) || text === '—') return text;
  const clock = text.match(/(?:^|T)(\d{2}):(\d{2})(?::\d{2})?/)?.slice(1, 3);
  if (!clock) return { ok: false, reason: `${field} is not a readable time` };
  const [hours, minutes] = clock.map(Number);
  if (hours > 23 || minutes > 59) {
    return { ok: false, reason: `${field} is not a valid clock time` };
  }
  return `${clock[0]}:${clock[1]}`;
}

export function toSessionView(row: Record<string, unknown>): SessionResult {
  if (typeof row.id !== 'string' || row.id.trim() === '') {
    return { ok: false, reason: 'id must be a non-empty string' };
  }
  if (typeof row.date !== 'string' || !isValidCalendarDate(row.date)) {
    return { ok: false, reason: 'date must be a valid API date string' };
  }

  const activity = textCell(row.activity, 'activity');
  const court = textCell(row.venue, 'venue');
  const start = clockText(row.start, 'start');
  const end = clockText(row.end, 'end');
  const attendanceCount = nullableNumber(row.memberCount, 'memberCount');
  const totalCost = nullableNumber(row.totalCost, 'totalCost');
  const status = textCell(row.status, 'status');
  const fields = [
    activity,
    court,
    start,
    end,
    attendanceCount,
    totalCost,
    status,
  ];
  const invalid = fields.find(isInvalid);
  if (invalid) return invalid;

  return {
    ok: true,
    value: {
      id: row.id,
      date: row.date,
      activity: activity as string,
      court: court as string,
      start: start as string,
      end: end as string,
      attendees: null,
      attendanceCount: attendanceCount as number | null,
      totalCost: totalCost as number | null,
      status: status as string,
    },
  };
}
