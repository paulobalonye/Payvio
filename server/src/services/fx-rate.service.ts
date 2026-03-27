import crypto from "crypto";
import { env } from "../config/env";
import type { FxRate } from "../types";

type HttpGetFn = (url: string, headers: Record<string, string>) => Promise<any>;

type RateCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

const RATE_LOCK_TTL = 30; // seconds
const CACHE_TTL = 60; // seconds

export class FxRateService {
  private readonly rateStore = new Map<string, FxRate>();

  constructor(
    private readonly httpGet?: HttpGetFn,
    private readonly cache?: RateCache
  ) {}

  async getRate(from: string, to: string): Promise<FxRate> {
    const cacheKey = `fx:${from}:${to}`;

    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as FxRate;
        // Return with fresh rate_id and expiry
        const rate = this.createRateWithId(parsed.our_rate, parsed.fee, from, to);
        return rate;
      }
    }

    // Fetch from YellowCard
    const getFn = this.httpGet ?? this.defaultHttpGet;
    const response = await getFn(
      `${env.YELLOWCARD_BASE_URL}/rates?from=${from}&to=${to}`,
      {
        "X-YC-Timestamp": new Date().toISOString(),
        Authorization: `Bearer ${env.YELLOWCARD_API_KEY}`,
      }
    );

    const ourRate = response.data.rate;
    const fee = response.data.fee;

    // Cache the rate
    if (this.cache) {
      await this.cache.set(
        cacheKey,
        JSON.stringify({ our_rate: ourRate, fee, from, to }),
        CACHE_TTL
      );
    }

    return this.createRateWithId(ourRate, fee, from, to);
  }

  async getRateById(rateId: string): Promise<FxRate | null> {
    return this.rateStore.get(rateId) ?? null;
  }

  private createRateWithId(ourRate: number, fee: number, from: string, to: string): FxRate {
    const rateId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RATE_LOCK_TTL * 1000).toISOString();

    const rate: FxRate = {
      rate_id: rateId,
      from,
      to,
      mid_market_rate: ourRate * 1.003, // approximate
      our_rate: ourRate,
      spread: 0.3,
      fee,
      expires_at: expiresAt,
    };

    // Store for lookup by rate_id
    this.rateStore.set(rateId, rate);

    // Clean up expired rates (simple in-memory cleanup)
    setTimeout(() => this.rateStore.delete(rateId), RATE_LOCK_TTL * 1000 + 5000);

    return rate;
  }

  private async defaultHttpGet(
    url: string,
    headers: Record<string, string>
  ): Promise<any> {
    const res = await fetch(url, { headers });
    return res.json();
  }
}
