"use client";

import { useAuth } from "@/contexts/auth/firebase-context";
import OnboardingContent from "./_sections/content";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { paths } from "@/paths";
import LoadingState from "@/components/loading-state";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.email && user.onboarding_completed) {
      router.push(paths.dashboard);
    }
  }, [user, router]);

  return !user?.email ? <LoadingState /> : <OnboardingContent />;
}
