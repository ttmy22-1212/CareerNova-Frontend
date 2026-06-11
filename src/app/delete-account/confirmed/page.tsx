import Link from "next/link";
import { TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { Suspense } from "react";
import { ConfirmedContent } from "./_content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Deleted – Career Nova",
};

export default function DeleteConfirmedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              Career Nova
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <Suspense fallback={null}>
          <ConfirmedContent />
        </Suspense>
      </main>
    </div>
  );
}
