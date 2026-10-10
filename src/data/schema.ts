import { z } from 'zod';

const finite = z.number().finite();
const numericDisplay = z.union([finite, z.string()]);
const unverifiedRows = z.array(z.record(z.string(), z.unknown()));

const overviewSchema = z.object({
  fundPeriod: z.string(),
  normalFee: finite,
  studentFee: finite,
  openingBalance: finite,
  totalIncome: finite,
  totalFundOutflow: finite,
  totalRefunded: finite,
  balance: finite,
  totalExpenses: finite,
  regularMembers: finite,
  periodRequired: finite,
  periodPaid: finite,
  periodMissing: finite,
  fullyPaidMembers: finite,
});

const memberSchema = z.object({
  name: z.string(),
  status: z.string(),
  joinedAt: z.string(),
  sessions: finite,
  matches: finite,
  wins: finite,
  losses: finite,
  winRate: finite,
  pointsFor: finite,
  pointsAgainst: finite,
  pointDifference: finite,
  required: finite,
  paid: finite,
  missing: finite,
  missingPeriods: finite,
  currentPeriodStatus: z.string(),
});

const incomeSchema = z.object({
  period: z.string(),
  member: z.string(),
  required: finite,
  paid: finite,
  missing: finite,
  status: z.string(),
  receivedAt: z.string(),
  method: z.string(),
});

const expenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string(),
  amount: finite,
  paidBy: z.string(),
  source: z.string(),
  sessionId: z.string(),
  fundOutflow: finite,
  refunded: finite,
  refundRemaining: finite,
  recordedExpense: finite,
});

const advanceSchema = z.object({
  member: z.string(),
  advanced: finite,
  refunded: finite,
  remaining: finite,
  status: z.string(),
});

const assetSchema = z.object({
  id: z.string(),
  name: z.string(),
  purchased: numericDisplay,
  remaining: numericDisplay,
  purchasedAt: z.string(),
  value: finite,
  holder: z.string(),
  status: z.string(),
  usedOrLost: numericDisplay,
  unit: z.string(),
});

const rankingSchema = z.object({
  rank: numericDisplay,
  member: z.string(),
  matches: finite,
  wins: finite,
  losses: finite,
  pointsFor: finite,
  pointsAgainst: finite,
  pointDifference: finite,
  winRate: numericDisplay,
});

export const teamDataSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string(),
  timezone: z.literal('Asia/Ho_Chi_Minh'),
  overview: overviewSchema,
  members: z.array(memberSchema),
  income: z.array(incomeSchema),
  expenses: z.array(expenseSchema),
  sessions: unverifiedRows,
  refunds: unverifiedRows,
  advances: z.array(advanceSchema),
  assets: z.array(assetSchema),
  ranking: z.array(rankingSchema),
  matches: unverifiedRows,
});

const payloadSchema = z.object({
  ok: z.literal(true),
  data: teamDataSchema,
});

export type TeamData = z.infer<typeof teamDataSchema>;
export type PageProps = { data: TeamData };

export function parseTeamPayload(input: unknown): TeamData {
  return payloadSchema.parse(input).data;
}
