export type InvalidRecord = { ok: false; reason: string };

export type MatchView = {
  date: string;
  team1: string[];
  team2: string[];
  score1: number;
  score2: number;
  sessionId: string | null;
};

type MatchResult = { ok: true; value: MatchView } | InvalidRecord;

function nonEmptyString(
  value: unknown,
  field: string,
): string | InvalidRecord {
  if (typeof value !== 'string' || value.trim() === '') {
    return { ok: false, reason: `${field} must be a non-empty string` };
  }
  return value;
}

function validScore(value: unknown, field: string): number | InvalidRecord {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return { ok: false, reason: `${field} score must be a nonnegative integer` };
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

export function toMatchView(row: Record<string, unknown>): MatchResult {
  if (row.validation !== 'Hợp lệ') {
    return { ok: false, reason: 'validation is not Hợp lệ' };
  }
  const date = nonEmptyString(row.date, 'date');
  if (!isInvalid(date) && !isValidCalendarDate(date)) {
    return { ok: false, reason: 'date must be a valid API date string' };
  }
  const player1 = nonEmptyString(row.team1Player1, 'team1Player1');
  const player2 = nonEmptyString(row.team1Player2, 'team1Player2');
  const player3 = nonEmptyString(row.team2Player1, 'team2Player1');
  const player4 = nonEmptyString(row.team2Player2, 'team2Player2');
  const score1 = validScore(row.team1Score, 'team1Score');
  const score2 = validScore(row.team2Score, 'team2Score');
  const values = [date, player1, player2, player3, player4, score1, score2];
  const invalid = values.find(isInvalid);
  if (invalid) return invalid;

  const players = [player1, player2, player3, player4] as string[];
  if (new Set(players).size !== players.length) {
    return { ok: false, reason: 'players must be distinct' };
  }
  if (score1 === score2) {
    return { ok: false, reason: 'tie scores are invalid' };
  }
  const expectedWinner = score1 > score2 ? 'Đội 1' : 'Đội 2';
  if (row.winner !== expectedWinner) {
    return { ok: false, reason: 'winner is inconsistent with the score' };
  }
  if (typeof row.sessionId !== 'string') {
    return { ok: false, reason: 'sessionId must be a string' };
  }

  return {
    ok: true,
    value: {
      date: date as string,
      team1: [player1 as string, player2 as string],
      team2: [player3 as string, player4 as string],
      score1: score1 as number,
      score2: score2 as number,
      sessionId: row.sessionId.trim() === '' ? null : row.sessionId,
    },
  };
}
