"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import AuthApi from "@/api/auth";

export default function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState(
    "Đang tiến hành xác thực tài khoản của bạn...",
  );

  const hasCalledAPI = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Mã xác thực không tìm thấy hoặc không hợp lệ.");
      return;
    }

    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verifyEmailProcess = async () => {
      try {
        setStatus("loading");
        setMessage("Đang tiến hành xác thực tài khoản của bạn...");

        const res = await AuthApi.verifyEmail(token);

        if (res) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được kích hoạt thành công!");

          setTimeout(() => {
            router.push("/auth/login");
          }, 4000);
        } else {
          setStatus("error");
          setMessage(
            "Xác thực thất bại. Liên kết này có thể đã được sử dụng hoặc hết hạn.",
          );
        }
      } catch (err) {
        setStatus("error");

        setMessage(
          err instanceof Error
            ? err.message
            : "Xác thực thất bại hoặc liên kết hết hạn.",
        );
      }
    };

    verifyEmailProcess();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-800">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="font-medium text-slate-600 dark:text-slate-300">
              {message}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <CheckCircle2 className="h-16 w-16 animate-bounce text-emerald-500" />

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Kích hoạt thành công!
            </h1>

            <p className="px-4 text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>

            <p className="text-xs italic text-slate-400 dark:text-slate-500">
              Hệ thống đang đưa bạn về trang đăng nhập...
            </p>

            <Link
              href="/auth/login"
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <XCircle className="h-16 w-16 text-red-500" />

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Xác thực thất bại
            </h1>

            <p className="px-4 text-sm font-medium text-red-500 dark:text-red-400">
              {message}
            </p>

            <Link
              href="/auth/register"
              className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Quay lại trang Đăng ký tài khoản
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
