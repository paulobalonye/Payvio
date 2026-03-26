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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.3 },
  },
};

const floatingCard = (delay: number) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.8 + delay },
  },
});

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
      {/* Background gradient orbs */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
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
            style={{ perspective: "1000px" }}
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
                <div className="text-xs text-[var(--color-text-muted)] mb-2">You send</div>
                <div className="text-3xl font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-satoshi)]">
                  $500.00
                </div>
                <div className="w-12 h-[1px] bg-[var(--color-accent-light)] my-4" />
                <div className="text-xs text-[var(--color-text-muted)] mb-2">They receive</div>
                <div className="text-3xl font-bold text-[var(--color-accent)] font-[family-name:var(--font-satoshi)]">
                  {"\u20A6"}780,000
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
