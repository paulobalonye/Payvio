import { NotificationService } from "../../services/notification.service";

jest.mock("../../config/database", () => ({
  prisma: {
    device: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

const mockPushSender = jest.fn();

describe("NotificationService", () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService(mockPushSender);
    jest.clearAllMocks();
  });

  describe("registerDevice", () => {
    it("should upsert device token", async () => {
      mockPrisma.device.upsert.mockResolvedValue({
        id: "dev-1",
        userId: "user-1",
        token: "fcm-token-123",
        platform: "android",
      });

      await service.registerDevice("user-1", "fcm-token-123", "android");

      expect(mockPrisma.device.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { token: "fcm-token-123" },
          create: expect.objectContaining({
            userId: "user-1",
            token: "fcm-token-123",
            platform: "android",
          }),
        })
      );
    });
  });

  describe("sendPush", () => {
    it("should send push to all user devices", async () => {
      mockPrisma.device.findMany.mockResolvedValue([
        { id: "d1", token: "fcm-token-1", platform: "android" },
        { id: "d2", token: "apns-token-1", platform: "ios" },
      ]);
      mockPushSender.mockResolvedValue({ success: true });

      await service.sendPush("user-1", "Transfer Delivered", "Your $500 has arrived!", {
        transferId: "t-1",
        screen: "transfer_detail",
      });

      expect(mockPushSender).toHaveBeenCalledTimes(2);
    });

    it("should handle gracefully when user has no devices", async () => {
      mockPrisma.device.findMany.mockResolvedValue([]);

      await expect(
        service.sendPush("user-1", "Title", "Body", {})
      ).resolves.not.toThrow();

      expect(mockPushSender).not.toHaveBeenCalled();
    });

    it("should remove invalid tokens on push failure", async () => {
      mockPrisma.device.findMany.mockResolvedValue([
        { id: "d1", token: "invalid-token", platform: "android" },
      ]);
      mockPushSender.mockRejectedValue(new Error("InvalidRegistration"));
      mockPrisma.device.deleteMany.mockResolvedValue({ count: 1 });

      await service.sendPush("user-1", "Title", "Body", {});

      expect(mockPrisma.device.deleteMany).toHaveBeenCalledWith({
        where: { token: "invalid-token" },
      });
    });

    it("should include deep-link data in push payload", async () => {
      mockPrisma.device.findMany.mockResolvedValue([
        { id: "d1", token: "token-1", platform: "android" },
      ]);
      mockPushSender.mockResolvedValue({ success: true });

      await service.sendPush("user-1", "Title", "Body", {
        transferId: "t-1",
        screen: "transfer_detail",
      });

      expect(mockPushSender).toHaveBeenCalledWith(
        "token-1",
        "android",
        expect.objectContaining({
          title: "Title",
          body: "Body",
          data: expect.objectContaining({ transferId: "t-1" }),
        })
      );
    });
  });
});
