# Payvio Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, production-quality landing page for Payvio — a remittance app targeting diaspora communities — using Next.js 15, Tailwind CSS v4, Framer Motion, and 21st.dev components.

**Architecture:** Single-page Next.js App Router site. All sections are independent React components composed in `app/page.tsx`. Data (copy, rates, testimonials) lives in `lib/constants.ts`. Animations use a shared `AnimatedSection` Framer Motion wrapper. 21st.dev Magic MCP provides polished UI components (buttons, badges, cards) — use it to search for and fetch components during implementation.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, 21st.dev components, next/font (Inter + display font)

**Design spec:** `docs/superpowers/specs/2026-03-26-payvio-landing-page-design.md`

---

## File Structure

```
app/
├── layout.tsx              # Root layout: fonts, metadata, OG tags, body classes
├── page.tsx                # Composes all sections in order
└── globals.css             # Tailwind v4 imports + custom CSS properties + keyframes

components/
├── ui/                     # Primitives from 21st.dev + custom
│   ├── Button.tsx          # Primary CTA button with hover/focus states
│   └── Badge.tsx           # Pill badge (eyebrow, trust strip)
├── sections/
│   ├── Navbar.tsx          # Fixed navbar with scroll behavior + mobile drawer
│   ├── Hero.tsx            # Split hero: copy left, phone mockup right
│   ├── HowItWorks.tsx      # 3-step process cards with connecting lines
│   ├── Features.tsx        # Asymmetric grid: featured card + 2x2 grid
│   ├── Corridors.tsx       # Country pill grid grouped by region
│   ├── Trust.tsx           # Trust badges + partner logo strip
│   ├── Testimonials.tsx    # Auto-scrolling testimonial carousel
│   ├── Calculator.tsx      # Interactive rate calculator widget
│   ├── CtaFooter.tsx       # Final CTA block + footer
│   └── index.ts            # Barrel export for all sections
└── shared/
    ├── AnimatedSection.tsx  # Framer Motion scroll-triggered wrapper
    ├── AppStoreBadges.tsx   # Reusable Apple + Google Play badge pair
    └── SectionHeading.tsx   # Reusable heading + subtitle pattern

lib/
├── constants.ts            # All copy, exchange rates, corridor data, testimonials
└── utils.ts                # formatCurrency, calculateReceiveAmount helpers

public/
└── images/
    ├── app-store-badge.svg
    └── google-play-badge.svg
```

---

### Task 1: Project Scaffolding + Tailwind + Fonts

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`

- [ ] **Step 1: Create Next.js 15 project**

```bash
cd /Users/drpraize/WebSite-Sample
npx create-next-app@latest payvio --typescript --tailwind --eslint --app --src=false --import-alias "@/*" --use-npm
```

Expected: Project scaffolded in `payvio/` directory.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/drpraize/WebSite-Sample/payvio
npm install framer-motion lucide-react
```

Expected: Both packages added to `package.json`.

- [ ] **Step 3: Set up globals.css with design tokens**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #fafbff;
  --color-bg-secondary: #f0f4ff;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-accent: #4f46e5;
  --color-accent-hover: #6366f1;
  --color-accent-light: rgba(99, 102, 241, 0.06);
  --color-accent-glow: rgba(79, 70, 229, 0.15);
  --color-card-bg: #ffffff;
  --color-card-border: rgba(99, 102, 241, 0.06);
  --color-footer-bg: #0f172a;
  --color-cta-bg-start: #eef2ff;
  --color-cta-bg-end: #e0e7ff;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(99, 102, 241, 0.06);
  --shadow-card-hover: 0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(99, 102, 241, 0.1);
  --radius-card: 16px;
  --radius-button: 12px;
  --radius-pill: 9999px;
}

