import { SmsService } from "../../services/sms.service";

const mockSnsPublish = jest.fn();

describe("SmsService", () => {
  let service: SmsService;

  beforeEach(() => {
    service = new SmsService(mockSnsPublish);
    jest.clearAllMocks();
  });

  describe("sendOtp", () => {
    it("should send OTP SMS with correct format", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-123" });

      await service.sendOtp("+12345678901", "123456");

      expect(mockSnsPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          PhoneNumber: "+12345678901",
          Message: expect.stringContaining("123456"),
        })
      );
    });

    it("should include Payvio branding in message", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-123" });

      await service.sendOtp("+12345678901", "654321");

      const callArgs = mockSnsPublish.mock.calls[0][0];
      expect(callArgs.Message).toContain("Payvio");
      expect(callArgs.Message).toContain("654321");
    });

    it("should set SMS type to Transactional", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-123" });

      await service.sendOtp("+12345678901", "123456");

      const callArgs = mockSnsPublish.mock.calls[0][0];
      expect(callArgs.MessageAttributes).toEqual(
        expect.objectContaining({
          "AWS.SNS.SMS.SMSType": expect.objectContaining({
            StringValue: "Transactional",
          }),
        })
      );
    });

    it("should set sender ID to Payvio", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-123" });

      await service.sendOtp("+12345678901", "123456");

      const callArgs = mockSnsPublish.mock.calls[0][0];
      expect(callArgs.MessageAttributes).toEqual(
        expect.objectContaining({
          "AWS.SNS.SMS.SenderID": expect.objectContaining({
            StringValue: "Payvio",
          }),
        })
      );
    });

    it("should return message ID on success", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-456" });

      const result = await service.sendOtp("+12345678901", "123456");

      expect(result.messageId).toBe("msg-456");
    });

    it("should throw on SNS failure", async () => {
      mockSnsPublish.mockRejectedValue(new Error("SNS error"));

      await expect(
        service.sendOtp("+12345678901", "123456")
      ).rejects.toThrow("Failed to send SMS");
    });
  });

  describe("sendNotification", () => {
    it("should send a generic SMS notification", async () => {
      mockSnsPublish.mockResolvedValue({ MessageId: "msg-789" });

      await service.sendNotification("+12345678901", "Your transfer of $500 has been delivered!");

      expect(mockSnsPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          PhoneNumber: "+12345678901",
          Message: "Your transfer of $500 has been delivered!",
        })
      );
    });
  });
});
