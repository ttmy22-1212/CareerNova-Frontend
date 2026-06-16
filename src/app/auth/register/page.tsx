import { Suspense } from "react";
import { RegisterContent } from "./_content";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-7 w-44 rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-100" />
          <div className="mt-6 h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-200" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
