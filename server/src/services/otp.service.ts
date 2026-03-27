import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import { SmsService } from "./sms.service";

export interface OtpStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class OtpService {
  private readonly smsService: SmsService;

  constructor(private readonly store: OtpStore, smsService?: SmsService) {
    this.smsService = smsService ?? new SmsService();
  }

  async sendOtp(phone: string, countryCode: string): Promise<{ expires_in: number }> {
    const fullNumber = `${countryCode}${phone}`;
    const rateLimitKey = `otp:ratelimit:${fullNumber}`;

    // Check rate limit (3 per hour)
    const attempts = await this.store.incr(rateLimitKey);
    if (attempts === 1) {
      await this.store.expire(rateLimitKey, 3600); // 1 hour TTL
    }
    if (attempts > env.OTP_MAX_ATTEMPTS) {
      throw new AppError(429, "Too many OTP requests. Try again later.");
    }

    // Generate 6-digit OTP
    const otp = this.generateOtp();

    // Hash and store
    const hashed = await bcrypt.hash(otp, 10);
    const otpKey = `otp:${fullNumber}`;
    await this.store.set(otpKey, hashed, env.OTP_TTL);

    // Send via AWS SNS (skipped in test mode)
    if (env.NODE_ENV === "test") {
      console.log(`[TEST] OTP for ${fullNumber}: ${otp}`);
    } else {
      try {
        await this.smsService.sendOtp(fullNumber, otp);
      } catch (err) {
        console.error("SMS delivery failed, OTP still stored:", err);
        // Don't throw — OTP is stored, user can retry SMS
      }
    }

    return { expires_in: env.OTP_TTL };
  }

  async verifyOtp(phone: string, countryCode: string, otp: string): Promise<boolean> {
    const fullNumber = `${countryCode}${phone}`;
    const otpKey = `otp:${fullNumber}`;

    const storedHash = await this.store.get(otpKey);
    if (!storedHash) {
      throw new AppError(410, "OTP expired or not found");
    }

    const isValid = await bcrypt.compare(otp, storedHash);
    if (!isValid) {
      throw new AppError(401, "Invalid OTP");
    }

    // Invalidate after use
    await this.store.del(otpKey);
    return true;
  }

  private generateOtp(): string {
    const max = Math.pow(10, env.OTP_LENGTH) - 1;
    const num = crypto.randomInt(0, max + 1);
    return num.toString().padStart(env.OTP_LENGTH, "0");
  }
}
