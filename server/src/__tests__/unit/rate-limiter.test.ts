import type { Request, Response, NextFunction } from "express";
import { createRateLimiter, MemoryRateLimitStore } from "../../middleware/rate-limiter";
import { AppError } from "../../middleware/error-handler";

describe("Rate Limiter", () => {
  let store: MemoryRateLimitStore;
  let limiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextError: Error | undefined;
  let nextCalled: boolean;
  let nextFn: NextFunction;
  let headers: Record<string, string>;

  beforeEach(() => {
    store = new MemoryRateLimitStore();
    limiter = createRateLimiter(
      { windowSeconds: 60, maxRequests: 3, keyGenerator: (req) => `test:${req.ip}` },
      store
    );
    mockReq = { ip: "127.0.0.1" };
    headers = {};
    mockRes = {
      setHeader: ((name: string, value: string) => {
        headers[name] = value;
      }) as any,
    };
    nextError = undefined;
    nextCalled = false;
    nextFn = ((err?: Error) => {
      nextCalled = true;
      nextError = err;
    }) as NextFunction;
  });

  it("should allow requests within the limit", async () => {
    await limiter(mockReq as Request, mockRes as Response, nextFn);
    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  it("should allow exactly maxRequests requests", async () => {
    for (let i = 0; i < 3; i++) {
      nextCalled = false;
      nextError = undefined;
      await limiter(mockReq as Request, mockRes as Response, nextFn);
      expect(nextError).toBeUndefined();
    }
  });

  it("should block the request after exceeding maxRequests", async () => {
    for (let i = 0; i < 3; i++) {
      await limiter(mockReq as Request, mockRes as Response, nextFn);
    }

    nextError = undefined;
    await limiter(mockReq as Request, mockRes as Response, nextFn);

    expect(nextError).toBeInstanceOf(AppError);
    expect((nextError as unknown as AppError).statusCode).toBe(429);
  });

  it("should set Retry-After header when rate limited", async () => {
    for (let i = 0; i < 3; i++) {
      await limiter(mockReq as Request, mockRes as Response, nextFn);
    }

    await limiter(mockReq as Request, mockRes as Response, nextFn);
    expect(headers["Retry-After"]).toBeDefined();
    expect(parseInt(headers["Retry-After"])).toBeGreaterThan(0);
  });

  it("should track different IPs independently", async () => {
    // Exhaust limit for IP 1
    for (let i = 0; i < 3; i++) {
      await limiter(mockReq as Request, mockRes as Response, nextFn);
    }

    // IP 2 should still be allowed
    const req2 = { ip: "192.168.1.1" } as Partial<Request>;
    nextError = undefined;
    await limiter(req2 as Request, mockRes as Response, nextFn);
    expect(nextError).toBeUndefined();
  });
});
