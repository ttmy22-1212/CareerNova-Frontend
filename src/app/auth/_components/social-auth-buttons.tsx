"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.6-2.6C16.9 3.4 14.7 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.2c0-.6-.1-1.1-.2-1.7H12v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1v-.3l3.8 2.9c2.2-2.1 3.3-5.1 3.3-8.9z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.3c-.2-.6-.3-1.3-.3-2 0-.7.1-1.4.3-2L1.6 7.4C.9 8.8.5 10.4.5 12s.4 3.2 1.1 4.6l3.9-2.3z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.8-2.9c-1 .7-2.4 1.2-4.8 1.2-3.8 0-5.5-2.7-5.5-4.1l-3.9 2.3C2.4 18.6 6.7 21.5 12 21.5z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9V15.5H7.1V12h3v-2.6c0-3 1.8-4.6 4.5-4.6 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-1.9.9-1.9 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z"
      />
    </svg>
  );
}

export function SocialAuthButtons({
  onSuccess,
  disabled,
}: {
  onSuccess?: () => void;
  disabled?: boolean;
}) {
  const { loginWithProvider } = useAuth();
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go(provider: "google" | "facebook") {
    setErr(null);
    setLoading(provider);
    try {
      await loginWithProvider(provider);
      onSuccess?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setLoading(null);
    }
  }

  const isDisabled = disabled || loading !== null;

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => go("google")}
          className="group relative flex h-11 items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
        >
          {loading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>Google</span>
        </button>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => go("facebook")}
          className="group relative flex h-11 items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-transparent bg-[#1877F2] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#166FE5] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "facebook" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FacebookIcon className="h-5 w-5 rounded-full bg-white" />
          )}
          <span>Facebook</span>
        </button>
      </div>

      {err && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {err}
        </div>
      )}
    </div>
  );
}

export function AuthDivider({ label = "hoặc" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
