# Payvio Landing Page — Design Spec

## Overview

A high-end, production-quality landing page for **Payvio**, a remittance app targeting diaspora communities sending money home. The page drives users to download the mobile app (App Store + Google Play). Design language is **Clean Light Futurism** — bright, airy, Apple/Stripe-level precision with subtle depth and soft gradients.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion (scroll-triggered, staggered reveals)
- **Components:** 21st.dev components for polished UI primitives
- **Icons:** Lucide React
- **Fonts:** Inter (body) + Satoshi or Cabinet Grotesk (display headings)

## Project Structure

```
payvio/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata, OG tags
│   ├── page.tsx            # Landing page — composes all sections
│   └── globals.css         # Tailwind config + custom properties
├── components/
│   ├── ui/                 # 21st.dev + shared primitives (Button, Badge, etc.)
│   ├── sections/           # One component per landing page section
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Features.tsx
│   │   ├── Corridors.tsx
│   │   ├── Trust.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Calculator.tsx
│   │   └── CtaFooter.tsx
│   └── shared/             # AnimatedSection wrapper, AppStoreBadges, etc.
├── lib/
│   └── constants.ts        # Copy text, exchange rates, corridor data, testimonials
└── public/
    └── images/             # App mockups, flag icons, badges
```

## Design Tokens

| Token | Value |
|-------|-------|
| Background | `#fafbff` → `#f0f4ff` subtle gradient |
| Text Primary | `#0f172a` |
| Text Secondary | `#64748b` |
| Accent Primary | `#4f46e5` (indigo) |
| Accent Hover | `#6366f1` |
| Card Background | `#ffffff` |
| Card Border | `rgba(99, 102, 241, 0.06)` |
| Card Shadow | `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)` |
| Border Radius (cards) | `16px` |
| Border Radius (buttons) | `12px` |
| Border Radius (pills) | `9999px` |
| Font Body | Inter |
| Font Display | Satoshi or Cabinet Grotesk |
| Animation Duration | `0.5s` |
| Animation Easing | `ease-out` |

## Responsive Breakpoints

- **Mobile:** < 768px (single column, stacked layouts)
- **Tablet:** 768px–1024px (2-column where applicable)
- **Desktop:** > 1024px (full layouts)
- **Max content width:** 1280px, centered

## Animation Strategy

All section animations use a shared `AnimatedSection` wrapper component built with Framer Motion:
- **Trigger:** Intersection Observer, fires when element is 20% in viewport
- **Default:** Fade up (translateY 30px → 0, opacity 0 → 1)
- **Stagger:** Children stagger by 0.1s
- **Duration:** 0.5s with ease-out
- **Runs once:** No re-animation on scroll back up

---

## Section 1: Navbar

**Layout:** Fixed top, transparent background with backdrop blur on scroll. Max-width container centered.

**Content:**
- **Left:** Payvio logo (text wordmark, display font, indigo color)
- **Center:** Nav links — How It Works, Features, Countries, Reviews (smooth scroll anchors)
- **Right:** "Download App" CTA button (indigo, solid, 12px radius)
- **Mobile:** Hamburger menu icon, slides in a drawer from right

**Behavior:**
- Transparent on page load, gains white background + subtle shadow after 50px scroll
- Sticky position, z-index above all content
- Active nav link highlights based on scroll position

## Section 2: Hero

**Layout:** Split — copy left (55%), phone mockup right (45%). Stacks on mobile (copy → phone).

**Left side:**
1. **Eyebrow badge:** Pill shape — "Trusted by 500K+ users worldwide" with subtle shimmer animation
2. **Headline:** "Send Money Home — Instantly" — display font, 56px desktop / 36px mobile, `#0f172a`
3. **Subheadline:** "The fastest way to send money to your loved ones. Low fees, real exchange rates, delivered in minutes." — 18px, `#64748b`
4. **App store badges:** Apple App Store + Google Play side by side, standard badge images
5. **Social proof strip:** "4.8★ on App Store · 1M+ transfers · Licensed & regulated" — 14px, `#94a3b8`

