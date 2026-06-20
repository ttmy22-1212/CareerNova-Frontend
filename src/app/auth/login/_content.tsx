"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth/auth-context";
import { mapAuthError } from "@/utils/auth-errors";
import {
  SocialAuthButtons,
  AuthDivider,
} from "../_components/social-auth-buttons";

export function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (e2) {
      setErr(mapAuthError(e2, "Đăng nhập thất bại"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Đăng nhập
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Chào mừng trở lại! Tiếp tục hành trình sự nghiệp của bạn.
      </p>

      <div className="mt-6">
        <SocialAuthButtons
          onSuccess={() => router.replace(next)}
          disabled={loading}
        />
      </div>
      <AuthDivider label="hoặc đăng nhập bằng email" />

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mật khẩu
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu của bạn"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              {showPwd ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {err && (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{err}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Đăng nhập
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Chưa có tài khoản?{" "}
        <Link
          href={`/auth/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
}
