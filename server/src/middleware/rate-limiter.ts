import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler";

export interface RateLimitStore {
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

// In-memory store for development/testing
export class MemoryRateLimitStore implements RateLimitStore {
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.counters.get(key);

    if (!entry || now > entry.expiresAt) {
      this.counters.set(key, { count: 1, expiresAt: now + 60_000 });
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

  async ttl(key: string): Promise<number> {
    const entry = this.counters.get(key);
    if (!entry) return 0;
    return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
  }
}

type RateLimitConfig = {
  readonly windowSeconds: number;
  readonly maxRequests: number;
  readonly keyGenerator: (req: Request) => string;
};

export function createRateLimiter(config: RateLimitConfig, store: RateLimitStore) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = `ratelimit:${config.keyGenerator(req)}`;
      const count = await store.incr(key);

      if (count === 1) {
        await store.expire(key, config.windowSeconds);
      }

      if (count > config.maxRequests) {
        const retryAfter = await store.ttl(key);
        const err = new AppError(429, "Too many requests");
        _res.setHeader("Retry-After", String(retryAfter));
        next(err);
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

// Pre-configured limiters
const defaultStore = new MemoryRateLimitStore();

export const authRateLimiter = createRateLimiter(
  {
    windowSeconds: 60,
    maxRequests: 10,
    keyGenerator: (req) => `auth:${req.ip}`,
  },
  defaultStore
);

export const transferRateLimiter = createRateLimiter(
  {
    windowSeconds: 60,
    maxRequests: 5,
    keyGenerator: (req) => `transfer:${req.user?.sub ?? req.ip}`,
  },
  defaultStore
);
