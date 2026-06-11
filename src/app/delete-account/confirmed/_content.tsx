"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

export function ConfirmedContent() {
  const params = useSearchParams();
  const isError = !!params.get("error");

  if (isError) {
    return (
      <>
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Liên kết không hợp lệ
        </h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Liên kết xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu
          cầu xoá tài khoản.
        </p>
        <Link
          href="/delete-account"
          className="mt-6 inline-flex rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Thử lại
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Tài khoản đã được xoá
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Tài khoản và toàn bộ dữ liệu liên quan của bạn đã bị xoá vĩnh viễn
        khỏi hệ thống Career Nova.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Về trang chủ
      </Link>
    </>
  );
}
