import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from "../../validators/auth.validator";

describe("Auth Validators", () => {
  describe("sendOtpSchema", () => {
    it("should accept valid phone and country code", () => {
      const result = sendOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "+1",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty phone number", () => {
      const result = sendOtpSchema.safeParse({
        phone: "",
        country_code: "+1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject phone with letters", () => {
      const result = sendOtpSchema.safeParse({
        phone: "234abc8901",
        country_code: "+1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject country code without +", () => {
      const result = sendOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject phone shorter than 7 digits", () => {
      const result = sendOtpSchema.safeParse({
        phone: "123456",
        country_code: "+1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject phone longer than 15 digits", () => {
      const result = sendOtpSchema.safeParse({
        phone: "1234567890123456",
        country_code: "+1",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("verifyOtpSchema", () => {
    it("should accept valid OTP verification request", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "+1",
        otp: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject OTP with less than 6 digits", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "+1",
        otp: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("should reject OTP with more than 6 digits", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "+1",
        otp: "1234567",
      });
      expect(result.success).toBe(false);
    });

    it("should reject OTP with non-numeric characters", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "2345678901",
        country_code: "+1",
        otp: "12345a",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const result = verifyOtpSchema.safeParse({
        phone: "2345678901",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should accept valid refresh token", () => {
      const result = refreshTokenSchema.safeParse({
        refresh_token: "some-valid-token",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty refresh token", () => {
      const result = refreshTokenSchema.safeParse({
        refresh_token: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
