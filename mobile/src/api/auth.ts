import { api } from "./client";

export const authApi = {
  sendOtp: (phone: string, countryCode: string) =>
    api.post("/auth/send-otp", { phone, country_code: countryCode }),

  verifyOtp: (phone: string, countryCode: string, otp: string) =>
    api.post("/auth/verify-otp", { phone, country_code: countryCode, otp }),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refresh_token: refreshToken }),
};
