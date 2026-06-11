"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CookieHelper from "@/utils/cookie-helper";

export function GoogleCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const error = params.get("error");

    if (error || !accessToken || !refreshToken) {
      router.replace("/auth/login?error=google_failed");
      return;
    }

    CookieHelper.setItem("token", accessToken);
    CookieHelper.setItem("refresh_token", refreshToken);

    router.replace("/");
  }, [params, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Đang hoàn tất đăng nhập...
      </p>
    </div>
  );
}
