import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { DeleteAccountContent } from "./_content";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Delete Your Account & Data – Career Nova",
  description:
    "Request deletion of your Career Nova account and all associated personal data.",
};

export default function DeleteAccountPage() {
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Delete Your Account &amp; Data
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          You can request permanent deletion of your Career Nova account and all
          personal data associated with it.
        </p>

        <Suspense fallback={null}>
          <DeleteAccountContent />
        </Suspense>

        {/* Static instructions — always visible */}
        <div className="mt-10 space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            What gets deleted
          </h2>
          <ul className="ml-4 list-disc space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
            <li>Your account (email, name, avatar)</li>
            <li>Profile information (education, experience, skills, goals)</li>
            <li>Uploaded CVs and extracted text</li>
            <li>Saved jobs and recommendations history</li>
            <li>All authentication tokens</li>
          </ul>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Alternative: delete from Settings
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            If you are logged in, you can also delete your account directly from{" "}
            <Link
              href="/settings"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Account Settings
            </Link>
            .
          </p>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Contact us
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            If you have trouble submitting the form, email us directly at{" "}
            <a
              href="mailto:support@career-nova.online"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              support@career-nova.online
            </a>{" "}
            with the subject &quot;Data Deletion Request&quot; and we will process it
            within 30 days.
          </p>
        </div>
      </main>
    </div>
  );
}
