import { ReceiptService } from "../../services/receipt.service";

describe("ReceiptService", () => {
  let service: ReceiptService;

  beforeEach(() => {
    service = new ReceiptService();
  });

  describe("generateHtml", () => {
    const transferData = {
      transferId: "TXN-001",
      senderName: "John Doe",
      recipientName: "Amara Okafor",
      sendAmount: "$500.00",
      receiveAmount: "₦780,000.00",
      fxRate: "1 USD = 1,560.00 NGN",
      fee: "$2.99",
      status: "Delivered",
      date: "2025-06-15 14:30 UTC",
    };

    it("should generate HTML receipt with all fields", () => {
      const html = service.generateHtml(transferData);

      expect(html).toContain("TXN-001");
      expect(html).toContain("John Doe");
      expect(html).toContain("Amara Okafor");
      expect(html).toContain("$500.00");
      expect(html).toContain("₦780,000.00");
      expect(html).toContain("1 USD = 1,560.00 NGN");
      expect(html).toContain("$2.99");
      expect(html).toContain("Delivered");
      expect(html).toContain("Payvio");
    });

    it("should include Payvio branding", () => {
      const html = service.generateHtml(transferData);

      expect(html).toContain("Payvio");
      expect(html).toContain("Transfer Receipt");
    });

    it("should be valid HTML structure", () => {
      const html = service.generateHtml(transferData);

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });
  });
});
