"use client";

import type { FC, ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { paths } from "@/paths";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth/firebase-context";

interface GuestGuardProps {
  children: ReactNode;
}

export const GuestGuard: FC<GuestGuardProps> = (props) => {
  const { children } = props;
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const check = useCallback(async () => {
    if (isAuthenticated && user?.email) {
      router.replace(paths.dashboard);
    }
  }, [isAuthenticated, router, user]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      const timeoutId = setTimeout(check, 2000);
      return () => {
        clearTimeout(timeoutId);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, user?.email],
  );

  return <>{children}</>;
};
