import { api } from "./client";

export const walletApi = {
  getWallet: (currency = "USD") =>
    api.get(`/wallet?currency=${currency}`),

  getAllWallets: () =>
    api.get("/wallet/all"),

  initiateFunding: (amount: number, currency = "USD") =>
    api.post("/wallet/fund", { amount, currency }),

  verifyBankAccount: (accountNumber: string, bankCode: string, country = "NG", networkId?: string) =>
    api.post("/wallet/banks/verify", {
      account_number: accountNumber,
      bank_code: bankCode,
      country,
      network_id: networkId,
    }),

  verifyMomoAccount: (mobileNumber: string, networkId: string) =>
    api.post("/wallet/momo/verify", {
      mobile_number: mobileNumber,
      network_id: networkId,
    }),

  getBankList: (country = "NG") =>
    api.get(`/wallet/banks/${country}`),

  creditAfterPayment: (amount: number, paymentIntentId: string, currency = "USD") =>
    api.post("/wallet/credit-after-payment", {
      amount,
      currency,
      payment_intent_id: paymentIntentId,
    }),
};
