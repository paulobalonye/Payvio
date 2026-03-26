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
