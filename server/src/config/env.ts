import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),

  // Database
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://localhost:5432/payvio",

  // Redis
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  JWT_ACCESS_TTL: 15 * 60, // 15 minutes in seconds
  JWT_REFRESH_TTL: 30 * 24 * 60 * 60, // 30 days in seconds

  // OTP
  OTP_TTL: 5 * 60, // 5 minutes in seconds
  OTP_MAX_ATTEMPTS: 3, // per hour per number
  OTP_LENGTH: 6,

  // Plivo (SMS)
  PLIVO_AUTH_ID: process.env.PLIVO_AUTH_ID ?? "",
  PLIVO_AUTH_TOKEN: process.env.PLIVO_AUTH_TOKEN ?? "",
  PLIVO_SENDER_NUMBER: process.env.PLIVO_SENDER_NUMBER ?? "Payvio",

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  // YellowCard
  YELLOWCARD_API_KEY: process.env.YELLOWCARD_API_KEY ?? "",
  YELLOWCARD_SECRET_KEY: process.env.YELLOWCARD_SECRET_KEY ?? "",
  YELLOWCARD_BASE_URL: process.env.YELLOWCARD_BASE_URL ?? "https://sandbox.api.yellowcard.io",
  YELLOWCARD_MERCHANT_ID: process.env.YELLOWCARD_MERCHANT_ID ?? "",

  // Flutterwave
  FLUTTERWAVE_SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY ?? "",
  FLUTTERWAVE_PUBLIC_KEY: process.env.FLUTTERWAVE_PUBLIC_KEY ?? "",
  FLUTTERWAVE_WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? "",

  // Veriff
  VERIFF_API_KEY: process.env.VERIFF_API_KEY ?? "",
  VERIFF_SHARED_SECRET: process.env.VERIFF_SHARED_SECRET ?? "",
  VERIFF_BASE_URL: process.env.VERIFF_BASE_URL ?? "https://stationapi.veriff.com",

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL ?? "noreply@payvio.com",

  // Referral
  REFERRAL_REWARD_CENTS: parseInt(process.env.REFERRAL_REWARD_CENTS ?? "500", 10), // $5.00

  // Plaid
  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID ?? "",
  PLAID_SECRET: process.env.PLAID_SECRET ?? "",
  PLAID_ENV: process.env.PLAID_ENV ?? "sandbox",

  // Stripe publishable key (for mobile)
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ?? "",

  // App
  APP_URL: process.env.APP_URL ?? "https://payvioapp.com",
} as const;
