import crypto from "crypto";
import { env } from "../config/env";

export type YellowCardNetwork = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly country: string;
  readonly status: string;
  readonly accountNumberType: string;
  readonly channelIds: string[];
};

export type YellowCardAccountDetails = {
  readonly accountNumber: string;
  readonly accountName: string;
  readonly accountBank?: string;
};

export class YellowCardClient {
  private readonly apiKey = env.YELLOWCARD_API_KEY;
  private readonly secretKey = env.YELLOWCARD_SECRET_KEY;
  private readonly baseUrl = env.YELLOWCARD_BASE_URL;

  private generateAuth(method: string, path: string, body?: string): {
    authorization: string;
    timestamp: string;
  } {
    const timestamp = new Date().toISOString();
    let message = timestamp + path + method;

    if (body && (method === "POST" || method === "PUT")) {
      const bodyHash = crypto.createHash("sha256").update(body).digest("base64");
      message += bodyHash;
    }

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(message)
      .digest("base64");

    return {
      authorization: `YcHmacV1 ${this.apiKey}:${signature}`,
      timestamp,
    };
  }

  async get<T>(path: string): Promise<T> {
    const { authorization, timestamp } = this.generateAuth("GET", path);

    const res = await fetch(this.baseUrl + path, {
      headers: {
        Authorization: authorization,
        "X-YC-Timestamp": timestamp,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`YellowCard GET ${path} failed: ${res.status} ${(err as any).message ?? ""}`);
    }

    return res.json() as Promise<T>;
  }

  async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const bodyStr = JSON.stringify(body);
    const { authorization, timestamp } = this.generateAuth("POST", path, bodyStr);

    const res = await fetch(this.baseUrl + path, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "X-YC-Timestamp": timestamp,
        "Content-Type": "application/json",
      },
      body: bodyStr,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`YellowCard POST ${path} failed: ${res.status} ${(err as any).message ?? ""}`);
    }

    return res.json() as Promise<T>;
  }

  async getRates(): Promise<{ rates: Array<{ code: string; buy: number; sell: number; locale: string; rateId: string }> }> {
    return this.get("/business/rates");
  }

  async getChannels(countryCode: string): Promise<any> {
    return this.get(`/business/channels?countryCode=${countryCode}`);
  }

  async getNetworks(countryCode: string): Promise<YellowCardNetwork[]> {
    return this.get<YellowCardNetwork[]>(`/business/networks?country=${countryCode}`);
  }

  async resolveBank(accountNumber: string, networkId: string): Promise<YellowCardAccountDetails> {
    return this.post<YellowCardAccountDetails>("/business/details/bank", {
      accountNumber,
      networkId,
    });
  }

  async resolveMomo(accountNumber: string, networkId: string): Promise<YellowCardAccountDetails> {
    return this.post<YellowCardAccountDetails>("/business/details/momo", {
      accountNumber,
      networkId,
    });
  }

  async submitTransfer(params: {
    amount: number;
    currency: string;
    recipientId: string;
    rateId: string;
  }): Promise<{ reference: string }> {
    // This would call the YellowCard payment endpoint
    // Exact endpoint depends on YellowCard docs for disbursements
    return this.post("/business/payments", {
      amount: params.amount,
      currencyCode: params.currency,
      channelId: params.rateId,
      merchantId: env.YELLOWCARD_MERCHANT_ID,
    });
  }
}
