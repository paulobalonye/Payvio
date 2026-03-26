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
