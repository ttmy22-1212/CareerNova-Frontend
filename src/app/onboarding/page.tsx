"use client";

import { useAuth } from "@/contexts/auth/auth-context";
import OnboardingContent from "./_sections/content";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { paths } from "@/paths";
import LoadingState from "@/components/loading-state";

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (!user?.email) {
      router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user?.email && user.onboarding_completed) {
      router.push(paths.dashboard);
    }
  }, [ready, user, router, pathname]);

  return !ready || !user?.email ? <LoadingState /> : <OnboardingContent />;
}
