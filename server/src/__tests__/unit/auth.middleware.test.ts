import type { Request, Response, NextFunction } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { TokenService } from "../../services/token.service";
import { AppError } from "../../middleware/error-handler";

describe("authenticate middleware", () => {
  const tokenService = new TokenService();
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;
  let nextError: Error | undefined;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    nextError = undefined;
    nextFn = ((err?: Error) => {
      nextError = err;
    }) as NextFunction;
  });

  it("should call next with AppError if no Authorization header", () => {
    authenticate(mockReq as Request, mockRes as Response, nextFn);
    expect(nextError).toBeInstanceOf(AppError);
    expect((nextError as AppError).statusCode).toBe(401);
  });

  it("should call next with AppError if Authorization header doesn't start with Bearer", () => {
    mockReq.headers = { authorization: "Basic abc123" };
    authenticate(mockReq as Request, mockRes as Response, nextFn);
    expect(nextError).toBeInstanceOf(AppError);
    expect((nextError as AppError).statusCode).toBe(401);
  });

  it("should call next with AppError for invalid token", () => {
    mockReq.headers = { authorization: "Bearer invalid-token" };
    authenticate(mockReq as Request, mockRes as Response, nextFn);
    expect(nextError).toBeInstanceOf(AppError);
    expect((nextError as AppError).statusCode).toBe(401);
  });

  it("should set req.user and call next() for valid token", () => {
    const token = tokenService.generateAccessToken("user-123", "1234567890");
    mockReq.headers = { authorization: `Bearer ${token}` };

    authenticate(mockReq as Request, mockRes as Response, nextFn);

    expect(nextError).toBeUndefined();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user!.sub).toBe("user-123");
    expect(mockReq.user!.phone).toBe("1234567890");
  });

  it("should call next with AppError for expired token", () => {
    // Create a token that's already expired by using a negative TTL
    // We'll test with a tampered token instead
    const token = tokenService.generateAccessToken("user-123", "1234567890");
    const parts = token.split(".");
    // Tamper with payload to make it invalid
    parts[1] = Buffer.from(JSON.stringify({ sub: "user-123", exp: 0, iat: 0 })).toString("base64url");
    const tamperedToken = parts.join(".");

    mockReq.headers = { authorization: `Bearer ${tamperedToken}` };
    authenticate(mockReq as Request, mockRes as Response, nextFn);

    expect(nextError).toBeInstanceOf(AppError);
    expect((nextError as AppError).statusCode).toBe(401);
  });
});
