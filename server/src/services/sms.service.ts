import { env } from "../config/env";

type SendMessageFn = (
  src: string,
  dst: string,
  text: string
) => Promise<{ messageUuid: string[] }>;

export class SmsService {
  private readonly sendMessage: SendMessageFn;
  private readonly senderNumber: string;

  constructor(sendMessageFn?: SendMessageFn) {
    this.senderNumber = env.PLIVO_SENDER_NUMBER;

    if (sendMessageFn) {
      this.sendMessage = sendMessageFn;
    } else {
      this.sendMessage = this.createPlivoSender();
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<{ messageId: string }> {
    const message = `Your Payvio verification code is: ${otp}. It expires in 5 minutes. Do not share this code.`;

    try {
      const result = await this.sendMessage(this.senderNumber, phoneNumber, message);
      return { messageId: result.messageUuid[0] ?? "unknown" };
    } catch (err) {
      console.error("SMS send failed:", err);
      throw new Error("Failed to send SMS");
    }
  }

  async sendNotification(phoneNumber: string, message: string): Promise<{ messageId: string }> {
    try {
      const result = await this.sendMessage(this.senderNumber, phoneNumber, message);
      return { messageId: result.messageUuid[0] ?? "unknown" };
    } catch (err) {
      console.error("SMS notification failed:", err);
      throw new Error("Failed to send SMS");
    }
  }

  private createPlivoSender(): SendMessageFn {
    // Plivo REST API — no SDK needed, just HTTP
    return async (src: string, dst: string, text: string) => {
      const authId = env.PLIVO_AUTH_ID;
      const authToken = env.PLIVO_AUTH_TOKEN;
      const url = `https://api.plivo.com/v1/Account/${authId}/Message/`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${authId}:${authToken}`).toString("base64"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src,
          dst,
          text,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Plivo API error ${res.status}: ${errBody}`);
      }

      const data = (await res.json()) as Record<string, any>;
      return {
        messageUuid: data.message_uuid ?? data.messageUuid ?? [data.api_id],
      };
    };
  }
}
