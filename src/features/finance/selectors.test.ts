import { describe, expect, it } from 'vitest';
import { makeTeamData } from '../../test/fixtures';
import {
  selectExpenses,
  selectIncome,
  summarizeExpenses,
  summarizeIncome,
} from './selectors';

describe('finance selectors', () => {
  it('does not offset missing dues with overpayment from another row', () => {
    const base = makeTeamData().income[0];
    const rows = [
      {
        ...base,
        period: 'OLD',
        required: 1_000_000,
        paid: 1_070_000,
        missing: 0,
      },
      {
        ...base,
        period: 'NEW',
        required: 1_000_000,
        paid: 0,
        missing: 1_000_000,
      },
    ];

    expect(summarizeIncome(rows)).toEqual({
      required: 2_000_000,
      paid: 1_070_000,
      missing: 1_000_000,
    });
  });

  it('keeps expense recognition separate from fund outflow and refund', () => {
    const base = makeTeamData().expenses[0];
    const rows = [
      {
        ...base,
        amount: 500_000,
        recordedExpense: 500_000,
        fundOutflow: 200_000,
        refunded: 200_000,
        refundRemaining: 300_000,
      },
    ];

    expect(summarizeExpenses(rows)).toEqual({
      amount: 500_000,
      recordedExpense: 500_000,
      fundOutflow: 200_000,
      refunded: 200_000,
      refundRemaining: 300_000,
    });
  });

  it('filters LS periods by exact equality and retains undated income', () => {
    const base = makeTeamData().income[0];
    const historical = {
      ...base,
      period: 'LS-2025-A',
      member: 'Bình',
      receivedAt: '',
    };
    const rows = [
      historical,
      { ...base, period: 'LS-2025-A-extra', member: 'Chi' },
    ];

    expect(
      selectIncome(rows, {
        period: 'LS-2025-A',
        member: '',
        status: '',
      }),
    ).toEqual([historical]);
  });

  it('filters expense dates inclusively by calendar day in Vietnam', () => {
    const base = makeTeamData().expenses[0];
    const rows = [
      { ...base, id: 'before', date: '2026-09-30T16:59:59Z' },
      { ...base, id: 'start', date: '2026-09-30T17:00:00Z' },
      { ...base, id: 'end', date: '2026-10-02T16:59:59Z' },
      { ...base, id: 'after', date: '2026-10-02T17:00:00Z' },
      { ...base, id: 'invalid', date: 'not-a-date' },
    ];

    const selected = selectExpenses(rows, {
      from: '2026-10-01',
      to: '2026-10-02',
      category: '',
      paidBy: '',
    });

    expect(selected.map((row) => row.id)).toEqual(['start', 'end']);
  });

  it('does not treat an invalid expense date as today', () => {
    const base = makeTeamData().expenses[0];
    const invalid = { ...base, id: 'invalid', date: '' };

    expect(
      selectExpenses([invalid], {
        from: '2026-10-10',
        to: '2026-10-10',
        category: '',
        paidBy: '',
      }),
    ).toEqual([]);
    expect(
      selectExpenses([invalid], {
        from: '',
        to: '',
        category: '',
        paidBy: '',
      }),
    ).toEqual([invalid]);
  });
});
