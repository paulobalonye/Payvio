import { prisma } from "../config/database";

type PushPayload = {
  readonly title: string;
  readonly body: string;
  readonly data: Record<string, string>;
};

type PushSenderFn = (
  token: string,
  platform: string,
  payload: PushPayload
) => Promise<{ success: boolean }>;

export class NotificationService {
  constructor(private readonly pushSender?: PushSenderFn) {}

  async registerDevice(
    userId: string,
    token: string,
    platform: "ios" | "android"
  ): Promise<void> {
    await prisma.device.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    });
  }

  async sendPush(
    userId: string,
    title: string,
    body: string,
    data: Record<string, string>
  ): Promise<void> {
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    if (devices.length === 0) return;

    const sender = this.pushSender ?? this.defaultSender;

    for (const device of devices) {
      try {
        await sender(device.token, device.platform, { title, body, data });
      } catch {
        // Remove invalid tokens
        await prisma.device.deleteMany({
          where: { token: device.token },
        });
      }
    }
  }

  private async defaultSender(
    token: string,
    platform: string,
    payload: PushPayload
  ): Promise<{ success: boolean }> {
    // In production: use FCM for Android, APNs for iOS
    console.log(`[DEV] Push to ${platform}:${token}: ${payload.title}`);
    return { success: true };
  }
}
