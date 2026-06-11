import Link from "next/link";
import { TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – Career Nova",
  description: "Terms of Service for Career Nova platform",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Last updated: June 12, 2025
        </p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Career Nova (&quot;Service&quot;) at{" "}
              <strong>career-nova.online</strong>, you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              2. Description of Service
            </h2>
            <p>
              Career Nova is a career-development platform that provides
              personalised job recommendations, skill-gap analysis, CV matching,
              and learning roadmaps for IT students and professionals in
              Vietnam.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              3. User Accounts
            </h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                You must provide accurate information when creating an account.
              </li>
              <li>You are responsible for keeping your credentials secure.</li>
              <li>
                You must be at least 13 years old to use the Service.
              </li>
              <li>
                You may not share your account with others or create accounts on
                behalf of third parties without permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              4. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>
                Use the Service for any unlawful purpose or in violation of
                applicable laws.
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the Service.
              </li>
              <li>
                Upload malicious files, spam, or content that infringes
                third-party rights.
              </li>
              <li>
                Scrape, crawl, or systematically extract data from the Service
                without our written consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              5. Intellectual Property
            </h2>
            <p>
              All content, branding, and software on the Service are owned by
              Career Nova or its licensors. You retain ownership of content you
              upload (e.g., your CV). By uploading content, you grant us a
              limited licence to process it solely to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              6. Third-Party Services
            </h2>
            <p>
              The Service integrates with Google and Facebook for authentication.
              Your use of those features is also governed by Google&apos;s and
              Meta&apos;s respective terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              7. Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind.
              We do not guarantee that the Service will be uninterrupted,
              error-free, or that career recommendations will lead to specific
              employment outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Career Nova shall not be
              liable for any indirect, incidental, or consequential damages
              arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              9. Account Termination
            </h2>
            <p>
              You may delete your account at any time via{" "}
              <Link
                href="/delete-account"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                career-nova.online/delete-account
              </Link>
              . We reserve the right to suspend or terminate accounts that
              violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              10. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of Vietnam. Any disputes
              shall be resolved in the courts of Ho Chi Minh City, Vietnam.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              12. Contact
            </h2>
            <p>
              Questions about these Terms?{" "}
              <a
                href="mailto:support@career-nova.online"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                support@career-nova.online
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
