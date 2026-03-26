export const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Countries", href: "#corridors" },
  { label: "Reviews", href: "#testimonials" },
] as const;

export const HERO = {
  eyebrow: "Trusted by 500K+ users worldwide",
  headline: "Send Money Home —\u00A0Instantly",
  subheadline:
    "The fastest way to send money to your loved ones. Low fees, real exchange rates, delivered in minutes.",
  socialProof: "4.8\u2605 on App Store \u00B7 1M+ transfers \u00B7 Licensed & regulated",
  floatingCards: [
    "Delivered in 2 min \u2713",
    "Fee: $2.99",
    "Rate: 1 USD = 1,560 NGN",
  ],
} as const;

export const STEPS = [
  {
    step: "01",
    icon: "DollarSign" as const,
    title: "Choose Amount",
    description:
      "Enter how much you want to send. See the exact amount your recipient gets \u2014 no surprises.",
  },
  {
    step: "02",
    icon: "UserPlus" as const,
    title: "Pick Recipient",
    description:
      "Add your recipient\u2019s details. Bank account, mobile money, or cash pickup \u2014 their choice.",
  },
  {
    step: "03",
    icon: "Zap" as const,
    title: "Money Delivered",
    description:
      "Hit send. Money arrives in minutes, not days. Track it in real-time.",
  },
] as const;

export const FEATURED_RATES = [
  { from: "\u{1F1FA}\u{1F1F8} USD", to: "\u{1F1F3}\u{1F1EC} NGN", rate: "1,560.00", direction: "\u2191" },
  { from: "\u{1F1EC}\u{1F1E7} GBP", to: "\u{1F1F0}\u{1F1EA} KES", rate: "198.50", direction: "\u2191" },
  { from: "\u{1F1EA}\u{1F1FA} EUR", to: "\u{1F1EC}\u{1F1ED} GHS", rate: "16.80", direction: "\u2191" },
] as const;

export const FEATURES = [
  {
    icon: "Coins" as const,
    title: "Fees from $1.99",
    description:
      "Transparent pricing. See the fee before you send. Often 3-5x cheaper than banks.",
  },
  {
    icon: "Zap" as const,
    title: "Arrives in Minutes",
    description:
      "Most transfers delivered in under 5 minutes. Real-time tracking so you\u2019re never guessing.",
  },
  {
    icon: "Wallet" as const,
    title: "Multiple Payout Methods",
    description:
      "Bank transfer, mobile money (M-Pesa, MTN), or cash pickup. However your family prefers.",
  },
  {
    icon: "Shield" as const,
    title: "Bank-Level Security",
    description:
      "256-bit encryption, biometric login, and fraud monitoring. Your money is protected at every step.",
  },
] as const;

