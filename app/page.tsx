import {
  Navbar,
  Hero,
  HowItWorks,
  Features,
  Corridors,
  Trust,
  Testimonials,
  Calculator,
  CtaFooter,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Corridors />
      <Trust />
      <Testimonials />
      <Calculator />
      <CtaFooter />
    </main>
  );
}
