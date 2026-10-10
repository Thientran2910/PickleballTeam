import { describe, expect, it } from 'vitest';
import { toMatchView } from './adapters';

const validMatch = {
  date: '2026-10-09T00:00:00+07:00',
  team1Player1: 'Người A',
  team1Player2: 'Người B',
  team2Player1: 'Người C',
  team2Player2: 'Người D',
  team1Score: 11,
  team2Score: 8,
  winner: 'Đội 1',
  validation: 'Hợp lệ',
  sessionId: 'SES-TEST-001',
};

describe('toMatchView', () => {
  it('maps a valid synthetic record using the verified keys', () => {
    expect(toMatchView(validMatch)).toEqual({
      ok: true,
      value: {
        date: '2026-10-09T00:00:00+07:00',
        team1: ['Người A', 'Người B'],
        team2: ['Người C', 'Người D'],
        score1: 11,
        score2: 8,
        sessionId: 'SES-TEST-001',
      },
    });
  });

  it.each([
    [{ ...validMatch, validation: 'Không hợp lệ' }, 'validation'],
    [{ ...validMatch, team2Player2: 'Người A' }, 'distinct'],
    [{ ...validMatch, team1Score: '11' }, 'score'],
    [{ ...validMatch, team2Score: 11 }, 'tie'],
    [{ ...validMatch, date: undefined }, 'date'],
    [{ ...validMatch, date: 'not-a-date' }, 'date'],
    [{ ...validMatch, winner: 'Đội 2' }, 'winner'],
  ])('rejects invalid match input %# (%s)', (row, reasonFragment) => {
    const result = toMatchView(row);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain(reasonFragment);
  });
});
