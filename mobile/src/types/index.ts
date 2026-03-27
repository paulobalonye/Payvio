export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PhoneEntry: undefined;
  OtpVerify: { phone: string; countryCode: string };
  ProfileSetup: undefined;
  KycVerification: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Send: undefined;
  History: undefined;
  Settings: undefined;
};

export type User = {
  readonly id: string;
  readonly phone: string;
  readonly country_code: string;
  readonly first_name: string | null;
  readonly last_name: string | null;
  readonly email: string | null;
  readonly kyc_status: "none" | "pending" | "approved" | "rejected";
  readonly referral_code: string;
};

export type Wallet = {
  readonly id: string;
  readonly currency: string;
  readonly balance: number;
};
