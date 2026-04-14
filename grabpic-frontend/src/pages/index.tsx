import Head from "next/head";
import { useSyncExternalStore } from "react";

import { AuthenticatedHomePage } from "@/components/home";
import { CTASection, FeaturesSection, HeroSection, Footer, NavBar } from "@/components/landing";
import { hasAuthSession } from "@/lib/auth";

export default function HomePage() {
  const isAuthenticated = useSyncExternalStore(
    () => () => {},
    hasAuthSession,
    () => false,
  );

  if (isAuthenticated) {
    return (
      <>
        <Head>
          <title>GrabPic | Dashboard</title>
        </Head>
        <AuthenticatedHomePage />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>GrabPic | AI Event Platform</title>
      </Head>
      <main className="landing-shell pb-8">
        <NavBar />
        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
