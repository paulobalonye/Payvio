import { FlutterwaveService } from "../../services/flutterwave.service";

const mockHttpPost = jest.fn();
const mockHttpGet = jest.fn();

describe("FlutterwaveService", () => {
  let service: FlutterwaveService;

  beforeEach(() => {
    service = new FlutterwaveService(mockHttpPost, mockHttpGet);
    jest.clearAllMocks();
  });

  describe("verifyBankAccount", () => {
    it("should return account name for valid bank details", async () => {
      mockHttpPost.mockResolvedValue({
        status: "success",
        data: {
          account_number: "0123456789",
          account_name: "AMARA OKAFOR",
        },
      });

      const result = await service.verifyBankAccount(
        "0123456789",
        "044", // GTBank code
        "NG"
      );

      expect(result.account_name).toBe("AMARA OKAFOR");
      expect(result.account_number).toBe("0123456789");
    });

    it("should throw 404 for invalid bank account", async () => {
      mockHttpPost.mockResolvedValue({
        status: "error",
        message: "Account not found",
      });

      await expect(
        service.verifyBankAccount("9999999999", "044", "NG")
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("getBankList", () => {
    it("should return list of banks for a country", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: [
          { id: 1, code: "044", name: "Access Bank" },
          { id: 2, code: "058", name: "GTBank" },
        ],
      });

      const result = await service.getBankList("NG");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Access Bank");
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should return true when hash matches secret", () => {
      const result = service.verifyWebhookSignature("valid-hash", "valid-hash");
      expect(result).toBe(true);
    });

    it("should return false when hash doesn't match", () => {
      const result = service.verifyWebhookSignature("wrong-hash", "correct-hash");
      expect(result).toBe(false);
    });
  });
});
