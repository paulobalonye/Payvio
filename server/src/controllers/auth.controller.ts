import type { Request, Response, NextFunction } from "express";
import { OtpService, type OtpStore } from "../services/otp.service";
import { AuthService } from "../services/auth.service";
import type { ApiResponse, SendOtpResponse, VerifyOtpResponse, AuthTokens } from "../types";

// In-memory OTP store for development/testing
// In production, replace with Redis-backed store
class MemoryOtpStore implements OtpStore {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async incr(key: string): Promise<number> {
    const entry = this.counters.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.counters.set(key, { count: 1, expiresAt: Date.now() + 3600_000 });
      return 1;
    }
    entry.count += 1;
    return entry.count;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.counters.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const otpStore = new MemoryOtpStore();
const otpService = new OtpService(otpStore);
const authService = new AuthService();

export class AuthController {
  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, country_code } = req.body;
      const result = await otpService.sendOtp(phone, country_code);

      const response: ApiResponse<SendOtpResponse> = {
        success: true,
        data: { success: true, expires_in: result.expires_in },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, country_code, otp } = req.body;
      await otpService.verifyOtp(phone, country_code, otp);
      const result = await authService.handleVerifiedOtp(phone, country_code);

      const response: ApiResponse<VerifyOtpResponse> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token } = req.body;
      const tokens = await authService.refreshAccessToken(refresh_token);

      const response: ApiResponse<AuthTokens> = {
        success: true,
        data: tokens,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}
