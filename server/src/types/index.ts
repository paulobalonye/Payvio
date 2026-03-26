// ============================================================
// Payvio API Types — Interfaces defined BEFORE tests & code
// ============================================================

// --- Common ---
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly total: number;
  readonly cursor?: string;
  readonly has_more: boolean;
}

// --- Auth ---
export interface SendOtpRequest {
  readonly phone: string;
  readonly country_code: string;
}

export interface SendOtpResponse {
  readonly success: boolean;
  readonly expires_in: number;
}

export interface VerifyOtpRequest {
  readonly phone: string;
  readonly country_code: string;
  readonly otp: string;
}

export interface AuthTokens {
  readonly access_token: string;
  readonly refresh_token: string;
}

export interface VerifyOtpResponse {
  readonly tokens: AuthTokens;
  readonly user: User;
}

export interface RefreshTokenRequest {
  readonly refresh_token: string;
}

// --- User ---
export interface User {
  readonly id: string;
  readonly phone: string;
  readonly country_code: string;
  readonly first_name: string | null;
  readonly last_name: string | null;
  readonly email: string | null;
  readonly kyc_status: KycStatus;
  readonly referral_code: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export type KycStatus = "none" | "pending" | "approved" | "rejected";

export interface UpdateProfileRequest {
  readonly first_name: string;
  readonly last_name: string;
  readonly email: string;
}

// --- KYC (Veriff) ---
export interface CreateKycSessionResponse {
  readonly session_url: string;
  readonly session_id: string;
}

export interface VeriffWebhookPayload {
  readonly id: string;
  readonly status: "approved" | "declined" | "resubmission_requested";
  readonly verification: {
    readonly id: string;
    readonly person: {
      readonly firstName: string;
      readonly lastName: string;
    };
  };
}

// --- Wallet ---
export interface Wallet {
  readonly id: string;
  readonly user_id: string;
  readonly currency: string;
  readonly balance: number; // stored as integer cents
  readonly created_at: string;
  readonly updated_at: string;
}

export interface CreditWalletRequest {
  readonly amount: number; // in cents
  readonly currency: string;
  readonly source: WalletTransactionSource;
  readonly reference_id: string;
}

export interface DebitWalletRequest {
  readonly amount: number; // in cents
  readonly currency: string;
  readonly reason: WalletTransactionSource;
  readonly reference_id: string;
}

export type WalletTransactionSource =
  | "card_funding"
  | "ach_funding"
  | "transfer_send"
  | "transfer_refund"
  | "referral_reward"
  | "payment_request";

// --- FX Rates (YellowCard) ---
export interface FxRateRequest {
  readonly from: string;
  readonly to: string;
  readonly amount?: number;
}

export interface FxRate {
  readonly rate_id: string;
  readonly from: string;
  readonly to: string;
  readonly mid_market_rate: number;
  readonly our_rate: number;
  readonly spread: number;
  readonly fee: number;
  readonly expires_at: string;
}

// --- Recipients ---
export interface Recipient {
  readonly id: string;
  readonly user_id: string;
  readonly country: string;
  readonly currency: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly payout_method: PayoutMethod;
  readonly bank_name: string | null;
  readonly account_number: string | null;
  readonly routing_number: string | null;
  readonly mobile_number: string | null;
  readonly mobile_provider: string | null;
  readonly is_archived: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export type PayoutMethod = "bank_transfer" | "mobile_money" | "cash_pickup";

export interface CreateRecipientRequest {
  readonly country: string;
  readonly currency: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly payout_method: PayoutMethod;
  readonly bank_name?: string;
  readonly account_number?: string;
  readonly routing_number?: string;
  readonly mobile_number?: string;
  readonly mobile_provider?: string;
}

// --- Transfers ---
export interface Transfer {
  readonly id: string;
  readonly user_id: string;
  readonly recipient_id: string;
  readonly send_amount: number; // cents
  readonly send_currency: string;
  readonly receive_amount: number; // cents
  readonly receive_currency: string;
  readonly fx_rate: number;
  readonly fee: number; // cents
  readonly status: TransferStatus;
  readonly rate_id: string;
  readonly idempotency_key: string;
  readonly partner_reference: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export type TransferStatus =
  | "initiated"
  | "processing"
  | "delivered"
  | "failed"
  | "refunded";

export interface CreateTransferRequest {
  readonly recipient_id: string;
  readonly send_amount: number; // cents
  readonly send_currency: string;
  readonly receive_currency: string;
  readonly rate_id: string;
  readonly idempotency_key: string;
}

// --- Payment Requests ---
export interface PaymentRequest {
  readonly id: string;
  readonly user_id: string;
  readonly token: string;
  readonly amount: number; // cents
  readonly currency: string;
  readonly note: string | null;
  readonly status: PaymentRequestStatus;
  readonly paid_by: string | null;
  readonly expires_at: string;
  readonly created_at: string;
}

export type PaymentRequestStatus = "pending" | "paid" | "expired";

export interface CreatePaymentRequestInput {
  readonly amount: number; // cents
  readonly currency: string;
  readonly note?: string;
}

// --- Transactions (History) ---
export interface Transaction {
  readonly id: string;
  readonly user_id: string;
  readonly type: TransactionType;
  readonly amount: number; // cents
  readonly currency: string;
  readonly description: string;
  readonly status: string;
  readonly reference_id: string;
  readonly created_at: string;
}

export type TransactionType =
  | "transfer"
  | "wallet_credit"
  | "wallet_debit"
  | "payment_request";

export interface TransactionQuery {
  readonly type?: TransactionType;
  readonly from?: string;
  readonly to?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

// --- Referrals ---
export interface Referral {
  readonly id: string;
  readonly referrer_id: string;
  readonly referee_id: string;
  readonly referee_name: string;
  readonly signup_date: string;
  readonly first_transfer_date: string | null;
  readonly reward_status: ReferralRewardStatus;
  readonly reward_amount: number; // cents
}

export type ReferralRewardStatus = "pending" | "eligible" | "rewarded";

export interface ReferralStats {
  readonly total_referrals: number;
  readonly converted: number;
  readonly total_earned: number; // cents
  readonly referral_code: string;
  readonly referral_link: string;
}

// --- Device Registration (Push Notifications) ---
export interface RegisterDeviceRequest {
  readonly token: string;
  readonly platform: "ios" | "android";
}

// --- Stripe Webhook ---
export interface StripeWebhookEvent {
  readonly id: string;
  readonly type: string;
  readonly data: {
    readonly object: {
      readonly id: string;
      readonly amount: number;
      readonly currency: string;
      readonly status: string;
      readonly metadata: Record<string, string>;
    };
  };
}

// --- JWT Payload ---
export interface JwtPayload {
  readonly sub: string; // user_id
  readonly phone: string;
  readonly iat: number;
  readonly exp: number;
}
