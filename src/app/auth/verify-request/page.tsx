"use client";

import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "Email của bạn";

  return (
    <div className="flex flex-col items-center text-center p-6 max-w-sm mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
        <Mail className="h-8 w-8" />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Kiểm tra Email của bạn
      </h1>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Chúng tôi đã gửi một liên kết kích hoạt tài khoản đến địa chỉ:
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">
        {decodeURIComponent(email)}
      </p>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
        Vui lòng nhấp vào liên kết trong email để hoàn tất kích hoạt trước khi
        tiến hành đăng nhập.
      </p>

      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 w-full pt-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
