import type { TeamData } from '../data/schema';

export function makeTeamData(
  overrides: Partial<TeamData> = {},
): TeamData {
  return {
    schemaVersion: 1,
    updatedAt: '2026-10-10T08:00:00+07:00',
    timezone: 'Asia/Ho_Chi_Minh',
    overview: {
      fundPeriod: 'TEST-2026-10',
      normalFee: 500_000,
      studentFee: 250_000,
      openingBalance: 1_000_000,
      totalIncome: 900_000,
      totalFundOutflow: 300_000,
      totalRefunded: 100_000,
      balance: 1_600_000,
      totalExpenses: 400_000,
      regularMembers: 2,
      periodRequired: 750_000,
      periodPaid: 650_000,
      periodMissing: 100_000,
      fullyPaidMembers: 1,
    },
    members: [
      {
        name: 'An Thử Nghiệm',
        status: 'Đang hoạt động',
        joinedAt: '2026-01-15',
        sessions: 4,
        matches: 3,
        wins: 2,
        losses: 1,
        winRate: 2 / 3,
        pointsFor: 31,
        pointsAgainst: 24,
        pointDifference: 7,
        required: 500_000,
        paid: 500_000,
        missing: 0,
        missingPeriods: 0,
        currentPeriodStatus: 'Đủ',
      },
    ],
    income: [
      {
        period: 'TEST-2026-10',
        member: 'An Thử Nghiệm',
        required: 500_000,
        paid: 500_000,
        missing: 0,
        status: 'Đủ',
        receivedAt: '2026-10-03',
        method: 'Chuyển khoản',
      },
    ],
    expenses: [
      {
        id: 'EXP-TEST-001',
        date: '2026-10-04',
        category: 'Sân thử nghiệm',
        amount: 400_000,
        paidBy: 'An Thử Nghiệm',
        source: 'Quỹ đội',
        sessionId: '',
        fundOutflow: 300_000,
        refunded: 100_000,
        refundRemaining: 0,
        recordedExpense: 400_000,
      },
    ],
    sessions: [],
    refunds: [],
    advances: [
      {
        member: 'An Thử Nghiệm',
        advanced: 100_000,
        refunded: 100_000,
        remaining: 0,
        status: 'Đã hoàn',
      },
    ],
    assets: [
      {
        id: 'AST-TEST-001',
        name: 'Bóng thử nghiệm',
        purchased: '12',
        remaining: '9',
        purchasedAt: '2026-09-01',
        value: 360_000,
        holder: 'Bình Thử Nghiệm',
        status: 'Đang dùng',
        usedOrLost: '3',
        unit: 'quả',
      },
    ],
    ranking: [
      {
        rank: '1',
        member: 'An Thử Nghiệm',
        matches: 3,
        wins: 2,
        losses: 1,
        pointsFor: 31,
        pointsAgainst: 24,
        pointDifference: 7,
        winRate: '66.7%',
      },
    ],
    matches: [],
    ...overrides,
  };
}

export function makePayload(overrides?: Partial<TeamData>) {
  return { ok: true as const, data: makeTeamData(overrides) };
}
