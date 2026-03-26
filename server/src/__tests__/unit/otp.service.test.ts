import { OtpService, type OtpStore } from "../../services/otp.service";
import { AppError } from "../../middleware/error-handler";

// In-memory test store
class TestOtpStore implements OtpStore {
  private store = new Map<string, string>();
  private counters = new Map<string, number>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, _ttl: number): Promise<void> {
    this.store.set(key, value);
  }

  async incr(key: string): Promise<number> {
    const current = this.counters.get(key) ?? 0;
    const next = current + 1;
    this.counters.set(key, next);
    return next;
  }

  async expire(_key: string, _ttl: number): Promise<void> {}

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Test helper
  getStoredValue(key: string): string | undefined {
    return this.store.get(key);
  }

  resetCounters(): void {
    this.counters.clear();
  }
}

describe("OtpService", () => {
  let store: TestOtpStore;
  let service: OtpService;

  beforeEach(() => {
    store = new TestOtpStore();
    service = new OtpService(store);
  });

  describe("sendOtp", () => {
    it("should return expires_in on success", async () => {
      const result = await service.sendOtp("1234567890", "+1");
      expect(result.expires_in).toBe(300); // 5 minutes
    });

    it("should store a hashed OTP in the store", async () => {
      await service.sendOtp("1234567890", "+1");
      const stored = store.getStoredValue("otp:+11234567890");
      expect(stored).toBeDefined();
      // Should be a bcrypt hash, not plain OTP
      expect(stored!.startsWith("$2")).toBe(true);
    });

    it("should throw 429 after 3 attempts in one hour", async () => {
      await service.sendOtp("1234567890", "+1");
      await service.sendOtp("1234567890", "+1");
      await service.sendOtp("1234567890", "+1");

      await expect(service.sendOtp("1234567890", "+1")).rejects.toThrow(AppError);
      await expect(service.sendOtp("1234567890", "+1")).rejects.toMatchObject({
        statusCode: 429,
      });
    });

    it("should allow different phone numbers independently", async () => {
      await service.sendOtp("1111111111", "+1");
      await service.sendOtp("2222222222", "+1");
      await service.sendOtp("3333333333", "+1");
      // Each number used only 1 attempt
      const result = await service.sendOtp("1111111111", "+1");
      expect(result.expires_in).toBe(300);
    });
  });

  describe("verifyOtp", () => {
    it("should return true for correct OTP", async () => {
      // We need to intercept the OTP. Since it's logged in test mode, we'll
      // test the flow by sending and then verifying with the stored hash.
      // Instead, test the verify logic directly by storing a known hash.
      const bcrypt = require("bcrypt");
      const hashedOtp = await bcrypt.hash("123456", 10);
      await store.set("otp:+11234567890", hashedOtp, 300);

      const result = await service.verifyOtp("1234567890", "+1", "123456");
      expect(result).toBe(true);
    });

    it("should throw 401 for wrong OTP", async () => {
      const bcrypt = require("bcrypt");
      const hashedOtp = await bcrypt.hash("123456", 10);
      await store.set("otp:+11234567890", hashedOtp, 300);

      await expect(
        service.verifyOtp("1234567890", "+1", "999999")
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 410 for expired/missing OTP", async () => {
      await expect(
        service.verifyOtp("1234567890", "+1", "123456")
      ).rejects.toMatchObject({ statusCode: 410 });
    });

    it("should invalidate OTP after successful verification", async () => {
      const bcrypt = require("bcrypt");
      const hashedOtp = await bcrypt.hash("123456", 10);
      await store.set("otp:+11234567890", hashedOtp, 300);

      await service.verifyOtp("1234567890", "+1", "123456");

      // Second attempt should fail (OTP deleted)
      await expect(
        service.verifyOtp("1234567890", "+1", "123456")
      ).rejects.toMatchObject({ statusCode: 410 });
    });
  });
});
