import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import type { ReferralStats } from "../types";
import type { WalletService } from "./wallet.service";

export class ReferralService {
  constructor(private readonly walletService: WalletService) {}

  async getStats(userId: string): Promise<ReferralStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
    });

    const converted = referrals.filter((r) => r.rewardStatus === "REWARDED").length;
    const totalEarned = referrals
      .filter((r) => r.rewardStatus === "REWARDED")
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    return {
      total_referrals: referrals.length,
      converted,
      total_earned: totalEarned,
      referral_code: user.referralCode,
      referral_link: `${env.APP_URL}/join/${user.referralCode}`,
    };
  }

  async trackReferral(refereeId: string, referralCode: string): Promise<void> {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
    });

    if (!referrer) return; // invalid code — silently skip

    if (referrer.id === refereeId) {
      throw new AppError(400, "Cannot use your own referral code");
    }

    // Check if referee already has a referral record
    const existing = await prisma.referral.findUnique({
      where: { refereeId },
    });

    if (existing) return; // already tracked

    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId,
        rewardAmount: env.REFERRAL_REWARD_CENTS,
      },
    });
  }

  async triggerReward(refereeId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
      where: { refereeId },
    });

    if (!referral) return;
    if (referral.rewardStatus === "REWARDED") return; // idempotent

    const rewardAmount = referral.rewardAmount;

    // Credit both parties
    await this.walletService.getOrCreateWallet(referral.referrerId, "USD");
    await this.walletService.creditWallet(referral.referrerId, {
      amount: rewardAmount,
      currency: "USD",
      source: "referral_reward",
      reference_id: referral.id,
    });

    await this.walletService.getOrCreateWallet(referral.refereeId, "USD");
    await this.walletService.creditWallet(referral.refereeId, {
      amount: rewardAmount,
      currency: "USD",
      source: "referral_reward",
      reference_id: referral.id,
    });

    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        rewardStatus: "REWARDED",
        firstTransferDate: new Date(),
      },
    });
  }
}
