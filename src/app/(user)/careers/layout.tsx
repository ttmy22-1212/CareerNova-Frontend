"use client";

import RequiredLoginDialog from "@/app/_components/required-login-dialog";
import { useAuth } from "@/contexts/auth/firebase-context";
import { useDialog } from "@/hooks/use-dialog";
import { CAREERS_LOGIN, getLocalStorage } from "@/utils/local-storage";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const requiredLoginDialog = useDialog();
  const { user } = useAuth();

  useEffect(() => {
    const data: {
      expired_at: string;
    } | null = getLocalStorage(CAREERS_LOGIN);

    if (!user?.email && (!data || new Date(data.expired_at) < new Date())) {
      requiredLoginDialog.handleOpen();
    }
  }, [user?.email, requiredLoginDialog]);

  return (
    <>
      {children}
      <RequiredLoginDialog
        open={requiredLoginDialog.open}
        onClose={requiredLoginDialog.handleClose}
      />
    </>
  );
}