@layer base {
  body {
    background: linear-gradient(180deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
    color: var(--color-text-primary);
    font-feature-settings: "rlig" 1, "calt" 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(15px, -10px); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Set up layout.tsx with fonts and metadata**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/Satoshi-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Payvio — Send Money Home, Instantly",
  description:
    "The fastest way to send money to your loved ones. Low fees, real exchange rates, delivered in minutes. Trusted by 500K+ users worldwide.",
  openGraph: {
    title: "Payvio — Send Money Home, Instantly",
    description:
      "Low fees. Real rates. Delivered in minutes. Download Payvio and make your first transfer today.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable}`}>
      <body className="font-[family-name:var(--font-inter)]">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Download Satoshi font files**

```bash
mkdir -p public/fonts
curl -L -o /tmp/satoshi.zip "https://api.fontsource.org/v1/fonts/satoshi/latin-500-normal.woff2" 2>/dev/null || true
```

Note: If the Satoshi font download fails, fall back to using `Sora` from Google Fonts as the display font. Replace the `localFont` in `layout.tsx` with:

```tsx
import { Inter, Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["500", "700", "900"],
});
```

- [ ] **Step 6: Create placeholder page.tsx**

Replace `app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-4xl font-bold text-center pt-20 font-[family-name:var(--font-satoshi)]">
        Payvio
      </h1>
    </main>
  );
}
```

- [ ] **Step 7: Verify dev server runs**

```bash
cd /Users/drpraize/WebSite-Sample/payvio
npm run dev
```

Expected: Server starts on localhost:3000, page shows "Payvio" heading with correct font.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, fonts, and design tokens"
```

---

### Task 2: Constants + Shared Utilities

**Files:**
- Create: `lib/constants.ts`, `lib/utils.ts`

- [ ] **Step 1: Create lib/constants.ts with all app data**

```tsx
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
  socialProof: "4.8★ on App Store · 1M+ transfers · Licensed & regulated",
  floatingCards: [
    "Delivered in 2 min ✓",
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
      "Enter how much you want to send. See the exact amount your recipient gets — no surprises.",
  },
  {
    step: "02",
    icon: "UserPlus" as const,
    title: "Pick Recipient",
    description:
      "Add your recipient's details. Bank account, mobile money, or cash pickup — their choice.",
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
  { from: "🇺🇸 USD", to: "🇳🇬 NGN", rate: "1,560.00", direction: "↑" },
  { from: "🇬🇧 GBP", to: "🇰🇪 KES", rate: "198.50", direction: "↑" },
  { from: "🇪🇺 EUR", to: "🇬🇭 GHS", rate: "16.80", direction: "↑" },
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
      "Most transfers delivered in under 5 minutes. Real-time tracking so you're never guessing.",
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
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇪🇺", name: "Europe" },
  { flag: "🇦🇺", name: "Australia" },
] as const;

export const DESTINATION_REGIONS = [
  {
    name: "Africa",
    countries: [
      { flag: "🇳🇬", name: "Nigeria", popular: true },
      { flag: "🇬🇭", name: "Ghana", popular: false },
      { flag: "🇰🇪", name: "Kenya", popular: true },
      { flag: "🇿🇦", name: "South Africa", popular: false },
      { flag: "🇺🇬", name: "Uganda", popular: false },
      { flag: "🇹🇿", name: "Tanzania", popular: false },
      { flag: "🇪🇹", name: "Ethiopia", popular: false },
      { flag: "🇸🇳", name: "Senegal", popular: false },
    ],
  },
  {
    name: "Asia",
    countries: [
      { flag: "🇮🇳", name: "India", popular: true },
      { flag: "🇵🇭", name: "Philippines", popular: false },
      { flag: "🇵🇰", name: "Pakistan", popular: false },
      { flag: "🇧🇩", name: "Bangladesh", popular: false },
    ],
  },
  {
    name: "Latin America",
    countries: [
      { flag: "🇲🇽", name: "Mexico", popular: true },
      { flag: "🇨🇴", name: "Colombia", popular: false },
      { flag: "🇧🇷", name: "Brazil", popular: false },
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
    corridor: "US → Nigeria",
  },
  {
    quote:
      "My mum gets the money on her M-Pesa in 3 minutes. She calls me every time to say thank you.",
    name: "David K.",
    corridor: "UK → Kenya",
  },
  {
    quote:
      "The exchange rate is always better than Western Union. I've saved hundreds this year.",
    name: "Priya M.",
    corridor: "Canada → India",
  },
  {
    quote:
      "Finally an app that doesn't feel like it was built in 2005. Clean, fast, and my family gets more money.",
    name: "Carlos R.",
    corridor: "US → Mexico",
  },
  {
    quote:
      "I was nervous sending money through an app. After 50+ transfers without a single issue, I'm a customer for life.",
    name: "Fatima B.",
    corridor: "UK → Ghana",
  },
] as const;

export type Currency = {
  readonly code: string;
  readonly flag: string;
  readonly name: string;
};

export const SEND_CURRENCIES: readonly Currency[] = [
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
] as const;

export const RECEIVE_CURRENCIES: readonly Currency[] = [
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "KES", flag: "🇰🇪", name: "Kenyan Shilling" },
  { code: "GHS", flag: "🇬🇭", name: "Ghanaian Cedi" },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee" },
  { code: "PHP", flag: "🇵🇭", name: "Philippine Peso" },
  { code: "MXN", flag: "🇲🇽", name: "Mexican Peso" },
  { code: "PKR", flag: "🇵🇰", name: "Pakistani Rupee" },
  { code: "BDT", flag: "🇧🇩", name: "Bangladeshi Taka" },
  { code: "ZAR", flag: "🇿🇦", name: "South African Rand" },
  { code: "UGX", flag: "🇺🇬", name: "Ugandan Shilling" },
  { code: "TZS", flag: "🇹🇿", name: "Tanzanian Shilling" },
  { code: "ETB", flag: "🇪🇹", name: "Ethiopian Birr" },
  { code: "XOF", flag: "🇸🇳", name: "CFA Franc" },
  { code: "COP", flag: "🇨🇴", name: "Colombian Peso" },
  { code: "BRL", flag: "🇧🇷", name: "Brazilian Real" },
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
```

- [ ] **Step 2: Create lib/utils.ts**

```tsx
export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateReceiveAmount(
  sendAmount: number,
  sendCurrency: string,
  receiveCurrency: string,
  rates: Record<string, Record<string, number>>
): number {
  const rate = rates[sendCurrency]?.[receiveCurrency];
  if (!rate) return 0;
  return sendAmount * rate;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add constants and utility functions"
```

---

### Task 3: Shared Components (AnimatedSection, AppStoreBadges, SectionHeading)

**Files:**
- Create: `components/shared/AnimatedSection.tsx`, `components/shared/AppStoreBadges.tsx`, `components/shared/SectionHeading.tsx`

- [ ] **Step 1: Create AnimatedSection wrapper**

```tsx
"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

type AnimatedSectionProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: {
            ...containerVariants.visible.transition,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create AppStoreBadges**

```tsx
import Image from "next/image";

type AppStoreBadgesProps = {
  readonly className?: string;
  readonly size?: "default" | "small";
};

export default function AppStoreBadges({
  className = "",
  size = "default",
}: AppStoreBadgesProps) {
  const height = size === "small" ? 40 : 48;
  const width = size === "small" ? 135 : 162;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="https://apps.apple.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
      >
        <Image
          src="/images/app-store-badge.svg"
          alt="Download on the App Store"
          width={width}
          height={height}
        />
      </a>
      <a
        href="https://play.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
      >
        <Image
          src="/images/google-play-badge.svg"
          alt="Get it on Google Play"
          width={width}
          height={height}
        />
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Create SectionHeading**

```tsx
"use client";

import { motion } from "framer-motion";
import { itemVariants } from "./AnimatedSection";

type SectionHeadingProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly className?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-16 ${className}`}>
      <motion.h2
        variants={itemVariants}
        className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="text-lg text-[var(--color-text-secondary)]"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 4: Create app store badge SVGs**

Download or create placeholder SVG badges:

```bash
mkdir -p public/images
```

Create `public/images/app-store-badge.svg` — a simple App Store badge placeholder (black rounded rect with "App Store" text).

Create `public/images/google-play-badge.svg` — a simple Google Play badge placeholder.

Note: In production, use official Apple and Google badge assets. For development, create simple placeholder SVGs with the correct aspect ratios (135x40 or 162x48).

- [ ] **Step 5: Commit**

```bash
git add components/shared/ public/images/
git commit -m "feat: add shared components (AnimatedSection, AppStoreBadges, SectionHeading)"
```

---

### Task 4: Navbar

**Files:**
- Create: `components/sections/Navbar.tsx`

- [ ] **Step 1: Build Navbar component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#"
          className="text-xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-accent)]"
        >
          Payvio
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#hero"
          className="hidden md:inline-flex items-center px-5 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Download App
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[var(--color-text-primary)]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 top-16 bg-white/95 backdrop-blur-xl md:hidden z-40"
          >
            <div className="flex flex-col items-center gap-8 pt-12">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-[var(--color-text-primary)] font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#hero"
                onClick={() => setMobileOpen(false)}
                className="px-8 py-3 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                Download App
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
```

- [ ] **Step 2: Add Navbar to page.tsx**

```tsx
import Navbar from "@/components/sections/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16" /> {/* Spacer for fixed nav */}
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, check that navbar renders, scrolls from transparent to white, and mobile drawer works.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Navbar.tsx app/page.tsx
git commit -m "feat: add Navbar with scroll behavior and mobile drawer"
```

---

### Task 5: Hero Section

**Files:**
- Create: `components/sections/Hero.tsx`

- [ ] **Step 1: Build Hero component**

```tsx
"use client";

import { motion } from "framer-motion";
import AppStoreBadges from "@/components/shared/AppStoreBadges";
import { HERO } from "@/lib/constants";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut", delay: 0.3 },
  },
};

const floatingCard = (delay: number) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: 0.8 + delay },
  },
});

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
      {/* Background gradient orbs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-100"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          animation: "drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          animation: "drift 25s ease-in-out infinite reverse",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: Copy */}
        <motion.div
          className="flex-1 lg:max-w-[55%] text-center lg:text-left"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--color-accent-light)] border border-[var(--color-card-border)] text-sm text-[var(--color-accent)] font-medium mb-6"
            style={{
              backgroundImage:
                "linear-gradient(110deg, transparent 30%, rgba(99,102,241,0.08) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          >
            {HERO.eyebrow}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-[56px] font-bold font-[family-name:var(--font-satoshi)] leading-[1.1] tracking-tight text-[var(--color-text-primary)] mb-6"
          >
            {HERO.headline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-[var(--color-text-secondary)] max-w-lg mx-auto lg:mx-0 mb-8"
          >
            {HERO.subheadline}
          </motion.p>

          <motion.div variants={fadeUp}>
            <AppStoreBadges className="justify-center lg:justify-start" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-sm text-[var(--color-text-muted)] mt-6"
          >
            {HERO.socialProof}
          </motion.p>
        </motion.div>

        {/* Right: Phone mockup */}
        <motion.div
          className="flex-1 relative flex justify-center"
          variants={slideInRight}
          initial="hidden"
          animate="visible"
        >
          <div
            className="relative w-[280px] h-[560px] md:w-[300px] md:h-[600px]"
            style={{
              perspective: "1000px",
            }}
          >
            {/* Phone frame */}
            <div
              className="w-full h-full rounded-[40px] bg-[#0f172a] p-3 shadow-2xl"
              style={{
                transform: "rotateY(-5deg) rotateX(2deg)",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              {/* Phone screen */}
              <div className="w-full h-full rounded-[32px] bg-gradient-to-b from-[#fafbff] to-[#f0f4ff] overflow-hidden flex flex-col items-center justify-center p-6">
                <div className="text-xs text-[var(--color-text-muted)] mb-2">
                  You send
                </div>
                <div className="text-3xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-satoshi)]">
                  $500.00
                </div>
                <div className="w-12 h-[1px] bg-[var(--color-accent-light)] my-4" />
                <div className="text-xs text-[var(--color-text-muted)] mb-2">
                  They receive
                </div>
                <div className="text-3xl font-bold text-[var(--color-accent)] font-[family-name:var(--font-satoshi)]">
                  ₦780,000
                </div>
                <div className="mt-6 px-8 py-3 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white text-sm font-medium">
                  Send Now
                </div>
              </div>
            </div>

            {/* Floating cards */}
            {HERO.floatingCards.map((text, i) => (
              <motion.div
                key={text}
                variants={floatingCard(i * 0.15)}
                className="absolute px-4 py-2 rounded-[var(--radius-card)] bg-white/90 backdrop-blur-sm shadow-[var(--shadow-card)] border border-[var(--color-card-border)] text-xs font-medium text-[var(--color-text-primary)] whitespace-nowrap"
                style={{
                  top: `${20 + i * 30}%`,
                  [i % 2 === 0 ? "right" : "left"]: "-30%",
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add Hero to page.tsx**

```tsx
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Check: hero renders with split layout, phone mockup has 3D tilt and float, floating cards appear, badges show, stagger animations work, mobile stacks vertically.

- [ ] **Step 4: Commit**

```bash
git add components/sections/Hero.tsx app/page.tsx
git commit -m "feat: add Hero section with phone mockup and staggered animations"
```

---

### Task 6: How It Works Section

**Files:**
- Create: `components/sections/HowItWorks.tsx`

- [ ] **Step 1: Build HowItWorks component**

```tsx
"use client";

import { motion } from "framer-motion";
import { DollarSign, UserPlus, Zap } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { STEPS } from "@/lib/constants";

const ICONS = { DollarSign, UserPlus, Zap } as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Send money in 3 simple steps"
          subtitle="No hidden fees. No complicated forms. Just fast, secure transfers."
        />

        <div className="relative flex flex-col md:flex-row items-stretch gap-8 md:gap-6">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-[1px]">
            <motion.div
              className="h-full border-t-2 border-dashed border-[var(--color-accent-light)]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {STEPS.map((step) => {
            const Icon = ICONS[step.icon];
            return (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="flex-1 relative bg-[var(--color-card-bg)] rounded-[var(--radius-card)] border border-[var(--color-card-border)] shadow-[var(--shadow-card)] p-8 text-center"
              >
                <div className="text-5xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-accent-glow)] mb-4">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import HowItWorks from "@/components/sections/HowItWorks";` and place `<HowItWorks />` after `<Hero />`.

- [ ] **Step 3: Verify and commit**

```bash
git add components/sections/HowItWorks.tsx app/page.tsx
git commit -m "feat: add How It Works section with step cards and connecting line"
```

---

### Task 7: Features Section

**Files:**
- Create: `components/sections/Features.tsx`

- [ ] **Step 1: Build Features component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Coins, Zap, Wallet, Shield } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { FEATURES, FEATURED_RATES } from "@/lib/constants";

const ICONS = { Coins, Zap, Wallet, Shield } as const;

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Everything you need to send money"
          subtitle="Real rates, low fees, and the speed your family deserves."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured card */}
          <motion.div
            variants={slideInLeft}
            className="relative overflow-hidden bg-[var(--color-card-bg)] rounded-[var(--radius-card)] border border-[var(--color-card-border)] shadow-[var(--shadow-card)] p-8 lg:row-span-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]" />
            <h3 className="text-2xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-2">
              Real Exchange Rates
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-8">
              We use the mid-market rate — the same one you see on Google. No
              markups, no hidden margins.
            </p>

            <div className="space-y-4">
              {FEATURED_RATES.map((rate) => (
                <div
                  key={`${rate.from}-${rate.to}`}
                  className="flex items-center justify-between p-4 rounded-[var(--radius-button)] bg-[var(--color-bg-primary)] border border-[var(--color-card-border)]"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {rate.from} / {rate.to}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {rate.rate} {rate.direction}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 4 small feature cards */}
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="bg-[var(--color-card-bg)] rounded-[var(--radius-card)] border border-[var(--color-card-border)] shadow-[var(--shadow-card)] p-6 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-lg font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import Features from "@/components/sections/Features";` and place `<Features />` after `<HowItWorks />`.

- [ ] **Step 3: Verify and commit**

```bash
git add components/sections/Features.tsx app/page.tsx
git commit -m "feat: add Features section with rate ticker and feature cards"
```

---

### Task 8: Corridors Section

**Files:**
- Create: `components/sections/Corridors.tsx`

- [ ] **Step 1: Build Corridors component**

```tsx
"use client";

import { motion } from "framer-motion";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { SOURCE_COUNTRIES, DESTINATION_REGIONS } from "@/lib/constants";

export default function Corridors() {
  return (
    <section id="corridors" className="py-24 md:py-32">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Send money to 40+ countries"
          subtitle="From the US, UK, Canada, and Europe to the people who matter most"
        />

        {/* Source countries */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {SOURCE_COUNTRIES.map((country) => (
            <div
              key={country.name}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-medium"
            >
              <span>{country.flag}</span>
              <span>{country.name}</span>
            </div>
          ))}
        </motion.div>

        {/* SVG connector lines (decorative) */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex justify-center mb-8"
        >
          <svg
            width="400"
            height="40"
            viewBox="0 0 400 40"
            fill="none"
            className="opacity-10"
          >
            <motion.path
              d="M50 0 Q100 40 200 20 Q300 0 350 40"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
            <motion.path
              d="M100 0 Q200 40 300 20"
              stroke="var(--color-accent)"
              strokeWidth="1"
              strokeDasharray="4 4"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.6 }}
            />
          </svg>
        </motion.div>

        {/* Destination regions */}
        <div className="space-y-10">
          {DESTINATION_REGIONS.map((region) => (
            <motion.div key={region.name} variants={itemVariants}>
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-widest mb-4 text-center">
                {region.name}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {region.countries.map((country) => (
                  <div
                    key={country.name}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md cursor-default ${
                      country.popular
                        ? "bg-[var(--color-accent-light)] border-[var(--color-accent)]/20 text-[var(--color-accent)] shadow-[0_0_16px_rgba(79,70,229,0.1)]"
                        : "bg-[var(--color-card-bg)] border-[var(--color-card-border)] text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import Corridors from "@/components/sections/Corridors";` and place `<Corridors />` after `<Features />`.

- [ ] **Step 3: Verify and commit**

```bash
git add components/sections/Corridors.tsx app/page.tsx
git commit -m "feat: add Corridors section with country pills and SVG connectors"
```

---

### Task 9: Trust Section

**Files:**
- Create: `components/sections/Trust.tsx`

- [ ] **Step 1: Build Trust component**

```tsx
"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, Eye } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { TRUST_BADGES } from "@/lib/constants";

const ICONS = { ShieldCheck, Lock, Fingerprint, Eye } as const;

export default function Trust() {
  return (
    <section className="py-24 md:py-32">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <SectionHeading
          title="Your money is safe with us"
          subtitle="Licensed, regulated, and built with security-first engineering"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {TRUST_BADGES.map((badge) => {
            const Icon = ICONS[badge.icon];
            return (
              <motion.div
                key={badge.title}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-[var(--color-accent)]" />
                </div>
                <h3 className="text-lg font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {badge.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Partner logo strip */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40"
        >
          {["FinCEN", "FCA", "PCI DSS", "Visa", "Mastercard"].map((name) => (
            <div
              key={name}
              className="text-sm font-medium tracking-wider text-[var(--color-text-muted)] uppercase"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </AnimatedSection>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import Trust from "@/components/sections/Trust";` and place `<Trust />` after `<Corridors />`.

- [ ] **Step 3: Verify and commit**

```bash
git add components/sections/Trust.tsx app/page.tsx
git commit -m "feat: add Trust section with badges and partner strip"
```

---

### Task 10: Testimonials Section

**Files:**
- Create: `components/sections/Testimonials.tsx`

- [ ] **Step 1: Build Testimonials component**

```tsx
"use client";

import { Star } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { TESTIMONIALS } from "@/lib/constants";
import { motion } from "framer-motion";

function TestimonialCard({
  quote,
  name,
  corridor,
}: {
  readonly quote: string;
  readonly name: string;
  readonly corridor: string;
}) {
  return (
    <div className="flex-shrink-0 w-[340px] md:w-[380px] bg-[var(--color-card-bg)] rounded-[var(--radius-card)] border border-[var(--color-card-border)] shadow-[var(--shadow-card)] p-6">
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className="fill-amber-400 text-amber-400"
          />
        ))}
      </div>
      <p className="text-[var(--color-text-primary)] leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center text-white text-xs font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            {name}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {corridor}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id="testimonials" className="py-24 md:py-32 overflow-hidden">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 text-[200px] leading-none font-[family-name:var(--font-satoshi)] font-bold pointer-events-none select-none"
            style={{ color: "rgba(79,70,229,0.04)" }}
          >
            &ldquo;
          </div>
          <SectionHeading
            title="Loved by families worldwide"
            subtitle="Join over 500,000 people who trust Payvio to send money home"
          />
        </div>
      </AnimatedSection>

      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div
          className="flex gap-6 hover:[animation-play-state:paused]"
          style={{
            animation: "scroll-left 30s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((testimonial, i) => (
            <TestimonialCard
              key={`${testimonial.name}-${i}`}
              quote={testimonial.quote}
              name={testimonial.name}
              corridor={testimonial.corridor}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import Testimonials from "@/components/sections/Testimonials";` and place `<Testimonials />` after `<Trust />`.

- [ ] **Step 3: Verify and commit**

Check: carousel auto-scrolls, pauses on hover, loops seamlessly, shows 3 cards on desktop, peek on mobile.

```bash
git add components/sections/Testimonials.tsx app/page.tsx
git commit -m "feat: add Testimonials carousel with CSS auto-scroll"
```

---

### Task 11: Calculator Section

**Files:**
- Create: `components/sections/Calculator.tsx`

- [ ] **Step 1: Build Calculator component**

```tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import {
  SEND_CURRENCIES,
  RECEIVE_CURRENCIES,
  EXCHANGE_RATES,
  FEES,
} from "@/lib/constants";
import { formatCurrency, calculateReceiveAmount } from "@/lib/utils";

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
};

export default function Calculator() {
  const [sendAmount, setSendAmount] = useState(500);
  const [sendCurrency, setSendCurrency] = useState("USD");
  const [receiveCurrency, setReceiveCurrency] = useState("NGN");

  const receiveAmount = useMemo(
    () => calculateReceiveAmount(sendAmount, sendCurrency, receiveCurrency, EXCHANGE_RATES),
    [sendAmount, sendCurrency, receiveCurrency]
  );

  const rate = EXCHANGE_RATES[sendCurrency]?.[receiveCurrency] ?? 0;
  const fee = FEES[sendCurrency] ?? 2.99;

  return (
    <section id="calculator" className="py-24 md:py-32">
      <AnimatedSection className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Calculator card */}
          <motion.div
            variants={slideInLeft}
            className="w-full lg:w-[45%] bg-[var(--color-card-bg)] rounded-[var(--radius-card)] border border-[var(--color-card-border)] p-8 shadow-[0_4px_24px_rgba(99,102,241,0.1),0_1px_3px_rgba(0,0,0,0.04)]"
          >
            {/* You send */}
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">
              You send
            </label>
            <div className="flex items-center gap-3 mb-6">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(Math.max(0, Number(e.target.value)))}
                className="flex-1 text-3xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
              />
              <select
                value={sendCurrency}
                onChange={(e) => setSendCurrency(e.target.value)}
                className="text-sm font-medium bg-[var(--color-bg-primary)] border border-[var(--color-card-border)] rounded-[var(--radius-button)] px-3 py-2 text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                {SEND_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate + fee info */}
            <div className="flex items-center justify-between py-4 border-y border-[var(--color-card-border)] mb-6 text-sm">
              <span className="text-[var(--color-text-muted)]">
                Rate: 1 {sendCurrency} = {formatCurrency(rate, receiveCurrency)}{" "}
                {receiveCurrency}
              </span>
              <span className="text-[var(--color-text-muted)]">
                Fee: ${fee.toFixed(2)}
              </span>
            </div>

            {/* They receive */}
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">
              They receive
            </label>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 text-3xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-accent)]">
                {formatCurrency(receiveAmount, receiveCurrency)}
              </div>
              <select
                value={receiveCurrency}
                onChange={(e) => setReceiveCurrency(e.target.value)}
                className="text-sm font-medium bg-[var(--color-bg-primary)] border border-[var(--color-card-border)] rounded-[var(--radius-button)] px-3 py-2 text-[var(--color-text-primary)] outline-none cursor-pointer"
              >
                {RECEIVE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] mb-6">
              ⚡ Arrives in ~3 minutes
            </p>

            <a
              href="#hero"
              className="block w-full text-center px-6 py-3.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Download to Send
            </a>
          </motion.div>

          {/* Right copy */}
          <motion.div variants={slideInRight} className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-6">
              See exactly what they&apos;ll get
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-6 max-w-lg mx-auto lg:mx-0">
              No surprises, no hidden fees. The rate you see is the rate you get.
              Enter any amount and see the full breakdown — before you download.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
              Save up to 5x vs banks and traditional services
            </div>
          </motion.div>
        </div>
      </AnimatedSection>
    </section>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import Calculator from "@/components/sections/Calculator";` and place `<Calculator />` after `<Testimonials />`.

- [ ] **Step 3: Verify and commit**

Test: change send amount, switch currencies, verify receive updates. Check mobile layout.

```bash
git add components/sections/Calculator.tsx app/page.tsx
git commit -m "feat: add interactive rate Calculator section"
```

---

### Task 12: CTA + Footer Section

**Files:**
- Create: `components/sections/CtaFooter.tsx`

- [ ] **Step 1: Build CtaFooter component**

```tsx
"use client";

import { motion } from "framer-motion";
import { Twitter, Instagram, Linkedin } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import AppStoreBadges from "@/components/shared/AppStoreBadges";
import { FOOTER_LINKS } from "@/lib/constants";

export default function CtaFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <AnimatedSection className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] bg-gradient-to-br from-[var(--color-cta-bg-start)] to-[var(--color-cta-bg-end)] px-8 py-16 md:py-20 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-4">
              Ready to send money home?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              Download Payvio and make your first transfer in under 2 minutes.
            </p>
            <AppStoreBadges className="justify-center" />
            <p className="text-sm text-[var(--color-text-muted)] mt-6">
              Free to download · No hidden fees · 4.8★ rated
            </p>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-footer-bg)] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div>
              <div className="text-xl font-bold font-[family-name:var(--font-satoshi)] mb-3">
                Payvio
              </div>
              <p className="text-sm text-white/50 mb-6">
                Send money home, instantly
              </p>
              <div className="flex gap-4">
                {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Icon size={16} className="text-white/70" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-medium uppercase tracking-wider text-white/70 mb-4">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-xs text-white/40">
              © 2025 Payvio. All rights reserved. Licensed and regulated by
              FinCEN and FCA.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Add to page.tsx**

Add `import CtaFooter from "@/components/sections/CtaFooter";` and place `<CtaFooter />` after `<Calculator />`.

- [ ] **Step 3: Verify and commit**

```bash
git add components/sections/CtaFooter.tsx app/page.tsx
git commit -m "feat: add final CTA block and footer"
```

---

### Task 13: Barrel Export + Final Page Assembly

**Files:**
- Create: `components/sections/index.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create barrel export**

```tsx
export { default as Navbar } from "./Navbar";
export { default as Hero } from "./Hero";
export { default as HowItWorks } from "./HowItWorks";
export { default as Features } from "./Features";
export { default as Corridors } from "./Corridors";
export { default as Trust } from "./Trust";
export { default as Testimonials } from "./Testimonials";
export { default as Calculator } from "./Calculator";
export { default as CtaFooter } from "./CtaFooter";
```

- [ ] **Step 2: Finalize page.tsx**

```tsx
import {
  Navbar,
  Hero,
  HowItWorks,
  Features,
  Corridors,
  Trust,
  Testimonials,
  Calculator,
  CtaFooter,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Corridors />
      <Trust />
      <Testimonials />
      <Calculator />
      <CtaFooter />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/index.ts app/page.tsx
git commit -m "feat: finalize page assembly with barrel export"
```

---

### Task 14: Build Verification + Polish

**Files:**
- Modify: various files as needed

- [ ] **Step 1: Run production build**

```bash
cd /Users/drpraize/WebSite-Sample/payvio
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Fix any build errors**

If there are TypeScript or build errors, fix them. Common issues:
- Missing `"use client"` directives on components using hooks or Framer Motion
- Import path mismatches
- Unused variables

- [ ] **Step 3: Run dev server and test all sections**

```bash
npm run dev
```

Verify each section renders correctly:
- Navbar: transparent → white on scroll, mobile drawer works
- Hero: split layout, phone mockup, floating cards, stagger animations
- How It Works: 3 cards, connecting line, step numbers
- Features: asymmetric grid, rate ticker, hover lift on cards
- Corridors: source pills, destination pills grouped by region, popular glow
- Trust: 4 badges, partner strip
- Testimonials: auto-scrolling carousel, pauses on hover
- Calculator: input updates receive amount, currency dropdowns work
- CTA + Footer: gradient block, 4-column footer, dark bg

- [ ] **Step 4: Test mobile responsiveness**

Open browser dev tools, check at 375px, 768px, and 1024px widths. Verify:
- All sections stack to single column on mobile
- Navbar hamburger menu works
- Text sizes are readable
- No horizontal overflow

- [ ] **Step 5: Commit final state**

```bash
git add -A
git commit -m "feat: verify build and polish responsive layout"
```

---

### Task 15: 21st.dev Component Integration

**Files:**
- Modify: various section files

- [ ] **Step 1: Search 21st.dev for relevant components**

Use the Magic MCP to search for polished component alternatives:
- Search for "button" — replace CTA buttons if a better variant exists
- Search for "badge" — check for pill/badge components
- Search for "card" — check for glass card variants
- Search for "navbar" / "header" — check for nav components
- Search for "marquee" / "testimonial" — check for carousel components

- [ ] **Step 2: Integrate best-fit components**

For each 21st.dev component that improves on the current implementation:
- Install it following the MCP instructions
- Replace the existing component
- Verify it matches the design tokens (colors, radii, shadows)

- [ ] **Step 3: Verify no regressions**

```bash
npm run build
npm run dev
```

Check all sections still render and animate correctly.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: integrate 21st.dev components for polished UI"
```
