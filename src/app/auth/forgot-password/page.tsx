"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // FRONTEND MOCK: simulate sending reset email. Hook up to BE later.
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Đã gửi email
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Nếu <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>{" "}
          tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút tới.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Quên mật khẩu?
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Gửi link đặt lại
        </button>
      </form>

      <Link
        href="/auth/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>
    </>
  );
}