export const SOURCE_COUNTRIES = [
  { flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
  { flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
  { flag: "\u{1F1EA}\u{1F1FA}", name: "Europe" },
  { flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
] as const;

export const DESTINATION_REGIONS = [
  {
    name: "Africa",
    countries: [
      { flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria", popular: true },
      { flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana", popular: false },
      { flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya", popular: true },
      { flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa", popular: false },
      { flag: "\u{1F1FA}\u{1F1EC}", name: "Uganda", popular: false },
      { flag: "\u{1F1F9}\u{1F1FF}", name: "Tanzania", popular: false },
      { flag: "\u{1F1EA}\u{1F1F9}", name: "Ethiopia", popular: false },
      { flag: "\u{1F1F8}\u{1F1F3}", name: "Senegal", popular: false },
    ],
  },
  {
    name: "Asia",
    countries: [
      { flag: "\u{1F1EE}\u{1F1F3}", name: "India", popular: true },
      { flag: "\u{1F1F5}\u{1F1ED}", name: "Philippines", popular: false },
      { flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistan", popular: false },
      { flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladesh", popular: false },
    ],
  },
  {
    name: "Latin America",
    countries: [
      { flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico", popular: true },
      { flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia", popular: false },
      { flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil", popular: false },
    ],
  },
] as const;

export const TRUST_BADGES = [
  {
    icon: "ShieldCheck" as const,
    title: "Licensed & Regulated",
    description:
      "Registered with FinCEN, FCA, and local regulators in every country we operate",
  },
  {
    icon: "Lock" as const,
    title: "256-bit Encryption",
    description:
      "Your data is encrypted end-to-end, same standard as major banks",
  },
  {
    icon: "Fingerprint" as const,
    title: "Biometric Auth",
    description:
      "Face ID and fingerprint login. No one else can access your account",
  },
  {
    icon: "Eye" as const,
    title: "24/7 Monitoring",
    description:
      "Real-time fraud detection and dedicated support when you need it",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "I used to pay $25 in fees with my bank. Payvio charges $2.99 and the money arrives before I put my phone down.",
    name: "Amara O.",
    corridor: "US \u2192 Nigeria",
  },
  {
    quote:
      "My mum gets the money on her M-Pesa in 3 minutes. She calls me every time to say thank you.",
    name: "David K.",
    corridor: "UK \u2192 Kenya",
  },
  {
    quote:
      "The exchange rate is always better than Western Union. I\u2019ve saved hundreds this year.",
    name: "Priya M.",
    corridor: "Canada \u2192 India",
  },
  {
    quote:
      "Finally an app that doesn\u2019t feel like it was built in 2005. Clean, fast, and my family gets more money.",
    name: "Carlos R.",
    corridor: "US \u2192 Mexico",
  },
  {
    quote:
      "I was nervous sending money through an app. After 50+ transfers without a single issue, I\u2019m a customer for life.",
    name: "Fatima B.",
    corridor: "UK \u2192 Ghana",
  },
] as const;

export type Currency = {
  readonly code: string;
  readonly flag: string;
  readonly name: string;
};

export const SEND_CURRENCIES: readonly Currency[] = [
  { code: "USD", flag: "\u{1F1FA}\u{1F1F8}", name: "US Dollar" },
  { code: "GBP", flag: "\u{1F1EC}\u{1F1E7}", name: "British Pound" },
  { code: "EUR", flag: "\u{1F1EA}\u{1F1FA}", name: "Euro" },
  { code: "CAD", flag: "\u{1F1E8}\u{1F1E6}", name: "Canadian Dollar" },
  { code: "AUD", flag: "\u{1F1E6}\u{1F1FA}", name: "Australian Dollar" },
] as const;

export const RECEIVE_CURRENCIES: readonly Currency[] = [
  { code: "NGN", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigerian Naira" },
  { code: "KES", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenyan Shilling" },
  { code: "GHS", flag: "\u{1F1EC}\u{1F1ED}", name: "Ghanaian Cedi" },
  { code: "INR", flag: "\u{1F1EE}\u{1F1F3}", name: "Indian Rupee" },
  { code: "PHP", flag: "\u{1F1F5}\u{1F1ED}", name: "Philippine Peso" },
  { code: "MXN", flag: "\u{1F1F2}\u{1F1FD}", name: "Mexican Peso" },
  { code: "PKR", flag: "\u{1F1F5}\u{1F1F0}", name: "Pakistani Rupee" },
  { code: "BDT", flag: "\u{1F1E7}\u{1F1E9}", name: "Bangladeshi Taka" },
  { code: "ZAR", flag: "\u{1F1FF}\u{1F1E6}", name: "South African Rand" },
  { code: "UGX", flag: "\u{1F1FA}\u{1F1EC}", name: "Ugandan Shilling" },
  { code: "TZS", flag: "\u{1F1F9}\u{1F1FF}", name: "Tanzanian Shilling" },
  { code: "ETB", flag: "\u{1F1EA}\u{1F1F9}", name: "Ethiopian Birr" },
  { code: "XOF", flag: "\u{1F1F8}\u{1F1F3}", name: "CFA Franc" },
  { code: "COP", flag: "\u{1F1E8}\u{1F1F4}", name: "Colombian Peso" },
  { code: "BRL", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazilian Real" },
] as const;

export const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { NGN: 1560.0, KES: 153.5, GHS: 15.2, INR: 83.5, PHP: 56.8, MXN: 17.2, PKR: 278.5, BDT: 110.0, ZAR: 18.5, UGX: 3780.0, TZS: 2530.0, ETB: 56.8, XOF: 610.0, COP: 3950.0, BRL: 5.05 },
  GBP: { NGN: 1980.0, KES: 198.5, GHS: 19.3, INR: 106.0, PHP: 72.1, MXN: 21.8, PKR: 353.5, BDT: 139.6, ZAR: 23.5, UGX: 4798.0, TZS: 3212.0, ETB: 72.1, XOF: 774.7, COP: 5016.5, BRL: 6.41 },
  EUR: { NGN: 1710.0, KES: 168.4, GHS: 16.8, INR: 91.7, PHP: 62.3, MXN: 18.9, PKR: 305.6, BDT: 120.7, ZAR: 20.3, UGX: 4147.8, TZS: 2777.9, ETB: 62.3, XOF: 655.96, COP: 4337.1, BRL: 5.54 },
  CAD: { NGN: 1150.0, KES: 113.3, GHS: 11.2, INR: 61.6, PHP: 41.9, MXN: 12.7, PKR: 205.5, BDT: 81.2, ZAR: 13.7, UGX: 2789.4, TZS: 1867.1, ETB: 41.9, XOF: 450.2, COP: 2914.1, BRL: 3.73 },
  AUD: { NGN: 1040.0, KES: 102.3, GHS: 10.1, INR: 55.7, PHP: 37.9, MXN: 11.5, PKR: 185.8, BDT: 73.4, ZAR: 12.3, UGX: 2521.8, TZS: 1688.0, ETB: 37.9, XOF: 407.0, COP: 2634.7, BRL: 3.37 },
};

export const FEES: Record<string, number> = {
  USD: 2.99,
  GBP: 2.49,
  EUR: 2.79,
  CAD: 3.49,
  AUD: 3.99,
};

export const FOOTER_LINKS = {
  product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Countries", href: "#corridors" },
    { label: "Rates", href: "#calculator" },
    { label: "Download", href: "#hero" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Licenses", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "AML Policy", href: "#" },
  ],
} as const;
