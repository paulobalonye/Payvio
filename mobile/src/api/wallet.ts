import { api } from "./client";

export const walletApi = {
  getWallet: (currency = "USD") =>
    api.get(`/wallet?currency=${currency}`),

  getAllWallets: () =>
    api.get("/wallet/all"),

  initiateFunding: (amount: number, currency = "USD") =>
    api.post("/wallet/fund", { amount, currency }),

  verifyBankAccount: (accountNumber: string, bankCode: string, country = "NG") =>
    api.post("/wallet/banks/verify", {
      account_number: accountNumber,
      bank_code: bankCode,
      country,
    }),

  getBankList: (country = "NG") =>
    api.get(`/wallet/banks/${country}`),
};
