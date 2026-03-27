import { env } from "../config/env";

type SendEmailFn = (params: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => Promise<{ id: string }>;

export class EmailService {
  constructor(private readonly sendFn?: SendEmailFn) {}

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.safeSend({
      from: `Payvio <${env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: `${otp} is your Payvio verification code`,
      html: `
        <div style="font-family:-apple-system,sans-serif;max-width:400px;margin:0 auto;padding:40px 20px">
          <h2 style="color:#4f46e5;margin-bottom:8px">Payvio</h2>
          <p style="color:#64748b;font-size:14px;margin-bottom:24px">Your verification code</p>
          <div style="background:#f8fafc;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#0f172a">${otp}</span>
          </div>
          <p style="color:#64748b;font-size:14px">This code expires in 5 minutes. Do not share it with anyone.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.safeSend({
      from: `Payvio <${env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Payvio!",
      html: `
        <h2>Welcome to Payvio, ${firstName}!</h2>
        <p>You're all set to send money home — instantly.</p>
        <p>Complete your identity verification to start sending transfers.</p>
      `,
    });
  }

  async sendKycStatusEmail(
    email: string,
    firstName: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    const subject =
      status === "approved"
        ? "Your identity has been verified!"
        : "Identity verification — action required";

    const body =
      status === "approved"
        ? `<h2>You're verified, ${firstName}!</h2><p>Your identity has been confirmed. You can now send money to 40+ countries.</p>`
        : `<h2>Verification update, ${firstName}</h2><p>We couldn't verify your identity with the documents provided. Please try again with a clearer photo of your government-issued ID.</p>`;

    await this.safeSend({
      from: `Payvio <${env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject,
      html: body,
    });
  }

  async sendTransferConfirmation(
    email: string,
    firstName: string,
    details: {
      amount: string;
      recipient: string;
      currency: string;
      status: string;
    }
  ): Promise<void> {
    await this.safeSend({
      from: `Payvio <${env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: `Transfer ${details.status} — ${details.amount} to ${details.recipient}`,
      html: `
        <h2>Transfer ${details.status}, ${firstName}</h2>
        <p><strong>Amount:</strong> ${details.amount}</p>
        <p><strong>Recipient:</strong> ${details.recipient}</p>
        <p><strong>Currency:</strong> ${details.currency}</p>
        <p><strong>Status:</strong> ${details.status}</p>
      `,
    });
  }

  private async safeSend(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const send = this.sendFn ?? this.defaultSend;
      await send(params);
    } catch (err) {
      // Graceful degradation — log but don't throw
      console.error("Failed to send email:", err);
    }
  }

  private async defaultSend(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<{ id: string }> {
    // Use Resend API directly
    if (!env.RESEND_API_KEY || env.RESEND_API_KEY === "re_...") {
      console.log(`[DEV] Email to ${params.to}: ${params.subject}`);
      return { id: "dev-email-id" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Resend API error: ${res.status}`);
    }

    return res.json() as Promise<{ id: string }>;
  }
}
