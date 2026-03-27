import { SNSClient, PublishCommand, type PublishCommandInput } from "@aws-sdk/client-sns";
import { env } from "../config/env";

type SnsPublishFn = (params: PublishCommandInput) => Promise<{ MessageId?: string }>;

export class SmsService {
  private readonly publish: SnsPublishFn;

  constructor(publishFn?: SnsPublishFn) {
    if (publishFn) {
      this.publish = publishFn;
    } else {
      const client = new SNSClient({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.publish = (params) => client.send(new PublishCommand(params));
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<{ messageId: string }> {
    const params: PublishCommandInput = {
      PhoneNumber: phoneNumber,
      Message: `Your Payvio verification code is: ${otp}. It expires in 5 minutes. Do not share this code.`,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "Payvio",
        },
      },
    };

    try {
      const result = await this.publish(params);
      return { messageId: result.MessageId ?? "unknown" };
    } catch (err) {
      console.error("SMS send failed:", err);
      throw new Error("Failed to send SMS");
    }
  }

  async sendNotification(phoneNumber: string, message: string): Promise<{ messageId: string }> {
    const params: PublishCommandInput = {
      PhoneNumber: phoneNumber,
      Message: message,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "Payvio",
        },
      },
    };

    try {
      const result = await this.publish(params);
      return { messageId: result.MessageId ?? "unknown" };
    } catch (err) {
      console.error("SMS notification failed:", err);
      throw new Error("Failed to send SMS");
    }
  }
}
