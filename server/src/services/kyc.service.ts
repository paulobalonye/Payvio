import crypto from "crypto";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import type { CreateKycSessionResponse, VeriffWebhookPayload } from "../types";

type HttpPostFn = (url: string, body: unknown, headers: Record<string, string>) => Promise<any>;

export class KycService {
  constructor(private readonly httpPost?: HttpPostFn) {}

  async createSession(userId: string): Promise<CreateKycSessionResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.kycStatus === "APPROVED") {
      throw new AppError(400, "User is already KYC approved");
    }

    const postFn = this.httpPost ?? this.defaultHttpPost;

    const response = await postFn(
      `${env.VERIFF_BASE_URL}/v1/sessions`,
      {
        verification: {
          person: {
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
          },
          vendorData: userId,
          callback: `${env.APP_URL}/webhooks/veriff`,
        },
      },
      {
        "X-AUTH-CLIENT": env.VERIFF_API_KEY,
        "Content-Type": "application/json",
      }
    );

    // Update KYC status to PENDING
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    });

    return {
      session_id: response.verification.id,
      session_url: response.verification.url,
    };
  }

  async handleWebhook(payload: VeriffWebhookPayload): Promise<void> {
    const statusMap: Record<string, string> = {
      approved: "APPROVED",
      declined: "REJECTED",
      resubmission_requested: "NONE",
    };

    const newStatus = statusMap[payload.status] ?? "NONE";

    // Find user by vendorData (stored as session metadata)
    // For now, we'll use the verification ID to look up
    // In production, vendorData in the webhook contains the userId
    await prisma.user.update({
      where: { id: payload.verification.id },
      data: { kycStatus: newStatus as any },
    });
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  }

  private async defaultHttpPost(
    url: string,
    body: unknown,
    headers: Record<string, string>
  ): Promise<any> {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return response.json();
  }
}
