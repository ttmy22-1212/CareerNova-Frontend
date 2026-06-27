"use client";

import { AlertCircle } from "lucide-react";

const looksLikePdf = (url: string) => {
  const clean = url.toLowerCase().split("#")[0].split("?")[0];
  return clean.endsWith(".pdf") || url.toLowerCase().includes(".pdf");
};

// Chỉ nhúng được khi là URL tuyệt đối http(s). Nếu file_url là đường dẫn tương
// đối / path tạm trên server (vd ".tmp_cv_uploads/...") thì nhúng vào iframe sẽ
// bị trình duyệt giải về cùng origin → rơi vào trang 404 của chính app. Khi đó
// hiển thị thông báo rõ ràng thay vì để người dùng thấy màn 404 khó hiểu.
const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url.trim());

/**
 * Trình xem tài liệu CV (PDF / ảnh).
 *
 * `referrerPolicy="no-referrer"` để tránh bị Cloudinary chặn theo referrer/domain
 * (hotlink protection) sau khi đổi sang domain mới.
 */
export function CvDocViewer({ url, name }: { url: string; name?: string }) {
  if (!isAbsoluteUrl(url)) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="flex max-w-sm flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Không xem được tài liệu này
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đường dẫn tệp không hợp lệ. Vui lòng tải lại CV này để xem.
          </p>
        </div>
      </div>
    );
  }

  if (looksLikePdf(url)) {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        referrerPolicy="no-referrer"
        className="h-full w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        title={name ? `Xem ${name}` : "Document preview"}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto">
      <img
        src={url}
        referrerPolicy="no-referrer"
        alt={name || "Document preview"}
        className="max-h-full max-w-full rounded-lg object-contain shadow-md"
      />
    </div>
  );
}
