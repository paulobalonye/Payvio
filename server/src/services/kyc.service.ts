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
          callback: `https://api.payvioapp.com/kyc/webhook`,
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

  async handleWebhook(payload: any): Promise<void> {
    const statusMap: Record<string, string> = {
      approved: "APPROVED",
      declined: "REJECTED",
      resubmission_requested: "NONE",
    };

    const status = payload.verification?.status ?? payload.status;
    const newStatus = statusMap[status] ?? "NONE";

    // vendorData contains the userId we passed when creating the session
    const userId = payload.vendorData ?? payload.verification?.vendorData;

    if (!userId) {
      console.error("Veriff webhook: no vendorData (userId) found");
      return;
    }

    const updateData: any = { kycStatus: newStatus };

    // If approved, update name from KYC verification
    if (newStatus === "APPROVED" && payload.verification?.person) {
      const { firstName, lastName } = payload.verification.person;
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
