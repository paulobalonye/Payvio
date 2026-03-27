import { ReferralService } from "../../services/referral.service";

jest.mock("../../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    referral: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

const mockWalletService = {
  creditWallet: jest.fn(),
  getOrCreateWallet: jest.fn(),
};

describe("ReferralService", () => {
  let service: ReferralService;

  beforeEach(() => {
    service = new ReferralService(mockWalletService as any);
    jest.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return referral stats for user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        referralCode: "ABCD1234",
      });
      mockPrisma.referral.findMany.mockResolvedValue([
        { id: "r1", refereeId: "u2", rewardStatus: "REWARDED", rewardAmount: 500, createdAt: new Date() },
        { id: "r2", refereeId: "u3", rewardStatus: "PENDING", rewardAmount: 500, createdAt: new Date() },
      ]);

      const result = await service.getStats("user-1");

      expect(result.total_referrals).toBe(2);
      expect(result.converted).toBe(1);
      expect(result.total_earned).toBe(500); // only rewarded
      expect(result.referral_code).toBe("ABCD1234");
    });

    it("should return zeros for user with no referrals", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        referralCode: "ABCD1234",
      });
      mockPrisma.referral.findMany.mockResolvedValue([]);

      const result = await service.getStats("user-1");

      expect(result.total_referrals).toBe(0);
      expect(result.converted).toBe(0);
      expect(result.total_earned).toBe(0);
    });
  });

  describe("trackReferral", () => {
    it("should create referral relationship on signup", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "referrer-1",
        referralCode: "ABCD1234",
      });
      mockPrisma.referral.findUnique.mockResolvedValue(null); // not already referred
      mockPrisma.referral.create.mockResolvedValue({
        id: "ref-1",
        referrerId: "referrer-1",
        refereeId: "new-user",
      });

      await service.trackReferral("new-user", "ABCD1234");

      expect(mockPrisma.referral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            referrerId: "referrer-1",
            refereeId: "new-user",
          }),
        })
      );
    });

    it("should prevent self-referral", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        referralCode: "ABCD1234",
      });

      await expect(
        service.trackReferral("user-1", "ABCD1234")
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should ignore invalid referral code silently", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Should not throw — just skip
      await expect(
        service.trackReferral("new-user", "INVALID")
      ).resolves.not.toThrow();
    });
  });

  describe("triggerReward", () => {
    it("should credit both parties on first transfer completion", async () => {
      const referral = {
        id: "ref-1",
        referrerId: "referrer-1",
        refereeId: "referee-1",
        rewardStatus: "PENDING",
        rewardAmount: 500,
      };
      mockPrisma.referral.findUnique.mockResolvedValue(referral);
      mockPrisma.referral.update.mockResolvedValue({
        ...referral,
        rewardStatus: "REWARDED",
      });
      mockWalletService.getOrCreateWallet.mockResolvedValue({ id: "w1" });
      mockWalletService.creditWallet.mockResolvedValue({});

      await service.triggerReward("referee-1");

      // Both parties should be credited
      expect(mockWalletService.creditWallet).toHaveBeenCalledTimes(2);
      expect(mockPrisma.referral.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ rewardStatus: "REWARDED" }),
        })
      );
    });

    it("should be idempotent — skip if already rewarded", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue({
        id: "ref-1",
        rewardStatus: "REWARDED",
      });

      await service.triggerReward("referee-1");

      expect(mockWalletService.creditWallet).not.toHaveBeenCalled();
    });

    it("should skip if user has no referral record", async () => {
      mockPrisma.referral.findUnique.mockResolvedValue(null);

      await service.triggerReward("no-referral-user");

      expect(mockWalletService.creditWallet).not.toHaveBeenCalled();
    });
  });
});
