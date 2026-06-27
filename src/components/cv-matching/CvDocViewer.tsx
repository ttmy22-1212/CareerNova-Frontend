"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download, ExternalLink, Loader2 } from "lucide-react";

type Status = "loading" | "ready" | "error";

const looksLikePdf = (url: string) => {
  const clean = url.toLowerCase().split("#")[0].split("?")[0];
  return clean.endsWith(".pdf") || url.toLowerCase().includes(".pdf");
};

/**
 * Trình xem tài liệu CV (PDF / ảnh).
 *
 * Thay vì nhúng thẳng URL Cloudinary cross-origin vào iframe — cách này dễ bị
 * chặn theo domain (hotlink/referrer) sau khi đổi sang domain mới, khiến iframe
 * rơi vào trang 404 của chính app — ta tải file qua fetch rồi hiển thị bằng
 * blob URL same-origin. Same-origin nên không bao giờ dính 404 của app, đồng
 * thời `no-referrer` giúp tránh bị chặn theo referrer.
 *
 * Nếu vẫn không tải được (CORS / file bị chặn), hiển thị nút mở tab mới + tải
 * về thay vì để người dùng kẹt ở màn hình lỗi khó hiểu.
 */
export function CvDocViewer({
  url,
  name,
}: {
  url: string;
  name?: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const isPdf = looksLikePdf(url);

  useEffect(() => {
    let active = true;
    let created: string | null = null;
    setStatus("loading");
    setObjectUrl(null);

    fetch(url, { referrerPolicy: "no-referrer" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [url]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-auto">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center gap-3 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm font-medium">Đang tải tài liệu…</p>
        </div>
      )}

      {(status === "error" || (status === "ready" && !objectUrl)) && (
        <div className="flex max-w-sm flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Không thể hiển thị tài liệu trực tiếp
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tài liệu có thể bị chặn xem nhúng. Bạn vẫn có thể mở hoặc tải về.
          </p>
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Mở trong tab mới
            </a>
            <a
              href={url}
              download={name || undefined}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" /> Tải xuống
            </a>
          </div>
        </div>
      )}

      {status === "ready" && objectUrl && isPdf && (
        <iframe
          src={`${objectUrl}#toolbar=0&navpanes=0`}
          className="absolute inset-0 h-full w-full border-none"
          title={name ? `Xem ${name}` : "Document preview"}
        />
      )}

      {status === "ready" && objectUrl && !isPdf && (
        <img
          src={objectUrl}
          alt={name || "Document preview"}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </div>
  );
}
