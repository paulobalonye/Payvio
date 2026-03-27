import { env } from "../config/env";

type SendEmailFn = (params: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => Promise<{ id: string }>;

export class EmailService {
  constructor(private readonly sendFn?: SendEmailFn) {}

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.safeSend({
      from: env.RESEND_FROM_EMAIL,
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
      from: env.RESEND_FROM_EMAIL,
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
      from: env.RESEND_FROM_EMAIL,
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
