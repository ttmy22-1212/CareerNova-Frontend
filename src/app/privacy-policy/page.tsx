import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Career Nova",
  description: "Privacy Policy for Career Nova platform",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Last updated: June 12, 2025
        </p>

        <div className="prose prose-slate max-w-none dark:prose-invert space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              1. Introduction
            </h2>
            <p>
              Career Nova (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the website{" "}
              <strong>career-nova.online</strong> (the &quot;Service&quot;). This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              2. Information We Collect
            </h2>
            <p>We may collect the following categories of information:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                <strong>Account data:</strong> name, email address, and profile
                picture obtained when you sign in via Google or Facebook OAuth.
              </li>
              <li>
                <strong>Profile data:</strong> education, work experience,
                skills, and career goals you voluntarily provide.
              </li>
              <li>
                <strong>CV / résumé content:</strong> text extracted from
                documents you upload for job-matching analysis.
              </li>
              <li>
                <strong>Usage data:</strong> pages visited, features used, and
                interactions with the platform (collected via server logs and
                analytics).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              3. How We Use Your Information
            </h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>To create and manage your account.</li>
              <li>
                To provide personalised career recommendations, skill-gap
                analysis, and learning roadmaps.
              </li>
              <li>To match your CV against job descriptions.</li>
              <li>To improve and develop the Service.</li>
              <li>
                To send transactional emails (e.g., email verification, password
                reset).
              </li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> sell your personal data to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              4. Social Login (Google &amp; Facebook)
            </h2>
            <p>
              When you choose to log in using Google or Facebook, we receive
              only your <strong>name</strong>, <strong>email address</strong>,
              and <strong>profile picture</strong> from their OAuth API. We do
              not request access to your contacts, posts, or any other social
              data. Your social-platform credentials are never stored on our
              servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              5. Data Retention
            </h2>
            <p>
              We retain your personal data for as long as your account is
              active. You may request deletion of your account and all
              associated data at any time via{" "}
              <Link
                href="/delete-account"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                career-nova.online/delete-account
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              6. Cookies
            </h2>
            <p>
              We use cookies strictly to maintain your authentication session
              (JWT access token and refresh token). We do not use advertising or
              tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              7. Security
            </h2>
            <p>
              All data is transmitted over HTTPS. Passwords are hashed using
              bcrypt. We apply industry-standard security practices to protect
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              8. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not directed to children under 13. We do not
              knowingly collect personal data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes by updating the &quot;Last
              updated&quot; date above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              10. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at{" "}
              <a
                href="mailto:support@career-nova.online"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                support@career-nova.online
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
