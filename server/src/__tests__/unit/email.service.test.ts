import { EmailService } from "../../services/email.service";

// Mock Resend client
const mockSend = jest.fn();

describe("EmailService", () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService(mockSend);
    jest.clearAllMocks();
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email with correct fields", async () => {
      mockSend.mockResolvedValue({ id: "email-123" });

      await service.sendWelcomeEmail("john@example.com", "John");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Welcome"),
        })
      );
    });

    it("should not throw if send fails (graceful degradation)", async () => {
      mockSend.mockRejectedValue(new Error("Resend API error"));

      await expect(
        service.sendWelcomeEmail("john@example.com", "John")
      ).resolves.not.toThrow();
    });
  });

  describe("sendKycStatusEmail", () => {
    it("should send approved email", async () => {
      mockSend.mockResolvedValue({ id: "email-456" });

      await service.sendKycStatusEmail("john@example.com", "John", "approved");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("verified"),
        })
      );
    });

    it("should send rejected email", async () => {
      mockSend.mockResolvedValue({ id: "email-789" });

      await service.sendKycStatusEmail("john@example.com", "John", "rejected");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("action"),
        })
      );
    });
  });

  describe("sendTransferConfirmation", () => {
    it("should send transfer confirmation email", async () => {
      mockSend.mockResolvedValue({ id: "email-101" });

      await service.sendTransferConfirmation("john@example.com", "John", {
        amount: "$500.00",
        recipient: "Amara Okafor",
        currency: "NGN",
        status: "delivered",
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: expect.stringContaining("Transfer"),
        })
      );
    });
  });
});
