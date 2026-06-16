"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BookmarkPlus,
  Share2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Bookmark,
} from "lucide-react";
import JobApi from "@/api/job";
import { JobDetailResponse } from "@/types/job-insight";
import ProfileApi from "@/api/profile";
import { formatSalaryRange } from "@/utils/salary";

const JUNK_TEXT_MARKERS = [
  "Thông tin việc làm",
  "NGÀY ĐĂNG",
  "Từ khoá:",
  "dành cho bạn",
  "Báo cáo tin tuyển dụng",
  "Gửi tôi việc tương tự",
  "Nhận diện một số hình thức lừa đảo",
  "Trang chủ Việc làm",
  "việc làm tuyển dụng thần số học",
  "Copyright ©",
  "Mức độ phù hợp và xếp hạng",
];

function cutAtMarkers(text: string, markers: string[]): string {
  let result = text;
  for (const marker of markers) {
    const idx = result.indexOf(marker);
    if (idx !== -1) result = result.slice(0, idx);
  }
  return result;
}

function cleanDescription(raw: string, hasSeparateSections: boolean): string {
  const isHtml = /<[a-z][\s\S]*?>/i.test(raw);

  if (!isHtml) {
    // Plain text path
    let text = raw.replace(/^mô tả công việc\s*/i, "");

    const sectionMarkers = hasSeparateSections
      ? ["Yêu cầu công việc", "QUYỀN LỢI", "Quyền lợi", ...JUNK_TEXT_MARKERS]
      : JUNK_TEXT_MARKERS;
    text = cutAtMarkers(text, sectionMarkers);
    text = text.trim();

    // Convert inline "; - " and "\n- " separators to <br>
    text = text
      .replace(/;\s*-\s+/g, "<br>- ")
      .replace(/\n\s*-\s+/g, "<br>- ")
      .replace(/\n/g, "<br>");

    return text;
  }

  // HTML path
  let cleaned = raw.replace(
    /^\s*<h[1-6][^>]*>\s*mô tả công việc\s*<\/h[1-6]>\s*/i,
    "",
  );

  if (hasSeparateSections) {
    cleaned = cleaned.replace(
      /<h[1-6][^>]*>\s*(Yêu cầu(?: công việc)?|QUYỀN LỢI|Quyền lợi)\s*<\/h[1-6]>[\s\S]*/i,
      "",
    );
  }

  cleaned = cutAtMarkers(cleaned, JUNK_TEXT_MARKERS);
  cleaned = cleaned.trim();

  // Split <li> items that contain "; - " inline separators into separate <li>
  cleaned = cleaned.replace(/<li>([\s\S]*?)<\/li>/gi, (_, content) => {
    const parts = content.split(/;\s*-\s+/).filter((s: string) => s.trim());
    if (parts.length <= 1) return `<li>${content}</li>`;
    return parts.map((p: string) => `<li>${p.trim()}</li>`).join("");
  });

  // For content without any list markup, convert "; - " to <br>-
  if (!/<[uo]l/i.test(cleaned)) {
    cleaned = cleaned
      .replace(/;\s*-\s+/g, "<br>- ")
      .replace(/\n\s*-\s+/g, "<br>- ");
  }

  return cleaned;
}

function formatSkillsDesc(text: string): string {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  const items = text.split(/(?<!\w)\s*[-–]\s+/).filter((s) => s.trim());
  if (items.length <= 1) return `<p>${text}</p>`;
  return `<ul>${items.map((item) => `<li>${item.trim()}</li>`).join("")}</ul>`;
}

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  Remote: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-violet-100 text-violet-700",
  "Part-time": "bg-amber-100 text-amber-700",
};

const workTypeLabels: Record<string, string> = {
  "Full-time": "Toàn thời gian",
  Remote: "Làm việc từ xa",
  Hybrid: "Linh hoạt",
  "Part-time": "Bán thời gian",
};

