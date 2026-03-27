import { SmsService } from "../../services/sms.service";

const mockSendMessage = jest.fn();

describe("SmsService (Plivo)", () => {
  let service: SmsService;

  beforeEach(() => {
    service = new SmsService(mockSendMessage);
    jest.clearAllMocks();
  });

  describe("sendOtp", () => {
    it("should send OTP SMS with correct destination and message", async () => {
      mockSendMessage.mockResolvedValue({
        messageUuid: ["msg-uuid-123"],
        apiId: "api-123",
      });

      await service.sendOtp("+14407713030", "123456");

      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.any(String),
        "+14407713030",
        expect.stringContaining("123456"),
      );
    });

    it("should include Payvio branding in message", async () => {
      mockSendMessage.mockResolvedValue({ messageUuid: ["msg-1"] });

      await service.sendOtp("+14407713030", "654321");

      const message = mockSendMessage.mock.calls[0][2];
      expect(message).toContain("Payvio");
      expect(message).toContain("654321");
    });

    it("should return message UUID on success", async () => {
      mockSendMessage.mockResolvedValue({
        messageUuid: ["msg-uuid-456"],
      });

      const result = await service.sendOtp("+14407713030", "123456");

      expect(result.messageId).toBe("msg-uuid-456");
    });

    it("should throw on Plivo failure", async () => {
      mockSendMessage.mockRejectedValue(new Error("Plivo error"));

      await expect(
        service.sendOtp("+14407713030", "123456")
      ).rejects.toThrow("Failed to send SMS");
    });
  });

  describe("sendNotification", () => {
    it("should send a generic SMS notification", async () => {
      mockSendMessage.mockResolvedValue({ messageUuid: ["msg-789"] });

      await service.sendNotification(
        "+14407713030",
        "Your transfer of $500 has been delivered!"
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.any(String),
        "+14407713030",
        "Your transfer of $500 has been delivered!",
      );
    });

    it("should return message UUID", async () => {
      mockSendMessage.mockResolvedValue({ messageUuid: ["notif-123"] });

      const result = await service.sendNotification("+14407713030", "Test");

      expect(result.messageId).toBe("notif-123");
    });
  });
});
