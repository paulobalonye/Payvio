"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import {
  SEND_CURRENCIES,
  RECEIVE_CURRENCIES,
  EXCHANGE_RATES,
  FEES,
} from "@/lib/constants";
import { formatCurrency, calculateReceiveAmount } from "@/lib/utils";

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const, delay: 0.2 } },
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
                Rate: 1 {sendCurrency} = {formatCurrency(rate)} {receiveCurrency}
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
                {formatCurrency(receiveAmount)}
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
              {"\u26A1"} Arrives in ~3 minutes
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
