import { FxRateService } from "../../services/fx-rate.service";
import { AppError } from "../../middleware/error-handler";

const mockHttpGet = jest.fn();

// Mock Redis-like cache
const mockCache = {
  store: new Map<string, string>(),
  async get(key: string) { return this.store.get(key) ?? null; },
  async set(key: string, value: string, _ttl: number) { this.store.set(key, value); },
  clear() { this.store.clear(); },
};

describe("FxRateService", () => {
  let service: FxRateService;

  beforeEach(() => {
    service = new FxRateService(mockHttpGet, mockCache);
    jest.clearAllMocks();
    mockCache.clear();
  });

  describe("getRate", () => {
    it("should return FX rate for valid currency pair", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: {
          rate: 1560.0,
          fee: 299,
        },
      });

      const result = await service.getRate("USD", "NGN");

      expect(result.from).toBe("USD");
      expect(result.to).toBe("NGN");
      expect(result.our_rate).toBe(1560.0);
      expect(result.fee).toBeGreaterThanOrEqual(0);
      expect(result.rate_id).toBeDefined();
      expect(result.expires_at).toBeDefined();
    });

    it("should return cached rate on second call within TTL", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: { rate: 1560.0, fee: 299 },
      });

      const first = await service.getRate("USD", "NGN");
      const second = await service.getRate("USD", "NGN");

      expect(first.our_rate).toBe(second.our_rate);
      // YellowCard API should only be called once (cached)
      expect(mockHttpGet).toHaveBeenCalledTimes(1);
    });

    it("should include rate_id for locking at confirmation", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: { rate: 1560.0, fee: 299 },
      });

      const result = await service.getRate("USD", "NGN");
      expect(result.rate_id).toMatch(/^[0-9a-f-]+$/); // UUID format
    });

    it("should set expires_at 30 seconds in the future", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: { rate: 1560.0, fee: 299 },
      });

      const result = await service.getRate("USD", "NGN");
      const expiresAt = new Date(result.expires_at).getTime();
      const now = Date.now();

      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt - now).toBeLessThanOrEqual(31000);
    });

    it("should throw if YellowCard API fails", async () => {
      mockHttpGet.mockRejectedValue(new Error("Network error"));

      await expect(service.getRate("USD", "NGN")).rejects.toThrow();
    });
  });

  describe("getRateById", () => {
    it("should return stored rate by ID", async () => {
      mockHttpGet.mockResolvedValue({
        status: "success",
        data: { rate: 1560.0, fee: 299 },
      });

      const rate = await service.getRate("USD", "NGN");
      const retrieved = await service.getRateById(rate.rate_id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.rate_id).toBe(rate.rate_id);
    });

    it("should return null for unknown rate_id", async () => {
      const result = await service.getRateById("nonexistent-id");
      expect(result).toBeNull();
    });
  });
});
