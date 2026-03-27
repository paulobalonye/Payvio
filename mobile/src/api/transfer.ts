import { api } from "./client";

export const transferApi = {
  getRate: (from: string, to: string) =>
    api.get(`/api/fx/rate?from=${from}&to=${to}`),

  createRecipient: (data: {
    country: string;
    currency: string;
    first_name: string;
    last_name: string;
    payout_method: string;
    bank_name?: string;
    account_number?: string;
    mobile_number?: string;
    mobile_provider?: string;
  }) => api.post("/api/recipients", data),

  getRecipients: () =>
    api.get("/api/recipients"),

  deleteRecipient: (id: string) =>
    api.delete(`/api/recipients/${id}`),

  createTransfer: (data: {
    recipient_id: string;
    send_amount: number;
    send_currency: string;
    receive_currency: string;
    rate_id: string;
    idempotency_key: string;
  }) => api.post("/api/transfers", data),

  getTransfers: () =>
    api.get("/api/transfers"),

  getTransfer: (id: string) =>
    api.get(`/api/transfers/${id}`),
};
