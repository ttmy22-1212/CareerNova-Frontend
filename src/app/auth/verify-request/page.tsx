import { Suspense } from "react";
import VerifyRequestContent from "./_sections/content";

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyRequestContent />
    </Suspense>
  );
}
