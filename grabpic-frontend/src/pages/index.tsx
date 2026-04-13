import { CTASection, FeaturesSection, HeroSection, Footer, NavBar } from "@/components/landing";

export default function HomePage() {
  return (
    <main className="landing-shell pb-8">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
