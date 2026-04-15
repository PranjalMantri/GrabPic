import Head from "next/head";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/router";

import { AuthenticatedHomePage } from "@/components/home";
import { CTASection, FeaturesSection, HeroSection, Footer, NavBar } from "@/components/landing";
import { hasAuthSession } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    () => () => {},
    hasAuthSession,
    () => false,
  );
  const [hasCheckedFace, setHasCheckedFace] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasCheckedFace(true);
      return;
    }

    let isMounted = true;

    const enforceFaceRegistration = async () => {
      const [data, response] = await apiClient.get<{ user?: { face_registered?: boolean; faceRegistered?: boolean } }>("/auth/me");

      if (!isMounted) {
        return;
      }

      const isFaceRegistered = Boolean(data?.user?.face_registered ?? data?.user?.faceRegistered);

      if (response.status === 200 && data?.user && !isFaceRegistered) {
        void router.replace("/settings/register-face");
        return;
      }

      setHasCheckedFace(true);
    };

    void enforceFaceRegistration();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    if (!hasCheckedFace) {
      return null;
    }

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
