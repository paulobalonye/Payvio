/**
 * Live API integration tests — run against real sandbox APIs.
 * These are skipped in CI (no API keys). Run locally with:
 *   npx jest --testPathPattern=integration/live-apis
 */

import { env } from "../../config/env";

const SKIP = !env.YELLOWCARD_API_KEY || env.YELLOWCARD_API_KEY === "";
const describeIf = SKIP ? describe.skip : describe;

describeIf("Live API Integration Tests", () => {
  jest.setTimeout(15000); // sandbox APIs can be slow

  describe("YellowCard — FX Rates", () => {
    it("should fetch live rates from sandbox", async () => {
      const crypto = require("crypto");
      const ts = new Date().toISOString();
      const path = "/business/rates";
      const message = ts + path + "GET";
      const sig = crypto.createHmac("sha256", env.YELLOWCARD_SECRET_KEY).update(message).digest("base64");

      const res = await fetch(env.YELLOWCARD_BASE_URL + path, {
        headers: {
          Authorization: `YcHmacV1 ${env.YELLOWCARD_API_KEY}:${sig}`,
          "X-YC-Timestamp": ts,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.rates).toBeDefined();
      expect(data.rates.length).toBeGreaterThan(0);

      // Should have NGN rate
      const ngn = data.rates.find((r: any) => r.code === "NGN");
      expect(ngn).toBeDefined();
      expect(ngn.sell).toBeGreaterThan(0);
    });
  });

  describe("Veriff — KYC Session", () => {
    it("should create a verification session", async () => {
      const res = await fetch(`${env.VERIFF_BASE_URL}/v1/sessions`, {
        method: "POST",
        headers: {
          "X-AUTH-CLIENT": env.VERIFF_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verification: {
            person: { firstName: "Test", lastName: "User" },
            vendorData: "integration-test",
            callback: `${env.APP_URL}/webhooks/veriff`,
          },
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json() as any;
      expect(data.status).toBe("success");
      expect(data.verification.id).toBeDefined();
      expect(data.verification.url).toContain("veriff.com");
    });
  });

  describe("Resend — Email", () => {
    it("should send a test email", async () => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: "delivered@resend.dev", // Resend test address
          subject: "Payvio Integration Test",
          html: "<h1>Test email from Payvio</h1><p>This is an automated integration test.</p>",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.id).toBeDefined();
    });
  });

  describe("Flutterwave — Bank Verification", () => {
    it("should list Nigerian banks", async () => {
      const res = await fetch("https://api.flutterwave.com/v3/banks/NG", {
        headers: {
          Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.status).toBe("success");
      expect(data.data.length).toBeGreaterThan(0);
    });

    it("should verify a test bank account", async () => {
      const res = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: "0690000032",
          account_bank: "044",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json() as any;
      expect(data.status).toBe("success");
      expect(data.data.account_name).toBeDefined();
      expect(data.data.account_number).toBe("0690000032");
    });
  });
});
