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
