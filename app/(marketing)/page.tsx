import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Features } from "@/components/marketing/features";
import { UseCases } from "@/components/marketing/use-cases";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";
import { TrustSignals } from "@/components/marketing/trust-signals";
import { Footer } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <UseCases />
      <Pricing />
      <Testimonials />
      <FAQ />
      <TrustSignals />
      <Footer />
    </main>
  );
}