export function JobDetail() {
  const params = useParams();
  const paramValues = params ? Object.values(params) : [];
  const id = Array.isArray(paramValues[0]) ? paramValues[0][0] : paramValues[0];
  const [data, setData] = useState<JobDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const loadJobDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let activeCvId: string | undefined = undefined;
      try {
        const profileRes = await ProfileApi.getMe();
        activeCvId =
          profileRes?.data?.default_cv?.cv_id ||
          profileRes?.data?.latest_cv?.cv_id ||
          profileRes?.data?.all_cvs?.[0]?.cv_id;
      } catch (cvErr) {
        console.error("Không lấy được CV mặc định:", cvErr);
      }

      const res = await JobApi.findOne(id, activeCvId);
      if (res && res.data) {
        setData(res.data);
        setIsSaved(!!(res.data as any).is_saved);
      }
    } catch (error) {
      console.error("Failed to load job detail:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJobDetail();
  }, [loadJobDetail]);

  const job = data?.job;
  const company = data?.company;
  const salary = data?.salary;
  const skills = data?.skills || [];
  const match_breakdown = data?.match_breakdown;
  const hasMatch = !!(
    match_breakdown &&
    ((match_breakdown.strong || []).length ||
      (match_breakdown.partial || []).length ||
      (match_breakdown.missing || []).length)
  );
  const industries = data?.industries || [];
  const benefits = data?.benefits || [];

  const isSkillInGroup = (group: any, skillName: string) => {
    if (!group || !Array.isArray(group)) return false;
    return group.some((item: any) =>
      typeof item === "string"
        ? item.toLowerCase() === skillName.toLowerCase()
        : item?.skill?.toLowerCase() === skillName.toLowerCase(),
    );
  };

  const handleToggleSaveJob = async () => {
    if (!id || saving) return;
    try {
      setSaving(true);
      if (isSaved) {
        const res = await ProfileApi.deleteSavedJob(id);
        if (res.message || res.data) {
          setIsSaved(false);
        }
      } else {
        const res = await ProfileApi.saveJob({ job_id: id });
        if (res.message || res.data) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý lưu/hủy lưu job:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data)
    return <div className="p-6 text-center">Không tìm thấy công việc.</div>;

  return (
    <div className="p-6 max-w-6xl">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại tìm việc
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center shrink-0">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-1">
                  {job!.title}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-600 font-medium">
                    {company?.name}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {job!.location || "Làm việc từ xa"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    {job!.work_type
                      ? workTypeLabels[job!.work_type] || job!.work_type
                      : "Chưa rõ hình thức"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    {formatSalaryRange(salary)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Đăng ngày{" "}
                    {job!.listed_time
                      ? new Date(job!.listed_time).toLocaleDateString("vi-VN")
                      : "chưa rõ"}
                  </span>
                  {job!.work_type && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${typeColors[job!.work_type] || "bg-slate-100 text-slate-600"}`}
                    >
                      {workTypeLabels[job!.work_type] || job!.work_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  hasMatch
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {hasMatch ? "Đã phân tích theo CV của bạn" : "Chưa đối soát CV"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleSaveJob}
                  disabled={saving}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 ${
                    isSaved
                      ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900"
                      : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:border-slate-800"
                  }`}
                >
                  <BookmarkPlus
                    className={`w-5 h-5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                </button>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasMatch ? (
        <div className="px-6 py-4 bg-slate-50 grid grid-cols-3 divide-x divide-slate-200">
          <div className="px-4 first:pl-0">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Kỹ năng phù hợp</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.strong || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Phù hợp một phần</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.partial || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Kỹ năng còn thiếu</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {(match_breakdown?.missing || []).map((s: any, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-medium rounded"
                >
                  {typeof s === "string" ? s : s?.skill}
                </span>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div className="px-6 py-5 bg-slate-50 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Tải CV để xem độ phù hợp với việc này
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Hệ thống sẽ đối soát kỹ năng của bạn với yêu cầu công việc này.
            </p>
            <Link
              href="/cv-matching"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Tải CV ngay <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {hasMatch && (
        <Link
          href="/cv-matching"
          className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 hover:bg-blue-100 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Phân tích sâu CV với các vai trò khác
            </p>
            <p className="text-xs text-blue-700">
              Xem điểm phù hợp chi tiết, radar kỹ năng và so sánh nhiều vị trí.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Mô tả công việc</h2>
            {job!.description ? (
              <>
                <div
                  className={`text-sm text-slate-700 leading-relaxed overflow-hidden transition-all duration-300
                    [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-5 [&_h3]:mb-2
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-5 [&_h2]:mb-2
                    [&_p]:mb-2 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:space-y-1
                    [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:space-y-1
                    [&_li]:text-slate-700
                    [&_strong]:font-semibold [&_strong]:text-slate-900
                    [&_a]:text-blue-600 [&_a]:underline ${descExpanded ? "" : "max-h-72"}`}
                  style={
                    descExpanded
                      ? undefined
                      : {
                          maskImage:
                            "linear-gradient(to bottom, black 60%, transparent 100%)",
                        }
                  }
                  dangerouslySetInnerHTML={{
                    __html: cleanDescription(
                      job!.description,
                      !!(job!.skills_desc || benefits.length > 0),
                    ),
                  }}
                />
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {descExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">Chưa có mô tả.</p>
            )}
          </div>

          {job!.skills_desc && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">Yêu cầu kỹ năng</h2>
              <div
                className="text-sm text-slate-700 leading-relaxed
                  [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ul]:space-y-1
                  [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_ol]:space-y-1
                  [&_li]:text-slate-700
                  [&_p]:mb-2 [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: formatSkillsDesc(job!.skills_desc),
                }}
              />
            </div>
          )}

          {benefits.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-bold text-slate-900 mb-4">
                Quyền lợi & Phúc lợi
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700">
                      {b.benefit_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Hạn nhận hồ sơ{" "}
                {job!.expiry_time
                  ? new Date(job!.expiry_time).toLocaleDateString("vi-VN")
                  : "chưa rõ"}
              </span>
            </div>
            {job!.job_posting_url ? (
              <a
                href={job!.job_posting_url}
                target="_blank"
                rel="noreferrer"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:from-blue-700 hover:to-indigo-700"
              >
                Mở tin tuyển dụng gốc <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <button
                disabled
                className="mb-3 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-400"
              >
                Chưa có URL tuyển dụng
              </button>
            )}
            <Link
              href="/cv-matching"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl font-semibold text-sm hover:bg-violet-100 transition-colors"
            >
              Kiểm tra CV của tôi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.skill_id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    isSkillInGroup(match_breakdown?.strong, s.skill_name)
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : isSkillInGroup(match_breakdown?.partial, s.skill_name)
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {s.skill_name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-sm bg-emerald-300 inline-block" />
                Bạn có
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-sm bg-amber-300 inline-block" />
                Một phần
              </span>
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <span className="w-2 h-2 rounded-sm bg-red-300 inline-block" />
                Còn thiếu
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-3">Về công ty</h3>
            <div className="space-y-3">
              {(company?.company_size_min || company?.company_size_max) && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Quy mô công ty</p>
                    <p className="text-sm font-medium text-slate-900">
                      {company.company_size_min && company.company_size_max
                        ? `${company.company_size_min}–${company.company_size_max} nhân viên`
                        : `${company.company_size_min ?? company.company_size_max} nhân viên`}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">
                    Ngành công nghiệp
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {industries.length > 0
                      ? industries.map((i) => i.industry_name).join(", ")
                      : "Chưa rõ"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Khám phá các công việc tương tự
            </p>
            <p className="text-xs text-blue-700 mb-3">
              Tìm thấy các vị trí phù hợp với hồ sơ của bạn
            </p>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
