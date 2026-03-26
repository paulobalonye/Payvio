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
