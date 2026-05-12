import { useAuth } from "@/contexts/auth/firebase-context";
import { Stack } from "@mui/material";
import { useCallback, useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, signInAnonymously } = useAuth();

  const check = useCallback(async () => {
    if (!user?.id) {
      try {
        await signInAnonymously();
      } catch (error) {
        console.log("error", error);
      }
    }
  }, [signInAnonymously, user]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      check();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return <>{children}</>;
};

export default AuthGuard;
