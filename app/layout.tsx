import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-satoshi",
  weight: ["500", "700", "800"],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-[family-name:var(--font-inter)]">{children}</body>
    </html>
  );
}
