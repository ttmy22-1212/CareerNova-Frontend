"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";

import ProfileApi from "@/api/profile";
import { UserProfileResponse } from "@/types/profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";

type CvItem = UserProfileResponse["all_cvs"][number];

function formatMatchScore(score?: number | null) {
  if (score == null) return null;
  const normalized = score > 1 ? score : score * 100;
  return `${Math.round(normalized)}%`;
}

export function DefaultCvManager() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingCvUrl, setViewingCvUrl] = useState<string | null>(null);
  const [viewingCvName, setViewingCvName] = useState("");

  const defaultCv = profile?.default_cv;
  const allCvs = profile?.all_cvs || [];
  const defaultMatch = profile?.default_match;
  const matchScore = formatMatchScore(defaultMatch?.match_score);

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await ProfileApi.getMe();
      setProfile(res.data || null);
    } catch (err) {
      console.error("Lỗi tải cấu hình CV mặc định:", err);
      setError("Không thể tải cấu hình CV mặc định.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSetDefaultCv = async (cvId: string) => {
    if (!cvId || cvId === defaultCv?.cv_id) return;
    try {
      setIsUpdating(true);
      setError(null);
      await ProfileApi.setDefaultCv(cvId);
      await fetchProfile();
    } catch (err) {
      console.error("Lỗi cập nhật CV mặc định:", err);
      setError("Đặt CV mặc định thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-6rem)] overflow-y-auto bg-white dark:bg-slate-900">
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                CV mặc định
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                CV và cấu hình so khớp đang dùng cho các gợi ý cá nhân hóa.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải cấu hình CV...
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <section className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  CV đang hoạt động
                </p>

                {defaultCv ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                          CV mặc định
                        </p>
                        <p
                          className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
                          title={defaultCv.file_name}
                        >
                          {defaultCv.file_name}
                        </p>
                      </div>
                    </div>

                    {defaultCv.file_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setViewingCvUrl(defaultCv.file_url);
                          setViewingCvName(defaultCv.file_name);
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                    <AlertCircle className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                    Chưa thiết lập CV mặc định.
                  </div>
                )}

                {allCvs.length > 0 ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Thay đổi CV mặc định
                    </label>
                    <select
                      disabled={isUpdating}
                      value={defaultCv?.cv_id || ""}
                      onChange={(e) => handleSetDefaultCv(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800"
                    >
                      <option value="" disabled>
                        Chọn CV hệ thống
                      </option>
                      {allCvs.map((cv: CvItem) => (
                        <option key={cv.cv_id} value={cv.cv_id}>
                          {cv.file_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Link
                    href="/cv-matching"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                    Tải CV
                  </Link>
                )}
              </section>

              <section className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Cấu hình so khớp mặc định
                </p>

                {defaultMatch ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Hình thức
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          defaultMatch.match_type === "url"
                            ? "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300"
                            : "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300"
                        }`}
                      >
                        {defaultMatch.match_type === "url"
                          ? "Job URL"
                          : "Benchmark"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {defaultMatch.match_type === "url"
                          ? "Nguồn tuyển dụng"
                          : "Nhóm vị trí"}
                      </p>
                      {defaultMatch.match_type === "url" ? (
                        <a
                          href={defaultMatch.job_posting_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-1 break-all text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300"
                        >
                          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                          {defaultMatch.job_posting_url || "N/A"}
                        </a>
                      ) : (
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
                          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                          {defaultMatch.search_group || "N/A"}
                        </p>
                      )}
                    </div>

                    {matchScore && (
                      <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-xs dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400">
                          Điểm phân tích
                        </span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
                          {matchScore}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs italic text-slate-400">
                    Chưa có cấu hình so khớp mặc định cho CV này.
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={!!viewingCvUrl}
        onOpenChange={(open) => {
          if (!open) {
            setViewingCvUrl(null);
            setViewingCvName("");
          }
        }}
      >
        <DialogContent className="!max-w-[80vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden !rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
          <div className="flex h-14 items-center justify-between bg-white px-5 dark:bg-slate-950 shrink-0 z-10">
            <DialogTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Đang xem tài liệu:{" "}
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-xl md:max-w-2xl ml-1">
                {viewingCvName}
              </span>
            </DialogTitle>

            <DialogDescription className="sr-only">
              Hiển thị chi tiết nội dung tệp hồ sơ cá nhân (CV) hiện tại của
              bạn.
            </DialogDescription>
          </div>

          <div className="flex-1 w-full bg-[#525659] dark:bg-slate-900 overflow-hidden relative">
            {viewingCvUrl && viewingCvUrl.toLowerCase().includes(".pdf") ? (
              <iframe
                src={`${viewingCvUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="absolute inset-0 h-full w-full border-none m-0 p-0 block bg-[#525659]"
                title="PDF Preview"
              />
            ) : (
              <div className="absolute inset-0 overflow-auto flex items-center justify-center p-4 custom-scrollbar">
                <img
                  src={viewingCvUrl!}
                  alt="CV Preview"
                  className="max-h-full max-w-full bg-white object-contain shadow-xs transition-all"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
