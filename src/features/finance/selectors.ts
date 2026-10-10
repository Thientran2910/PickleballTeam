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

/** `YYYY-MM-DD` of a Vietnam-time calendar day, or null when the date is unknown. */
export function vietnamDayKey(value: string): string | null {
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

type AdvanceRow = TeamData['advances'][number];
type RefundRow = TeamData['refunds'][number];

export type FinanceTab = 'income' | 'expenses' | 'advances' | 'refunds';

export type RefundView = {
  date: string;
  member: string;
  expenseId: string;
  amount: number | null;
  method: string;
  raw: RefundRow;
};

function normalizeQuery(query: string): string {
  return query.trim().toLocaleLowerCase('vi-VN');
}

/** Free-text search runs over text fields only, so "100" never matches an amount. */
function matchesQuery(values: unknown[], query: string): boolean {
  const needle = normalizeQuery(query);
  if (!needle) return true;
  const haystack = values
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLocaleLowerCase('vi-VN');
  return haystack.includes(needle);
}

/** `YYYY-MM` of a Vietnam-time calendar day, or null when the date is unknown. */
export function monthKey(value: string): string | null {
  return vietnamDayKey(value)?.slice(0, 7) ?? null;
}

/** Month keys that occur in dated rows, newest first. */
export function listMonths(dates: string[]): string[] {
  const months = new Set<string>();
  for (const date of dates) {
    const key = monthKey(date);
    if (key) months.add(key);
  }
  return [...months].sort().reverse();
}

export function searchIncome(
  rows: IncomeRow[],
  filter: { period: string; query: string },
): IncomeRow[] {
  return rows.filter(
    (row) =>
      (!filter.period || row.period === filter.period) &&
      matchesQuery([row.period, row.member, row.status, row.method], filter.query),
  );
}

/** Newest expense first; rows without a readable date keep source order at the end. */
export function searchExpenses(
  rows: ExpenseRow[],
  filter: { month: string; query: string },
): ExpenseRow[] {
  return rows
    .filter(
      (row) =>
        (!filter.month || monthKey(row.date) === filter.month) &&
        matchesQuery([row.id, row.category, row.paidBy, row.source], filter.query),
    )
    .map((row, index) => ({ row, index, day: vietnamDayKey(row.date) ?? '' }))
    .sort((a, b) =>
      a.day === b.day ? a.index - b.index : a.day < b.day ? 1 : -1,
    )
    .map((entry) => entry.row);
}

export function searchAdvances(rows: AdvanceRow[], query: string): AdvanceRow[] {
  return rows.filter((row) => matchesQuery([row.member, row.status], query));
}

export function sumAdvanceRemaining(rows: AdvanceRow[]): number {
  return rows.reduce((total, row) => total + row.remaining, 0);
}

function readText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function readAmount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Refund rows are not schema-verified upstream; unknown fields stay unknown. */
export function readRefund(row: RefundRow): RefundView {
  return {
    date: readText(row.date),
    member: readText(row.member),
    expenseId: readText(row.expenseId),
    amount: readAmount(row.amount),
    method: readText(row.method),
    raw: row,
  };
}

export function searchRefunds(
  rows: RefundRow[],
  filter: { month: string; query: string },
): RefundView[] {
  return rows
    .map(readRefund)
    .filter(
      (view) =>
        (!filter.month || monthKey(view.date) === filter.month) &&
        matchesQuery([view.member, view.expenseId, view.method], filter.query),
    );
}

export function summarizeRefunds(views: RefundView[]) {
  return views.reduce(
    (sum, view) =>
      view.amount === null
        ? { ...sum, unknown: sum.unknown + 1 }
        : { ...sum, amount: sum.amount + view.amount },
    { amount: 0, unknown: 0 },
  );
}
