import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";

type HttpPostFn = (url: string, body: unknown, headers: Record<string, string>) => Promise<any>;
type HttpGetFn = (url: string, headers: Record<string, string>) => Promise<any>;

type BankVerificationResult = {
  readonly account_number: string;
  readonly account_name: string;
};

type BankInfo = {
  readonly id: number;
  readonly code: string;
  readonly name: string;
};

export class FlutterwaveService {
  private readonly baseUrl = "https://api.flutterwave.com/v3";

  constructor(
    private readonly httpPost?: HttpPostFn,
    private readonly httpGet?: HttpGetFn
  ) {}

  async verifyBankAccount(
    accountNumber: string,
    bankCode: string,
    country: string
  ): Promise<BankVerificationResult> {
    const postFn = this.httpPost ?? this.defaultPost;

    const response = await postFn(
      `${this.baseUrl}/accounts/resolve`,
      { account_number: accountNumber, account_bank: bankCode },
      {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      }
    );

    if (response.status !== "success") {
      throw new AppError(404, "Bank account not found or invalid");
    }

    return {
      account_number: response.data.account_number,
      account_name: response.data.account_name,
    };
  }

  async getBankList(country: string): Promise<BankInfo[]> {
    const getFn = this.httpGet ?? this.defaultGet;

    const response = await getFn(
      `${this.baseUrl}/banks/${country}`,
      {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      }
    );

    if (response.status !== "success") {
      return [];
    }

    return response.data.map((bank: any) => ({
      id: bank.id,
      code: bank.code,
      name: bank.name,
    }));
  }

  verifyWebhookSignature(receivedHash: string, expectedHash: string): boolean {
    return receivedHash === expectedHash;
  }

  private async defaultPost(
    url: string,
    body: unknown,
    headers: Record<string, string>
  ): Promise<any> {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  }

  private async defaultGet(
    url: string,
    headers: Record<string, string>
  ): Promise<any> {
    const res = await fetch(url, { headers });
    return res.json();
  }
}
