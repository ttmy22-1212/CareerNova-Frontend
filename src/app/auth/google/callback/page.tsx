import { Suspense } from "react";
import { GoogleCallbackContent } from "./_content";

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
