"use client";

import { motion } from "framer-motion";
import AnimatedSection, { itemVariants } from "@/components/shared/AnimatedSection";
import AppStoreBadges from "@/components/shared/AppStoreBadges";
import { FOOTER_LINKS } from "@/lib/constants";

export default function CtaFooter() {
  return (
    <>
      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <AnimatedSection className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] bg-gradient-to-br from-[var(--color-cta-bg-start)] to-[var(--color-cta-bg-end)] px-8 py-16 md:py-20 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-satoshi)] text-[var(--color-text-primary)] mb-4">
              Ready to send money home?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              Download Payvio and make your first transfer in under 2 minutes.
            </p>
            <AppStoreBadges className="justify-center" />
            <p className="text-sm text-[var(--color-text-muted)] mt-6">
              Free to download {"\u00B7"} No hidden fees {"\u00B7"} 4.8{"\u2605"} rated
            </p>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-footer-bg)] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div>
              <div className="text-xl font-bold font-[family-name:var(--font-satoshi)] mb-3">
                Payvio
              </div>
              <p className="text-sm text-white/50 mb-6">
                Send money home, instantly
              </p>
              <div className="flex gap-4">
                {["T", "I", "L"].map((letter) => (
                  <a
                    key={letter}
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white/70 text-xs font-bold"
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-medium uppercase tracking-wider text-white/70 mb-4">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-xs text-white/40">
              {"\u00A9"} 2026 Payvio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
