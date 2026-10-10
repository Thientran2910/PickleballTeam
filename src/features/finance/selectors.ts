import type { TeamData } from '../../data/schema';

type IncomeRow = TeamData['income'][number];
type ExpenseRow = TeamData['expenses'][number];

export type IncomeFilter = {
  period: string;
  member: string;
  status: string;
};

export type ExpenseFilter = {
  from: string;
  to: string;
  category: string;
  paidBy: string;
};

const vietnamDayFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function isCalendarDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

function vietnamDayKey(value: string): string | null {
  const trimmed = value.trim();
  if (isCalendarDay(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = vietnamDayFormatter.formatToParts(parsed);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return year && month && day ? `${year}-${month}-${day}` : null;
}

export function selectIncome(
  rows: IncomeRow[],
  filter: IncomeFilter,
): IncomeRow[] {
  return rows.filter(
    (row) =>
      (!filter.period || row.period === filter.period) &&
      (!filter.member || row.member === filter.member) &&
      (!filter.status || row.status === filter.status),
  );
}

export function selectExpenses(
  rows: ExpenseRow[],
  filter: ExpenseFilter,
): ExpenseRow[] {
  return rows.filter((row) => {
    if (filter.category && row.category !== filter.category) return false;
    if (filter.paidBy && row.paidBy !== filter.paidBy) return false;
    if (!filter.from && !filter.to) return true;

    const day = vietnamDayKey(row.date);
    if (!day) return false;
    if (filter.from && day < filter.from) return false;
    if (filter.to && day > filter.to) return false;
    return true;
  });
}

export function summarizeIncome(rows: IncomeRow[]) {
  return rows.reduce(
    (sum, row) => ({
      required: sum.required + row.required,
      paid: sum.paid + row.paid,
      missing: sum.missing + row.missing,
    }),
    { required: 0, paid: 0, missing: 0 },
  );
}

export function summarizeExpenses(rows: ExpenseRow[]) {
  return rows.reduce(
    (sum, row) => ({
      amount: sum.amount + row.amount,
      recordedExpense: sum.recordedExpense + row.recordedExpense,
      fundOutflow: sum.fundOutflow + row.fundOutflow,
      refunded: sum.refunded + row.refunded,
      refundRemaining: sum.refundRemaining + row.refundRemaining,
    }),
    {
      amount: 0,
      recordedExpense: 0,
      fundOutflow: 0,
      refunded: 0,
      refundRemaining: 0,
    },
  );
}