**Right side:**
- Phone mockup with slight 3D rotation (`perspective: 1000px, rotateY: -5deg, rotateX: 2deg`)
- Screen shows a transfer UI: `$500 → ₦780,000`
- 3 floating glass cards orbit the phone:
  - "Delivered in 2 min ✓"
  - "Fee: $2.99"
  - "Rate: 1 USD = 1,560 NGN"
- Cards have white background, soft shadow, slight blur border
- Phone has subtle float animation (CSS `translateY` oscillation, 3s loop)

**Background:**
- 2-3 radial gradient orbs (indigo/blue, very low opacity ~0.05-0.08) positioned at top-right and bottom-left
- Orbs slowly drift with CSS animation (20s loop)

**Animations:**
- Headline → subheadline → badges → social proof: staggered fade-up (0.1s between each)
- Phone: slides in from right with scale (0.9 → 1)
- Floating cards: fade in with 0.3s delay after phone, stagger between cards

## Section 3: How It Works

**Layout:** Centered section heading + 3 step cards in horizontal row. Stacks vertical on mobile.

**Heading:**
- "Send money in 3 simple steps"
- Subtitle: "No hidden fees. No complicated forms. Just fast, secure transfers."

**Step cards (3):**

| Step | Icon | Title | Description |
|------|------|-------|-------------|
| 01 | Currency/dollar | Choose Amount | Enter how much you want to send. See the exact amount your recipient gets — no surprises. |
| 02 | Person/contact | Pick Recipient | Add your recipient's details. Bank account, mobile money, or cash pickup — their choice. |
| 03 | Checkmark/lightning | Money Delivered | Hit send. Money arrives in minutes, not days. Track it in real-time. |

**Card design:**
- Large step number (`01`) in light indigo (`rgba(79,70,229,0.15)`), 48px display font
- Icon in a soft indigo circle (48px)
- Title: 20px, bold
- Description: 16px, secondary color
- White card, subtle border, soft shadow, 16px radius

**Connecting element:** Subtle dashed line or arrow SVG between cards on desktop (hidden on mobile)

**Animations:**
- Cards stagger fade-up (left → center → right)
- Connecting line draws with SVG stroke-dashoffset animation
- Step numbers count up (00 → 01, etc.)

## Section 4: Key Features

**Layout:** Asymmetric 2-column grid — large featured card left, 2x2 grid of smaller cards right. Stacks on mobile (featured card first, then 2x2 grid becomes single column).

**Featured card (left):**
- Title: "Real Exchange Rates"
- Description: "We use the mid-market rate — the same one you see on Google. No markups, no hidden margins."
- Contains a rate ticker element showing 3 rows:
  - 🇺🇸 USD / 🇳🇬 NGN — 1,560.00 ↑
  - 🇬🇧 GBP / 🇰🇪 KES — 198.50 ↑
  - 🇪🇺 EUR / 🇬🇭 GHS — 16.80 ↑
- Card has subtle indigo gradient accent on top edge
- Glass effect (very subtle backdrop blur border)

**4 smaller cards (right, 2x2):**

| Title | Description | Icon |
|-------|-------------|------|
| Fees from $1.99 | Transparent pricing. See the fee before you send. Often 3-5x cheaper than banks. | Coins |
| Arrives in Minutes | Most transfers delivered in under 5 minutes. Real-time tracking so you're never guessing. | Zap/Lightning |
| Multiple Payout Methods | Bank transfer, mobile money (M-Pesa, MTN), or cash pickup. However your family prefers. | Wallet |
| Bank-Level Security | 256-bit encryption, biometric login, and fraud monitoring. Your money is protected at every step. | Shield |

**Each small card:** Lucide icon (indigo tint) top-left, title + description, white bg, hover lift (translateY -4px + shadow increase, 0.2s transition)

**Animations:**
- Featured card slides in from left
- 4 small cards stagger fade-up
- Rate ticker numbers animate/count up on scroll into view

## Section 5: Supported Corridors

