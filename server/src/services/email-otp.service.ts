import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import { EmailService } from "./email.service";

export interface OtpStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

export class EmailOtpService {
  private readonly emailService: EmailService;

  constructor(
    private readonly store: OtpStore,
    emailService?: EmailService
  ) {
    this.emailService = emailService ?? new EmailService();
  }

  async sendOtp(email: string): Promise<{ expires_in: number }> {
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitKey = `otp:ratelimit:${normalizedEmail}`;

    // Rate limit: 3 per hour
    const attempts = await this.store.incr(rateLimitKey);
    if (attempts === 1) {
      await this.store.expire(rateLimitKey, 3600);
    }
    if (attempts > env.OTP_MAX_ATTEMPTS) {
      throw new AppError(429, "Too many OTP requests. Try again later.");
    }

    // Generate 6-digit OTP
    const otp = this.generateOtp();

    // Hash and store
    const hashed = await bcrypt.hash(otp, 10);
    const otpKey = `otp:email:${normalizedEmail}`;
    await this.store.set(otpKey, hashed, env.OTP_TTL);

    // Send via Resend
    if (env.NODE_ENV === "test") {
      console.log(`[TEST] Email OTP for ${normalizedEmail}: ${otp}`);
    } else {
      try {
        await this.emailService.sendOtpEmail(normalizedEmail, otp);
      } catch (err) {
        console.error("Email OTP delivery failed:", err);
      }
    }

    return { expires_in: env.OTP_TTL };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const otpKey = `otp:email:${normalizedEmail}`;

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
