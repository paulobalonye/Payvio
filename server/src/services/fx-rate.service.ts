import crypto from "crypto";
import type { FxRate } from "../types";
import { YellowCardClient } from "./yellowcard.client";

type HttpGetFn = (url: string, headers: Record<string, string>) => Promise<any>;

type RateCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
};

const RATE_LOCK_TTL = 30; // seconds
const CACHE_TTL = 60; // seconds

// Currency code to YellowCard locale mapping
const CURRENCY_LOCALE: Record<string, string> = {
  NGN: "NG", KES: "KE", GHS: "GH", ZAR: "ZA", UGX: "UG",
  TZS: "TZ", ETB: "ET", XOF: "CI", INR: "IN", PHP: "PH",
  PKR: "PK", BDT: "BD", MXN: "MX", COP: "CO", BRL: "BR",
};

export class FxRateService {
  private readonly rateStore = new Map<string, FxRate>();
  private readonly ycClient: YellowCardClient;

  constructor(
    private readonly httpGet?: HttpGetFn,
    private readonly cache?: RateCache
  ) {
    this.ycClient = new YellowCardClient();
  }

  async getRate(from: string, to: string): Promise<FxRate> {
    const cacheKey = `fx:${from}:${to}`;

    // Check cache first
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as FxRate;
        return this.createRateWithId(parsed.our_rate, parsed.fee, from, to);
      }
    }

    // If a custom httpGet was provided (for testing), use it
    if (this.httpGet) {
      const response = await this.httpGet(`/rates?from=${from}&to=${to}`, {});
      const ourRate = response.data.rate;
      const fee = response.data.fee;

      if (this.cache) {
        await this.cache.set(cacheKey, JSON.stringify({ our_rate: ourRate, fee, from, to }), CACHE_TTL);
      }
      return this.createRateWithId(ourRate, fee, from, to);
    }

    // Fetch from YellowCard live API
    const ycRates = await this.ycClient.getRates();
    const locale = CURRENCY_LOCALE[to];
    const match = ycRates.rates.find(
      (r) => r.code === to || (r.locale === locale && r.code === to)
    );

    if (!match) {
      // Fallback: find by code across all locales
      const byCode = ycRates.rates.find((r) => r.code === to);
      if (!byCode) {
        throw new Error(`No YellowCard rate found for ${to}`);
      }
      const ourRate = byCode.sell;
      const fee = 299; // default fee in cents ($2.99)
      if (this.cache) {
        await this.cache.set(cacheKey, JSON.stringify({ our_rate: ourRate, fee, from, to }), CACHE_TTL);
      }
      return this.createRateWithId(ourRate, fee, from, to);
    }

    const ourRate = match.sell;
    const fee = 299; // $2.99 default

    if (this.cache) {
      await this.cache.set(cacheKey, JSON.stringify({ our_rate: ourRate, fee, from, to }), CACHE_TTL);
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
      mid_market_rate: ourRate * 1.003,
      our_rate: ourRate,
      spread: 0.3,
      fee,
      expires_at: expiresAt,
    };

    this.rateStore.set(rateId, rate);
    setTimeout(() => this.rateStore.delete(rateId), RATE_LOCK_TTL * 1000 + 5000);

    return rate;
  }
}