**Layout:** Centered heading + "sending from" row + country pill grid grouped by region

**Heading:**
- "Send money to 40+ countries"
- Subtitle: "From the US, UK, Canada, and Europe to the people who matter most"

**Sending from row:** Horizontal row of source countries as pills:
- 🇺🇸 United States · 🇬🇧 United Kingdom · 🇨🇦 Canada · 🇪🇺 Europe · 🇦🇺 Australia

**Destination grid (grouped by region):**

**Africa:** 🇳🇬 Nigeria · 🇬🇭 Ghana · 🇰🇪 Kenya · 🇿🇦 South Africa · 🇺🇬 Uganda · 🇹🇿 Tanzania · 🇪🇹 Ethiopia · 🇸🇳 Senegal

**Asia:** 🇮🇳 India · 🇵🇭 Philippines · 🇵🇰 Pakistan · 🇧🇩 Bangladesh

**Latin America:** 🇲🇽 Mexico · 🇨🇴 Colombia · 🇧🇷 Brazil

**Country pill design:**
- Flag emoji + country name
- White background, subtle border, 9999px radius (pill shape)
- Popular corridors (Nigeria, Kenya, India, Mexico) have soft indigo glow background
- Hover: subtle scale (1.05) + shadow

**Background decoration:** SVG dotted arc lines connecting "from" row to destination regions, very low opacity (~0.1), suggesting money flow paths

**Animations:**
- Country pills fade in with stagger by region group
- Arc lines draw with SVG stroke-dashoffset
- Hover highlights individual pills

## Section 6: Trust & Security

**Layout:** Centered heading + 4 trust badges in horizontal row + partner logo strip below. Stacks 2x2 on mobile.

**Heading:**
- "Your money is safe with us"
- Subtitle: "Licensed, regulated, and built with security-first engineering"

**4 trust badges:**

| Icon | Title | Description |
|------|-------|-------------|
| Shield/Check | Licensed & Regulated | Registered with FinCEN, FCA, and local regulators in every country we operate |
| Lock | 256-bit Encryption | Your data is encrypted end-to-end, same standard as major banks |
| Fingerprint | Biometric Auth | Face ID and fingerprint login. No one else can access your account |
| Eye/Monitor | 24/7 Monitoring | Real-time fraud detection and dedicated support when you need it |

**Badge design:** Icon in soft indigo circle (56px), title below (18px bold), description (14px secondary). No heavy cards — clean icon + text with generous spacing.

**Partner logo strip:**
- Horizontal row: FinCEN, FCA, PCI DSS, Visa, Mastercard (placeholder silhouette logos)
- Grayscale, 40% opacity
- Centered with generous top margin

**Animations:**
- Badges fade up with stagger
- Logo strip fades in with 0.3s delay after badges

## Section 7: Testimonials

**Layout:** Centered heading + horizontally scrolling card carousel

**Heading:**
- "Loved by families worldwide"
- Subtitle: "Join over 500,000 people who trust Payvio to send money home"
- Decorative faded quote mark (`"`) as large background element behind heading, ~200px, `rgba(79,70,229,0.05)`

**Testimonial cards (5):**

| Quote | Name | Corridor |
|-------|------|----------|
| I used to pay $25 in fees with my bank. Payvio charges $2.99 and the money arrives before I put my phone down. | Amara O. | US → Nigeria |
| My mum gets the money on her M-Pesa in 3 minutes. She calls me every time to say thank you. | David K. | UK → Kenya |
| The exchange rate is always better than Western Union. I've saved hundreds this year. | Priya M. | Canada → India |
| Finally an app that doesn't feel like it was built in 2005. Clean, fast, and my family gets more money. | Carlos R. | US → Mexico |
| I was nervous sending money through an app. After 50+ transfers without a single issue, I'm a customer for life. | Fatima B. | UK → Ghana |

**Card design:**
- 5 yellow stars at top
- Quote text: 16px, slightly larger line-height, `#0f172a`
- Name + corridor: 14px, secondary color, with small avatar circle (gradient placeholder)
- White card, subtle shadow, 16px radius
- Card width: ~380px

