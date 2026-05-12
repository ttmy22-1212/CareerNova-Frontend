"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Trang không tìm thấy
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          URL không tồn tại hoặc đã bị di chuyển. Tự động về trang chủ sau {countdown}s.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Home className="h-4 w-4" /> Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
