import { Router, type Request, type Response, type NextFunction } from "express";
import { validate } from "../middleware/validate";
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from "../validators/auth.validator";
import { AuthController } from "../controllers/auth.controller";
import { EmailOtpService, type OtpStore } from "../services/email-otp.service";
import { EmailAuthService } from "../services/email-auth.service";
import { z } from "zod/v4";

const authRouter = Router();
const controller = new AuthController();

// Phone-based OTP (legacy)
authRouter.post("/send-otp", validate(sendOtpSchema), controller.sendOtp);
authRouter.post("/verify-otp", validate(verifyOtpSchema), controller.verifyOtp);
authRouter.post("/refresh", validate(refreshTokenSchema), controller.refresh);

// === EMAIL-BASED OTP (new) ===

const sendEmailOtpSchema = z.object({
  email: z.email(),
});

const verifyEmailOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"),
});

// In-memory OTP store (same pattern as phone OTP)
class MemoryOtpStore implements OtpStore {
  private store = new Map<string, { value: string; expiresAt: number }>();
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
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
    if (entry) entry.expiresAt = Date.now() + ttlSeconds * 1000;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const emailOtpStore = new MemoryOtpStore();
const emailOtpService = new EmailOtpService(emailOtpStore);
const emailAuthService = new EmailAuthService();

authRouter.post("/send-email-otp", validate(sendEmailOtpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await emailOtpService.sendOtp(email);
    res.json({ success: true, data: { success: true, expires_in: result.expires_in } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/verify-email-otp", validate(verifyEmailOtpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    await emailOtpService.verifyOtp(email, otp);
    const result = await emailAuthService.handleVerifiedEmail(email);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export { authRouter };