**Carousel behavior:**
- CSS-based infinite auto-scroll (no JS library needed)
- Duplicated card set for seamless loop
- Scrolls right slowly (~30s per loop)
- Pauses on hover
- Shows 3 cards on desktop, 1.2 cards on mobile (peek next card)
- No pagination dots or arrows

**Animations:**
- Section heading fades up on scroll
- Carousel runs continuously via CSS animation (translateX)

## Section 8: Live Rate Calculator

**Layout:** Split — calculator widget left (45%), supporting copy right (55%). Stacks on mobile (copy first, calculator below).

**Calculator widget card:**
- Elevated glass-effect card — larger shadow, soft indigo glow on edges
- **"You send" field:**
  - Label: "You send"
  - Large number input (32px font)
  - Currency dropdown right-aligned: flag + code (🇺🇸 USD) — options: USD, GBP, EUR, CAD, AUD
- **Info row (between fields):**
  - Exchange rate: "1 USD = 1,560.00 NGN"
  - Fee: "$2.99"
  - Displayed in a subtle divider area
- **"They receive" field:**
  - Label: "They receive"
  - Calculated amount (32px font, indigo color to highlight)
  - Currency dropdown: flag + code (🇳🇬 NGN) — options: NGN, KES, GHS, INR, PHP, MXN, PKR, BDT, ZAR, UGX, TZS, ETB, XOF, COP, BRL
- **Transfer time:** "⚡ Arrives in ~3 minutes" — small text below receive field
- **CTA button:** "Download to Send" — full-width, indigo, 12px radius

**Calculation logic:** Client-side with static exchange rates defined in `lib/constants.ts`. Updates on input change — no API calls needed. Rates are representative, not live.

**Right side copy:**
- Heading: "See exactly what they'll get"
- Body: "No surprises, no hidden fees. The rate you see is the rate you get. Enter any amount and see the full breakdown — before you download."
- Comparison callout: "Save up to 5x vs banks and traditional services" — in a subtle pill/badge

**Animations:**
- Calculator card slides in from left on scroll
- Receive amount animates (count up) when send amount changes
- Copy fades in from right

## Section 9: Final CTA + Footer

**Final CTA block:**
- Full-width section with soft indigo gradient background (`#eef2ff` → `#e0e7ff`)
- Centered:
  - Heading: "Ready to send money home?"
  - Subtitle: "Download Payvio and make your first transfer in under 2 minutes."
  - App store badges centered (Apple + Google Play)
  - Trust reminder: "Free to download · No hidden fees · 4.8★ rated" — 14px, secondary

**Footer:**
- Background: `#0f172a` (dark contrast)
- Text: white primary, `rgba(255,255,255,0.5)` secondary
- 4-column grid (stacks 2x2 on tablet, single column on mobile):

| Payvio | Product | Company | Legal |
|--------|---------|---------|-------|
| Logo (white) | How It Works | About | Privacy Policy |
| "Send money home, instantly" | Features | Careers | Terms of Service |
| Social icons (Twitter, Instagram, LinkedIn, TikTok) | Countries | Blog | Licenses |
| | Rates | Press | Cookie Policy |
| | Download | Contact | AML Policy |

- Bottom bar: divider line + "© 2025 Payvio. All rights reserved. Licensed and regulated by FinCEN and FCA."

**Animations:**
- CTA block fades up on scroll
- App store badges: subtle hover scale (1.05)
- Footer: no animation — static

---

## Performance Requirements

- Lighthouse score: 90+ across all categories
- First Contentful Paint: < 1.5s
- No layout shift from animations (elements have reserved space)
- Images: Next.js `<Image>` with lazy loading, WebP format
- Fonts: `next/font` for zero-layout-shift font loading

## Accessibility

- All interactive elements keyboard-navigable
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Alt text on all images
- Semantic HTML (sections, headings hierarchy, nav landmarks)
- `prefers-reduced-motion`: disable all animations when enabled
- Focus-visible states on all interactive elements
