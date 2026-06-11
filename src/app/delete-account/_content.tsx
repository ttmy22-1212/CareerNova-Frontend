"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth/auth-context";
import AuthApi from "@/api/auth";
import { Loader2, Trash2, CheckCircle2 } from "lucide-react";

export function DeleteAccountContent() {
  const { user, deleteAccount, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- Logged-in flow: one-click delete ---
  if (user) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
        <h2 className="mb-1 text-lg font-semibold text-red-700 dark:text-red-400">
          Delete account: {user.email}
        </h2>
        <p className="mb-5 text-sm text-red-600 dark:text-red-300">
          This action is <strong>permanent and irreversible</strong>. All your
          data will be deleted immediately.
        </p>

        {submitted ? (
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Your account and data have been permanently deleted.
          </div>
        ) : (
          <>
            {err && (
              <p className="mb-3 rounded-lg border border-red-300 bg-red-100 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                {err}
              </p>
            )}
            <button
              disabled={loading}
              onClick={async () => {
                if (
                  !window.confirm(
                    "Are you sure you want to permanently delete your account? This cannot be undone.",
                  )
                )
                  return;
                setErr(null);
                setLoading(true);
                try {
                  await deleteAccount();
                  logout();
                  setSubmitted(true);
                } catch (e) {
                  setErr(
                    e instanceof Error ? e.message : "Deletion failed. Please try again.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Permanently delete my account
            </button>
          </>
        )}
      </div>
    );
  }

  // --- Guest flow: email request form ---
  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/40 dark:bg-green-950/20">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <div>
          <p className="font-semibold text-green-800 dark:text-green-300">
            Request received
          </p>
          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
            We will process your data deletion request for{" "}
            <strong>{email}</strong> within 30 days and send a confirmation
            email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Submit a deletion request
      </h2>
      <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
        Not logged in? Enter the email address associated with your Career Nova
        account and we will delete all data linked to it.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          setLoading(true);
          try {
            await AuthApi.requestDeleteAccount(email);
            setSubmitted(true);
          } catch {
            setErr("Gửi yêu cầu thất bại. Vui lòng thử lại sau.");
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {err && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Request account deletion
        </button>
      </form>
    </div>
  );
}
