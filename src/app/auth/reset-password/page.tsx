import { Suspense } from "react";
import AuthResetPasswordContent from "./_sections/content";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <AuthResetPasswordContent />
    </Suspense>
  );
}
