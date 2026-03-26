import { TokenService } from "../../services/token.service";

describe("TokenService", () => {
  const service = new TokenService();
  const userId = "test-user-id";
  const phone = "1234567890";

  describe("generateAccessToken", () => {
    it("should generate a valid JWT string", () => {
      const token = service.generateAccessToken(userId, phone);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should contain correct payload when verified", () => {
      const token = service.generateAccessToken(userId, phone);
      const payload = service.verifyAccessToken(token);
      expect(payload.sub).toBe(userId);
      expect(payload.phone).toBe(phone);
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    it("should expire in 15 minutes", () => {
      const token = service.generateAccessToken(userId, phone);
      const payload = service.verifyAccessToken(token);
      const ttl = payload.exp - payload.iat;
      expect(ttl).toBe(15 * 60);
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a 96-char hex string", () => {
      const token = service.generateRefreshToken();
      expect(typeof token).toBe("string");
      expect(token).toHaveLength(96); // 48 bytes = 96 hex chars
    });

    it("should generate unique tokens", () => {
      const token1 = service.generateRefreshToken();
      const token2 = service.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyAccessToken", () => {
    it("should throw on invalid token", () => {
      expect(() => service.verifyAccessToken("invalid-token")).toThrow();
    });

    it("should throw on tampered token", () => {
      const token = service.generateAccessToken(userId, phone);
      const tampered = token.slice(0, -5) + "XXXXX";
      expect(() => service.verifyAccessToken(tampered)).toThrow();
    });
  });

  describe("generateTokenPair", () => {
    it("should return both access and refresh tokens", () => {
      const pair = service.generateTokenPair(userId, phone);
      expect(pair.access_token).toBeDefined();
      expect(pair.refresh_token).toBeDefined();
      expect(pair.access_token.split(".")).toHaveLength(3);
      expect(pair.refresh_token).toHaveLength(96);
    });
  });

  describe("decodeWithoutVerify", () => {
    it("should decode a valid token without verification", () => {
      const token = service.generateAccessToken(userId, phone);
      const payload = service.decodeWithoutVerify(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe(userId);
    });

    it("should return null for invalid token", () => {
      const payload = service.decodeWithoutVerify("not-a-jwt");
      expect(payload).toBeNull();
    });
  });
});
