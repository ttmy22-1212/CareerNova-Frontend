import { Suspense } from "react";
import EmailVerifiedContent from "./_sections/context";

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
