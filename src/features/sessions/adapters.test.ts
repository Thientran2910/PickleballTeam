import { describe, expect, it } from 'vitest';
import { toSessionView } from './adapters';

describe('toSessionView', () => {
  it('maps verified API keys and preserves an 1899 time as a clock value', () => {
    expect(
      toSessionView({
        id: 'SES-TEST-001',
        date: '2026-10-09T00:00:00+07:00',
        activity: 'Buổi chơi thử nghiệm',
        venue: 'Sân thử nghiệm',
        start: '1899-12-30T18:30:00+07:00',
        end: '1899-12-30T20:30:00+07:00',
        courts: '2',
        guests: 1,
        memberCount: 6,
        courtCost: 300_000,
        totalCost: 360_000,
        status: 'Đã hoàn thành',
      }),
    ).toEqual({
      ok: true,
      value: {
        id: 'SES-TEST-001',
        date: '2026-10-09T00:00:00+07:00',
        activity: 'Buổi chơi thử nghiệm',
        court: 'Sân thử nghiệm',
        start: '18:30',
        end: '20:30',
        attendees: null,
        attendanceCount: 6,
        totalCost: 360_000,
        status: 'Đã hoàn thành',
      },
    });
  });

  it('keeps optional empty cells unknown instead of coercing them to zero', () => {
    const result = toSessionView({
      id: 'SES-TEST-002',
      date: '2026-10-10',
      activity: '',
      venue: '',
      start: '',
      end: '',
      courts: '',
      guests: '',
      memberCount: '',
      courtCost: '',
      totalCost: '',
      status: '',
    });

    expect(result).toMatchObject({
      ok: true,
      value: {
        activity: '—',
        court: '—',
        start: '—',
        end: '—',
        attendanceCount: null,
        totalCost: null,
        status: '—',
      },
    });
  });

  it('rejects a record missing a required identity or with a wrong numeric type', () => {
    expect(toSessionView({ date: '2026-10-10' })).toMatchObject({ ok: false });
    expect(
      toSessionView({
        id: 'SES-TEST-003',
        date: '2026-10-10',
        activity: '',
        venue: '',
        start: '',
        end: '',
        memberCount: '6',
        totalCost: 100_000,
        status: '',
      }),
    ).toMatchObject({ ok: false });
  });
});
