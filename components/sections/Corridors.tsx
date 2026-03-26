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
