import { z } from "zod/v4";

export const sendOtpSchema = z.object({
  phone: z.string().min(7).max(15).regex(/^\d+$/, "Phone must contain only digits"),
  country_code: z.string().min(1).max(4).regex(/^\+\d+$/, "Country code must start with +"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(7).max(15).regex(/^\d+$/, "Phone must contain only digits"),
  country_code: z.string().min(1).max(4).regex(/^\+\d+$/, "Country code must start with +"),
  otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});
