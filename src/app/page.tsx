"use client";

import { paths } from "@/paths";
import { useOnboarding } from "@/contexts/onboarding/onboarding-context";
import { useAuth } from "@/contexts/auth/auth-context";
import { LandingPage } from "@/components/career-lens/LandingPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { ready: onboardingReady } = useOnboarding();
  const { ready: authReady, user } = useAuth();

  useEffect(() => {
    if (!authReady || !onboardingReady) return;
    if (user) {
      // Always land on Tổng quan Cá nhân; onboarding banner handles first-time setup
      router.replace(paths.personalDashboard);
    }
  }, [authReady, onboardingReady, user, router]);

  return <LandingPage />;
}
