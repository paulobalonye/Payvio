"use client";

import { motion } from "framer-motion";
import { Coins, Zap, Wallet, Shield } from "lucide-react";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { FEATURES, FEATURED_RATES } from "@/lib/constants";

const ICONS = { Coins, Zap, Wallet, Shield } as const;

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
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
