import { prisma } from "../config/database";

type OverviewResult = {
  readonly user_count: number;
  readonly kyc_pending: number;
  readonly transfer_volume_usd: number;
  readonly transfer_count: number;
  readonly success_rate: number;
  readonly aml_flags: number;
  readonly revenue_usd: number;
};

type CorridorResult = {
  readonly send_currency: string;
  readonly receive_currency: string;
  readonly count: number;
  readonly volume_usd: number;
};

export class AdminAnalyticsService {
  async getOverview(): Promise<OverviewResult> {
    const [userCount, kycPending, transfers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { kycStatus: "PENDING" } }),
      prisma.transfer.findMany({ select: { sendAmount: true, fee: true, status: true } }),
    ]);

    const totalVolume = transfers.reduce((sum, t) => sum + t.sendAmount, 0);
    const delivered = transfers.filter((t) => t.status === "DELIVERED").length;
    const successRate = transfers.length > 0 ? (delivered / transfers.length) * 100 : 0;
    const revenue = transfers.reduce((sum, t) => sum + t.fee, 0);

    return {
      user_count: userCount,
      kyc_pending: kycPending,
      transfer_volume_usd: totalVolume,
      transfer_count: transfers.length,
      success_rate: Math.round(successRate * 100) / 100,
      aml_flags: 0,
      revenue_usd: revenue,
    };
  }

  async getVolumeTimeSeries(from: string, to: string, groupBy = "day"): Promise<any[]> {
    const transfers = await prisma.transfer.findMany({
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      select: { sendAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped = new Map<string, number>();
    for (const t of transfers) {
      const key = t.createdAt.toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) ?? 0) + t.sendAmount);
    }

    return Array.from(grouped.entries()).map(([date, volume]) => ({ date, volume }));
  }

  async getCorridors(): Promise<CorridorResult[]> {
    const transfers = await prisma.transfer.findMany({
      select: { sendCurrency: true, receiveCurrency: true, sendAmount: true },
    });

    const corridors = new Map<string, { count: number; volume: number }>();
    for (const t of transfers) {
      const key = `${t.sendCurrency}-${t.receiveCurrency}`;
      const existing = corridors.get(key) ?? { count: 0, volume: 0 };
      corridors.set(key, { count: existing.count + 1, volume: existing.volume + t.sendAmount });
    }

    return Array.from(corridors.entries())
      .map(([key, data]) => {
        const [send, receive] = key.split("-");
        return { send_currency: send, receive_currency: receive, count: data.count, volume_usd: data.volume };
      })
      .sort((a, b) => b.volume_usd - a.volume_usd)
      .slice(0, 10);
  }
}
