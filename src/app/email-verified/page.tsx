"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import AuthApi from "@/api/auth";

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Đang tiến hành xác thực tài khoản của bạn...",
  );
  const hasCalledAPI = useRef(false); // Cơ chế khóa chốt ngăn StrictMode gọi trùng nhịp khi sử dụng API wrapper

  useEffect(() => {
    // 1. Kiểm tra sự tồn tại của token trên URL đầu tiên
    if (!token) {
      setStatus("error");
      setMessage("Mã xác thực không tìm thấy hoặc không hợp lệ.");
      return;
    }

    // 2. Nếu nhịp render trước đã kích hoạt gọi API rồi thì chốt chặn này sẽ giữ trạng thái đứng im
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const verifyEmailProcess = async () => {
      try {
        setStatus("loading");
        setMessage("Đang tiến hành xác thực tài khoản của bạn...");

        // Gọi hàm tĩnh từ AuthApi đúng cấu trúc của bạn
        const res = await AuthApi.verifyEmail(token);

        // API wrapper (apiGet) trả về res.data hoặc res ổn định khi thành công
        if (res) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được kích hoạt thành công!");

          // Tự động điều hướng về trang đăng nhập sau 4 giây
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
        // Đọc chuỗi thông báo lỗi đã được hàm getErrorString xử lý từ apiFetch ném ra
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
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-800">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {message}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-2">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Kích hoạt thành công!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm px-4">
              {message}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Hệ thống đang đưa bạn về trang đăng nhập...
            </p>
            <Link
              href="/auth/login"
              className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
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
            <p className="text-red-500 dark:text-red-400 text-sm font-medium px-4">
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
